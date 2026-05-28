# دليل الإعداد والنشر — مصاريف السكن

---

## ١. إعداد قاعدة البيانات على Supabase

### الخطوة ١ — إنشاء المشروع (إذا لم يكن موجوداً)
1. افتح [supabase.com](https://supabase.com) وسجّل الدخول.
2. اضغط **New Project**، اختر اسماً للمشروع وكلمة سر قوية، ثم اضغط **Create**.
3. انتظر حتى تنتهي عملية الإنشاء (دقيقة تقريباً).

### الخطوة ٢ — تشغيل ملف الـ SQL
1. من القائمة الجانبية اضغط على **SQL Editor**.
2. اضغط **New Query**.
3. افتح ملف `SCHEMA.sql` الموجود في جذر المشروع، وانسخ كامل محتواه.
4. الصق المحتوى في محرر SQL واضغط **Run** (أو `Ctrl+Enter`).
5. تحقق أن الجداول الأربعة ظهرت في **Table Editor**:
   - `settings`
   - `expenses`
   - `settlements`
   - `rent_data`

> **ملاحظة:** يُعطِّل الـ Schema تلقائياً Row-Level Security ويُفعِّل الـ Realtime لجميع الجداول.

---

## ٢. تشغيل التطبيق محلياً

### المتطلبات
- Node.js نسخة 18 أو أحدث
- npm

### الخطوات

```bash
# ١. استنسخ أو حمّل المشروع
cd sakan-app

# ٢. ثبِّت الاعتماديات
npm install

# ٣. تأكد من وجود ملف .env في جذر المشروع بالمحتوى التالي:
#    VITE_SUPABASE_URL=https://xdmcmoynghbkfsizlkwk.supabase.co
#    VITE_SUPABASE_ANON_KEY=sb_publishable_...
#    (الملف موجود مسبقاً — لا حاجة لتعديله)

# ٤. شغّل الخادم المحلي
npm run dev
```

افتح المتصفح على العنوان الذي يظهر في الطرفية (عادةً `http://localhost:5173`).

---

## ٣. النشر على Vercel

### الطريقة الأولى — من واجهة Vercel (الأسهل)

1. ارفع الكود على GitHub (مستودع خاص أو عام).
2. افتح [vercel.com](https://vercel.com) وسجّل الدخول.
3. اضغط **Add New → Project**.
4. اختر مستودع GitHub.
5. في قسم **Environment Variables** أضف:

   | الاسم | القيمة |
   |-------|--------|
   | `VITE_SUPABASE_URL` | `https://xdmcmoynghbkfsizlkwk.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkbWNtb3luZ2hia2ZzaXpsa3drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NzA1NTQsImV4cCI6MjA5NTU0NjU1NH0.uj3bg1NFGX6C0NuvB5WEVWbYxjthJc5UAkoiufGS5mo` |

6. اضغط **Deploy**.
7. بعد اكتمال النشر ستحصل على رابط مثل `https://sakan-app.vercel.app`.

### الطريقة الثانية — من سطر الأوامر

```bash
# ثبِّت Vercel CLI
npm install -g vercel

# سجّل الدخول
vercel login

# انشر من داخل مجلد المشروع
vercel

# أضف متغيرات البيئة إذا طلب منك Vercel ذلك
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# نشر نسخة الإنتاج
vercel --prod
```

> **تنبيه:** لا ترفع ملف `.env` إلى GitHub. أضفه إلى `.gitignore` إذا لم يكن موجوداً فيه.

---

## ٤. مشاركة التطبيق مع الشركاء

بعد النشر، أرسل الرابط لجميع الشركاء. التطبيق مزامَن فورياً — أي تغيير يراه الجميع في الحال دون الحاجة لإعادة التحميل.

---

## ٥. ملاحظات تقنية

| الموضوع | التفاصيل |
|---------|---------|
| قاعدة البيانات | Supabase (PostgreSQL) |
| المزامنة الفورية | Supabase Realtime (WebSocket) |
| الواجهة | React + Tailwind CSS + Vite |
| الخط | Tajawal (عربي) |
| حفظ البيانات | سحابي — مشترك بين جميع الأجهزة |
