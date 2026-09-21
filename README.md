# "Book–Cafe" — to'liq loyiha (frontend + backend)

## Tuzilishi
```
book-cafe/
  frontend/   React + TypeScript (.tsx) + Tailwind + Vite + framer-motion
  backend/    Node.js + Express + TypeScript + SQLite
```

## 1. Backend'ni ishga tushirish
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```
Server `http://localhost:4000` da ishga tushadi. Birinchi ishga tushirishda
`bookcafe.db` fayli avtomatik yaratiladi va quyidagilar bilan to'ldiriladi:
- 10 ta namunaviy kitob, kafe menyusi, 14 kunlik energiya statistikasi
- **standart admin hisobi**: telefon `admin`, parol `admin123`
  (ishlab chiqarishga chiqarishdan oldin albatta o'zgartiring!)

### API endpointlar
- `POST /api/auth/register` — {name, phone, password}
- `POST /api/auth/login` — {phone, password} → admin bo'lsa javobda `adminKey` ham keladi
- `GET /api/books` — ?category=&q=
- `GET /api/books/categories`
- `GET /api/books/:id`
- `POST /api/reservations` (token kerak) — {bookId}
- `POST /api/reservations/:id/return` (token kerak)
- `GET /api/reservations/me` (token kerak)
- `GET /api/menu`
- `POST /api/orders` (token kerak) — {items:[{menuItemId, qty}]}
- `GET /api/orders/me` (token kerak)
- `GET /api/zones`
- `GET /api/energy` — 14 kunlik quyosh statistikasi
- `GET /api/energy/live` — joriy ishlab chiqarish/sarfiyot (5 sekundda yangilanadi)
- `POST /api/rfid/scan` — {tag, gate: 'exit'|'entry'}
- `GET /api/rfid/events`
- `POST /api/admin/books` (`x-admin-key` header) — AKM yangi kitob qo'shadi
- `DELETE /api/admin/books/:id` (`x-admin-key` header)
- `GET /api/admin/sync-log`
- `GET /api/admin/stats` (`x-admin-key` header)

## 2. Frontend'ni ishga tushirish
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Sayt `http://localhost:5173` da ochiladi.

## 3. Ishlab chiqarishga chiqarish
```bash
cd backend && npm run build && npm start
cd frontend && npm run build
```
`JWT_SECRET` va `ADMIN_KEY`ni albatta uzun, tasodifiy qiymatlarga
o'zgartiring va standart admin parolini yangilang.

## 4. Foydalanuvchi oqimi (yangi)
1. **Sayt endi "avval hisob" tamoyili bilan ishlaydi**: bosh sahifa, katalog,
   kafe, savat — barchasi hisobga kirishni talab qiladi. Hisobi yo'q
   mehmon `/hisobim`ga yo'naltiriladi va shu yerda ro'yxatdan o'tadi yoki
   kiradi.
2. **Oddiy mijoz** kirgach — ovoz orqali "Xush kelibsiz, Book–Cafega,
   [Ism]!" deb ekranga chiroyli animatsiyali salomlashuv chiqadi (brauzer
   ovoz sintezi, Web Speech API), so'ng bosh sahifaga o'tkaziladi.
3. **Admin hisobi** (`admin` / `admin123`) bilan kirilsa — foydalanuvchi
   avtomatik ravishda `/admin` panelga yo'naltiriladi, kalitni qo'lda
   kiritish shart emas.
4. **`/kitob/:id`** (QR orqali) va **`/rfid`** (xodimlar RFID kioski)
   hisobsiz ham ochiladi — chunki ular mehmon telefonidan yoki alohida
   kiosk qurilmasidan ishlatiladi.

## 5. AKM admin paneli (`/admin`) — yangilangan
Endi uchta bo'limli (tab) boshqaruv paneli:
- **Statistika** — jami kitoblar, mavjud kitoblar, faol band qilishlar,
  foydalanuvchilar, buyurtmalar, tushum, RFID signallari (raqamlar
  animatsiyali hisoblanadi), kategoriya taqsimoti va eng ko'p band
  qilingan kitoblar.
- **Energiya** — (avvalgi alohida `/energiya` sahifasi shu yerga
  ko'chirildi) jonli kW ko'rsatkichlari (5 sekundda yangilanadi) va
  14 kunlik grafik.
- **Fond boshqaruvi** — yangi kitob qo'shish formasi (qo'shilgan zahoti
  umumiy katalogda ko'rinadi) va AKM sinxronizatsiya jurnali.

## 6. Animatsiyalar (`framer-motion`)
- Sahifalar orasidagi silliq o'tish (fade + scale)
- Bosh sahifada suzib yuruvchi fon gradientlari, javondagi kitoblarning
  ketma-ket ochilishi
- Header'da faol havola ustida suzib yuruvchi "pill" indikator
  (`layoutId` animatsiyasi)
- Admin panelida tablar orasidagi animatsiyali chiziqcha, statistika
  kartalarining ketma-ket paydo bo'lishi va raqamlarning "hisoblanib"
  ko'rsatilishi (`AnimatedNumber` komponenti)
- RFID kioskida signal berilganda butun ekranni qamrab oluvchi qizil
  miltillash effekti
- Login/ro'yxatdan o'tishda ovozli salomlashuv paytida to'liq ekranli
  animatsiyali xushnud lavha

## PDF taqdimotdagi qaysi narsalar qamrab olindi
- **AKM hamkorligi** — admin panelning "Fond boshqaruvi" bo'limida xodim
  yangi kitob qo'shsa, u darhol katalogda paydo bo'ladi va sinxronizatsiya
  jurnaliga yoziladi.
- **RFID himoya** — `/rfid` kioskida haqiqiy darvoza mantig'i: band
  qilinmagan kitob olib chiqilsa signal (butun ekranli effekt bilan)
  beriladi, qaytarilganda avtomatik yopiladi.
- **QR va audiozona** — har bir kitobda haqiqiy skanerlanadigan QR-kod va
  brauzer orqali ishlaydigan audio o'qish.
- **Yashil energiya** — admin panelning "Energiya" bo'limida jonli
  ko'rsatkichlar va 14 kunlik grafik.
- **Kafening 4 hududi** — bosh sahifada.
- **Daromad manbalari** — kafe menyusi orqali buyurtma.
