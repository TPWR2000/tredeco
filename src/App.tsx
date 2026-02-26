import { Route, Routes } from 'react-router-dom';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { AppShell } from './components/AppShell';
import { ReloadPrompt } from './components/ReloadPrompt';
import { Home } from './pages/Home';
import { KalkulatorPage } from './pages/KalkulatorPage';
import { FullCalendar } from './pages/FullCalendar';
import { About } from './pages/About';

function App() {
  useRegisterSW({
    immediate: true,
    onRegistered(registration) {
      console.log('SW Registered:', registration);
    },
  });

  return (
    <div className="min-h-screen pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <AppShell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/kalkulator" element={<KalkulatorPage />} />
          <Route path="/kalendarz" element={<FullCalendar />} />
          <Route path="/o-systemie" element={<About />} />
        </Routes>
        <ReloadPrompt />
      </AppShell>
    </div>
  );
}

export default App;
