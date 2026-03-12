import { InspectionData, BikeDetails, ItemStatus, ChecklistItem } from './types';
import { getDefaultChecklist, getDefaultMandatoryPhotos } from './inspection-data';

const STORAGE_KEY = 'pdi-inspection';

export function createNewInspection(): InspectionData {
  const data: InspectionData = {
    id: `insp-${Date.now()}`,
    bike: {
      vin: '',
      engineNumber: '',
      model: 'Triumph Scrambler 400 X',
      color: '',
      dealerName: '',
      odometer: '',
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

export function updateBikeDetails(data: InspectionData, bike: BikeDetails): InspectionData {
  const updated = { ...data, bike };
  saveInspection(updated);
  return updated;
}

export function updateChecklistItem(
  data: InspectionData,
  itemId: string,
  updates: Partial<Pick<ChecklistItem, 'status' | 'comment' | 'photoUrl'>>
): InspectionData {
  const updated = {
    ...data,
    checklist: data.checklist.map((item) =>
      item.id === itemId ? { ...item, ...updates } : item
    ),
  };
  saveInspection(updated);
  return updated;
}

export function updateMandatoryPhoto(
  data: InspectionData,
  photoId: string,
  photoUrl: string
): InspectionData {
  const updated = {
    ...data,
    mandatoryPhotos: data.mandatoryPhotos.map((p) =>
      p.id === photoId ? { ...p, photoUrl } : p
    ),
  };
  saveInspection(updated);
  return updated;
}

export function getInspectionStats(data: InspectionData) {
  const total = data.checklist.length;
  const passed = data.checklist.filter((i) => i.status === 'pass').length;
  const issues = data.checklist.filter((i) => i.status === 'issue').length;
  const pending = data.checklist.filter((i) => i.status === 'pending').length;
  const photosUploaded = data.mandatoryPhotos.filter((p) => p.photoUrl).length;
  const totalPhotos = data.mandatoryPhotos.length;
  return { total, passed, issues, pending, photosUploaded, totalPhotos };
}
