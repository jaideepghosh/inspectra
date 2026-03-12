import { Shield, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomeScreenProps {
  onStart: () => void;
  onResume: () => void;
  hasExisting: boolean;
}

const WelcomeScreen = ({ onStart, onResume, hasExisting }: WelcomeScreenProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 animate-slide-up">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <Shield className="w-8 h-8 text-primary" />
      </div>

      <h1 className="text-2xl font-display font-bold text-foreground text-center mb-2">
        PDI INSPECTOR
      </h1>
      <p className="text-sm text-muted-foreground text-center mb-1 font-display">
        TRIUMPH SCRAMBLER 400 X
      </p>
      <p className="text-sm text-muted-foreground text-center mb-10 max-w-xs">
        Complete a professional Pre-Delivery Inspection before accepting your motorcycle.
      </p>

      <div className="w-full max-w-xs space-y-3">
        <Button
          onClick={onStart}
          className="w-full h-14 text-base font-display font-semibold"
          size="lg"
        >
          NEW INSPECTION
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>

        {hasExisting && (
          <Button
            onClick={onResume}
            variant="outline"
            className="w-full h-14 text-base font-display border-primary/30 text-primary hover:bg-primary/10"
            size="lg"
          >
            RESUME INSPECTION
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground mt-10 text-center">
        All data is stored locally on your device.
      </p>
    </div>
  );
};

export default WelcomeScreen;
