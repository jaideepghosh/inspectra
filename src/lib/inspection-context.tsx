import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  InspectionData,
  BikeDetails,
  ChecklistItem,
  SavedReport,
} from "./types";
import {
  createNewInspection,
  loadInspection,
  loadBikeDetails,
  saveInspection,
  clearInspection,
  updateBikeDetails as storUpdateBikeDetails,
  updateChecklistItem as storeUpdateChecklistItem,
  updateMandatoryPhoto as storeUpdateMandatoryPhoto,
  saveReport,
  loadSavedReports,
  deleteSavedReport,
} from "./inspection-store";

// ─────────────────────────────────────────────
// Shape
// ─────────────────────────────────────────────
interface InspectionContextValue {
  // Current live inspection
  data: InspectionData | null;
  step: number;
  hasExisting: boolean;

  // Navigation
  goTo: (step: number) => void;

  // Inspection lifecycle
  handleNewInspection: () => void;
  handleResume: () => void;
  handleFullReset: () => void;

  // Data mutations
  submitBrandModel: (brand: string, model: string) => void;
  submitBikeDetails: (bike: BikeDetails) => void;
  updateChecklistItem: (
    itemId: string,
    updates: Partial<Pick<ChecklistItem, "status" | "comment" | "photoUrl">>,
  ) => void;
  updateSectionIndex: (idx: number) => void;
  completeChecklist: () => void;
  updatePhoto: (photoId: string, photoUrl: string) => void;
  removePhoto: (photoId: string) => void;
  completePhotos: () => void;

  // Saved reports
  savedReports: SavedReport[];
  saveCurrentReport: () => SavedReport | null;
  removeReport: (reportId: string) => void;
}

// ─────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────
const InspectionContext = createContext<InspectionContextValue | null>(null);

export function InspectionProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<InspectionData | null>(null);
  const [step, setStep] = useState(0);
  const [hasExisting, setHasExisting] = useState(false);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);

  // Bootstrap
  useEffect(() => {
    const existing = loadInspection();
    if (existing) setHasExisting(true);
    setSavedReports(loadSavedReports());
  }, []);

  // ── Navigation ──────────────────────────────
  const goTo = useCallback((s: number) => {
    setStep(s);
    setData((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, currentStep: s };
      saveInspection(updated);
      return updated;
    });
    window.scrollTo(0, 0);
  }, []);

  // ── Lifecycle ───────────────────────────────
  const handleNewInspection = useCallback(() => {
    clearInspection();
    const fresh = createNewInspection();
    setData(fresh);
    setStep(1);
    window.scrollTo(0, 0);
  }, []);

  const handleResume = useCallback(() => {
    const existing = loadInspection();
    if (existing) {
      setData(existing);
      setStep(existing.currentStep || 1);
    }
  }, []);

  const handleFullReset = useCallback(() => {
    clearInspection();
    setData(null);
    setStep(0);
    setHasExisting(false);
  }, []);

  // ── Mutations ───────────────────────────────
  const submitBrandModel = useCallback(
    (brand: string, model: string) => {
      setData((prev) => {
        if (!prev) return prev;
        const updatedBike = { ...prev.bike, brand, model };
        return storUpdateBikeDetails(prev, updatedBike);
      });
      goTo(2);
    },
    [goTo],
  );

  const submitBikeDetails = useCallback(
    (bike: BikeDetails) => {
      setData((prev) => {
        if (!prev) return prev;
        return storUpdateBikeDetails(prev, bike);
      });
      goTo(3);
    },
    [goTo],
  );

  const updateChecklistItem = useCallback(
    (
      itemId: string,
      updates: Partial<Pick<ChecklistItem, "status" | "comment" | "photoUrl">>,
    ) => {
      setData((prev) => {
        if (!prev) return prev;
        return storeUpdateChecklistItem(prev, itemId, updates);
      });
    },
    [],
  );

  const updateSectionIndex = useCallback((idx: number) => {
    setData((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, currentSection: idx };
      saveInspection(updated);
      return updated;
    });
  }, []);

  const completeChecklist = useCallback(() => {
    setData((prev) => {
      if (!prev) return prev;
      const savedBike = loadBikeDetails();
      const synced = savedBike ? { ...prev, bike: savedBike } : prev;
      saveInspection(synced);
      return synced;
    });
    goTo(4);
  }, [goTo]);

  const updatePhoto = useCallback((photoId: string, photoUrl: string) => {
    setData((prev) => {
      if (!prev) return prev;
      return storeUpdateMandatoryPhoto(prev, photoId, photoUrl);
    });
  }, []);

  const removePhoto = useCallback((photoId: string) => {
    setData((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        mandatoryPhotos: prev.mandatoryPhotos.map((p) =>
          p.id === photoId ? { ...p, photoUrl: null } : p,
        ),
      };
      saveInspection(updated);
      return updated;
    });
  }, []);

  const completePhotos = useCallback(() => {
    setData((prev) => {
      if (!prev) return prev;
      const savedBike = loadBikeDetails();
      const completed = {
        ...prev,
        bike: savedBike ?? prev.bike,
        completedAt: new Date().toISOString(),
      };
      saveInspection(completed);
      return completed;
    });
    goTo(5);
  }, [goTo]);

  // ── Saved reports ───────────────────────────
  const saveCurrentReport = useCallback((): SavedReport | null => {
    if (!data) return null;
    const report = saveReport(data);
    setSavedReports(loadSavedReports());
    return report;
  }, [data]);

  const removeReport = useCallback((reportId: string) => {
    deleteSavedReport(reportId);
    setSavedReports(loadSavedReports());
  }, []);

  return (
    <InspectionContext.Provider
      value={{
        data,
        step,
        hasExisting,
        goTo,
        handleNewInspection,
        handleResume,
        handleFullReset,
        submitBrandModel,
        submitBikeDetails,
        updateChecklistItem,
        updateSectionIndex,
        completeChecklist,
        updatePhoto,
        removePhoto,
        completePhotos,
        savedReports,
        saveCurrentReport,
        removeReport,
      }}
    >
      {children}
    </InspectionContext.Provider>
  );
}

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────
export function useInspection(): InspectionContextValue {
  const ctx = useContext(InspectionContext);
  if (!ctx)
    throw new Error("useInspection must be used within InspectionProvider");
  return ctx;
}
