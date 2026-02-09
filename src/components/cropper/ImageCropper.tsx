'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import 'react-easy-crop/react-easy-crop.css';

interface ImageCropperProps {
  open: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedFile: File) => void;
}

interface CroppedAreaPixels {
  width: number;
  height: number;
  x: number;
  y: number;
}

const getRadianAngle = (degreeValue: number): number => {
  return (degreeValue * Math.PI) / 180;
};

export function ImageCropper({ open, onClose, imageSrc, onCropComplete }: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedAreaPixels | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropMove = useCallback((location: Point) => {
    setCrop(location);
  }, []);

  const onCropAreaChange = useCallback(
    (croppedArea: Area, croppedAreaPixels: CroppedAreaPixels) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const handleZoomChange = (value: number[]): void => {
    setZoom(value[0] ?? 1);
  };

  const handleRotationChange = (value: number[]): void => {
    setRotation(value[0] ?? 0);
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (err) => reject(err));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (): Promise<void> => {
    if (!croppedAreaPixels) return;

    try {
      setIsProcessing(true);
      const image = await createImage(imageSrc);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas context not found');
      }

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(getRadianAngle(rotation));
      ctx.scale(zoom, zoom);
      ctx.translate(-croppedAreaPixels.width / 2, -croppedAreaPixels.height / 2);

      ctx.drawImage(image, -croppedAreaPixels.x, -croppedAreaPixels.y);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            throw new Error('Canvas blob not created');
          }

          const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
          onCropComplete(file);
          handleClose();
          setIsProcessing(false);
        },
        'image/jpeg',
        0.95,
      );
    } catch (error) {
      console.error('Error cropping image:', error);
      setIsProcessing(false);
    }
  };

  const handleClose = (): void => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="theme-admin sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cropper Container */}
          <div className="relative w-full overflow-hidden bg-gray-900 rounded-lg h-96">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={4 / 3}
              cropShape="rect"
              showGrid
              onCropChange={onCropMove}
              onCropAreaChange={onCropAreaChange}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              restrictPosition={false}
            />
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Zoom */}
            <div>
              <Label>Zoom: {zoom.toFixed(1)}x</Label>
              <Slider
                value={[zoom]}
                onValueChange={handleZoomChange}
                min={1}
                max={3}
                step={0.1}
                className="mt-2"
              />
            </div>

            {/* Rotation */}
            <div>
              <Label>Rotation: {rotation}°</Label>
              <Slider
                value={[rotation]}
                onValueChange={handleRotationChange}
                min={0}
                max={360}
                step={1}
                className="mt-2"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={getCroppedImg} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Crop & Upload'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
