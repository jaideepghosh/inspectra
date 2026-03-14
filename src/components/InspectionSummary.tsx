import { InspectionData } from "@/lib/types";
import { getInspectionStats } from "@/lib/inspection-store";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Check,
  AlertTriangle,
  Camera,
  FileText,
} from "lucide-react";

interface InspectionSummaryProps {
  data: InspectionData;
  onGenerateReport: () => void;
  onBack: () => void;
}

const InspectionSummary = ({
  data,
  onGenerateReport,
  onBack,
}: InspectionSummaryProps) => {
  const stats = getInspectionStats(data);
  const issues = data.checklist.filter((i) => i.status === "issue");

  return (
    <div className="min-h-screen px-4 py-6 animate-slide-up">
      <button
        onClick={onBack}
        className="flex items-center text-muted-foreground mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </button>

      <h2 className="text-xl font-display font-bold text-foreground mb-1">
        INSPECTION SUMMARY
      </h2>
      <p className="text-sm text-muted-foreground mb-1">{data.bike.model}</p>
      {data.bike.brand && (
        <p className="text-xs text-muted-foreground mb-6">{data.bike.brand}</p>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Check className="w-4 h-4 text-success" />
            <span className="text-xs text-muted-foreground font-display">
              PASSED
            </span>
          </div>
          <p className="text-2xl font-display font-bold text-success">
            {stats.passed}
          </p>
          <p className="text-xs text-muted-foreground">
            of {stats.total} checks
          </p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-xs text-muted-foreground font-display">
              ISSUES
            </span>
          </div>
          <p className="text-2xl font-display font-bold text-destructive">
            {stats.issues}
          </p>
          <p className="text-xs text-muted-foreground">need attention</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Camera className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground font-display">
              PHOTOS
            </span>
          </div>
          <p className="text-2xl font-display font-bold text-primary">
            {stats.photosUploaded}
          </p>
          <p className="text-xs text-muted-foreground">
            of {stats.totalPhotos} required
          </p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-foreground" />
            <span className="text-xs text-muted-foreground font-display">
              STATUS
            </span>
          </div>
          <p
            className={`text-lg font-display font-bold ${stats.issues > 0 ? "text-warning" : "text-success"}`}
          >
            {stats.issues > 0 ? "REVIEW" : "CLEAR"}
          </p>
          <p className="text-xs text-muted-foreground">
            {stats.pending > 0 ? `${stats.pending} pending` : "complete"}
          </p>
        </div>
      </div>

      {/* Bike details */}
      <div className="bg-card rounded-lg border border-border p-4 mb-6">
        <h3 className="text-xs font-display text-primary mb-3">BIKE DETAILS</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Brand</span>
            <span className="text-foreground">{data.bike.brand || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Model</span>
            <span className="text-foreground">{data.bike.model || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">VIN</span>
            <span className="text-foreground font-mono text-xs">
              {data.bike.vin}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Engine No.</span>
            <span className="text-foreground font-mono text-xs">
              {data.bike.engineNumber}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Odometer</span>
            <span className="text-foreground">
              {data.bike.odometer || "—"} km
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Color</span>
            <span className="text-foreground">{data.bike.color || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Dealer</span>
            <span className="text-foreground">{data.bike.dealerName}</span>
          </div>
        </div>
      </div>

      {/* Issues list */}
      {issues.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-display text-destructive mb-3">
            ISSUES FOUND
          </h3>
          <div className="space-y-2">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="bg-destructive/5 border border-destructive/20 rounded-lg p-3"
              >
                <p className="text-sm text-foreground">{issue.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {issue.section}
                </p>
                {issue.comment && (
                  <p className="text-xs text-destructive mt-1">
                    Note: {issue.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <Button
        onClick={onGenerateReport}
        className="w-full h-14 text-base font-display font-semibold mb-8"
        size="lg"
      >
        <FileText className="w-5 h-5 mr-2" />
        GENERATE PDF REPORT
      </Button>
    </div>
  );
};

export default InspectionSummary;
