export type ItemStatus = "pass" | "issue" | "pending";

export interface BikeDetails {
  brand: string;
  vin: string;
  engineNumber: string;
  model: string;
  color: string;
  dealerName: string;
  odometer: string;
}

export interface ChecklistItem {
  id: string;
  section: string;
  description: string;
  status: ItemStatus;
  comment: string;
  photoUrl: string | null;
}

export interface MandatoryPhoto {
  id: string;
  label: string;
  description: string;
  photoUrl: string | null;
}

export interface InspectionData {
  id: string;
  bike: BikeDetails;
  checklist: ChecklistItem[];
  mandatoryPhotos: MandatoryPhoto[];
  startedAt: string;
  completedAt: string | null;
  currentStep: number; // 0=welcome, 1=brand/model, 2=bike details, 3=checklist, 4=photos, 5=summary, 6=report
  currentSection: number;
}

export interface SavedReport {
  id: string;
  savedAt: string;
  inspection: InspectionData;
}
