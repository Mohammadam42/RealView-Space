import { Box, Cuboid, Layers3, MapPinned, Rotate3D, Sparkles, Upload } from 'lucide-react';
import CameraPanel from './CameraPanel.jsx';
import CaptureLibrary from './CaptureLibrary.jsx';
import ScenePreview from './ScenePreview.jsx';
import { useCaptureStore } from '../hooks/useCaptureStore.js';
import ModelArViewer from './ModelArViewer.jsx';
import { fileToDataUrl, modelPoster, splitModelByType } from '../utils/files.js';
import { useRef, useState } from 'react';

const placementOptions = [
  { id: 'floor', label: 'أرضية', icon: MapPinned },
  { id: 'table', label: 'طاولة', icon: Layers3 },
  { id: 'wall', label: 'جدار', icon: Box },
];

export default function ObjectScanner() {
  const [placement, setPlacement] = useState('floor');
  const fileInputRef = useRef(null);
  const store = useCaptureStore('object', 'obj');

  const handleCapture = (imageData, frame) => {
    const nextNumber = store.items.length + 1;
    store.addItem({
      title: `سكان جسم ${nextNumber}`,
      imageData,
      meta: {
        placement,
        frame,
        mode: 'object-placement',
      },
    });
  };

  const handleModelUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const dataUrl = await fileToDataUrl(file);
    const modelParts = splitModelByType(file.name, dataUrl);

    store.addItem({
      title: `موديل AR ${store.items.length + 1}`,
      imageData: modelPoster('AR Model'),
      meta: {
        placement,
        modelName: file.name,
        mode: 'real-mobile-ar',
        ...modelParts,
      },
    });

    event.target.value = '';
  };

  return (
    <div className="workspace-grid">
      <div className="main-stack">
        <div className="module-header">
          <div>
            <span className="eyebrow">Object AR</span>
            <h1>سكان الأجسام وعرضها</h1>
          </div>
          <div className="header-badge">
            <Sparkles size={18} />
            <span>AR-ready</span>
          </div>
        </div>

        <div className="option-row">
          {placementOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                type="button"
                className={placement === option.id ? 'segmented-button active' : 'segmented-button'}
                onClick={() => setPlacement(option.id)}
              >
                <Icon size={17} />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>

        <CameraPanel title="كاميرا السكان" captureLabel="تخزين السكان" onCapture={handleCapture} />

        <input
          ref={fileInputRef}
          type="file"
          accept=".glb,.gltf,.usdz,model/gltf-binary,model/gltf+json"
          onChange={handleModelUpload}
          hidden
        />
        <button type="button" className="wide-action" onClick={() => fileInputRef.current?.click()}>
          <Upload size={18} />
          <span>رفع موديل 3D للـ AR</span>
        </button>

        {store.error && <div className="error-banner">{store.error}</div>}

        <div className="stat-grid">
          <div className="stat-card">
            <span>عدد السكانات</span>
            <strong>{store.items.length}</strong>
          </div>
          <div className="stat-card">
            <span>منطقة العرض</span>
            <strong>{placementOptions.find((item) => item.id === placement)?.label}</strong>
          </div>
          <div className="stat-card">
            <span>الحركة</span>
            <strong>
              <Rotate3D size={19} />
              3D
            </strong>
          </div>
          <div className="stat-card">
            <span>AR</span>
            <strong>
              <Cuboid size={18} />
              هاتف
            </strong>
          </div>
        </div>
      </div>

      {store.selected?.meta?.modelData || store.selected?.meta?.iosModelData ? (
        <ModelArViewer item={store.selected} placement={store.selected?.meta?.placement || placement} />
      ) : (
        <ScenePreview scan={store.selected} placement={store.selected?.meta?.placement || placement} />
      )}

      <CaptureLibrary
        items={store.items}
        selectedId={store.selectedId}
        onSelect={store.setSelectedId}
        onDelete={store.removeItem}
        emptyLabel="ما في سكانات محفوظة"
        renderMeta={(item) => <small>{placementOptions.find((option) => option.id === item.meta?.placement)?.label}</small>}
      />
    </div>
  );
}
