/* ============================================================
   MATEMATİK HİKÂYELERİ — SOHBET SUNUCUSU (Cloudflare Worker)

   Bu kod, sitedeki sohbet kutusundan gelen mesajları alır,
   Claude API'ye iletir ve yanıtı geri döndürür. API anahtarınız
   tarayıcıya asla gitmez; yalnızca bu sunucuda saklanır.

   KURULUM (ayrıntısı README-KURULUM.md'de):
   1. dash.cloudflare.com → Workers & Pages → Create Worker
   2. Bu dosyanın tamamını editöre yapıştırın → Deploy
   3. Worker → Settings → Variables and Secrets →
      "ANTHROPIC_API_KEY" adında bir SECRET ekleyin
      (değeri: console.anthropic.com'dan aldığınız anahtar)
   4. Worker adresini (örn. https://....workers.dev)
      sitedeki config.js dosyasına yazın.
   ============================================================ */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

const SYSTEM_PROMPT = `Sen, Prof. Dr. Mehmet Fatih Özmantar'ın "Matematik Hikâyeleri" sitesindeki eğitsel sohbet asistanısın. Okuyucular, tarihî olaylara dayanan matematik hikâyelerini okuduktan sonra seninle sohbet ediyor.

Görevin:
- Sana verilen hikâye bağlamındaki tarihî olay, kişiler ve matematiksel kavramlar hakkında sohbet etmek.
- Tarihsel doğruluğa özen göstermek; emin olmadığın bir ayrıntıda bunu açıkça söylemek. Efsane ile belgelenmiş olayı ayırt etmek.
- Matematiği, lise ve üniversite öğrencilerinin anlayabileceği sıcak ve anlaşılır bir dille açıklamak; istenirse derinleşmek.
- Yanıtları kısa tutmak (çoğunlukla 150 kelimeyi aşmamak).
- Konu hikâyeden tamamen uzaklaşırsa nazikçe hikâyeye ve matematiğe geri bağlamak.
- Kişisel bilgi istememek; uygunsuz içeriğe girmemek.
- Türkçe soruya Türkçe, İngilizce soruya İngilizce yanıt vermek.`;

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS });
    }
    if (request.method !== "POST") {
      return json({ error: "Yalnızca POST istekleri kabul edilir." }, 405);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Geçersiz istek." }, 400);
    }

    const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
    if (messages.length === 0) {
      return json({ error: "Mesaj bulunamadı." }, 400);
    }

    // Basit kötüye kullanım önlemleri
    for (const m of messages) {
      if (typeof m.content !== "string" || m.content.length > 2000) {
        return json({ error: "Mesaj çok uzun." }, 400);
      }
      if (m.role !== "user" && m.role !== "assistant") {
        return json({ error: "Geçersiz mesaj." }, 400);
      }
    }
    const storyContext = String(body.storyContext || "").slice(0, 4000);
    const storyTitle = String(body.storyTitle || "").slice(0, 200);

    const apiResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001", // hızlı ve ekonomik; istenirse "claude-sonnet-5" yapılabilir
        max_tokens: 700,
        system:
          SYSTEM_PROMPT +
          "\n\n--- HİKÂYE BAĞLAMI ---\nBaşlık: " +
          storyTitle +
          "\n" +
          storyContext,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!apiResponse.ok) {
      return json({ error: "Yapay zekâ hizmetine ulaşılamadı." }, 502);
    }

    const data = await apiResponse.json();
    const reply =
      data.content && data.content[0] && data.content[0].text
        ? data.content[0].text
        : "Üzgünüm, bir yanıt oluşturamadım.";

    return json({ reply });
  },
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...CORS },
  });
}
