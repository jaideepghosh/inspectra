import { useState } from 'react';
import jsPDF from 'jspdf';
import { InspectionData } from '@/lib/types';
import { getInspectionStats } from '@/lib/inspection-store';
import { getSectionNames } from '@/lib/inspection-data';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Loader2, RotateCcw } from 'lucide-react';

interface ReportGeneratorProps {
  data: InspectionData;
  onBack: () => void;
  onNewInspection: () => void;
}

const ReportGenerator = ({ data, onBack, onNewInspection }: ReportGeneratorProps) => {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generatePDF = async () => {
    setGenerating(true);

    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      let y = 20;

      const checkPageBreak = (needed: number) => {
        if (y + needed > 270) {
          doc.addPage();
          y = 20;
        }
      };

      // Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('PRE-DELIVERY INSPECTION REPORT', margin, y);
      y += 8;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(data.bike.model, margin, y);
      y += 6;
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
      doc.setTextColor(0);
      y += 12;

      // Bike details
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('BIKE DETAILS', margin, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);

      const details = [
        ['VIN', data.bike.vin],
        ['Engine No.', data.bike.engineNumber],
        ['Odometer', `${data.bike.odometer || '—'} km`],
        ['Color', data.bike.color || '—'],
        ['Dealer', data.bike.dealerName],
      ];

      details.forEach(([label, val]) => {
        doc.text(`${label}: ${val}`, margin, y);
        y += 5;
      });
      y += 5;

      // Stats
      const stats = getInspectionStats(data);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('SUMMARY', margin, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Total Checks: ${stats.total}`, margin, y); y += 5;
      doc.text(`Passed: ${stats.passed}`, margin, y); y += 5;
      doc.text(`Issues: ${stats.issues}`, margin, y); y += 5;
      doc.text(`Photos: ${stats.photosUploaded}/${stats.totalPhotos}`, margin, y);
      y += 10;

      // Checklist by section
      const sections = getSectionNames();
      for (const section of sections) {
        checkPageBreak(20);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(section.toUpperCase(), margin, y);
        y += 6;

        const sectionItems = data.checklist.filter((i) => i.section === section);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);

        for (const item of sectionItems) {
          checkPageBreak(10);
          const status = item.status === 'pass' ? '✓' : item.status === 'issue' ? '✗' : '○';
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
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.text(photo.label, margin, y);
          y += 5;
          try {
            doc.addImage(photo.photoUrl, 'JPEG', margin, y, 70, 52);
            y += 57;
          } catch {
            doc.setFont('helvetica', 'normal');
            doc.text('[Photo could not be embedded]', margin, y);
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
      doc.text('This report was generated using PDI Inspector. Inspection ID: ' + data.id, margin, y);

      doc.save(`PDI-Report-${data.bike.vin || 'inspection'}.pdf`);
      setGenerated(true);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-6 flex flex-col items-center justify-center animate-slide-up">
      <button onClick={onBack} className="self-start flex items-center text-muted-foreground mb-10 text-sm">
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
            Your inspection is complete. Download a PDF report with all findings and photos.
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
            Check your downloads folder. Share this report with the dealer if needed.
          </p>
          <div className="w-full max-w-xs space-y-3">
            <Button
              onClick={generatePDF}
              className="w-full h-12 font-display"
              size="lg"
            >
              <Download className="w-4 h-4 mr-2" /> DOWNLOAD AGAIN
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
