# 🚀 Deploy Rehberi — Railway (Backend) + Netlify (Frontend)

---

## ÖN HAZIRLIK: GitHub'a Yükle

Projeyi yayınlamadan önce GitHub'a yüklemeniz gerekiyor.

### Adım 1 — Git başlat ve push et

```bash
# Proje klasörünün içinde:
git init
git add .
git commit -m "ilk commit"
```

### Adım 2 — GitHub'da repo oluştur

1. [github.com](https://github.com) → sağ üst **"+"** → **"New repository"**
2. Repository adı: `qrmenu` (ya da istediğin isim)
3. **Public** seç → **"Create repository"** tıkla
4. Sayfada çıkan komutları çalıştır:

```bash
git remote add origin https://github.com/KULLANICI_ADIN/qrmenu.git
git branch -M main
git push -u origin main
```

---

## BÖLÜM 1: RAILWAY — Backend + PostgreSQL

> Railway, .NET API ve PostgreSQL veritabanını ücretsiz barındırır.
> Aylık 5$ kredi ücretsiz verir (küçük projeler için yeterli).

---

### Adım 3 — Railway hesabı aç

1. [railway.app](https://railway.app) adresine git
2. **"Login"** → **"Login with GitHub"** tıkla
3. GitHub hesabınla giriş yap

---

### Adım 4 — PostgreSQL veritabanı oluştur

1. Railway dashboard'da **"New Project"** tıkla
2. **"Add a service"** → **"Database"** → **"Add PostgreSQL"** seç
3. PostgreSQL servisi oluşturulur (birkaç saniye sürer)
4. Sol menüde **PostgreSQL** servisine tıkla
5. **"Variables"** sekmesine gir
6. **DATABASE_URL** değerini kopyala ve bir yere kaydet
   - Şuna benzer: `postgresql://postgres:sifre@containers-us-west-1.railway.app:5432/railway`

---

### Adım 5 — .NET API servisini oluştur

1. Railway dashboard'da **"+ New"** → **"GitHub Repo"** tıkla
2. GitHub hesabını bağla (ilk kez kullanıyorsan izin ver)
3. `qrmenu` reposunu seç
4. Railway otomatik deploy başlatır — **henüz bekleme**, önce ayarları yapman lazım

---

### Adım 6 — API'nin environment variable'larını ayarla

1. Oluşturulan API servisine tıkla
2. **"Variables"** sekmesine gir
3. Aşağıdaki değişkenleri **tek tek** ekle:

| Değişken Adı | Değer |
|---|---|
| `DATABASE_URL` | Adım 4'te kopyaladığın PostgreSQL URL'i |
| `FRONTEND_URL` | Şimdilik boş bırak, Netlify'dan sonra ekleyeceksin |
| `ASPNETCORE_ENVIRONMENT` | `Production` |

4. **"Deploy"** butonuna tıkla

---

### Adım 7 — Root Directory ayarla

Railway tüm repoyu görür ama Dockerfile sadece `QRMenu.API` içinde:

1. Servis ayarlarında **"Settings"** sekmesine git
2. **"Root Directory"** alanına `QRMenu.API` yaz
3. Kaydet ve yeniden deploy et

---

### Adım 8 — API URL'ini al

1. Servis **"Settings"** → **"Networking"** bölümüne git
2. **"Generate Domain"** tıkla
3. Sana şuna benzer bir URL verir:
   ```
   https://qrmenu-api-production.up.railway.app
   ```
4. **Bu URL'i kopyala** — Netlify ve FRONTEND_URL için lazım olacak

---

### Adım 9 — API'nin çalıştığını test et

Tarayıcıda şu adresi aç:
```
https://SENIN_RAILWAY_URL/health
```
Şunu görürsen API çalışıyor demektir:
```json
{"status": "healthy", "time": "2024-..."}
```

---

## BÖLÜM 2: NETLIFY — React Frontend

---

### Adım 10 — Netlify hesabı aç

1. [netlify.com](https://netlify.com) adresine git
2. **"Sign up"** → **"Sign up with GitHub"** tıkla

---

### Adım 11 — Yeni site oluştur

1. Dashboard'da **"Add new site"** → **"Import an existing project"**
2. **"GitHub"** seç
3. `qrmenu` reposunu seç

---

### Adım 12 — Build ayarlarını kontrol et

Netlify `netlify.toml` dosyasını otomatik okur, ayarlar otomatik gelir:
- **Base directory:** `QRMenu.Frontend`
- **Build command:** `npm run build`
- **Publish directory:** `QRMenu.Frontend/dist`

Eğer otomatik gelmezse manuel gir.

---

### Adım 13 — Environment variable ekle

**"Deploy"** butonuna basmadan önce:

1. **"Site configuration"** → **"Environment variables"**
2. **"Add a variable"** tıkla:

| Key | Value |
|---|---|
| `VITE_API_URL` | Adım 8'deki Railway URL'in (sonda `/` olmadan) |

Örnek: `https://qrmenu-api-production.up.railway.app`

3. Kaydet

---

### Adım 14 — Deploy et

1. **"Deploy site"** butonuna tıkla
2. Build süreci başlar (~2-3 dakika)
3. Tamamlanınca Netlify sana bir URL verir:
   ```
   https://amazing-name-123.netlify.app
   ```
4. **Bu URL'i kopyala**

---

### Adım 15 — Railway'e Netlify URL'ini ekle

Railway'deki API, Netlify'ı tanıması için:

1. Railway → API servisi → **"Variables"**
2. `FRONTEND_URL` değişkenini güncelle:
   ```
   https://amazing-name-123.netlify.app
   ```
3. Railway otomatik yeniden deploy eder

---

## BÖLÜM 3: TEST ET

### Adım 16 — Her şeyi kontrol et

Tarayıcıda Netlify URL'ini aç:

```
https://amazing-name-123.netlify.app
```

✅ **Yönetim paneli açılıyor mu?** → `/admin`
✅ **Kategori ekleyebiliyor musun?** → Kategoriler sayfası
✅ **QR kod oluşturuluyor mu?** → Masalar sayfası
✅ **Müşteri menüsü açılıyor mu?** → `/menu/1`
✅ **Sipariş verilebiliyor mu?** → Menüden sepete ekle

---

## ÖZET

```
GitHub Repo
    ├── Railway (otomatik deploy)
    │     ├── .NET API  → https://xxx.up.railway.app
    │     └── PostgreSQL (dahili bağlantı)
    │
    └── Netlify (otomatik deploy)
          └── React Frontend → https://xxx.netlify.app
```

Her `git push` yaptığında hem Railway hem Netlify **otomatik deploy** yapar.

---

## SORUN GİDERME

**API çalışmıyor / health endpoint 502 veriyor:**
- Railway → Servis → **"Logs"** sekmesini kontrol et
- `DATABASE_URL` doğru girildi mi kontrol et

**Frontend API'ye bağlanamıyor (CORS hatası):**
- Railway'deki `FRONTEND_URL` değişkeni Netlify URL'iyle birebir aynı mı?
- Sonda `/` var mı? Olmaması lazım

**Sayfa yenileyince 404 hatası:**
- `netlify.toml` dosyası repoda var mı kontrol et

**QR kod resmi görünmüyor:**
- Railway ücretsiz planda dosya sistemi kalıcı değildir
- Görsel kalıcılığı için ilerleyen aşamada Cloudinary entegrasyonu eklenebilir
