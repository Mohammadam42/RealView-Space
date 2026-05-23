import { useMemo, useState } from 'react';
import { Box, ChefHat, Glasses, ScanLine, ShieldCheck, Wifi } from 'lucide-react';
import ObjectScanner from './components/ObjectScanner.jsx';
import GlassesTryOn from './components/GlassesTryOn.jsx';
import FoodScale from './components/FoodScale.jsx';

const tabs = [
  {
    id: 'objects',
    label: 'الأجسام',
    icon: Box,
    component: ObjectScanner,
  },
  {
    id: 'glasses',
    label: 'النظارات',
    icon: Glasses,
    component: GlassesTryOn,
  },
  {
    id: 'food',
    label: 'الأكل',
    icon: ChefHat,
    component: FoodScale,
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('objects');
  const ActiveComponent = useMemo(
    () => tabs.find((tab) => tab.id === activeTab)?.component || ObjectScanner,
    [activeTab],
  );

  const cameraReady = Boolean(navigator.mediaDevices?.getUserMedia);
  const storageReady = 'indexedDB' in window;

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand-block">
          <div className="brand-mark">
            <ScanLine size={26} />
          </div>
          <div>
            <span>Ammar</span>
            <strong>AR Studio</strong>
          </div>
        </div>

        <nav className="tabs" aria-label="التطبيقات">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                className={activeTab === tab.id ? 'tab-button active' : 'tab-button'}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="system-status">
          <span className={cameraReady ? 'status-dot on' : 'status-dot'} title="Camera API">
            <Wifi size={14} />
          </span>
          <span className={storageReady ? 'status-dot on' : 'status-dot'} title="Local storage">
            <ShieldCheck size={14} />
          </span>
        </div>
      </header>

      <ActiveComponent />
    </main>
  );
}
