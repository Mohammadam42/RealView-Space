import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Box, MapPinned } from 'lucide-react';

const placementLabels = {
  floor: 'أرضية',
  table: 'طاولة',
  wall: 'جدار',
};

export default function ScenePreview({ scan, placement = 'floor', locked = false }) {
  const hostRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, host.clientWidth / host.clientHeight, 0.1, 100);
    camera.position.set(0, 0.25, 4.8);

    const group = new THREE.Group();
    scene.add(group);

    const surface = new THREE.GridHelper(4.8, 14, 0x2f4f5f, 0x23313f);
    surface.position.y = -1.05;
    scene.add(surface);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x213140, 1.45));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.1);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);

    let frame = 0;
    const clock = new THREE.Clock();

    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(host);

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      group.rotation.y = Math.sin(elapsed * 0.6) * 0.28;
      group.rotation.x = placement === 'wall' ? -0.06 : Math.sin(elapsed * 0.42) * 0.04;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };

    sceneRef.current = { group, renderer };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      sceneRef.current = null;
      host.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [placement]);

  useEffect(() => {
    const state = sceneRef.current;
    if (!state) return undefined;

    state.group.clear();
    if (!scan?.imageData) return undefined;

    const loader = new THREE.TextureLoader();
    let mesh;
    let disposed = false;

    loader.load(scan.imageData, (texture) => {
      if (disposed) {
        texture.dispose();
        return;
      }

      texture.colorSpace = THREE.SRGBColorSpace;
      const ratio = texture.image.width / texture.image.height || 1.45;
      const width = 2.45;
      const height = Math.min(2.1, width / ratio);
      const geometry = new THREE.BoxGeometry(width, height, 0.12);
      const edge = new THREE.MeshStandardMaterial({ color: 0x122230, roughness: 0.72, metalness: 0.1 });
      const front = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.62, metalness: 0.04 });
      const back = new THREE.MeshStandardMaterial({ color: 0x0d1724, roughness: 0.85 });

      mesh = new THREE.Mesh(geometry, [edge, edge, edge, edge, front, back]);
      mesh.position.y = placement === 'floor' ? -0.1 : 0.05;
      mesh.rotation.x = placement === 'table' ? -0.18 : 0;
      state.group.add(mesh);
    });

    return () => {
      disposed = true;
      if (mesh) {
        mesh.geometry.dispose();
        mesh.material.forEach((material) => {
          material.map?.dispose();
          material.dispose();
        });
      }
    };
  }, [scan, placement]);

  return (
    <section className="preview-panel">
      <div className="panel-heading">
        <h2>العرض</h2>
        <span className="status-pill">
          {locked ? 'Scale locked' : placementLabels[placement]}
        </span>
      </div>
      <div className="scene-host" ref={hostRef}>
        {!scan && (
          <div className="scene-empty">
            <Box size={34} />
            <span>لا يوجد عنصر محدد</span>
          </div>
        )}
      </div>
      <div className="placement-strip">
        <MapPinned size={17} />
        <span>{scan?.title || 'Preview'}</span>
      </div>
    </section>
  );
}
