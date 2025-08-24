
import { useState, useEffect, useCallback } from 'react';
import * as tmImage from '@teachablemachine/image';
import { Prediction } from '../types';

const MODEL_URL = './tm-recycler-model/model.json';
const METADATA_URL = './tm-recycler-model/metadata.json';

export const useTeachableMachine = () => {
  const [model, setModel] = useState<tmImage.CustomMobileNet | null>(null);
  const [isLoadingModel, setIsLoadingModel] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        setError(null);
        setIsLoadingModel(true);
        const loadedModel = await tmImage.load(MODEL_URL, METADATA_URL);
        setModel(loadedModel);
      } catch (err) {
        console.error('Failed to load the model:', err);
        setError('Could not load the recycling model. Please try refreshing the page.');
      } finally {
        setIsLoadingModel(false);
      }
    };
    loadModel();
  }, []);

  const predict = useCallback(async (image: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<Prediction[]> => {
    if (!model) {
      console.error('Prediction attempted before model was loaded.');
      return [];
    }
    try {
      const predictions = await model.predict(image);
      return predictions.map(p => ({
        className: p.className,
        probability: parseFloat(p.probability.toFixed(4)),
      }));
    } catch (err) {
      console.error('Prediction failed:', err);
      setError('An error occurred during classification.');
      return [];
    }
  }, [model]);

  return { model, predict, isLoadingModel, error };
};
