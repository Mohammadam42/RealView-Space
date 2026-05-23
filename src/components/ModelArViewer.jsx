import '@google/model-viewer';
import { Box, Smartphone, Upload } from 'lucide-react';

export default function ModelArViewer({
  item,
  placement = 'floor',
  lockedScale = false,
  emptyLabel = 'ارفع ملف 3D لتشغيل AR على الهاتف',
}) {
  const modelSrc = item?.meta?.modelData;
  const iosSrc = item?.meta?.iosModelData;
  const hasModel = Boolean(modelSrc || iosSrc);

  return (
    <section className="model-ar-panel">
      <div className="panel-heading">
        <h2>AR حقيقي على الهاتف</h2>
        <span className={lockedScale ? 'status-pill locked' : 'status-pill'}>
          <Smartphone size={14} />
          {lockedScale ? 'Scale locked' : 'Mobile AR'}
        </span>
      </div>

      <div className="model-stage">
        {hasModel ? (
          <model-viewer
            src={modelSrc || iosSrc}
            ios-src={iosSrc || ''}
            ar=""
            ar-modes="webxr scene-viewer quick-look"
            ar-placement={placement}
            ar-scale={lockedScale ? 'fixed' : 'auto'}
            camera-controls=""
            touch-action="pan-y"
            auto-rotate=""
            shadow-intensity="0.85"
            exposure="0.95"
            alt={item?.title || 'AR model'}
          >
            <button slot="ar-button" type="button" className="ar-launch-button">
              <Smartphone size={18} />
              <span>افتح بالـ AR</span>
            </button>
          </model-viewer>
        ) : (
          <div className="scene-empty">
            <Box size={34} />
            <span>{emptyLabel}</span>
          </div>
        )}
      </div>

      <div className="placement-strip">
        <Upload size={17} />
        <span>{item?.meta?.modelName || item?.title || 'GLB / USDZ'}</span>
      </div>
    </section>
  );
}
