import {
  InspectionData,
  BikeDetails,
  ChecklistItem,
  SavedReport,
} from "./types";
import {
  getDefaultChecklist,
  getDefaultMandatoryPhotos,
} from "./inspection-data";

const STORAGE_KEY = "pdi-inspection";
const BIKE_STORAGE_KEY = "pdi-bike-details";
const SAVED_REPORTS_KEY = "pdi-saved-reports";

export function saveBikeDetails(bike: BikeDetails): void {
  localStorage.setItem(BIKE_STORAGE_KEY, JSON.stringify(bike));
}

export function loadBikeDetails(): BikeDetails | null {
  const raw = localStorage.getItem(BIKE_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BikeDetails;
  } catch {
    return null;
  }
}

export function createNewInspection(): InspectionData {
  const savedBike = loadBikeDetails();
  const data: InspectionData = {
    id: `insp-${Date.now()}`,
    bike: savedBike ?? {
      brand: "",
      vin: "",
      engineNumber: "",
      model: "",
      color: "",
      dealerName: "",
      odometer: "",
    },
    checklist: getDefaultChecklist(),
    mandatoryPhotos: getDefaultMandatoryPhotos(),
    startedAt: new Date().toISOString(),
    completedAt: null,
    currentStep: 0,
    currentSection: 0,
  };
  saveInspection(data);
  return data;
}

export function saveInspection(data: InspectionData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadInspection(): InspectionData | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as InspectionData;
  } catch {
    return null;
  }
}

export function clearInspection(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function updateBikeDetails(
  data: InspectionData,
  bike: BikeDetails,
): InspectionData {
  saveBikeDetails(bike);
  const updated = { ...data, bike };
  saveInspection(updated);
  return updated;
}

export function updateChecklistItem(
  data: InspectionData,
  itemId: string,
  updates: Partial<Pick<ChecklistItem, "status" | "comment" | "photoUrl">>,
): InspectionData {
  const updated = {
    ...data,
    checklist: data.checklist.map((item) =>
      item.id === itemId ? { ...item, ...updates } : item,
    ),
  };
  saveInspection(updated);
  return updated;
}

export function updateMandatoryPhoto(
  data: InspectionData,
  photoId: string,
  photoUrl: string,
): InspectionData {
  const updated = {
    ...data,
    mandatoryPhotos: data.mandatoryPhotos.map((p) =>
      p.id === photoId ? { ...p, photoUrl } : p,
    ),
  };
  saveInspection(updated);
  return updated;
}

export function getInspectionStats(data: InspectionData) {
  const total = data.checklist.length;
  const passed = data.checklist.filter((i) => i.status === "pass").length;
  const issues = data.checklist.filter((i) => i.status === "issue").length;
  const pending = data.checklist.filter((i) => i.status === "pending").length;
  const photosUploaded = data.mandatoryPhotos.filter((p) => p.photoUrl).length;
  const totalPhotos = data.mandatoryPhotos.length;
  return { total, passed, issues, pending, photosUploaded, totalPhotos };
}

export function loadSavedReports(): SavedReport[] {
  const raw = localStorage.getItem(SAVED_REPORTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SavedReport[];
  } catch {
    return [];
  }
}

export function saveReport(inspection: InspectionData): SavedReport {
  const report: SavedReport = {
    id: `report-${Date.now()}`,
    savedAt: new Date().toISOString(),
    inspection,
  };
  const existing = loadSavedReports();
  // Replace if same inspection id already saved, otherwise prepend
  const updated = [
    report,
    ...existing.filter((r) => r.inspection.id !== inspection.id),
  ];
  localStorage.setItem(SAVED_REPORTS_KEY, JSON.stringify(updated));
  return report;
}

export function deleteSavedReport(reportId: string): void {
  const updated = loadSavedReports().filter((r) => r.id !== reportId);
  localStorage.setItem(SAVED_REPORTS_KEY, JSON.stringify(updated));
}
