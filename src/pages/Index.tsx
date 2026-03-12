import { useState, useEffect } from 'react';
import { InspectionData } from '@/lib/types';
import {
  createNewInspection,
  loadInspection,
  saveInspection,
  clearInspection,
  updateBikeDetails,
  updateChecklistItem,
  updateMandatoryPhoto,
} from '@/lib/inspection-store';
import WelcomeScreen from '@/components/WelcomeScreen';
import BikeDetailsForm from '@/components/BikeDetailsForm';
import InspectionChecklist from '@/components/InspectionChecklist';
import PhotoCapture from '@/components/PhotoCapture';
import InspectionSummary from '@/components/InspectionSummary';
import ReportGenerator from '@/components/ReportGenerator';

const Index = () => {
  const [data, setData] = useState<InspectionData | null>(null);
  const [step, setStep] = useState(0);
  const [hasExisting, setHasExisting] = useState(false);

  useEffect(() => {
    const existing = loadInspection();
    if (existing) {
      setHasExisting(true);
    }
  }, []);

  const goTo = (s: number) => {
    setStep(s);
    if (data) {
      const updated = { ...data, currentStep: s };
      saveInspection(updated);
      setData(updated);
    }
    window.scrollTo(0, 0);
  };

  const handleNewInspection = () => {
    clearInspection();
    const fresh = createNewInspection();
    setData(fresh);
    goTo(1);
  };

  const handleResume = () => {
    const existing = loadInspection();
    if (existing) {
      setData(existing);
      setStep(existing.currentStep || 1);
    }
  };

  const handleFullReset = () => {
    clearInspection();
    setData(null);
    setStep(0);
    setHasExisting(false);
  };

  if (step === 0) {
    return (
      <div className="max-w-lg mx-auto">
        <WelcomeScreen
          onStart={handleNewInspection}
          onResume={handleResume}
          hasExisting={hasExisting}
        />
      </div>
    );
  }

  if (!data) return null;

  if (step === 1) {
    return (
      <div className="max-w-lg mx-auto">
        <BikeDetailsForm
          initial={data.bike}
          onSubmit={(bike) => {
            const updated = updateBikeDetails(data, bike);
            setData(updated);
            goTo(2);
          }}
          onBack={() => goTo(0)}
        />
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="max-w-lg mx-auto">
        <InspectionChecklist
          items={data.checklist}
          currentSection={data.currentSection}
          onUpdateItem={(itemId, updates) => {
            const updated = updateChecklistItem(data, itemId, updates);
            setData(updated);
          }}
          onSectionChange={(idx) => {
            const updated = { ...data, currentSection: idx };
            saveInspection(updated);
            setData(updated);
          }}
          onComplete={() => goTo(3)}
          onBack={() => goTo(1)}
        />
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="max-w-lg mx-auto">
        <PhotoCapture
          photos={data.mandatoryPhotos}
          onUpdatePhoto={(photoId, photoUrl) => {
            const updated = updateMandatoryPhoto(data, photoId, photoUrl);
            setData(updated);
          }}
          onRemovePhoto={(photoId) => {
            const updated = {
              ...data,
              mandatoryPhotos: data.mandatoryPhotos.map((p) =>
                p.id === photoId ? { ...p, photoUrl: null } : p
              ),
            };
            saveInspection(updated);
            setData(updated);
          }}
          onComplete={() => {
            const completed = { ...data, completedAt: new Date().toISOString() };
            saveInspection(completed);
            setData(completed);
            goTo(4);
          }}
          onBack={() => goTo(2)}
        />
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className="max-w-lg mx-auto">
        <InspectionSummary
          data={data}
          onGenerateReport={() => goTo(5)}
          onBack={() => goTo(3)}
        />
      </div>
    );
  }

  if (step === 5) {
    return (
      <div className="max-w-lg mx-auto">
        <ReportGenerator
          data={data}
          onBack={() => goTo(4)}
          onNewInspection={handleFullReset}
        />
      </div>
    );
  }

  return null;
};

export default Index;
