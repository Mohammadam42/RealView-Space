import { useMemo, useRef, useState } from 'react';
import { Lock, Ruler, Salad, Scale3D, Sparkles, Upload } from 'lucide-react';
import CameraPanel from './CameraPanel.jsx';
import CaptureLibrary from './CaptureLibrary.jsx';
import { useCaptureStore } from '../hooks/useCaptureStore.js';
import ModelArViewer from './ModelArViewer.jsx';
import { fileToDataUrl, modelPoster, splitModelByType } from '../utils/files.js';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function FoodRealScalePreview({ item, defaultDiameter, screenDiagonal }) {
  if (item?.meta?.modelData || item?.meta?.iosModelData) {
    return (
      <ModelArViewer
        item={item}
        placement="floor"
        lockedScale
        emptyLabel="ارفع موديل طبق GLB / USDZ لتشغيل AR بالحجم المقفل"
      />
    );
  }

  const diameter = Number(item?.meta?.diameterCm || defaultDiameter);
  const pixelsPerCm = useMemo(() => {
    const width = window.screen?.width || 390;
    const height = window.screen?.height || 844;
    const diagonalPixels = Math.hypot(width, height);
    return diagonalPixels / Number(screenDiagonal || 6.7) / 2.54;
  }, [screenDiagonal]);

  const size = clamp(Math.round(diameter * pixelsPerCm), 130, 980);

  return (
    <section className="food-preview-panel">
      <div className="panel-heading">
        <h2>الحجم الواقعي</h2>
        <span className="status-pill locked">
          <Lock size={14} />
          Scale locked
        </span>
      </div>

      <div className="true-scale-scroll">
        <div className="dish-real-size" style={{ width: size, height: size }}>
          {item ? (
            <img src={item.imageData} alt={item.title} />
          ) : (
            <div className="plate-empty">
              <Salad size={42} />
            </div>
          )}
        </div>
      </div>

      <div className="measure-strip">
        <Ruler size={17} />
        <span>{diameter.toFixed(1)} cm</span>
      </div>
    </section>
  );
}

export default function FoodScale() {
  const store = useCaptureStore('food', 'food');
  const fileInputRef = useRef(null);
  const [plateDiameter, setPlateDiameter] = useState(28);
  const [screenDiagonal, setScreenDiagonal] = useState(6.7);

  const saveDish = (imageData, frame) => {
    store.addItem({
      title: `طبق ${store.items.length + 1}`,
      imageData,
      meta: {
        diameterCm: Number(plateDiameter),
        screenDiagonal: Number(screenDiagonal),
        frame,
        lockedScale: true,
      },
    });
  };

  const handleModelUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const dataUrl = await fileToDataUrl(file);
    const modelParts = splitModelByType(file.name, dataUrl);

    store.addItem({
      title: `طبق AR ${store.items.length + 1}`,
      imageData: modelPoster('Food Model'),
      meta: {
        diameterCm: Number(plateDiameter),
        screenDiagonal: Number(screenDiagonal),
        modelName: file.name,
        lockedScale: true,
        mode: 'true-scale-mobile-ar',
        ...modelParts,
      },
    });

    event.target.value = '';
  };

  return (
    <div className="workspace-grid food-grid">
      <div className="main-stack">
        <div className="module-header">
          <div>
            <span className="eyebrow">True-Scale Food</span>
            <h1>عرض الأكل بالحجم الحقيقي</h1>
          </div>
          <div className="header-badge">
            <Scale3D size={18} />
            <span>Locked</span>
          </div>
        </div>

        <div className="input-grid">
          <label className="field">
            <span>قطر الصحن cm</span>
            <input
              type="number"
              min="8"
              max="60"
              step="0.5"
              value={plateDiameter}
              onChange={(event) => setPlateDiameter(event.target.value)}
            />
          </label>
          <label className="field">
            <span>قطر الشاشة inch</span>
            <input
              type="number"
              min="4"
              max="34"
              step="0.1"
              value={screenDiagonal}
              onChange={(event) => setScreenDiagonal(event.target.value)}
            />
          </label>
        </div>

        <CameraPanel title="سكان الطبق" captureLabel="تخزين الطبق" onCapture={saveDish} />

        <input
          ref={fileInputRef}
          type="file"
          accept=".glb,.gltf,.usdz,model/gltf-binary,model/gltf+json"
          onChange={handleModelUpload}
          hidden
        />
        <button type="button" className="wide-action" onClick={() => fileInputRef.current?.click()}>
          <Upload size={18} />
          <span>رفع موديل طبق للـ AR</span>
        </button>

        <div className="stat-grid">
          <div className="stat-card">
            <span>الحجم</span>
            <strong>{Number(plateDiameter).toFixed(1)} cm</strong>
          </div>
          <div className="stat-card">
            <span>التحكم</span>
            <strong>
              <Lock size={17} />
              مقفل
            </strong>
          </div>
          <div className="stat-card">
            <span>العناصر</span>
            <strong>{store.items.length}</strong>
          </div>
        </div>

        {store.error && <div className="error-banner">{store.error}</div>}
      </div>

      <FoodRealScalePreview item={store.selected} defaultDiameter={plateDiameter} screenDiagonal={screenDiagonal} />

      <CaptureLibrary
        items={store.items}
        selectedId={store.selectedId}
        onSelect={store.setSelectedId}
        onDelete={store.removeItem}
        emptyLabel="ما في أطباق محفوظة"
        renderMeta={(item) => (
          <small>
            <Sparkles size={12} />
            {Number(item.meta?.diameterCm || plateDiameter).toFixed(1)} cm
          </small>
        )}
      />
    </div>
  );
}
