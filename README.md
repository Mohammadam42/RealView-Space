# Ammar AR Studio

تطبيق ويب React/Vite يحتوي على ثلاث تجارب منفصلة داخل نفس الواجهة:

- سكان الأجسام وحفظها وحذفها وعرض Preview ثلاثي الأبعاد، مع رفع ملفات `GLB/GLTF/USDZ` وتشغيل AR حقيقي على الهاتف.
- سكان/رفع نظارات وتجربتها على الوجه عبر الكاميرا.
- سكان الأكل وعرضه بوضع حجم واقعي مع قفل الـ scale، وتشغيل موديلات الطعام في AR مع `ar-scale=fixed`.

> ملاحظة: السكان بالكاميرا داخل المتصفح يحفظ صور السكان. تحويل الصور إلى موديل 3D حقيقي يحتاج خدمة Photogrammetry أو تطبيق/native scanner. بعد إنتاج ملف `GLB` أو `USDZ` يمكن رفعه داخل الموقع وتشغيله بالـ AR مباشرة.

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

## تشغيل Render كـ Node Web Service

```bash
npm ci && npm run build
```

Start Command:

```bash
npm start
```

## الرفع على Render

المشروع يحتوي على `render.yaml` جاهز كـ Static Site:

- Build Command: `npm ci && npm run build`
- Publish Directory: `dist`
- Rewrite: `/*` إلى `/index.html`

بعد رفع المشروع على GitHub، افتح Render وأنشئ Static Site من الريبو. الكاميرا تحتاج HTTPS، ورندر يوفر رابط HTTPS تلقائياً.
