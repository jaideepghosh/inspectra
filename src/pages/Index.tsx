import { useInspection } from "@/lib/inspection-context";
import { loadBikeDetails } from "@/lib/inspection-store";
import WelcomeScreen from "@/components/WelcomeScreen";
import BrandModelSelector from "@/components/BrandModelSelector";
import BikeDetailsForm from "@/components/BikeDetailsForm";
import InspectionChecklist from "@/components/InspectionChecklist";
import PhotoCapture from "@/components/PhotoCapture";
import InspectionSummary from "@/components/InspectionSummary";
import ReportGenerator from "@/components/ReportGenerator";

const Index = () => {
  const {
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
  } = useInspection();

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
        <BrandModelSelector
          initialBrand={data.bike.brand}
          initialModel={data.bike.model}
          onSubmit={submitBrandModel}
          onBack={() => goTo(0)}
        />
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="max-w-lg mx-auto">
        <BikeDetailsForm
          initial={loadBikeDetails() ?? data.bike}
          onSubmit={submitBikeDetails}
          onBack={() => goTo(1)}
        />
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="max-w-lg mx-auto">
        <InspectionChecklist
          items={data.checklist}
          currentSection={data.currentSection}
          onUpdateItem={updateChecklistItem}
          onSectionChange={updateSectionIndex}
          onComplete={completeChecklist}
          onBack={() => goTo(2)}
        />
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className="max-w-lg mx-auto">
        <PhotoCapture
          photos={data.mandatoryPhotos}
          onUpdatePhoto={updatePhoto}
          onRemovePhoto={removePhoto}
          onComplete={completePhotos}
          onBack={() => goTo(3)}
        />
      </div>
    );
  }

  if (step === 5) {
    return (
      <div className="max-w-lg mx-auto">
        <InspectionSummary
          data={data}
          onGenerateReport={() => goTo(6)}
          onBack={() => goTo(4)}
        />
      </div>
    );
  }

  if (step === 6) {
    return (
      <div className="max-w-lg mx-auto">
        <ReportGenerator
          data={data}
          onBack={() => goTo(5)}
          onNewInspection={handleFullReset}
        />
      </div>
    );
  }

  return null;
};

export default Index;
