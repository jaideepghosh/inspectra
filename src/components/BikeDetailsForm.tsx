import { useState } from "react";
import { BikeDetails } from "@/lib/types";
import { saveBikeDetails } from "@/lib/inspection-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight, ArrowLeft } from "lucide-react";

interface BikeDetailsFormProps {
  initial: BikeDetails;
  onSubmit: (details: BikeDetails) => void;
  onBack: () => void;
}

const BikeDetailsForm = ({
  initial,
  onSubmit,
  onBack,
}: BikeDetailsFormProps) => {
  const [form, setForm] = useState<BikeDetails>(initial);

  const update = (key: keyof BikeDetails, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      saveBikeDetails(next);
      return next;
    });
  };

  const canSubmit =
    form.vin.trim() && form.engineNumber.trim() && form.dealerName.trim();

  const fields: {
    key: keyof BikeDetails;
    label: string;
    placeholder: string;
    required?: boolean;
  }[] = [
    {
      key: "vin",
      label: "VIN / Chassis Number",
      placeholder: "e.g. MLATFK227R5000123",
      required: true,
    },
    {
      key: "engineNumber",
      label: "Engine Number",
      placeholder: "e.g. TR400E-00123",
      required: true,
    },
    { key: "odometer", label: "Odometer Reading (km)", placeholder: "e.g. 5" },
    { key: "color", label: "Color", placeholder: "e.g. Phantom Black" },
    {
      key: "dealerName",
      label: "Dealer Name",
      placeholder: "e.g. Triumph Mumbai",
      required: true,
    },
  ];

  return (
    <div className="min-h-screen px-4 py-6 animate-slide-up">
      <button
        onClick={onBack}
        className="flex items-center text-muted-foreground mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </button>

      <h2 className="text-xl font-display font-bold text-foreground mb-1">
        BIKE DETAILS
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Enter the motorcycle information from documents.
      </p>

      <div className="bg-card rounded-lg border border-border p-4 mb-4">
        <p className="text-xs font-display text-primary mb-1">BRAND & MODEL</p>
        <p className="text-base font-semibold text-foreground">{form.model}</p>
        {form.brand && (
          <p className="text-sm text-muted-foreground mt-0.5">{form.brand}</p>
        )}
      </div>

      <div className="space-y-4">
        {fields.map(({ key, label, placeholder, required }) => (
          <div key={key}>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              {label} {required && <span className="text-primary">*</span>}
            </Label>
            <Input
              value={form[key]}
              onChange={(e) => update(key, e.target.value)}
              placeholder={placeholder}
              className="h-12 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
        ))}
      </div>

      <Button
        onClick={() => onSubmit(form)}
        disabled={!canSubmit}
        className="w-full h-14 mt-8 text-base font-display font-semibold"
        size="lg"
      >
        START INSPECTION
        <ChevronRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
};

export default BikeDetailsForm;
