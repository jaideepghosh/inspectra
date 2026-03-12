import { useState, useRef } from 'react';
import { ChecklistItem, ItemStatus } from '@/lib/types';
import { getSectionNames } from '@/lib/inspection-data';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import ProgressBar from '@/components/ProgressBar';
import {
  ArrowLeft,
  ChevronRight,
  Check,
  AlertTriangle,
  Camera,
  MessageSquare,
  X,
} from 'lucide-react';

interface InspectionChecklistProps {
  items: ChecklistItem[];
  currentSection: number;
  onUpdateItem: (itemId: string, updates: Partial<Pick<ChecklistItem, 'status' | 'comment' | 'photoUrl'>>) => void;
  onSectionChange: (index: number) => void;
  onComplete: () => void;
  onBack: () => void;
}

const InspectionChecklist = ({
  items,
  currentSection,
  onUpdateItem,
  onSectionChange,
  onComplete,
  onBack,
}: InspectionChecklistProps) => {
  const sectionNames = getSectionNames();
  const sectionItems = items.filter((i) => i.section === sectionNames[currentSection]);
  const completedItems = items.filter((i) => i.status !== 'pending').length;
  const [expandedComment, setExpandedComment] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activePhotoItem, setActivePhotoItem] = useState<string | null>(null);

  const isLastSection = currentSection === sectionNames.length - 1;

  const handlePhotoCapture = (itemId: string) => {
    setActivePhotoItem(itemId);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activePhotoItem) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        onUpdateItem(activePhotoItem, { photoUrl: ev.target?.result as string });
        setActivePhotoItem(null);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleStatus = (itemId: string, status: ItemStatus) => {
    onUpdateItem(itemId, { status });
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

      <button onClick={onBack} className="flex items-center text-muted-foreground mb-4 text-sm">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </button>

      <ProgressBar current={completedItems} total={items.length} label="INSPECTION PROGRESS" />

      {/* Section tabs */}
      <div className="flex overflow-x-auto gap-2 mt-4 mb-6 pb-2 -mx-4 px-4 scrollbar-hide">
        {sectionNames.map((name, idx) => {
          const sItems = items.filter((i) => i.section === name);
          const done = sItems.every((i) => i.status !== 'pending');
          const hasIssue = sItems.some((i) => i.status === 'issue');
          return (
            <button
              key={name}
              onClick={() => onSectionChange(idx)}
              className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-display font-medium transition-colors border ${
                idx === currentSection
                  ? 'bg-primary text-primary-foreground border-primary'
                  : done
                  ? hasIssue
                    ? 'bg-destructive/10 text-destructive border-destructive/30'
                    : 'bg-success/10 text-success border-success/30'
                  : 'bg-secondary text-secondary-foreground border-border'
              }`}
            >
              {name}
            </button>
          );
        })}
      </div>

      <h3 className="text-lg font-display font-bold text-foreground mb-4">
        {sectionNames[currentSection]}
      </h3>

      <div className="space-y-3">
        {sectionItems.map((item) => (
          <div
            key={item.id}
            className={`bg-card rounded-lg border p-4 transition-colors ${
              item.status === 'pass'
                ? 'border-success/30'
                : item.status === 'issue'
                ? 'border-destructive/30'
                : 'border-border'
            }`}
          >
            <p className="text-sm text-foreground mb-3">{item.description}</p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleStatus(item.id, 'pass')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  item.status === 'pass'
                    ? 'bg-success text-success-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-success/20'
                }`}
              >
                <Check className="w-3.5 h-3.5" /> Pass
              </button>
              <button
                onClick={() => handleStatus(item.id, 'issue')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  item.status === 'issue'
                    ? 'bg-destructive text-destructive-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-destructive/20'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Issue
              </button>
              <button
                onClick={() => setExpandedComment(expandedComment === item.id ? null : item.id)}
                className={`p-2 rounded-md text-xs transition-colors ${
                  item.comment ? 'bg-primary/10 text-primary' : 'bg-secondary text-secondary-foreground'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handlePhotoCapture(item.id)}
                className={`p-2 rounded-md text-xs transition-colors ${
                  item.photoUrl ? 'bg-primary/10 text-primary' : 'bg-secondary text-secondary-foreground'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {expandedComment === item.id && (
              <div className="mt-3">
                <Textarea
                  placeholder="Add a note about this item..."
                  value={item.comment}
                  onChange={(e) => onUpdateItem(item.id, { comment: e.target.value })}
                  className="bg-secondary border-border text-foreground text-sm min-h-[60px]"
                />
              </div>
            )}

            {item.photoUrl && (
              <div className="mt-3 relative w-20 h-20">
                <img src={item.photoUrl} alt="Evidence" className="w-20 h-20 rounded-md object-cover" />
                <button
                  onClick={() => onUpdateItem(item.id, { photoUrl: null })}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-destructive-foreground" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-6 pb-8">
        {currentSection > 0 && (
          <Button
            variant="outline"
            onClick={() => onSectionChange(currentSection - 1)}
            className="flex-1 h-12 font-display border-border"
          >
            PREVIOUS
          </Button>
        )}
        <Button
          onClick={() => (isLastSection ? onComplete() : onSectionChange(currentSection + 1))}
          className="flex-1 h-12 font-display font-semibold"
        >
          {isLastSection ? 'NEXT: PHOTOS' : 'NEXT SECTION'}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default InspectionChecklist;
