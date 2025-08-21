import { useCallback } from 'react';
import { trackEvent } from './analytics.ts';

export const useAnalytics = () => {
  const trackSimulationEvent = useCallback((action: string, label?: string, value?: number) => {
    trackEvent(action, 'simulation', label, value);
  }, []);

  const trackUserInteraction = useCallback((action: string, label?: string, value?: number) => {
    trackEvent(action, 'user_interaction', label, value);
  }, []);

  const trackError = useCallback((error: string, context?: string) => {
    trackEvent('error', 'error_tracking', context);
  }, []);

  const trackPerformance = useCallback((metric: string, value: number) => {
    trackEvent('performance', 'performance_tracking', metric, value);
  }, []);

  return {
    trackSimulationEvent,
    trackUserInteraction,
    trackError,
    trackPerformance,
  };
};
