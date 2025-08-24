import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export default function ExplainerModal({ isOpen, onClose, title, content }: ExplainerModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg" data-testid="explainer-modal">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900" data-testid="explainer-title">
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div 
          className="text-gray-700 space-y-4" 
          dangerouslySetInnerHTML={{ __html: content }}
          data-testid="explainer-content"
        />
        
        <div className="flex justify-end mt-6">
          <Button onClick={onClose} data-testid="button-close-explainer">
            Got it! 👍
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
