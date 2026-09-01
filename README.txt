# MAISON AL TEEB — Admin products

هاد النسخة كتخلي الموقع الأصلي كما هو، وكتزيد لوحة إدارة آمنة لإضافة المنتجات.

## الملفات
- `index.html` الموقع الأصلي + مزامنة المنتجات المضافة من الإدارة.
- `admin.html` لوحة الإدارة: login / إضافة / تعديل / حذف / رفع الصور.
- `supabase-config.js` ضع فيه URL و anon key ديال Supabase.
- `supabase-schema.sql` شغلو مرة واحدة داخل Supabase SQL Editor.

## الإعداد
1. صايب Project في Supabase.
2. شغل `supabase-schema.sql`.
3. من Supabase Auth > Users صايب user خاص بالإدارة (email/password).
4. حط Project URL و anon public key داخل `supabase-config.js`.
5. رفع الملفات إلى Vercel.
6. افتح `/admin.html` وسجل الدخول.

## مهم
- ما تحطش Service Role Key داخل الموقع.
- anon key عادي يكون ظاهر للمتصفح مع RLS مفعّل.
- المنتجات القديمة والصور القديمة في `index.html` ما تبدلوش.
- المنتجات الجديدة كتتحفظ في Supabase وكتبان تلقائياً في الموقع.
