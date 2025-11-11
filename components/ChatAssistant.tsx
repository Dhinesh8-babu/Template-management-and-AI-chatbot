
import React, { useState } from 'react';
import { getSuggestedReply } from '../services/geminiService.ts';
import { CameraIcon } from './icons/CameraIcon.tsx';

export const ChatAssistant: React.FC = () => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [context, setContext] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCaptureAndSuggest = async () => {
    setIsLoading(true);
    setError(null);
    setSuggestion('');
    setCapturedImage(null);

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      
      const video = document.createElement('video');
      video.srcObject = stream;
      
      video.onloadedmetadata = () => {
        video.play();
        
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          stream.getTracks().forEach(track => track.stop());
          throw new Error('Could not get canvas context');
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);

        // Stop the screen sharing track as soon as the frame is captured
        stream.getTracks().forEach(track => track.stop());

        const base64Image = dataUrl.split(',')[1];
        getSuggestedReply(base64Image, 'image/jpeg', context)
          .then(suggested => {
            setSuggestion(suggested);
          })
          .catch(err => {
            setError(err instanceof Error ? err.message : 'An unknown error occurred getting suggestion.');
          })
          .finally(() => {
              setIsLoading(false);
          });
      };
      video.onerror = () => {
        stream.getTracks().forEach(track => track.stop());
        setError('Failed to load video stream for capture.');
        setIsLoading(false);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setError('Screen capture permission was denied. Please allow screen sharing to use this feature.');
      } else {
        setError(err instanceof Error ? err.message : 'An unknown error occurred during screen capture.');
      }
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (suggestion) {
      navigator.clipboard.writeText(suggestion);
    }
  };

  const handleReset = () => {
      setCapturedImage(null);
      setSuggestion('');
      setError(null);
      setIsLoading(false);
  }
  
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg flex flex-col h-full">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">AI Chat Assistant</h2>
      <div className="flex flex-col space-y-4 flex-grow">
        
        {capturedImage ? (
           <div className="border-2 border-slate-300 dark:border-slate-600 rounded-lg p-4 text-center">
             <img src={capturedImage} alt="Screen capture preview" className="max-h-40 mx-auto rounded-lg object-contain" />
           </div>
        ) : (
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center flex flex-col items-center justify-center flex-grow">
              <CameraIcon className="w-10 h-10 mb-2 text-slate-500 dark:text-slate-400" />
              <p className="font-semibold text-slate-500 dark:text-slate-400">Capture your screen to get an AI-powered reply.</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">The AI will analyze the image of your chat window.</p>
          </div>
        )}

        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Add any additional context here (optional)..."
          className="w-full h-24 p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          aria-label="Additional Context"
        />

        {capturedImage ? (
             <button
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 font-semibold py-3 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors duration-200"
                >
                <CameraIcon className="w-5 h-5" />
                <span>Capture New Screen</span>
            </button>
        ) : (
            <button
            onClick={handleCaptureAndSuggest}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-all duration-200"
            >
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
                <CameraIcon className="w-5 h-5" />
            )}
            <span>{isLoading ? 'Waiting for Capture...' : 'Capture Screen & Suggest'}</span>
            </button>
        )}

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        
        {isLoading && capturedImage && (
            <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-700 rounded-lg space-y-3 flex items-center justify-center">
                 <div className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                <p className="text-slate-700 dark:text-slate-200">Generating suggestion...</p>
            </div>
        )}

        {suggestion && (
          <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-700 rounded-lg space-y-3">
            <h3 className="font-semibold text-slate-800 dark:text-white">Suggested Reply:</h3>
            <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{suggestion}</p>
            <button 
              onClick={handleCopy}
              className="text-sm bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 font-semibold py-1 px-3 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
            >
              Copy
            </button>
          </div>
        )}
      </div>
    </div>
  );
};