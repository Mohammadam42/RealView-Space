# Engineer Mohammad Ammar Try-On

واجهة عربية أصلية لتجربة النظارات افتراضياً من المتصفح.

## الميزات

- كاميرا أمامية مباشرة.
- 6 موديلات نظارات جاهزة من الملفات المرفقة.
- بدون رفع ملفات من المستخدم.
- ضبط حجم النظارة ومكانها وميلانها.
- حفظ صورة النتيجة.
- اسم العلامة داخل الواجهة: `المهندس محمد عمار`.

## التشغيل المحلي

```bash
npm install
npm run dev
```

افتح:

```text
http://localhost:5173
```

## Render

استخدم Node Web Service:

```text
Build Command:
npm ci && npm run build
```

```text
Start Command:
npm start
```

خلي `Root Directory` فاضي إذا ملفات المشروع في جذر الريبو.

ملاحظة: تشغيل الكاميرا يحتاج HTTPS، ورندر يوفر HTTPS تلقائياً.
