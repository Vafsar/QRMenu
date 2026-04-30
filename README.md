# 🍽️ QR Menü Uygulaması

Kafeler ve restoranlar için QR kodlu dijital menü ve sipariş sistemi.

## 🔧 Teknolojiler

- **Backend:** ASP.NET Core 8 Web API + PostgreSQL + Entity Framework Core (Npgsql)
- **Frontend:** React 18 + Vite + React Router
- **QR Kod:** QRCoder kütüphanesi
- **Veritabanı:** PostgreSQL 14+

---

## 🚀 Kurulum

### Gereksinimler
- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/)
- [PostgreSQL 14+](https://www.postgresql.org/download/)

---

### 1. PostgreSQL Veritabanını Oluştur

```sql
-- psql ile bağlan ve çalıştır:
CREATE DATABASE qrmenu;
```

`appsettings.json` içinde bağlantı bilgilerini güncelle:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=qrmenu;Username=postgres;Password=SIFREN"
}
```

---

### 2. Migration Oluştur ve Backend'i Başlat

```bash
cd QRMenu.API
dotnet restore

# İlk migration oluştur
dotnet ef migrations add InitialCreate

# Backend'i başlat (migration otomatik uygulanır)
dotnet run
```

> `dotnet ef` komutu yoksa: `dotnet tool install --global dotnet-ef`

API `http://localhost:5000` adresinde çalışmaya başlar.
Swagger: `http://localhost:5000/swagger`

---

### 2. Frontend'i Başlat

Yeni bir terminal aç:

```bash
cd QRMenu.Frontend
npm install
npm run dev
```

Frontend `http://localhost:3000` adresinde açılır.

---

## 📱 Kullanım

### Yönetim Paneli
`http://localhost:3000/admin` adresine git.

- **Panel:** Genel istatistikler ve son siparişler
- **Kategoriler:** Menü kategorilerini yönet
- **Ürünler:** Ürün ekle/düzenle, fiyat ve görsel yükle
- **Masalar & QR:** Masa oluştur, QR kod üret ve yazdır
- **Siparişler:** Gelen siparişleri takip et, durum güncelle

### Müşteri Menüsü
QR kod taratıldığında veya `http://localhost:3000/menu/{masaId}` adresine girildiğinde:

1. Menü kategorilere göre görüntülenir
2. Ürün arama yapılabilir
3. Sepete ürün eklenir
4. İsim ve not ile sipariş gönderilir

---

## 🗂️ Proje Yapısı

```
QRMenu/
├── QRMenu.API/                  # .NET Backend
│   ├── Controllers/
│   │   ├── CategoriesController.cs
│   │   ├── MenuItemsController.cs
│   │   ├── TablesController.cs
│   │   ├── OrdersController.cs
│   │   └── MenuController.cs    # Müşteri menü endpoint'i
│   ├── Models/
│   │   └── Models.cs            # Entity'ler + DTO'lar
│   ├── Data/
│   │   └── AppDbContext.cs
│   ├── wwwroot/
│   │   ├── uploads/             # Ürün görselleri
│   │   └── qrcodes/             # QR kod PNG'leri
│   ├── Program.cs
│   └── appsettings.json
│
└── QRMenu.Frontend/             # React Frontend
    ├── src/
    │   ├── pages/
    │   │   ├── Admin/           # Yönetim sayfaları
    │   │   └── Customer/        # Müşteri menüsü
    │   ├── services/
    │   │   └── api.js           # API çağrıları
    │   ├── context/
    │   │   └── CartContext.jsx  # Sepet state'i
    │   └── main.jsx
    └── vite.config.js
```

---

## 🌐 API Endpoint'leri

| Method | URL | Açıklama |
|--------|-----|----------|
| GET | `/api/menu/{tableId}` | Müşteri menüsü |
| GET/POST | `/api/categories` | Kategoriler |
| GET/POST | `/api/menuitems` | Ürünler |
| GET/POST | `/api/tables` | Masalar |
| POST | `/api/tables/{id}/regenerate-qr` | QR yenile |
| GET/POST | `/api/orders` | Siparişler |
| PUT | `/api/orders/{id}/status` | Sipariş durumu güncelle |

---

## ⚙️ Production Konfigürasyonu

`appsettings.json` dosyasında frontend URL'ini güncelle:

```json
{
  "AppSettings": {
    "FrontendUrl": "https://yourdomain.com"
  }
}
```

---

## 📦 Sipariş Durumları

| # | Durum | Açıklama |
|---|-------|----------|
| 0 | Bekliyor | Yeni sipariş |
| 1 | Onaylandı | Kasiyer onayladı |
| 2 | Hazırlanıyor | Mutfakta |
| 3 | Hazır | Alınmayı bekliyor |
| 4 | Teslim Edildi | Tamamlandı |
| 5 | İptal | İptal edildi |
