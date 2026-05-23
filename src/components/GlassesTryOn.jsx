import { useEffect, useMemo, useRef, useState } from 'react';
import { Glasses, ImageUp, ScanFace, SlidersHorizontal, Sparkles } from 'lucide-react';
import CameraPanel from './CameraPanel.jsx';
import CaptureLibrary from './CaptureLibrary.jsx';
import { useCaptureStore } from '../hooks/useCaptureStore.js';

const DEMO_GLASSES =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22900%22 height=%22280%22 viewBox=%220 0 900 280%22%3E%3Cpath fill=%22none%22 stroke=%22%23101a23%22 stroke-width=%2242%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M58 128c32-62 212-62 244 0 26 50-4 110-70 118-86 10-154-18-174-118Zm540 0c32-62 212-62 244 0 26 50-4 110-70 118-86 10-154-18-174-118ZM302 126c84-36 194-36 296 0%22/%3E%3Cpath fill=%22%2328b7a7%22 fill-opacity=%22.18%22 d=%22M85 120c50-34 142-35 188 0 23 80-12 105-86 104-73-1-118-27-102-104Zm540 0c50-34 142-35 188 0 23 80-12 105-86 104-73-1-118-27-102-104Z%22/%3E%3C/svg%3E';

function TryOnCanvas({ glasses }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const imageRef = useRef(null);
  const detectorRef = useRef(null);
  const faceRef = useRef(null);
  const detectingRef = useRef(false);
  const frameRef = useRef(0);
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState('جاهز');
  const [fit, setFit] = useState({ scale: 1.05, y: 0, x: 0 });

  const overlaySource = glasses?.imageData || DEMO_GLASSES;

  useEffect(() => {
    const image = new window.Image();
    image.onload = () => {
      imageRef.current = image;
    };
    image.src = overlaySource;
  }, [overlaySource]);

  const stop = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
    setStatus('متوقف');
  };

  const start = async () => {
    try {
      stop();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      if ('FaceDetector' in window && !detectorRef.current) {
        detectorRef.current = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
      }

      setActive(true);
      setStatus(detectorRef.current ? 'تتبع تلقائي' : 'تتبع يدوي');
    } catch (err) {
      setStatus(err.message || 'تعذر تشغيل كاميرا الوجه');
    }
  };

  useEffect(() => {
    let animation = 0;

    const draw = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas?.getContext('2d');

      if (video?.videoWidth && context) {
        const width = video.videoWidth;
        const height = video.videoHeight;
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }

        context.clearRect(0, 0, width, height);
        context.save();
        context.translate(width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, width, height);
        context.restore();

        frameRef.current += 1;
        const detector = detectorRef.current;
        if (detector && !detectingRef.current && frameRef.current % 10 === 0) {
          detectingRef.current = true;
          detector
            .detect(video)
            .then((faces) => {
              faceRef.current = faces?.[0]?.boundingBox || faceRef.current;
            })
            .catch(() => {
              detectorRef.current = null;
              setStatus('تتبع يدوي');
            })
            .finally(() => {
              detectingRef.current = false;
            });
        }

        const face = faceRef.current || {
          x: width * 0.28,
          y: height * 0.2,
          width: width * 0.44,
          height: height * 0.5,
        };

        const mirroredX = width - face.x - face.width;
        const image = imageRef.current;
        if (image) {
          const glassesWidth = face.width * 1.25 * fit.scale;
          const glassesHeight = glassesWidth * (image.height / image.width);
          const glassesX = mirroredX + face.width / 2 - glassesWidth / 2 + fit.x * face.width;
          const glassesY = face.y + face.height * 0.34 - glassesHeight / 2 + fit.y * face.height;

          context.save();
          context.shadowColor = 'rgba(0, 0, 0, 0.28)';
          context.shadowBlur = 18;
          context.drawImage(image, glassesX, glassesY, glassesWidth, glassesHeight);
          context.restore();
        }
      }

      animation = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animation);
  }, [fit]);

  useEffect(() => stop, []);

  return (
    <section className="tryon-panel">
      <div className="panel-heading">
        <h2>تجربة على الوجه</h2>
        <span className={active ? 'status-pill live' : 'status-pill'}>{status}</span>
      </div>

      <div className="tryon-stage">
        <video ref={videoRef} playsInline muted />
        <canvas ref={canvasRef} />
        {!active && (
          <div className="camera-empty">
            <ScanFace size={34} />
          </div>
        )}
      </div>

      <div className="toolbar">
        <button type="button" className="primary-button" onClick={start}>
          <ScanFace size={18} />
          <span>تشغيل الوجه</span>
        </button>
        <button type="button" className="icon-button" onClick={stop} disabled={!active}>
          إيقاف
        </button>
      </div>

      <div className="control-card">
        <div className="control-title">
          <SlidersHorizontal size={17} />
          <span>الضبط</span>
        </div>
        <label>
          <span>العرض</span>
          <input
            type="range"
            min="0.72"
            max="1.42"
            step="0.01"
            value={fit.scale}
            onChange={(event) => setFit((current) => ({ ...current, scale: Number(event.target.value) }))}
          />
        </label>
        <label>
          <span>ارتفاع</span>
          <input
            type="range"
            min="-0.2"
            max="0.2"
            step="0.01"
            value={fit.y}
            onChange={(event) => setFit((current) => ({ ...current, y: Number(event.target.value) }))}
          />
        </label>
      </div>
    </section>
  );
}

export default function GlassesTryOn() {
  const store = useCaptureStore('glasses', 'glasses');
  const fileInputRef = useRef(null);

  const currentGlasses = useMemo(() => store.selected || null, [store.selected]);

  const saveGlasses = (imageData) => {
    store.addItem({
      title: `نظارة ${store.items.length + 1}`,
      imageData,
      meta: { mode: 'try-on-glasses' },
    });
  };

  const handleUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => saveGlasses(reader.result);
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  return (
    <div className="workspace-grid glasses-grid">
      <div className="main-stack">
        <div className="module-header">
          <div>
            <span className="eyebrow">Virtual Try-On</span>
            <h1>سكان النظارات وتجربتها</h1>
          </div>
          <div className="header-badge">
            <Glasses size={18} />
            <span>Face fit</span>
          </div>
        </div>

        <CameraPanel
          title="سكان النظارة"
          captureLabel="تخزين النظارة"
          onCapture={saveGlasses}
          facingMode="environment"
        />

        <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleUpload} hidden />
        <button type="button" className="wide-action" onClick={() => fileInputRef.current?.click()}>
          <ImageUp size={18} />
          <span>رفع صورة نظارة</span>
        </button>

        {store.error && <div className="error-banner">{store.error}</div>}
      </div>

      <TryOnCanvas glasses={currentGlasses} />

      <CaptureLibrary
        items={store.items}
        selectedId={store.selectedId}
        onSelect={store.setSelectedId}
        onDelete={store.removeItem}
        emptyLabel="ما في نظارات محفوظة"
        renderMeta={() => (
          <small>
            <Sparkles size={12} />
            Try-on
          </small>
        )}
      />
    </div>
  );
}
