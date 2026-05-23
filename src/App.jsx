import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {
  BadgeCheck,
  Camera,
  Check,
  Download,
  Eye,
  Glasses,
  Pause,
  Play,
  RefreshCw,
  ScanFace,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';

const glassesCatalog = [
  {
    id: 'urban-clear',
    name: 'Urban Clear',
    description: 'فريم خفيف للاستخدام اليومي',
    model: '/models/glasses/glasses-11c.glb',
    size: '2.5 MB',
  },
  {
    id: 'classic-curve',
    name: 'Classic Curve',
    description: 'شكل كلاسيكي ناعم',
    model: '/models/glasses/glasses-10.glb',
    size: '3.3 MB',
  },
  {
    id: 'soft-square',
    name: 'Soft Square',
    description: 'تصميم مربع متوازن',
    model: '/models/glasses/glasses-6.glb',
    size: '3.6 MB',
  },
  {
    id: 'sharp-line',
    name: 'Sharp Line',
    description: 'فريم واضح وحاد',
    model: '/models/glasses/glasses-9c.glb',
    size: '3.9 MB',
  },
  {
    id: 'wide-frame',
    name: 'Wide Frame',
    description: 'إطار أعرض للوجوه الكبيرة',
    model: '/models/glasses/glasses-7.glb',
    size: '5.8 MB',
  },
  {
    id: 'signature',
    name: 'Signature',
    description: 'موديل مميز للعرض',
    model: '/models/glasses/glasses-8c.glb',
    size: '6.3 MB',
  },
];

function fitModelToUnit(object) {
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  const largest = Math.max(size.x, size.y, size.z) || 1;
  object.position.sub(center);
  object.scale.multiplyScalar(1 / largest);
}

function useModelScene(canvasRef, selectedModel, fit) {
  const stateRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 100);
    camera.position.set(0, 0, 4);

    const group = new THREE.Group();
    scene.add(group);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x33424a, 2.2));
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(2, 3, 4);
    scene.add(key);

    let animation = 0;
    const render = () => {
      const width = canvas.clientWidth || 800;
      const height = canvas.clientHeight || 800;
      if (canvas.width !== Math.round(width * renderer.getPixelRatio())) {
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
      renderer.render(scene, camera);
      animation = requestAnimationFrame(render);
    };

    stateRef.current = { renderer, scene, camera, group };
    render();

    return () => {
      cancelAnimationFrame(animation);
      group.clear();
      renderer.dispose();
      stateRef.current = null;
    };
  }, [canvasRef]);

  useEffect(() => {
    const state = stateRef.current;
    if (!state) return undefined;

    state.group.clear();
    const loader = new GLTFLoader();
    let loadedScene = null;
    let disposed = false;

    loader.load(
      selectedModel,
      (gltf) => {
        if (disposed) return;
        loadedScene = gltf.scene;
        fitModelToUnit(loadedScene);
        loadedScene.traverse((child) => {
          if (child.isMesh) {
            child.frustumCulled = false;
            child.castShadow = true;
            child.material.side = THREE.DoubleSide;
          }
        });
        state.group.add(loadedScene);
      },
      undefined,
      () => {},
    );

    return () => {
      disposed = true;
      if (loadedScene) {
        loadedScene.traverse((child) => {
          if (child.isMesh) {
            child.geometry?.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach((material) => material.dispose?.());
            } else {
              child.material?.dispose?.();
            }
          }
        });
      }
    };
  }, [selectedModel]);

  useEffect(() => {
    const state = stateRef.current;
    if (!state) return;

    state.group.position.set(fit.x, fit.y, 0);
    state.group.rotation.set(THREE.MathUtils.degToRad(fit.rotateX), THREE.MathUtils.degToRad(fit.rotateY), 0);
    state.group.scale.setScalar(fit.scale);
  }, [fit]);
}

export default function App() {
  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const captureCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const [selectedId, setSelectedId] = useState(glassesCatalog[0].id);
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState('جاهز للتجربة');
  const [fit, setFit] = useState({
    scale: 1.62,
    x: 0,
    y: 0.08,
    rotateX: 8,
    rotateY: 0,
  });

  const selectedGlasses = useMemo(
    () => glassesCatalog.find((item) => item.id === selectedId) || glassesCatalog[0],
    [selectedId],
  );

  useModelScene(overlayRef, selectedGlasses.model, fit);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
    setStatus('متوقف');
  };

  const startCamera = async () => {
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 900 },
        },
        audio: false,
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setActive(true);
      setStatus('الكاميرا تعمل');
    } catch (error) {
      setStatus(error.message || 'تعذر تشغيل الكاميرا');
    }
  };

  const downloadSnapshot = () => {
    const video = videoRef.current;
    const overlay = overlayRef.current;
    const capture = captureCanvasRef.current;
    if (!capture || !overlay) return;

    const width = video?.videoWidth || overlay.width || 1080;
    const height = video?.videoHeight || overlay.height || 1350;
    capture.width = width;
    capture.height = height;
    const context = capture.getContext('2d');

    context.fillStyle = '#eef3f2';
    context.fillRect(0, 0, width, height);
    if (video?.videoWidth) {
      context.save();
      context.translate(width, 0);
      context.scale(-1, 1);
      context.drawImage(video, 0, 0, width, height);
      context.restore();
    }
    context.drawImage(overlay, 0, 0, width, height);

    const link = document.createElement('a');
    link.download = 'engineer-mohammad-ammar-glasses.png';
    link.href = capture.toDataURL('image/png');
    link.click();
  };

  useEffect(() => stopCamera, []);

  return (
    <main className="page-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <Glasses size={26} />
          </div>
          <div>
            <span>استوديو تجربة النظارات</span>
            <strong>المهندس محمد عمار</strong>
          </div>
        </div>

        <nav className="status-bar">
          <span>
            <ShieldCheck size={15} />
            بدون رفع ملفات
          </span>
          <span>
            <Eye size={15} />
            موديلات جاهزة
          </span>
        </nav>
      </header>

      <section className="workspace">
        <aside className="intro-panel">
          <span className="eyebrow">Virtual Try-On</span>
          <h1>جرّب النظارات الجاهزة مباشرة</h1>
          <p>
            الواجهة تستخدم موديلات النظارات التي زودتني بها داخل المشروع. لا يوجد رفع ملفات من الزبون، فقط تشغيل
            الكاميرا واختيار النظارة المناسبة.
          </p>

          <div className="quick-actions">
            <button className="primary-action" type="button" onClick={startCamera}>
              <Play size={18} />
              <span>ابدأ التجربة</span>
            </button>
            <button className="secondary-action" type="button" onClick={downloadSnapshot}>
              <Download size={18} />
              <span>حفظ صورة</span>
            </button>
          </div>

          <div className="metrics">
            <div>
              <strong>{glassesCatalog.length}</strong>
              <span>نظارات جاهزة</span>
            </div>
            <div>
              <strong>3D</strong>
              <span>ملفات GLB</span>
            </div>
            <div>
              <strong>RTL</strong>
              <span>واجهة عربية</span>
            </div>
          </div>
        </aside>

        <section className="tryon-stage">
          <div className="stage-header">
            <div>
              <span className="eyebrow">Live Preview</span>
              <h2>تجربة مباشرة</h2>
            </div>
            <span className={active ? 'live-pill active' : 'live-pill'}>{status}</span>
          </div>

          <div className="camera-shell">
            <video ref={videoRef} playsInline muted />
            <canvas ref={overlayRef} className="webgl-overlay" />
            {!active && (
              <div className="camera-empty">
                <ScanFace size={40} />
                <span>شغّل الكاميرا لبدء التجربة</span>
              </div>
            )}
          </div>

          <div className="stage-toolbar">
            <button type="button" onClick={startCamera}>
              <RefreshCw size={17} />
              <span>تشغيل</span>
            </button>
            <button type="button" onClick={stopCamera} disabled={!active}>
              <Pause size={17} />
              <span>إيقاف</span>
            </button>
            <button type="button" onClick={downloadSnapshot}>
              <Camera size={17} />
              <span>لقطة</span>
            </button>
          </div>
          <canvas ref={captureCanvasRef} hidden />
        </section>

        <aside className="controls-panel">
          <div className="control-group">
            <div className="panel-title">
              <BadgeCheck size={18} />
              <h3>النظارات الجاهزة</h3>
            </div>
            <div className="frame-list">
              {glassesCatalog.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={item.id === selectedId ? 'frame-card active' : 'frame-card'}
                  onClick={() => setSelectedId(item.id)}
                >
                  <span>{item.name}</span>
                  <small>
                    {item.description} · {item.size}
                  </small>
                  {item.id === selectedId && <Check size={17} />}
                </button>
              ))}
            </div>
          </div>

          <div className="control-group">
            <div className="panel-title">
              <SlidersHorizontal size={18} />
              <h3>ضبط مكان النظارة</h3>
            </div>

            <label className="slider-row">
              <span>الحجم</span>
              <input
                type="range"
                min="0.75"
                max="2.65"
                step="0.01"
                value={fit.scale}
                onChange={(event) => setFit((current) => ({ ...current, scale: Number(event.target.value) }))}
              />
            </label>
            <label className="slider-row">
              <span>يمين / يسار</span>
              <input
                type="range"
                min="-1.3"
                max="1.3"
                step="0.01"
                value={fit.x}
                onChange={(event) => setFit((current) => ({ ...current, x: Number(event.target.value) }))}
              />
            </label>
            <label className="slider-row">
              <span>ارتفاع</span>
              <input
                type="range"
                min="-1.2"
                max="1.4"
                step="0.01"
                value={fit.y}
                onChange={(event) => setFit((current) => ({ ...current, y: Number(event.target.value) }))}
              />
            </label>
            <label className="slider-row">
              <span>ميلان</span>
              <input
                type="range"
                min="-35"
                max="35"
                step="1"
                value={fit.rotateY}
                onChange={(event) => setFit((current) => ({ ...current, rotateY: Number(event.target.value) }))}
              />
            </label>
          </div>
        </aside>
      </section>

      <footer className="footer">
        <Sparkles size={16} />
        <span>تجربة جاهزة باسم المهندس محمد عمار وتستخدم موديلات النظارات المرفقة داخل المشروع.</span>
      </footer>
    </main>
  );
}
