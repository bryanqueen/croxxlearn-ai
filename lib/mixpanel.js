import mixpanel from 'mixpanel-browser';

export const initMixpanel = () => {
  mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN, {
    debug: process.env.NODE_ENV !== 'production',
    track_pageview: true,
    persistence: 'localStorage'
  });
};

export const trackEvent = (eventName, properties) => {
  mixpanel.track(eventName, properties);
};

export const setUserProfile = (userId, properties) => {
  mixpanel.identify(userId);
  if (properties) {
    mixpanel.people.set(properties);
  }
};