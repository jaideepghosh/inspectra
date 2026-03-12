import { useState } from "react";
import jsPDF from "jspdf";
import { InspectionData } from "@/lib/types";
import { getInspectionStats } from "@/lib/inspection-store";
import { useInspection } from "@/lib/inspection-context";
import { getSectionNames } from "@/lib/inspection-data";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Download,
  Loader2,
  RotateCcw,
  Save,
  CheckCircle2,
} from "lucide-react";

interface ReportGeneratorProps {
  data: InspectionData;
  onBack: () => void;
  onNewInspection: () => void;
}

const ReportGenerator = ({
  data,
  onBack,
  onNewInspection,
}: ReportGeneratorProps) => {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [saved, setSaved] = useState(false);

  const { saveCurrentReport } = useInspection();

  const generatePDF = async () => {
    setGenerating(true);

    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      let y = 20;

      const checkPageBreak = (needed: number) => {
        if (y + needed > 270) {
          doc.addPage();
          y = 20;
        }
      };

      const stats = getInspectionStats(data);

      // ── HEADER ──────────────────────────────────────────────────────────
      doc.setFillColor(24, 24, 27); // zinc-900
      doc.rect(0, 0, pageWidth, 30, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text("INSPECTION SUMMARY", margin, 14);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(160, 160, 160);
      doc.text(data.bike.model, margin, 22);
      doc.setFontSize(8);
      doc.text(
        `Generated: ${new Date().toLocaleString()}`,
        pageWidth - margin,
        22,
        { align: "right" },
      );
      y = 38;

      // ── STAT CARDS (2 × 2 grid) ──────────────────────────────────────────
      const cardW = (pageWidth - margin * 2 - 4) / 2;
      const cardH = 28;
      const col1 = margin;
      const col2 = margin + cardW + 4;

      const drawCard = (
        x: number,
        cy: number,
        iconChar: string,
        label: string,
        value: string,
        subLabel: string,
        valueColor: [number, number, number],
        iconColor: [number, number, number],
      ) => {
        // card background
        doc.setFillColor(30, 30, 33);
        doc.setDrawColor(50, 50, 55);
        doc.roundedRect(x, cy, cardW, cardH, 2, 2, "FD");

        // icon + label row
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...iconColor);
        doc.text(iconChar, x + 4, cy + 7);
        doc.setTextColor(140, 140, 140);
        doc.text(label, x + 9, cy + 7);

        // large value
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.setTextColor(...valueColor);
        doc.text(value, x + 4, cy + 19);

        // sub-label
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(140, 140, 140);
        doc.text(subLabel, x + 4, cy + 25);
      };

      // PASSED
      drawCard(
        col1,
        y,
        "✓",
        "PASSED",
        String(stats.passed),
        `of ${stats.total} checks`,
        [74, 222, 128],
        [74, 222, 128],
      );
      // ISSUES
      drawCard(
        col2,
        y,
        "⚠",
        "ISSUES",
        String(stats.issues),
        "need attention",
        [248, 113, 113],
        [248, 113, 113],
      );
      y += cardH + 4;

      // PHOTOS
      drawCard(
        col1,
        y,
        "⬡",
        "PHOTOS",
        String(stats.photosUploaded),
        `of ${stats.totalPhotos} required`,
        [251, 191, 36],
        [251, 191, 36],
      );
      // STATUS
      const statusClear = stats.issues === 0;
      const statusText = statusClear ? "CLEAR" : "REVIEW";
      const statusColor: [number, number, number] = statusClear
        ? [74, 222, 128]
        : [251, 191, 36];
      const subStatus =
        stats.pending > 0 ? `${stats.pending} pending` : "complete";
      drawCard(
        col2,
        y,
        "≡",
        "STATUS",
        statusText,
        subStatus,
        statusColor,
        [200, 200, 200],
      );
      y += cardH + 6;

      // ── BIKE DETAILS CARD ────────────────────────────────────────────────
      const details: [string, string][] = [
        ["VIN", data.bike.vin || "—"],
        ["Engine No.", data.bike.engineNumber || "—"],
        ["Odometer", `${data.bike.odometer || "—"} km`],
        ["Color", data.bike.color || "—"],
        ["Dealer", data.bike.dealerName || "—"],
      ];
      const detailCardH = 12 + details.length * 7;
      doc.setFillColor(30, 30, 33);
      doc.setDrawColor(50, 50, 55);
      doc.roundedRect(
        margin,
        y,
        pageWidth - margin * 2,
        detailCardH,
        2,
        2,
        "FD",
      );

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(251, 191, 36); // amber
      doc.text("BIKE DETAILS", margin + 4, y + 8);

      let dy = y + 15;
      details.forEach(([label, val]) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(160, 160, 160);
        doc.text(label, margin + 4, dy);
        doc.setTextColor(220, 220, 220);
        doc.text(val, pageWidth - margin - 4, dy, { align: "right" });
        dy += 7;
      });

      y = dy + 8;

      // ── DIVIDER ──────────────────────────────────────────────────────────
      doc.setDrawColor(50, 50, 55);
      doc.line(margin, y, pageWidth - margin, y);
      doc.setTextColor(0);
      y += 8;

      // Checklist by section
      const sections = getSectionNames();
      for (const section of sections) {
        checkPageBreak(20);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(section.toUpperCase(), margin, y);
        y += 6;

        const sectionItems = data.checklist.filter(
          (i) => i.section === section,
        );
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);

        for (const item of sectionItems) {
          checkPageBreak(10);
          const status =
            item.status === "pass" ? "✓" : item.status === "issue" ? "✗" : "○";
          doc.text(`${status}  ${item.description}`, margin + 2, y);
          y += 4;
          if (item.comment) {
            doc.setTextColor(120);
            doc.text(`   Note: ${item.comment}`, margin + 2, y);
            doc.setTextColor(0);
            y += 4;
          }
        }
        y += 4;
      }

      // Mandatory photos
      for (const photo of data.mandatoryPhotos) {
        if (photo.photoUrl) {
          checkPageBreak(80);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.text(photo.label, margin, y);
          y += 5;
          try {
            doc.addImage(photo.photoUrl, "JPEG", margin, y, 70, 52);
            y += 57;
          } catch {
            doc.setFont("helvetica", "normal");
            doc.text("[Photo could not be embedded]", margin, y);
            y += 5;
          }
        }
      }

      // Footer
      checkPageBreak(15);
      y += 5;
      doc.setDrawColor(200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;
      doc.setFontSize(7);
      doc.setTextColor(150);
      doc.text(
        "This report was generated using PDI Inspector. Inspection ID: " +
          data.id,
        margin,
        y,
      );

      doc.save(`PDI-Report-${data.bike.vin || "inspection"}.pdf`);
      setGenerated(true);
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-6 flex flex-col items-center justify-center animate-slide-up">
      <button
        onClick={onBack}
        className="self-start flex items-center text-muted-foreground mb-10 text-sm"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Summary
      </button>

      {!generated ? (
        <>
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
            <Download className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-display font-bold text-foreground mb-2 text-center">
            GENERATE REPORT
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-8 max-w-xs">
            Your inspection is complete. Download a PDF report with all findings
            and photos.
          </p>
          <Button
            onClick={generatePDF}
            disabled={generating}
            className="w-full max-w-xs h-14 text-base font-display font-semibold"
            size="lg"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> GENERATING...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" /> DOWNLOAD PDF
              </>
            )}
          </Button>
        </>
      ) : (
        <>
          <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mb-6">
            <Download className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-xl font-display font-bold text-success mb-2 text-center">
            REPORT DOWNLOADED
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-8 max-w-xs">
            Check your downloads folder. Share this report with the dealer if
            needed.
          </p>
          <div className="w-full max-w-xs space-y-3">
            <Button
              onClick={generatePDF}
              className="w-full h-12 font-display"
              size="lg"
            >
              <Download className="w-4 h-4 mr-2" /> DOWNLOAD AGAIN
            </Button>

            {/* Save to local storage */}
            <Button
              onClick={() => {
                saveCurrentReport();
                setSaved(true);
              }}
              disabled={saved}
              variant="outline"
              className="w-full h-12 font-display border-primary/40 text-primary hover:bg-primary/10"
              size="lg"
            >
              {saved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2 text-success" /> SAVED
                  TO DEVICE
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> SAVE TO DEVICE
                </>
              )}
            </Button>

            <Button
              onClick={onNewInspection}
              variant="outline"
              className="w-full h-12 font-display border-border"
              size="lg"
            >
              <RotateCcw className="w-4 h-4 mr-2" /> NEW INSPECTION
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportGenerator;
