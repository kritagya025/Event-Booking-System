import React from 'react';
import BackstageAuthTerminal from './BackstageAuthTerminal';

export default function LoginPage({ onAuthSuccess, onNavigate, showToast }) {
  return (
    <BackstageAuthTerminal
      initialMode="login"
      onAuthSuccess={onAuthSuccess}
      onNavigate={onNavigate}
      showToast={showToast}
    />
  );
}
