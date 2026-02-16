import { useState, useRef } from 'react';
import { useAddCheckIn, useGetCheckIns } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogIn, CheckCircle2, AlertCircle, Clock, Camera, X } from 'lucide-react';
import { toast } from 'sonner';
import { formatDateTime, formatRelativeTime } from '../utils/time';
import { validateImageFile, compressImage } from '../utils/images';
import CheckInPhotoViewer from '../components/checkins/CheckInPhotoViewer';

export default function PrincipalCheckInPage() {
  const [detail, setDetail] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const addCheckIn = useAddCheckIn();
  const { data: checkIns, isLoading } = useGetCheckIns();

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateImageFile(file)) {
      toast.error('Please select a valid image file');
      return;
    }

    try {
      // Compress and convert to base64
      const compressedDataUrl = await compressImage(file, 500);
      setSelectedPhoto(compressedDataUrl);
      setPhotoFile(file);
    } catch (error) {
      toast.error('Failed to process image. Please try another file.');
      console.error('Image processing error:', error);
    }
  };

  const handleRemovePhoto = () => {
    setSelectedPhoto(null);
    setPhotoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPhoto) {
      toast.error('Please select a photo before submitting');
      return;
    }

    try {
      // Extract base64 data from data URL
      const base64Data = selectedPhoto.split(',')[1] || selectedPhoto;
      await addCheckIn.mutateAsync({ detail, photo: base64Data });
      toast.success('Check-in submitted successfully!');
      setDetail('');
      handleRemovePhoto();
    } catch (error) {
      toast.error('Failed to submit check-in. Please try again.');
    }
  };

  const sortedCheckIns = checkIns ? [...checkIns].sort((a, b) => Number(b.time - a.time)) : [];
  const mostRecent = sortedCheckIns[0];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Check-In</h2>
        <p className="text-muted-foreground mt-2">
          Record your arrival time with photo evidence
        </p>
      </div>

      {mostRecent && (
        <Alert className="border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="text-emerald-800 dark:text-emerald-200">
            Last check-in: {formatRelativeTime(mostRecent.time)} ({formatDateTime(mostRecent.time)})
          </AlertDescription>
        </Alert>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogIn className="w-5 h-5 text-emerald-600" />
            Submit Check-In
          </CardTitle>
          <CardDescription>Record your arrival with photo evidence (required)</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="photo" className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Photo Evidence <span className="text-destructive">*</span>
              </Label>
              <div className="space-y-3">
                {selectedPhoto ? (
                  <div className="relative">
                    <img
                      src={selectedPhoto}
                      alt="Selected check-in photo"
                      className="w-full h-48 object-cover rounded-lg border-2 border-emerald-500"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={handleRemovePhoto}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-emerald-500 transition-colors">
                    <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground mb-3">
                      Click to select a photo
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Choose Photo
                    </Button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                A photo is required for each check-in. The image will be compressed automatically.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="detail">Notes (Optional)</Label>
              <Textarea
                id="detail"
                placeholder="Add any notes about your arrival..."
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                The check-in time will be recorded automatically by the server
              </p>
            </div>

            {addCheckIn.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to submit check-in. Please try again.
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              size="lg"
              disabled={addCheckIn.isPending || !selectedPhoto}
            >
              {addCheckIn.isPending ? 'Submitting...' : 'Submit Check-In'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            Check-In History
          </CardTitle>
          <CardDescription>Your recent check-in records</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading history...
            </div>
          ) : sortedCheckIns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No check-in records yet. Submit your first check-in above.
            </div>
          ) : (
            <div className="space-y-3">
              {sortedCheckIns.slice(0, 10).map((checkIn, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-lg border bg-accent/50"
                >
                  {checkIn.photo && (
                    <CheckInPhotoViewer
                      photo={checkIn.photo}
                      timestamp={checkIn.time}
                      className="w-20 h-20 flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">
                      {formatDateTime(checkIn.time)}
                    </div>
                    {checkIn.detail && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {checkIn.detail}
                      </p>
                    )}
                    {!checkIn.photo && (
                      <p className="text-xs text-muted-foreground italic mt-1">
                        No photo (legacy record)
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground flex-shrink-0">
                    {formatRelativeTime(checkIn.time)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
