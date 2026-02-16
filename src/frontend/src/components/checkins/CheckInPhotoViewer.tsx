import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { photoToImageSrc } from '@/utils/images';
import { Image as ImageIcon } from 'lucide-react';

interface CheckInPhotoViewerProps {
  photo: string;
  timestamp?: bigint;
  className?: string;
}

/**
 * View-only photo viewer component for check-in evidence.
 * Displays a thumbnail that opens a larger modal view on click.
 * No download functionality is provided.
 */
export default function CheckInPhotoViewer({ photo, timestamp, className = '' }: CheckInPhotoViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const imageSrc = photoToImageSrc(photo);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`relative overflow-hidden rounded-lg border-2 border-border hover:border-emerald-500 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${className}`}
        aria-label="View photo evidence"
      >
        <img
          src={imageSrc}
          alt="Check-in photo evidence"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
          <ImageIcon className="w-6 h-6 text-white opacity-0 hover:opacity-100 transition-opacity" />
        </div>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Photo Evidence</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <img
              src={imageSrc}
              alt="Check-in photo evidence (full size)"
              className="w-full h-auto rounded-lg"
            />
            {timestamp && (
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Captured at check-in
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
