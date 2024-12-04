import { useEffect } from 'react';
import { initMixpanel, trackEvent, setUserProfile } from '../lib/mixpanel';

export const useMixpanel = () => {
  useEffect(() => {
    initMixpanel();
  }, []);

  return { trackEvent, setUserProfile };
};