# 🚀 دليل نشر Nitro Notifier على Vercel

---

## 📋 المتطلبات

1. حساب على [Vercel](https://vercel.com) (مجاني)
2. حساب على [GitHub](https://github.com) (مجاني)
3. بوت ديسكورد (للإشعارات)

---

## 🔄 الخطوة 1: رفع الكود لـ GitHub

### الطريقة A: رفع مباشر

1. اذهب إلى [GitHub](https://github.com/new)
2. أنشئ مستودع جديد (مثلاً: `nitro-notifier`)
3. لا تختر README أو .gitignore

### الطريقة B: باستخدام Git

```bash
# في مجلد المشروع
git init
git add .
git commit -m "Initial commit - Nitro Notifier"
git branch -M main
git remote add origin https://github.com/USERNAME/nitro-notifier.git
git push -u origin main
```

---

## 🗄️ الخطوة 2: إنشاء قاعدة بيانات Vercel Postgres

### الطريقة الأبسط: استخدام Vercel Storage

1. اذهب لمشروعك على Vercel
2. اضغط **Storage** في الأعلى
3. اختر **Create Database**
4. اختر **Postgres**
5. أدخل اسم قاعدة البيانات (مثلاً: `nitro-db`)
6. اضغط **Create**
7. اختر مشروعك واضغط **Connect**

✅ سيتم إضافة `DATABASE_URL` تلقائياً!

---

## ⚡ الخطوة 3: نشر المشروع على Vercel

### الطريقة A: من الموقع

1. اذهب إلى [vercel.com/new](https://vercel.com/new)
2. اختر مستودع GitHub الخاص بك
3. اضغط **Import**
4. الإعدادات:
   - **Framework Preset**: Next.js (تلقائي)
   - **Root Directory**: `./`
   - **Build Command**: `prisma generate && next build`
   - **Output Directory**: `.next` (تلقائي)
5. اضغط **Deploy**

### الطريقة B: من CLI

```bash
# تثبيت Vercel CLI
npm i -g vercel

# تسجيل الدخول
vercel login

# النشر
vercel --prod
```

---

## ⚙️ الخطوة 4: إعداد متغيرات البيئة

اذهب إلى **Settings** > **Environment Variables** في مشروع Vercel:

| المتغير | القيمة | مطلوب |
|---------|--------|-------|
| `DATABASE_URL` | (تلقائي من Postgres) | ✅ |
| `DISCORD_BOT_TOKEN` | توكن البوت | للإشعارات |
| `NOTIFICATION_CHANNEL_ID` | معرف القناة | للإشعارات |
| `CRON_SECRET` | مفتاح عشوائي | اختياري |

---

## 🔄 الخطوة 5: تفعيل Cron Jobs

الـ Cron Jobs مُعرّفة في `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/check-subscriptions",
      "schedule": "*/30 * * * *"
    }
  ]
}
```

> **ملاحظة**: الـ Cron Jobs تعمل تلقائياً على Vercel Pro plan
> للمجاني، يمكنك استخدام [cron-job.org](https://cron-job.org) لاستدعاء الـ endpoint

---

## 🤖 الخطوة 6: تشغيل البوت (منفصل)

البوت يحتاج عملية مستمرة، لذا استخدم أحد الخيارات:

### الخيار 1: Render.com (مجاني) ⭐ موصى به

1. اذهب إلى [render.com](https://render.com)
2. أنشئ حساب واربط GitHub
3. اختر **New** > **Background Worker**
4. اربط المستودع
5. الإعدادات:
   - **Build Command**: `cd download/discord-bot && npm install && npm run build`
   - **Start Command**: `cd download/discord-bot && npm start`
6. أضف متغيرات البيئة من `.env.example`

### الخيار 2: Railway.app

```bash
npm install -g railway
railway login
railway init
railway run -- cd download/discord-bot && npm start
```

### الخيار 3: VPS

```bash
# باستخدام PM2
cd download/discord-bot
npm install
npm run build
pm2 start dist/index.js --name nitro-bot
pm2 save
pm2 startup
```

---

## ✅ التحقق من النشر

### 1. لوحة التحكم
افتح رابط Vercel الخاص بك (مثلاً: `https://nitro-notifier.vercel.app`)

### 2. API
```bash
# جلب الإحصائيات
curl https://your-app.vercel.app/api/stats

# جلب العملاء
curl https://your-app.vercel.app/api/customers
```

### 3. Cron Job
```bash
# اختبار يدوي
curl https://your-app.vercel.app/api/cron/check-subscriptions
```

---

## 🔧 استكشاف الأخطاء

### مشكلة: Database connection error

```bash
# تأكد من DATABASE_URL
vercel env pull .env.local
npx prisma db push
```

### مشكلة: Build fails

```bash
# تحقق من الـ logs
vercel logs --output raw
```

### مشكلة: Cron not running

- المجاني لا يدعم Cron Jobs تلقائياً
- استخدم cron-job.org لاستدعاء الـ endpoint

---

## 📊 مقارنة خطط Vercel

| الميزة | المجاني | Pro ($20/شهر) |
|--------|---------|---------------|
| النطاقات | نعم | نعم |
| Cron Jobs | ❌ | ✅ |
| Storage | محدود | غير محدود |
| Logs | محدود | كامل |

---

## 🎉 مبروك!

لوحة التحكم تعمل الآن على Vercel 24/7!

للمساعدة: [Vercel Documentation](https://vercel.com/docs)
