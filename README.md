# Ammar AR Studio

تطبيق ويب React/Vite يحتوي على ثلاث تجارب منفصلة داخل نفس الواجهة:

- سكان الأجسام وحفظها وحذفها وعرض Preview ثلاثي الأبعاد.
- سكان/رفع نظارات وتجربتها على الوجه عبر الكاميرا.
- سكان الأكل وعرضه بوضع حجم واقعي مع قفل الـ scale.

## التشغيل المحلي

```bash
npm install
npm run dev
```

افتح:

```text
http://localhost:5173
```

## Build

```bash
npm run build
```

الملفات الجاهزة للنشر تظهر داخل مجلد `dist`.

## الرفع على Render

المشروع يحتوي على `render.yaml` جاهز كـ Static Site:

- Build Command: `npm ci && npm run build`
- Publish Directory: `dist`
- Rewrite: `/*` إلى `/index.html`

بعد رفع المشروع على GitHub، افتح Render وأنشئ Static Site من الريبو. الكاميرا تحتاج HTTPS، ورندر يوفر رابط HTTPS تلقائياً.
