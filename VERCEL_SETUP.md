# Vercel Environment Variables Setup

## ⚠️ IMPORTANT: Set Environment Variables Before Deploy

Vercel build akan gagal jika environment variables tidak di-set. Ikuti langkah ini:

## Step-by-Step Setup

### 1. Go to Vercel Dashboard
1. Buka project: https://vercel.com/dashboard
2. Pilih project `ctrxldrama-premium`
3. Klik **Settings** → **Environment Variables**

### 2. Add These Variables

Copy paste nilai-nilai ini ke Vercel:

#### Variable 1: NEXT_PUBLIC_API_BASE_URL
```
NEXT_PUBLIC_API_BASE_URL
```
Value:
```
https://api.sansekai.my.id/api
```

#### Variable 2: NEXT_PUBLIC_CRYPTO_SECRET
```
NEXT_PUBLIC_CRYPTO_SECRET
```
Value:
```
Sansekai-SekaiDrama
```

#### Variable 3: NEXT_PUBLIC_SUPABASE_URL
```
NEXT_PUBLIC_SUPABASE_URL
```
Value:
```
https://ymcjoloqemofuhiomdgk.supabase.co
```

#### Variable 4: NEXT_PUBLIC_SUPABASE_ANON_KEY
```
NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Value:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltY2pvbG9xZW1vZnVoaW9tZGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4MzAxMjQsImV4cCI6MjA4NTQwNjEyNH0.WmkqB1Ro9iVBB8w1NTr7Oy8a0CXqtMH-Zb1CS38wSGc
```

### 3. Apply to All Environments

Pastikan semua variables di-apply ke:
- ✅ Production
- ✅ Preview
- ✅ Development

### 4. Redeploy

Setelah environment variables di-set:
1. Klik **Deployments** tab
2. Pilih deployment terakhir yang failed
3. Klik **Redeploy**
4. Atau push commit baru ke GitHub untuk trigger auto-deploy

## Verification

Build akan sukses jika melihat:
```
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

## Troubleshooting

### Error: "supabaseUrl is required"
- Environment variables belum di-set di Vercel
- Solusi: Set semua 4 variables di atas

### Error: "Failed to fetch"
- API keys salah atau expired
- Solusi: Cek kembali nilai dari `.env.local`

### Build Success tapi Admin Panel Error
- Supabase connection issue
- Solusi: Verify Supabase project masih active di dashboard

## Quick Copy-Paste Format

Untuk copy paste cepat ke Vercel:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.sansekai.my.id/api
NEXT_PUBLIC_CRYPTO_SECRET=Sansekai-SekaiDrama
NEXT_PUBLIC_SUPABASE_URL=https://ymcjoloqemofuhiomdgk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltY2pvbG9xZW1vZnVoaW9tZGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4MzAxMjQsImV4cCI6MjA4NTQwNjEyNH0.WmkqB1Ro9iVBB8w1NTr7Oy8a0CXqtMH-Zb1CS38wSGc
```

---

**Setelah setup, build akan sukses dan website siap digunakan!** 🚀
