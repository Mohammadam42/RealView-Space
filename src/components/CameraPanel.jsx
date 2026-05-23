import { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, Save, VideoOff } from 'lucide-react';

export default function CameraPanel({
  title,
  facingMode = 'environment',
  mirrored = false,
  captureLabel = 'حفظ',
  onCapture,
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState('جاهز');

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
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setActive(true);
      setStatus('الكاميرا تعمل');
    } catch (err) {
      setStatus(err.message || 'تعذر تشغيل الكاميرا');
    }
  };

  const captureFrame = () => {
    const video = videoRef.current;
    if (!video?.videoWidth) {
      setStatus('شغل الكاميرا أولاً');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');

    if (mirrored) {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/jpeg', 0.88);
    onCapture?.(imageData, { width: canvas.width, height: canvas.height });
    setStatus('تم الحفظ');
  };

  useEffect(() => stopCamera, []);

  return (
    <section className="camera-panel">
      <div className="panel-heading">
        <h2>{title}</h2>
        <span className={active ? 'status-pill live' : 'status-pill'}>{status}</span>
      </div>

      <div className="camera-frame">
        <video ref={videoRef} className={mirrored ? 'mirrored' : ''} playsInline muted />
        {!active && (
          <div className="camera-empty">
            <Camera size={34} />
          </div>
        )}
      </div>

      <div className="toolbar">
        <button type="button" className="icon-button" onClick={startCamera} aria-label="تشغيل الكاميرا">
          <RefreshCw size={18} />
          <span>تشغيل</span>
        </button>
        <button type="button" className="primary-button" onClick={captureFrame} disabled={!active}>
          <Save size={18} />
          <span>{captureLabel}</span>
        </button>
        <button type="button" className="icon-button" onClick={stopCamera} disabled={!active} aria-label="إيقاف الكاميرا">
          <VideoOff size={18} />
        </button>
      </div>
    </section>
  );
}
