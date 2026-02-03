# Supabase Auth Configuration

## ⚠️ IMPORTANT: Enable Email Auth in Supabase

Untuk signup/login bekerja, kamu perlu enable Email Auth di Supabase Dashboard.

## Setup Steps

### 1. Go to Supabase Dashboard

https://supabase.com/dashboard/project/ymcjoloqemofuhiomdgk/auth/providers

### 2. Enable Email Provider

1. Klik **Authentication** di sidebar
2. Klik **Providers** tab
3. Cari **Email** provider
4. Toggle **Enable Email Provider** → ON
5. Configure settings:
   - ✅ **Enable email confirmations** → OFF (untuk testing, bisa ON nanti)
   - ✅ **Secure email change** → ON
   - ✅ **Secure password change** → ON

### 3. Configure Site URL (Optional but Recommended)

1. Klik **Authentication** → **URL Configuration**
2. Set **Site URL**: `https://your-domain.vercel.app`
3. Add **Redirect URLs**:
   - `https://your-domain.vercel.app`
   - `http://localhost:3000` (for local dev)

### 4. Email Templates (Optional)

Jika enable email confirmations:
1. Klik **Authentication** → **Email Templates**
2. Customize templates untuk:
   - Confirm signup
   - Magic Link
   - Change email
   - Reset password

## Database Trigger Applied ✅

Trigger sudah dibuat untuk auto-create user record saat signup:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## RLS Policy Applied ✅

Policy untuk allow user insert their own data:

```sql
CREATE POLICY "Users can insert their own data" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);
```

## Testing Signup

1. Buka `/register` page
2. Enter email dan password (min 6 characters)
3. Klik Sign Up
4. Jika sukses, akan redirect ke homepage
5. Check di Supabase Dashboard → Authentication → Users

## Troubleshooting

### Error: "load failed"
**Cause:** Email provider belum enabled di Supabase  
**Solution:** Enable Email provider di Authentication → Providers

### Error: "Email not confirmed"
**Cause:** Email confirmation enabled tapi email belum dikonfirmasi  
**Solution:** 
- Disable email confirmation untuk testing, atau
- Check email inbox untuk confirmation link, atau
- Manually confirm di Supabase Dashboard → Authentication → Users → Edit user

### Error: "User already registered"
**Cause:** Email sudah terdaftar  
**Solution:** Gunakan email lain atau login dengan email tersebut

### Error: "Invalid email"
**Cause:** Format email salah  
**Solution:** Gunakan format email yang valid (example@domain.com)

### Error: "Weak password"
**Cause:** Password terlalu lemah  
**Solution:** Gunakan password minimal 6 karakter

## Create Admin User

Setelah signup berhasil:

1. Login dengan akun yang baru dibuat
2. Go to Supabase Dashboard: https://supabase.com/dashboard/project/ymcjoloqemofuhiomdgk/editor
3. Table Editor → `users` table
4. Find your user by email
5. Edit row → Change `role` from `user` to `admin`
6. Save
7. Refresh website → Admin button akan muncul di header
8. Akses `/admin` dashboard

## Features After Setup

- ✅ User registration
- ✅ User login
- ✅ Auto-create user record in public.users
- ✅ Role-based access (user/admin)
- ✅ Protected admin routes
- ✅ Session persistence
- ✅ Secure authentication

---

**Setup Auth dulu baru signup bisa bekerja!** 🔐
