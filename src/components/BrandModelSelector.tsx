import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ArrowLeft, Check, ChevronsUpDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BikeModel {
  id: number;
  name: string;
  tags: string;
}

interface BikeBrand {
  brand_name: string;
  models: BikeModel[];
}

interface BrandModelSelectorProps {
  initialBrand?: string;
  initialModel?: string;
  onSubmit: (brand: string, model: string) => void;
  onBack: () => void;
}

const BrandModelSelector = ({
  initialBrand = "",
  initialModel = "",
  onSubmit,
  onBack,
}: BrandModelSelectorProps) => {
  const [brands, setBrands] = useState<BikeBrand[]>([]);
  const [loading, setLoading] = useState(true);

  const [brandOpen, setBrandOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);

  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [selectedModel, setSelectedModel] = useState(initialModel);

  useEffect(() => {
    fetch("/bikes.json")
      .then((r) => r.json())
      .then((data: BikeBrand[]) => {
        setBrands(data.filter((b) => b != null && b.brand_name != null));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const currentBrand = brands.find((b) => b.brand_name === selectedBrand);
  const models = currentBrand?.models ?? [];

  const handleBrandSelect = (brand: string) => {
    setSelectedBrand(brand);
    setSelectedModel("");
    setBrandOpen(false);
  };

  const handleModelSelect = (model: string) => {
    setSelectedModel(model);
    setModelOpen(false);
  };

  const canProceed = selectedBrand.trim() !== "" && selectedModel.trim() !== "";

  return (
    <div className="min-h-screen px-4 py-6 animate-slide-up">
      <button
        onClick={onBack}
        className="flex items-center text-muted-foreground mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </button>

      <h2 className="text-xl font-display font-bold text-foreground mb-1">
        SELECT MOTORCYCLE
      </h2>
      <p className="text-sm text-muted-foreground mb-8">
        Choose the brand and model you are inspecting.
      </p>

      <div className="space-y-6">
        {/* Brand Selector */}
        <div>
          <p className="text-xs text-muted-foreground mb-2 font-display tracking-wide">
            BRAND <span className="text-primary">*</span>
          </p>
          <Popover open={brandOpen} onOpenChange={setBrandOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={brandOpen}
                disabled={loading}
                className="w-full h-12 justify-between bg-secondary border-border text-foreground hover:bg-secondary/80 hover:text-white font-normal"
              >
                {loading
                  ? "Loading brands…"
                  : selectedBrand || "Select a brand"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[var(--radix-popover-trigger-width)] p-0"
              align="start"
            >
              <Command>
                <CommandInput placeholder="Search brand…" />
                <CommandList>
                  <CommandEmpty>No brand found.</CommandEmpty>
                  <CommandGroup>
                    {brands.map((b) => (
                      <CommandItem
                        key={b.brand_name}
                        value={b.brand_name}
                        onSelect={() => handleBrandSelect(b.brand_name)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedBrand === b.brand_name
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {b.brand_name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Model Selector */}
        <div>
          <p className="text-xs text-muted-foreground mb-2 font-display tracking-wide">
            MODEL <span className="text-primary">*</span>
          </p>
          <Popover open={modelOpen} onOpenChange={setModelOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={modelOpen}
                disabled={!selectedBrand || models.length === 0}
                className="w-full h-12 justify-between bg-secondary border-border text-foreground hover:bg-secondary/80 hover:text-white font-normal disabled:opacity-50"
              >
                {selectedModel ||
                  (selectedBrand ? "Select a model" : "Select a brand first")}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[var(--radix-popover-trigger-width)] p-0"
              align="start"
            >
              <Command>
                <CommandInput placeholder="Search model…" />
                <CommandList>
                  <CommandEmpty>No model found.</CommandEmpty>
                  <CommandGroup>
                    {models.map((m) => (
                      <CommandItem
                        key={m.id}
                        value={m.name}
                        onSelect={() => handleModelSelect(m.name)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedModel === m.name
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {m.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Preview card */}
        {canProceed && (
          <div className="bg-card rounded-lg border border-border p-4 animate-slide-up">
            <p className="text-xs font-display text-primary mb-1">SELECTED</p>
            <p className="text-base font-semibold text-foreground">
              {selectedModel}
            </p>
            <p className="text-sm text-muted-foreground">{selectedBrand}</p>
          </div>
        )}
      </div>

      <Button
        onClick={() => onSubmit(selectedBrand, selectedModel)}
        disabled={!canProceed}
        className="w-full h-14 mt-8 text-base font-display font-semibold"
        size="lg"
      >
        NEXT: BIKE DETAILS
        <ChevronRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
};

export default BrandModelSelector;
