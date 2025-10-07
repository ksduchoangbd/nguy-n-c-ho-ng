import React, { useState, useRef } from 'react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import type { ImageFile } from '../types';
import { UploadIcon, XCircleIcon } from './Icons';

interface ImageUploaderProps {
  title: string;
  onImageUpload: (file: ImageFile | null) => void;
}


// Helper function to render a cropped image with transformations to a canvas.
function setCanvasPreview(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  crop: PixelCrop,
  scale = 1,
  rotate = 0,
) {
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  
  canvas.width = Math.floor(crop.width * scaleX);
  canvas.height = Math.floor(crop.height * scaleY);

  ctx.imageSmoothingQuality = 'high';

  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;

  const rotateRads = (rotate * Math.PI) / 180;
  const centerX = image.naturalWidth / 2;
  const centerY = image.naturalHeight / 2;

  ctx.save();

  // 5) Move the crop origin to the canvas origin (0,0)
  ctx.translate(-cropX, -cropY);
  // 4) Move the origin to the center of the original position
  ctx.translate(centerX, centerY);
  // 3) Rotate around the origin
  ctx.rotate(rotateRads);
  // 2) Scale the image
  ctx.scale(scale, scale);
  // 1) Move the center of the image to the origin (0,0)
  ctx.translate(-centerX, -centerY);
  ctx.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
  );

  ctx.restore();
}


const ImageUploader: React.FC<ImageUploaderProps> = ({ title, onImageUpload }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourceFileType, setSourceFileType] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [showSuccess, setShowSuccess] = useState(false);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSourceFileType(file.type);
      setCrop(undefined); // Reset crop state
      setScale(1); // Reset zoom
      setRotate(0); // Reset rotation
      const reader = new FileReader();
      reader.onloadend = () => {
        setSourceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImagePreview(null);
    onImageUpload(null);
    setSourceImage(null);
    setSourceFileType(null);
    setCompletedCrop(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  const handleCropCancel = () => {
    setSourceImage(null);
    setScale(1);
    setRotate(0);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleCropConfirm = async () => {
    if (completedCrop && imgRef.current && sourceFileType) {
      try {
        const previewCanvas = document.createElement('canvas');
        setCanvasPreview(
            imgRef.current,
            previewCanvas,
            completedCrop,
            scale,
            rotate
        );

        const outputMimeType = (sourceFileType === 'image/png' || sourceFileType === 'image/webp') ? sourceFileType : 'image/jpeg';
        const dataUrl = previewCanvas.toDataURL(outputMimeType);
        
        setImagePreview(dataUrl);
        const base64 = dataUrl.split(',')[1];
        onImageUpload({ base64, mimeType: outputMimeType });
        setSourceImage(null); // Close modal

        // Reset for next time
        setScale(1);
        setRotate(0);

        // Add visual feedback
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
        }, 2000); // Show feedback for 2 seconds

      } catch (e) {
        console.error("Error cropping image:", e);
        setSourceImage(null); // Close modal on error
      }
    }
  };


  return (
    <>
      {sourceImage && (
        <div className="fixed inset-0 bg-white/80 dark:bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl shadow-2xl max-w-4xl w-full border border-gray-200 dark:border-gray-700 flex flex-col">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Cắt & Điều chỉnh ảnh</h3>
            <div className="max-h-[60vh] overflow-auto mb-4 flex justify-center bg-gray-200 dark:bg-gray-900 rounded-lg">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={undefined} // Free crop
                scale={scale}
                rotate={rotate}
              >
                <img ref={imgRef} src={sourceImage} alt="Crop preview" style={{ maxHeight: '60vh' }} />
              </ReactCrop>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                  <label htmlFor="scale-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Zoom: {Math.round(scale * 100)}%</label>
                  <input
                      id="scale-input"
                      type="range"
                      min="1"
                      max="3"
                      step="0.01"
                      value={scale}
                      onInput={(e) => setScale(Number((e.target as HTMLInputElement).value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
              </div>
              <div className="space-y-2">
                  <label htmlFor="rotate-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Xoay: {Math.round(rotate)}°</label>
                  <input
                      id="rotate-input"
                      type="range"
                      min="-180"
                      max="180"
                      value={rotate}
                      onInput={(e) => setRotate(Number((e.target as HTMLInputElement).value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button onClick={handleCropCancel} className="py-2 px-5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500 transition-colors duration-200 font-semibold">
                Hủy
              </button>
              <button 
                onClick={handleCropConfirm} 
                disabled={!completedCrop || completedCrop.width === 0} 
                className={`py-2 px-5 rounded-lg transition-colors duration-200 font-semibold ${
                  (!completedCrop || completedCrop.width === 0) 
                    ? 'bg-sky-300 dark:bg-sky-800 text-sky-100 dark:text-sky-400/50 cursor-not-allowed' 
                    : 'bg-sky-600 text-white hover:bg-sky-500'
                }`}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
      <div 
        className={`relative aspect-square bg-gray-200/50 dark:bg-gray-700/50 border-2 border-dashed rounded-lg flex flex-col justify-center items-center text-center p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 group ${
          showSuccess 
            ? 'border-emerald-500 border-solid ring-2 ring-emerald-500/30' 
            : 'border-gray-400 dark:border-gray-600 hover:border-sky-500'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileChange}
        />
        {imagePreview ? (
          <>
            <img src={imagePreview} alt={title} className="object-contain w-full h-full rounded-md" />
            <button 
              onClick={handleRemoveImage}
              className="absolute top-1 right-1 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-full text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors duration-200 opacity-0 group-hover:opacity-100"
              aria-label="Remove image"
            >
              <XCircleIcon className="w-6 h-6" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
            <UploadIcon className="w-8 h-8 mb-2 group-hover:text-sky-400 transition-colors" />
            <span className="text-sm font-semibold">{title}</span>
          </div>
        )}
      </div>
    </>
  );
};

export default ImageUploader;