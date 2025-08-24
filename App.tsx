
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTeachableMachine } from './hooks/useTeachableMachine';
import { fetchRecyclingGuidance } from './services/geminiService';
import { AppStatus, ClassificationResult } from './types';
import { InputArea } from './components/InputArea';
import { ResultDisplay } from './components/ResultDisplay';
import { Spinner } from './components/Spinner';
import { ThemeToggle } from './components/ThemeToggle';

const App: React.FC = () => {
    const { predict, isLoadingModel, error: modelError } = useTeachableMachine();
    const [status, setStatus] = useState<AppStatus>(AppStatus.ModelLoading);
    const [currentResults, setCurrentResults] = useState<ClassificationResult[] | null>(null);
    const [history, setHistory] = useState<ClassificationResult[]>([]);
    const [error, setError] = useState<string | null>(null);
    const imageRef = useRef<HTMLImageElement>(new Image());

    useEffect(() => {
        setStatus(isLoadingModel ? AppStatus.ModelLoading : AppStatus.Ready);
    }, [isLoadingModel]);

    useEffect(() => {
        if (modelError) {
            setError(modelError);
            setStatus(AppStatus.Error);
        }
    }, [modelError]);

    const handleImageClassification = useCallback(async (imageSrc: string) => {
        setStatus(AppStatus.Predicting);
        setError(null);
        
        const image = imageRef.current;
        image.src = imageSrc;
        
        image.onload = async () => {
            const predictions = await predict(image);
            const CONFIDENCE_THRESHOLD = 0.20; // 20% confidence

            if (predictions && predictions.length > 0) {
                const significantPredictions = predictions
                    .filter(p => p.probability >= CONFIDENCE_THRESHOLD && p.className !== 'Nothing on sight')
                    .sort((a, b) => b.probability - a.probability);

                if (significantPredictions.length === 0) {
                    const topPrediction = [...predictions].sort((a, b) => b.probability - a.probability)[0];
                    if (topPrediction && topPrediction.className === 'Nothing on sight' && topPrediction.probability >= CONFIDENCE_THRESHOLD) {
                        setError("No recyclable items were detected. Please try again with a clear view of an item.");
                    } else {
                        setError("Could not identify any items with high confidence. Please try a clearer picture.");
                    }
                    setStatus(AppStatus.Error);
                    return;
                }

                const initialResults: ClassificationResult[] = significantPredictions.map(prediction => ({
                    id: `${new Date().toISOString()}-${prediction.className}`,
                    imageSrc,
                    prediction,
                    guidance: null,
                    timestamp: new Date().toLocaleString(),
                }));
                
                setCurrentResults(initialResults);
                setStatus(AppStatus.FetchingGuidance);

                const guidancePromises = initialResults.map(result => fetchRecyclingGuidance(result.prediction.className));
                const guidanceList = await Promise.all(guidancePromises);

                const finalResults = initialResults.map((result, index) => ({
                    ...result,
                    guidance: guidanceList[index],
                }));
                
                setCurrentResults(finalResults);
                if (finalResults.length > 0) {
                  setHistory(prev => [finalResults[0], ...prev.slice(0, 4)]);
                }
                setStatus(AppStatus.Ready);

            } else {
                setError("Prediction failed. The model could not process the image.");
                setStatus(AppStatus.Error);
            }
        };
        image.onerror = () => {
            console.error("Image failed to load");
            setError("The selected image file could not be loaded. It might be corrupted.");
            setStatus(AppStatus.Error);
        };

    }, [predict]);

    const reset = () => {
        setCurrentResults(null);
        setError(null);
        setStatus(AppStatus.Ready);
    };

    const renderContent = () => {
        if (currentResults && currentResults.length > 0) {
            return <ResultDisplay results={currentResults} onClose={reset} />;
        }
        
        switch (status) {
            case AppStatus.ModelLoading:
                return (
                    <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-dark shadow-xl rounded-2xl">
                        <Spinner text="Warming up the recycling AI..." size="lg" />
                    </div>
                );
            case AppStatus.Ready:
            case AppStatus.Predicting:
            case AppStatus.FetchingGuidance:
                return (
                    <div className="relative">
                        <InputArea onImageReady={handleImageClassification} isModelLoading={isLoadingModel} />
                        {(status === AppStatus.Predicting || status === AppStatus.FetchingGuidance) && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-2xl z-10">
                                <Spinner 
                                  text={status === AppStatus.Predicting ? 'Analyzing image...' : 'Fetching guidance...'}
                                  size="lg"
                                />
                            </div>
                        )}
                    </div>
                );
            case AppStatus.Error:
                return (
                    <div className="text-center p-8 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 rounded-2xl text-red-700 dark:text-red-200">
                        <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong.</h2>
                        <p className="mb-4">{error || 'An unknown error occurred.'}</p>
                        <button onClick={reset} className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                            Try Again
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center p-4 sm:p-6 lg:p-8 relative">
            <header className="w-full max-w-5xl mx-auto flex justify-between items-center mb-6">
                 <div className="flex items-center gap-3">
                    <div className="relative text-7xl text-primary-dark dark:text-primary-light flex items-center justify-center w-[72px] h-[72px]">
                        <span role="img" aria-label="Recycling Symbol" className="absolute">♻️</span>
                        <span className="absolute text-3xl" role="img" aria-label="Planet Earth">🌍</span>
                    </div>
                    <h1 className="text-5xl font-bold tracking-tighter text-slate-800 dark:text-slate-100">Recyclr</h1>
                </div>
                <ThemeToggle />
            </header>
            
            <main className="w-full flex-grow flex items-center justify-center">
                {renderContent()}
            </main>

            <footer className="w-full max-w-5xl mx-auto text-center mt-8 py-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Powered by Teachable Machine & Google Gemini.
                </p>
            </footer>
        </div>
    );
};

export default App;
