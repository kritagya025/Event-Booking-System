import React from 'react';

/**
 * Deprecated splash screen placeholder.
 * Retained for backwards compatibility if referenced dynamically.
 */
export default function IntroSplashScreen({ onComplete }) {
  React.useEffect(() => {
    if (onComplete) onComplete();
  }, [onComplete]);

  return null;
}
