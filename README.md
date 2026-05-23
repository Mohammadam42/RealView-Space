# RealView Space

تطبيق ويب React/Vite جاهز للنشر على Render، يعرض موديلات جاهزة باستخدام AR على الهاتف.

- تبويب البيتزا: موديل `Pizza Salami` جاهز بصيغتي `GLB` و`USDZ`.
- تبويب النظارات: 4 موديلات نظارات جاهزة بصيغة `GLB`.
- زر `افتح بالـ AR` داخل العارض لتشغيل تجربة الهاتف الأصلية.
- البيتزا تعمل بقفل حجم `ar-scale=fixed`.

ملاحظة: النظارات الموجودة حالياً `GLB` فقط، لذلك تعمل كـ AR على Android/Chrome. الآيفون يحتاج ملف `USDZ` للنظارات حتى يفتحها عبر Quick Look.

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

Build Command:

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
