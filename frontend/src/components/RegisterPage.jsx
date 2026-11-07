import React from 'react';
import BackstageAuthTerminal from './BackstageAuthTerminal';

export default function RegisterPage({ onAuthSuccess, onNavigate, showToast }) {
  return (
    <BackstageAuthTerminal
      initialMode="register"
      onAuthSuccess={onAuthSuccess}
      onNavigate={onNavigate}
      showToast={showToast}
    />
  );
}
