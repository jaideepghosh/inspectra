export type ItemStatus = "pass" | "issue" | "pending";

export interface BikeDetails {
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
  currentStep: number; // 0=welcome, 1=bike details, 2=checklist, 3=photos, 4=summary, 5=report
  currentSection: number;
}

export interface SavedReport {
  id: string;
  savedAt: string;
  inspection: InspectionData;
}
