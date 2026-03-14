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

  /* ─────────────────────────────────────────────────────────
     Pure-jsPDF icon drawers  (no SVG / canvas / blob needed)
  ───────────────────────────────────────────────────────── */

  /** Draw a ✓ checkmark at (cx,cy) with given size */
  const drawCheck = (doc: jsPDF, cx: number, cy: number, size: number) => {
    doc.setDrawColor(34, 197, 94);
    doc.setLineWidth(0.6);
    // polyline: bottom-left → middle-bottom → top-right
    doc.lines(
      [
        [size * 0.35, size * 0.35],
        [size * 0.65, -size * 0.65],
      ],
      cx - size * 0.5,
      cy + size * 0.1,
      [1, 1],
    );
  };

  /** Draw an ⚠ circle-exclamation at (cx,cy) */
  const drawIssue = (doc: jsPDF, cx: number, cy: number, r: number) => {
    doc.setDrawColor(239, 68, 68);
    doc.setLineWidth(0.5);
    doc.circle(cx, cy, r, "S");
    doc.setFillColor(239, 68, 68);
    // vertical bar
    doc.rect(cx - 0.4, cy - r * 0.55, 0.8, r * 0.65, "F");
    // dot
    doc.circle(cx, cy + r * 0.3, 0.5, "F");
  };

  /** Draw an ○ pending circle at (cx,cy) */
  const drawPending = (doc: jsPDF, cx: number, cy: number, r: number) => {
    doc.setDrawColor(156, 163, 175);
    doc.setLineWidth(0.5);
    doc.circle(cx, cy, r, "S");
  };

  /* ─────────────────────────────────────────────────────────
     Stat card helper  (draws one summary card)
  ───────────────────────────────────────────────────────── */

  const drawStatCard = (
    doc: jsPDF,
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    value: string,
    sub: string,
    rgb: [number, number, number],
    drawIcon: (doc: jsPDF, cx: number, cy: number) => void,
  ) => {
    doc.setFillColor(30, 30, 33);
    doc.roundedRect(x, y, w, h, 2, 2, "F");

    drawIcon(doc, x + 7, y + 7);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(label, x + 12, y + 8);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...rgb);
    doc.text(value, x + 4, y + 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(140, 140, 140);
    doc.text(sub, x + 4, y + 26);
  };

  /* ─────────────────────────────────────────────────────────
     Main PDF generator
  ───────────────────────────────────────────────────────── */

  const generatePDF = async () => {
    setGenerating(true);

    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 14;
      const contentW = pageW - margin * 2;
      let y = 0;

      const newPage = () => {
        doc.addPage();
        y = 16;
      };

      const guard = (needed: number) => {
        if (y + needed > pageH - 14) newPage();
      };

      const stats = getInspectionStats(data);

      /* ── HEADER ── */
      doc.setFillColor(18, 18, 20);
      doc.rect(0, 0, pageW, 32, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(255, 255, 255);
      doc.text("PDI INSPECTION REPORT", margin, 13);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(180, 180, 180);
      doc.text(
        data.bike.brand
          ? `${data.bike.brand}  ·  ${data.bike.model}`
          : data.bike.model,
        margin,
        21,
      );

      doc.setFontSize(7.5);
      doc.setTextColor(120, 120, 120);
      doc.text(
        `Generated: ${new Date().toLocaleString()}`,
        pageW - margin,
        21,
        { align: "right" },
      );

      y = 38;

      /* ── STAT CARDS (2 × 2) ── */
      const cardW = (contentW - 4) / 2;
      const cardH = 30;

      const statusClear = stats.issues === 0;

      // Row 1
      drawStatCard(
        doc,
        margin,
        y,
        cardW,
        cardH,
        "PASSED",
        String(stats.passed),
        `of ${stats.total} checks`,
        [74, 222, 128],
        (d, cx, cy) => drawCheck(d, cx, cy, 5),
      );
      drawStatCard(
        doc,
        margin + cardW + 4,
        y,
        cardW,
        cardH,
        "ISSUES",
        String(stats.issues),
        "need attention",
        [248, 113, 113],
        (d, cx, cy) => drawIssue(d, cx, cy, 2.5),
      );
      y += cardH + 4;

      // Row 2
      drawStatCard(
        doc,
        margin,
        y,
        cardW,
        cardH,
        "PHOTOS",
        String(stats.photosUploaded),
        `of ${stats.totalPhotos} required`,
        [251, 191, 36],
        (d, cx, cy) => {
          // camera outline
          d.setDrawColor(251, 191, 36);
          d.setLineWidth(0.5);
          d.roundedRect(cx - 3, cy - 2, 6, 4.5, 0.5, 0.5, "S");
          d.circle(cx, cy + 0.3, 1.2, "S");
        },
      );
      drawStatCard(
        doc,
        margin + cardW + 4,
        y,
        cardW,
        cardH,
        "STATUS",
        statusClear ? "CLEAR" : "REVIEW",
        stats.pending > 0 ? `${stats.pending} pending` : "complete",
        statusClear ? [74, 222, 128] : [251, 191, 36],
        (d, cx, cy) => {
          d.setDrawColor(
            ...(statusClear
              ? ([74, 222, 128] as [number, number, number])
              : ([251, 191, 36] as [number, number, number])),
          );
          d.setLineWidth(0.5);
          // shield shape approximation
          d.roundedRect(cx - 2.5, cy - 3, 5, 5.5, 0.8, 0.8, "S");
        },
      );
      y += cardH + 8;

      /* ── BIKE DETAILS ── */
      const details: [string, string][] = [
        ["Brand", data.bike.brand || "—"],
        ["Model", data.bike.model || "—"],
        ["VIN", data.bike.vin || "—"],
        ["Engine No.", data.bike.engineNumber || "—"],
        ["Odometer", `${data.bike.odometer || "—"} km`],
        ["Color", data.bike.color || "—"],
        ["Dealer", data.bike.dealerName || "—"],
      ];
      const detailH = 13 + details.length * 7.5;

      doc.setFillColor(26, 26, 30);
      doc.roundedRect(margin, y, contentW, detailH, 2, 2, "F");

      // gold accent bar
      doc.setFillColor(251, 191, 36);
      doc.rect(margin, y, 2.5, detailH, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(251, 191, 36);
      doc.text("BIKE DETAILS", margin + 6, y + 9);

      let dy = y + 17;
      details.forEach(([lbl, val], i) => {
        if (i % 2 === 0) {
          doc.setFillColor(32, 32, 36);
          // doc.rect(margin + 2.5, dy - 5, contentW - 2.5, 7, "F");
        }
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(140, 140, 140);
        doc.text(lbl, margin + 6, dy);
        doc.setTextColor(220, 220, 220);
        doc.text(val, pageW - margin - 4, dy, { align: "right" });
        dy += 7.5;
      });

      y = dy + 10;

      /* ── CHECKLIST ── */
      const sections = getSectionNames();

      for (const section of sections) {
        guard(18);

        /* Section header bar */
        doc.setFillColor(24, 24, 28);
        doc.rect(margin, y - 1, contentW, 10, "F");

        doc.setFillColor(99, 102, 241); // indigo accent
        doc.rect(margin, y - 1, 3, 10, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(200, 200, 220);
        doc.text(section.toUpperCase(), margin + 6, y + 6);

        y += 13;

        const items = data.checklist.filter((i) => i.section === section);

        items.forEach((item, idx) => {
          guard(9);

          const rowH = 8;

          /* Alternating row tint */
          if (idx % 2 === 0) {
            doc.setFillColor(245, 245, 248);
          } else {
            doc.setFillColor(250, 250, 253);
          }
          doc.rect(margin, y - 1, contentW, rowH, "F");

          /* Status-coloured left stripe */
          const stripeColor: [number, number, number] =
            item.status === "pass"
              ? [34, 197, 94]
              : item.status === "issue"
                ? [239, 68, 68]
                : [209, 213, 219];

          doc.setFillColor(...stripeColor);
          doc.rect(margin, y - 1, 2, rowH, "F");

          /* Icon */
          const iconCx = margin + 7;
          const iconCy = y + 3;

          if (item.status === "pass") {
            drawCheck(doc, iconCx, iconCy, 4);
          } else if (item.status === "issue") {
            drawIssue(doc, iconCx, iconCy, 2);
          } else {
            drawPending(doc, iconCx, iconCy, 2);
          }

          /* Description */
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.5);
          doc.setTextColor(40, 40, 40);
          const maxDescW = contentW - 46;
          const lines = doc.splitTextToSize(item.description, maxDescW);
          doc.text(lines[0], margin + 13, y + 4.5);

          /* Status badge */
          const badgeW = 22;
          const badgeH = 5.5;
          const badgeX = pageW - margin - badgeW;
          const badgeY = y + 0.8;

          if (item.status === "pass") {
            doc.setFillColor(220, 252, 231);
            doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 1.5, 1.5, "F");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(6.5);
            doc.setTextColor(22, 163, 74);
            doc.text("PASS", badgeX + badgeW / 2, badgeY + 3.8, {
              align: "center",
            });
          } else if (item.status === "issue") {
            doc.setFillColor(254, 226, 226);
            doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 1.5, 1.5, "F");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(6.5);
            doc.setTextColor(220, 38, 38);
            doc.text("ISSUE", badgeX + badgeW / 2, badgeY + 3.8, {
              align: "center",
            });
          } else {
            doc.setFillColor(243, 244, 246);
            doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 1.5, 1.5, "F");
            doc.setFont("helvetica", "normal");
            doc.setFontSize(6.5);
            doc.setTextColor(107, 114, 128);
            doc.text("PENDING", badgeX + badgeW / 2, badgeY + 3.8, {
              align: "center",
            });
          }

          y += rowH + 1;

          /* Inline comment under issue items */
          if (item.comment) {
            guard(8);
            doc.setFillColor(255, 247, 237);
            doc.rect(margin + 2, y - 1, contentW - 2, 7, "F");
            doc.setFont("helvetica", "italic");
            doc.setFontSize(6.5);
            doc.setTextColor(154, 52, 18);
            const commentLines = doc.splitTextToSize(
              `Note: ${item.comment}`,
              contentW - 18,
            );
            doc.text(commentLines[0], margin + 13, y + 4);
            y += 8;
          }
        });

        y += 5;
      }

      /* ── HELPER: draw a photo grid section ── */
      const drawPhotoSection = (
        title: string,
        accentRgb: [number, number, number],
        photos: { photoUrl: string; label: string; sublabel?: string }[],
      ) => {
        if (photos.length === 0) return;

        guard(18);

        /* Section header */
        doc.setFillColor(24, 24, 28);
        doc.rect(margin, y - 1, contentW, 10, "F");
        doc.setFillColor(...accentRgb);
        doc.rect(margin, y - 1, 3, 10, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(200, 200, 220);
        doc.text(title, margin + 6, y + 6);
        y += 13;

        const cols = 2;
        const gap = 4;
        const imgW = (contentW - gap) / cols;
        const imgH = imgW * 0.65; // ~approx 3:2 ratio
        const captionH = 12;
        const rowH = imgH + captionH + 4;

        for (let i = 0; i < photos.length; i += cols) {
          guard(rowH);

          for (let col = 0; col < cols; col++) {
            const photo = photos[i + col];
            if (!photo) continue;

            const x = margin + col * (imgW + gap);

            /* Image */
            try {
              const fmt = photo.photoUrl.startsWith("data:image/png")
                ? "PNG"
                : "JPEG";
              doc.addImage(photo.photoUrl, fmt, x, y, imgW, imgH);
            } catch {
              /* draw placeholder if image fails */
              doc.setFillColor(40, 40, 44);
              doc.roundedRect(x, y, imgW, imgH, 1, 1, "F");
              doc.setFont("helvetica", "normal");
              doc.setFontSize(7);
              doc.setTextColor(120, 120, 120);
              doc.text("Image unavailable", x + imgW / 2, y + imgH / 2, {
                align: "center",
              });
            }

            /* Label */
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7.5);
            doc.setTextColor(40, 40, 40);
            const labelLines = doc.splitTextToSize(photo.label, imgW);
            doc.text(labelLines[0], x, y + imgH + 5);

            /* Sub-label */
            if (photo.sublabel) {
              doc.setFont("helvetica", "italic");
              doc.setFontSize(6.5);
              doc.setTextColor(100, 100, 100);
              const subLines = doc.splitTextToSize(photo.sublabel, imgW);
              doc.text(subLines[0], x, y + imgH + 10);
            }
          }

          y += rowH + 4;
        }

        y += 5;
      };

      /* ── MANDATORY PHOTOS ── */
      drawPhotoSection(
        "MANDATORY PHOTOS",
        [251, 191, 36],
        data.mandatoryPhotos
          .filter((p) => p.photoUrl)
          .map((p) => ({
            photoUrl: p.photoUrl!,
            label: p.label,
            sublabel: p.description,
          })),
      );

      /* ── ISSUE / ITEM PHOTOS ── */
      drawPhotoSection(
        "ISSUE PHOTOS",
        [239, 68, 68],
        data.checklist
          .filter((i) => i.photoUrl)
          .map((i) => ({
            photoUrl: i.photoUrl!,
            label: i.description,
            sublabel: i.comment || undefined,
          })),
      );

      /* ── FOOTER (every page) ── */
      const totalPages = (doc.internal as any).getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFillColor(18, 18, 20);
        doc.rect(0, pageH - 10, pageW, 10, "F");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.5);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `Inspectra  •  Inspection ID: ${data.id}  •  VIN: ${data.bike.vin || "—"}`,
          margin,
          pageH - 3.5,
        );
        doc.text(`Page ${p} of ${totalPages}`, pageW - margin, pageH - 3.5, {
          align: "right",
        });
      }

      doc.save(`PDI-Report-${data.bike.vin || "inspection"}.pdf`);
      setGenerated(true);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-6 flex flex-col items-center justify-center relative">
      <button
        onClick={onBack}
        className="absolute top-4 left-4 flex items-center text-muted-foreground text-sm"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </button>

      {!generated ? (
        <Button onClick={generatePDF} disabled={generating}>
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </>
          )}
        </Button>
      ) : (
        <div className="space-y-3">
          <Button onClick={generatePDF}>
            <Download className="w-4 h-4 mr-2" />
            Download Again
          </Button>

          <Button
            onClick={() => {
              saveCurrentReport();
              setSaved(true);
            }}
            disabled={saved}
            variant="outline"
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Saved
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save to Device
              </>
            )}
          </Button>

          <Button onClick={onNewInspection} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            New Inspection
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;
