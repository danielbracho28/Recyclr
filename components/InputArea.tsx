
import React, { useRef, useState, useCallback, useEffect } from 'react';

const CameraIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;

interface InputAreaProps {
  onImageReady: (imageSrc: string) => void;
  isModelLoading: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ onImageReady, isModelLoading }) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setCameraError("Could not access camera. Please ensure permissions are granted and try again.");
        setActiveTab('upload');
      }
    } else {
      setCameraError("Camera not supported on this device.");
      setActiveTab('upload');
    }
  }, []);

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        onImageReady(canvas.toDataURL('image/jpeg'));
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onImageReady(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const commonButtonClasses = "px-6 py-3 font-semibold rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-dark focus:ring-primary";
  const disabledClasses = "bg-slate-300 dark:bg-slate-600 text-slate-500 cursor-not-allowed";
  const enabledClasses = "bg-primary hover:bg-primary-dark text-white";

  return (
    <div className="bg-white dark:bg-dark shadow-xl rounded-2xl w-full max-w-lg mx-auto overflow-hidden">
      <div className="flex">
        <button
          onClick={() => setActiveTab('camera')}
          className={`flex-1 p-4 font-semibold text-lg flex items-center justify-center transition-colors ${activeTab === 'camera' ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
        >
          <CameraIcon/> Live Camera
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex-1 p-4 font-semibold text-lg flex items-center justify-center transition-colors ${activeTab === 'upload' ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
        >
          <UploadIcon/> Upload Image
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'camera' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-full bg-slate-800 rounded-lg overflow-hidden aspect-square relative">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              {cameraError && <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 p-4"><p className="text-white text-center">{cameraError}</p></div>}
            </div>
            <button onClick={handleCapture} disabled={isModelLoading || !!cameraError} className={`${commonButtonClasses} ${isModelLoading || !!cameraError ? disabledClasses : enabledClasses}`}>
              {isModelLoading ? 'Model Loading...' : 'Scan Item'}
            </button>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="flex flex-col items-center gap-4">
            <div 
              className="w-full aspect-square border-4 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex flex-col items-center justify-center text-center p-4 cursor-pointer hover:border-primary dark:hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadIcon />
              <p className="font-semibold text-slate-600 dark:text-slate-300">Click to upload an image</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">PNG, JPG, or WEBP</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isModelLoading}
            />
             <button onClick={() => fileInputRef.current?.click()} disabled={isModelLoading} className={`${commonButtonClasses} ${isModelLoading ? disabledClasses : enabledClasses}`}>
              {isModelLoading ? 'Model Loading...' : 'Choose File'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
