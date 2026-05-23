import '@google/model-viewer';
import { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  BadgeCheck,
  ChefHat,
  Glasses,
  Grid2X2,
  Maximize2,
  ScanLine,
  Smartphone,
  Sparkles,
} from 'lucide-react';

const catalog = {
  pizza: {
    label: 'البيتزا',
    eyebrow: 'True Size Menu',
    title: 'Pizza Salami',
    subtitle: 'عرض طبق جاهز بالحجم الواقعي على طاولة الزبون.',
    icon: ChefHat,
    hero: '/models/pizza/cc0_-_pizza_salami.glb',
    ios: '/models/pizza/CC0_-_Pizza_Salami.usdz',
    arScale: 'fixed',
    arPlacement: 'floor',
    accent: '#d95f3e',
    products: [
      {
        id: 'pizza-salami',
        name: 'Pizza Salami',
        model: '/models/pizza/cc0_-_pizza_salami.glb',
        ios: '/models/pizza/CC0_-_Pizza_Salami.usdz',
        meta: 'GLB + USDZ',
        scale: 'fixed',
        placement: 'floor',
      },
    ],
  },
  glasses: {
    label: 'النظارات',
    eyebrow: 'Frame Gallery',
    title: 'Glasses Collection',
    subtitle: 'موديلات نظارات جاهزة للعرض ثلاثي الأبعاد وفتحها بالـ AR على الهاتف.',
    icon: Glasses,
    hero: '/models/glasses/glasses-11c.glb',
    arScale: 'auto',
    arPlacement: 'floor',
    accent: '#24776d',
    products: [
      {
        id: 'glasses-11c',
        name: 'Urban Clear',
        model: '/models/glasses/glasses-11c.glb',
        meta: '2.5 MB',
        scale: 'auto',
        placement: 'floor',
      },
      {
        id: 'glasses-10',
        name: 'Classic Curve',
        model: '/models/glasses/glasses-10.glb',
        meta: '3.3 MB',
        scale: 'auto',
        placement: 'floor',
      },
      {
        id: 'glasses-6',
        name: 'Soft Square',
        model: '/models/glasses/glasses-6.glb',
        meta: '3.6 MB',
        scale: 'auto',
        placement: 'floor',
      },
      {
        id: 'glasses-9c',
        name: 'Sharp Line',
        model: '/models/glasses/glasses-9c.glb',
        meta: '3.9 MB',
        scale: 'auto',
        placement: 'floor',
      },
    ],
  },
};

function ArModel({ product, className = '' }) {
  return (
    <model-viewer
      class={className}
      src={product.model}
      ios-src={product.ios || ''}
      ar=""
      ar-modes="webxr scene-viewer quick-look"
      ar-scale={product.scale}
      ar-placement={product.placement}
      camera-controls=""
      touch-action="pan-y"
      auto-rotate=""
      rotation-per-second="22deg"
      shadow-intensity="0.86"
      exposure="0.92"
      alt={product.name}
    >
      <button slot="ar-button" type="button" className="ar-button">
        <Smartphone size={18} />
        <span>افتح بالـ AR</span>
      </button>
    </model-viewer>
  );
}

function ProductCard({ product, active, onSelect, icon: Icon }) {
  return (
    <button type="button" className={active ? 'product-card active' : 'product-card'} onClick={onSelect}>
      <div className="product-thumb">
        <Icon size={38} />
      </div>
      <div className="product-copy">
        <strong>{product.name}</strong>
        <span>{product.meta}</span>
      </div>
      <ArrowUpRight size={17} />
    </button>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('pizza');
  const section = catalog[activeTab];
  const [selectedByTab, setSelectedByTab] = useState({
    pizza: catalog.pizza.products[0].id,
    glasses: catalog.glasses.products[0].id,
  });

  const selectedProduct = useMemo(() => {
    const selectedId = selectedByTab[activeTab];
    return section.products.find((product) => product.id === selectedId) || section.products[0];
  }, [activeTab, section, selectedByTab]);

  const selectProduct = (id) => {
    setSelectedByTab((current) => ({ ...current, [activeTab]: id }));
  };

  return (
    <main className="site-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">
            <ScanLine size={25} />
          </div>
          <div>
            <span>RealView</span>
            <strong>Space</strong>
          </div>
        </div>

        <nav className="tabbar" aria-label="catalog">
          {Object.entries(catalog).map(([key, item]) => {
            const Icon = item.icon;
            return (
              <button
                key={key}
                type="button"
                className={activeTab === key ? 'tab active' : 'tab'}
                onClick={() => setActiveTab(key)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="device-pill">
          <Smartphone size={16} />
          <span>Mobile AR</span>
        </div>
      </header>

      <section className="hero-band" style={{ '--accent': section.accent }}>
        <div className="hero-copy">
          <span className="eyebrow">{section.eyebrow}</span>
          <h1>{section.title}</h1>
          <p>{section.subtitle}</p>

          <div className="hero-actions">
            <div className="feature-pill">
              <BadgeCheck size={16} />
              <span>{selectedProduct.ios ? 'Android + iPhone' : 'Android ready'}</span>
            </div>
            <div className="feature-pill">
              <Maximize2 size={16} />
              <span>{selectedProduct.scale === 'fixed' ? 'Fixed scale' : 'Auto scale'}</span>
            </div>
          </div>
        </div>

        <div className="hero-viewer">
          <ArModel product={selectedProduct} className="main-viewer" />
        </div>
      </section>

      <section className="catalog-section" style={{ '--accent': section.accent }}>
        <div className="section-heading">
          <div>
            <span className="eyebrow">Ready Models</span>
            <h2>الموديلات الجاهزة</h2>
          </div>
          <div className="feature-pill quiet">
            <Grid2X2 size={16} />
            <span>{section.products.length} عناصر</span>
          </div>
        </div>

        <div className={section.products.length === 1 ? 'product-grid single' : 'product-grid'}>
          {section.products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              icon={section.icon}
              active={product.id === selectedProduct.id}
              onSelect={() => selectProduct(product.id)}
            />
          ))}
        </div>
      </section>

      <footer className="footer-strip">
        <Sparkles size={16} />
        <span>جاهز للنشر على Render وتشغيله من رابط HTTPS على الهاتف.</span>
      </footer>
    </main>
  );
}
