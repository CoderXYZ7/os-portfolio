import { useState } from 'react';
import BootSequence from './boot/BootSequence.jsx';
import StartupScreen from './boot/StartupScreen.jsx';
import Desktop from './desktop/Desktop.jsx';
import { WindowManagerProvider } from './windows/WindowManagerContext.jsx';

function App() {
  // Always boot from scratch on every page load
  const [phase, setPhase] = useState('boot');

  if (phase === 'boot') {
    return <BootSequence onComplete={() => setPhase('startup')} />;
  }

  if (phase === 'startup') {
    return <StartupScreen onComplete={() => setPhase('desktop')} />;
  }

  return (
    <WindowManagerProvider>
      <Desktop />
    </WindowManagerProvider>
  );
}

export default App;
