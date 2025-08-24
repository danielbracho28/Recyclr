import React from 'react';
import { ClassificationResult } from '../types';
import { Spinner } from './Spinner';

interface ResultDisplayProps {
    results: ClassificationResult[];
    onClose: () => void;
}

const RecycleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline-block text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.5,4.94a1,1,0,0,1,1.06,0l5.44,4.46a1,1,0,0,1,0,1.52l-5.44,4.46a1,1,0,0,1-1.59-.76V12.1a1,1,0,0,0-1-1H10.5a1,1,0,0,1-1-1v-2a1,1,0,0,1,1-1h2.95V5.7A1,1,0,0,1,14.5,4.94Z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.5,19.06a1,1,0,0,1-1.06,0l-5.44-4.46a1,1,0,0,1,0-1.52l5.44-4.46a1,1,0,0,1,1.59.76v2.55a1,1,0,0,0,1,1h3.05a1,1,0,0,1,1,1v2a1,1,0,0,1-1,1H10.5v2.55A1,1,0,0,1,9.5,19.06Z" />
    </svg>
);
const ImpactIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline-block text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);
const ReuseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline-block text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 16v-1m0-1c-1.11 0-2.08-.402-2.599-1M12 16c-4.418 0-8-3.134-8-7s3.582-7 8-7 8 3.134 8 7-3.582 7-8 7z" />
    </svg>
);


export const ResultDisplay: React.FC<ResultDisplayProps> = ({ results, onClose }) => {
    // All results share the same source image
    const imageSrc = results[0]?.imageSrc;

    return (
        <div className="bg-white dark:bg-dark shadow-2xl rounded-2xl w-full max-w-5xl mx-auto overflow-hidden animate-fade-in-up">
            <div className="p-6 md:p-8 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Left Column: Image */}
                    <div className="flex flex-col items-center">
                        <img src={imageSrc} alt="Classified items" className="rounded-xl shadow-lg w-full h-auto object-cover aspect-square" />
                         <div className="w-full mt-4 bg-slate-100 dark:bg-darker p-4 rounded-lg text-center">
                            <p className="text-sm text-slate-500 dark:text-slate-400">Analysis Complete</p>
                            <h2 className="text-2xl font-bold text-primary">Found {results.length} Item{results.length > 1 ? 's' : ''}</h2>
                        </div>
                    </div>
                    {/* Right Column: Results List */}
                    <div className="flex flex-col gap-4 max-h-[75vh] overflow-y-auto pr-2">
                        {results.map((result) => {
                            const { prediction, guidance } = result;
                            const confidence = (prediction.probability * 100).toFixed(1);
                            
                            return (
                                <div key={result.id} className="bg-slate-100 dark:bg-darker p-4 rounded-lg animate-fade-in">
                                    {/* Prediction Header */}
                                    <div>
                                        <h3 className="text-2xl font-bold text-primary">{prediction.className}</h3>
                                        <div className="mt-1">
                                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Confidence: {confidence}%</p>
                                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-1">
                                                <div className="bg-primary h-2 rounded-full" style={{ width: `${confidence}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <hr className="my-4 border-slate-300 dark:border-slate-600" />

                                    {/* Guidance Details */}
                                    {!guidance ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Spinner text="Fetching guidance..." />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-3 text-sm">
                                            <div>
                                                <h4 className="font-semibold mb-1 flex items-center"><RecycleIcon /> Recycling</h4>
                                                <p className="text-slate-600 dark:text-slate-300">{guidance.recyclingInstructions}</p>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold mb-1 flex items-center"><ImpactIcon /> Impact</h4>
                                                <p className="text-slate-600 dark:text-slate-300">{guidance.environmentalImpact}</p>
                                            </div>
                                            {guidance.reuseSuggestions && guidance.reuseSuggestions.length > 0 && (
                                                <div>
                                                    <h4 className="font-semibold mb-1 flex items-center"><ReuseIcon /> Reuse Ideas</h4>
                                                    <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1">
                                                        {guidance.reuseSuggestions.map((tip, index) => <li key={index}>{tip}</li>)}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};