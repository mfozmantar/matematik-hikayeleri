# Matematik Hikâyeleri Sitesi — Kurulum Rehberi

Bu klasör, yayına hazır bir web sitesidir:

```
matematik-hikayeleri-sitesi/
├── index.html                        ← Ana sayfa (özgeçmiş + hikâye listesi)
├── config.js                         ← DOLDURULACAK: sohbet ve yorum ayarları
├── hikayeler/
│   ├── konigsberg-kopruleri.html     ← Hikâye 1: Euler ve yedi köprü
│   ├── ramanujan-1729.html           ← Hikâye 2: Ramanujan ve Hardy
│   └── cahit-arf.html                ← Hikâye 3: Cahit Arf
├── assets/
│   ├── hikaye.css                    ← Hikâye sayfalarının ortak tasarımı
│   └── chat.js                       ← Sohbet kutusu + yorum sistemi kodu
└── worker/
    └── chat-worker.js                ← Cloudflare'a yüklenecek sohbet sunucusu
```

Hikâyeler şimdiden çalışır durumda — `index.html`'i çift tıklayıp görebilirsiniz.
Sohbet ve yorumların çalışması için aşağıdaki 3 adım gerekir (toplam ~30 dakika).

---

## ADIM 1 — Siteyi GitHub Pages'te yayınlamak (ücretsiz)

1. **github.com** adresinde ücretsiz bir hesap açın.
2. Sağ üstteki **+** → **New repository** deyin.
   - Repository name: `matematik-hikayeleri`
   - **Public** seçin → **Create repository**.
3. Açılan sayfada **"uploading an existing file"** bağlantısına tıklayın;
   bu klasördeki **tüm dosya ve klasörleri** sürükleyip bırakın → **Commit changes**.
   (Alternatif: Claude'a "dosyaları GitHub'a gönder" deyin; git ile birlikte göndeririz.)
4. Repo sayfasında **Settings → Pages** bölümüne gelin:
   - Source: **Deploy from a branch**
   - Branch: **main** / (root) → **Save**
5. Birkaç dakika içinde siteniz şu adreste yayında olur:
   `https://KULLANICIADINIZ.github.io/matematik-hikayeleri/`

---

## ADIM 2 — Okuyucu yorumlarını açmak (giscus, ücretsiz)

1. Reponuzda **Settings → General → Features** altında **Discussions** kutusunu işaretleyin.
2. **github.com/apps/giscus** adresine gidin → **Install** → reponuzu seçin.
3. **giscus.app** adresine gidin:
   - Repo alanına `KULLANICIADINIZ/matematik-hikayeleri` yazın.
   - Sayfa–tartışma eşlemesi: **pathname** seçin.
   - Discussion kategorisi: **Announcements** (veya yeni bir "Hikâye Sohbetleri" kategorisi) seçin.
4. Sayfanın altında oluşan kod kutusundan şu dört değeri kopyalayın:
   `data-repo`, `data-repo-id`, `data-category`, `data-category-id`
5. Bu değerleri sitenizdeki **config.js** dosyasının `giscus` bölümüne yapıştırın
   ve dosyayı GitHub'a tekrar yükleyin.

> Not: Yorum yazmak isteyen okuyucuların ücretsiz bir GitHub hesabı olmalıdır.
> Yorumlar, reponuzun "Discussions" bölümünde saklanır; oradan yönetebilir,
> istenmeyen yorumları silebilirsiniz.

---

## ADIM 3 — Yapay zekâ sohbetini açmak (Claude API + Cloudflare)

**3a. API anahtarı alın:**
1. **console.anthropic.com** adresinde hesap açın.
2. **Billing** bölümünden küçük bir bakiye yükleyin (başlangıç için 5 $ yeterlidir).
3. **API Keys → Create Key** deyin; çıkan `sk-ant-...` anahtarını kopyalayın.
   ⚠️ Bu anahtarı kimseyle paylaşmayın ve asla config.js'e yazmayın.

**3b. Cloudflare Worker kurun (ücretsiz):**
1. **dash.cloudflare.com** adresinde ücretsiz hesap açın.
2. Sol menüden **Workers & Pages → Create → Create Worker** deyin.
   - İsim önerisi: `matematik-sohbet` → **Deploy**.
3. **Edit code** deyin; editördeki her şeyi silip bu klasördeki
   **worker/chat-worker.js** dosyasının tamamını yapıştırın → **Deploy**.
4. Worker sayfasında **Settings → Variables and Secrets → Add**:
   - Type: **Secret**
   - Name: `ANTHROPIC_API_KEY`
   - Value: 3a'da aldığınız anahtar → **Save**.
5. Worker'ınızın adresini kopyalayın
   (örn. `https://matematik-sohbet.kullaniciadi.workers.dev`).

**3c. Siteye bağlayın:**
- **config.js** dosyasında `chatWorkerUrl` alanına Worker adresini yazın,
  dosyayı GitHub'a tekrar yükleyin. Sohbet kutuları aktifleşir.

---

## Maliyet özeti

| Kalem | Maliyet |
|---|---|
| GitHub Pages barındırma | Ücretsiz |
| giscus yorumları | Ücretsiz |
| Cloudflare Worker | Ücretsiz (günde 100.000 istek) |
| Claude API (Haiku modeli) | Kullandıkça: tipik bir sohbet mesajı ≈ 1 kuruş mertebesi; yoğun kullanımda ayda birkaç dolar |

## Yeni hikâye eklemek

Claude'a "yeni bir matematik hikâyesi ekle: [konu]" demeniz yeterli —
mevcut hikâyelerden birini şablon alıp `hikayeler/` klasörüne ekleriz,
ana sayfadaki listeye kartını koyarız.

## Güvenlik notları

- API anahtarınız yalnızca Cloudflare'da "Secret" olarak durur; site kodunda yer almaz.
- Worker, mesaj uzunluğu ve geçmiş sınırlamasıyla basit kötüye kullanım önlemleri içerir.
- Yoğun kötüye kullanım endişesi olursa Cloudflare panelinden ücretsiz
  "Rate Limiting" kuralı eklenebilir (örn. IP başına dakikada 10 istek).
