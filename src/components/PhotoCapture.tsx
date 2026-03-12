import { useRef } from 'react';
import { MandatoryPhoto } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Camera, ChevronRight, Check, X } from 'lucide-react';

interface PhotoCaptureProps {
  photos: MandatoryPhoto[];
  onUpdatePhoto: (photoId: string, photoUrl: string) => void;
  onRemovePhoto: (photoId: string) => void;
  onComplete: () => void;
  onBack: () => void;
}

const PhotoCapture = ({ photos, onUpdatePhoto, onRemovePhoto, onComplete, onBack }: PhotoCaptureProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeIdRef = useRef<string | null>(null);

  const allCaptured = photos.every((p) => p.photoUrl);

  const handleCapture = (id: string) => {
    activeIdRef.current = id;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeIdRef.current) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        onUpdatePhoto(activeIdRef.current!, ev.target?.result as string);
        activeIdRef.current = null;
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  return (
    <div className="min-h-screen px-4 py-6 animate-slide-up">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      <button onClick={onBack} className="flex items-center text-muted-foreground mb-6 text-sm">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </button>

      <h2 className="text-xl font-display font-bold text-foreground mb-1">MANDATORY PHOTOS</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Capture all required photos before generating your report.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className={`relative rounded-lg border overflow-hidden ${
              photo.photoUrl ? 'border-success/30' : 'border-border'
            }`}
          >
            {photo.photoUrl ? (
              <>
                <img src={photo.photoUrl} alt={photo.label} className="w-full aspect-[4/3] object-cover" />
                <button
                  onClick={() => onRemovePhoto(photo.id)}
                  className="absolute top-2 right-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center"
                >
                  <X className="w-3.5 h-3.5 text-destructive-foreground" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-card/90 px-2 py-1.5 flex items-center gap-1">
                  <Check className="w-3 h-3 text-success" />
                  <span className="text-xs font-medium text-foreground">{photo.label}</span>
                </div>
              </>
            ) : (
              <button
                onClick={() => handleCapture(photo.id)}
                className="w-full aspect-[4/3] bg-secondary flex flex-col items-center justify-center gap-2 hover:bg-muted transition-colors"
              >
                <Camera className="w-8 h-8 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">{photo.label}</span>
                <span className="text-[10px] text-muted-foreground text-center px-2">{photo.description}</span>
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 pb-8">
        <Button
          onClick={onComplete}
          disabled={!allCaptured}
          className="w-full h-14 text-base font-display font-semibold"
          size="lg"
        >
          {allCaptured ? 'VIEW SUMMARY' : `${photos.filter((p) => p.photoUrl).length}/${photos.length} PHOTOS CAPTURED`}
          {allCaptured && <ChevronRight className="w-5 h-5 ml-2" />}
        </Button>
        {!allCaptured && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            All photos are required to proceed
          </p>
        )}
      </div>
    </div>
  );
};

export default PhotoCapture;
