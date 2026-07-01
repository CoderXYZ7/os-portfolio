import { useState } from 'react';
import BootSequence from './boot/BootSequence.jsx';
import Desktop from './desktop/Desktop.jsx';
import { WindowManagerProvider } from './windows/WindowManagerContext.jsx';

function App() {
  const [booted, setBooted] = useState(() => sessionStorage.getItem('booted') === 'true');

  function handleBootComplete() {
    sessionStorage.setItem('booted', 'true');
    setBooted(true);
  }

  if (!booted) {
    return <BootSequence onComplete={handleBootComplete} />;
  }

  return (
    <WindowManagerProvider>
      <Desktop />
    </WindowManagerProvider>
  );
}

export default App;
