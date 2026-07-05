/* ============================================================
   SİTE YAPILANDIRMASI
   Kurulum tamamlanınca aşağıdaki iki bölümü doldurun.
   Ayrıntılı adımlar: README-KURULUM.md
   ============================================================ */

window.SITE_CONFIG = {

  /* 1) YAPAY ZEKÂ SOHBETİ
     Cloudflare Worker'ınızı kurduktan sonra adresini buraya yazın.
     Örnek: "https://matematik-sohbet.kullaniciadi.workers.dev"
     Boş bırakılırsa sohbet kutusu "henüz etkin değil" notu gösterir. */
  chatWorkerUrl: "",

  /* 2) OKUYUCU YORUMLARI (giscus)
     giscus.app adresinde repo bilgilerinizi girince size verilen
     değerleri buraya kopyalayın. Boş bırakılırsa yorum alanı
     "henüz etkin değil" notu gösterir. */
  giscus: {
    repo: "mfozmantar/matematik-hikayeleri",
    repoId: "R_kgDOTOPN_g",
    category: "Announcements",
    categoryId: "DIC_kwDOTOPN_s4DAjEE"
  }
};
