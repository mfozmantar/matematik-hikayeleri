/* Hikâye sayfaları: yapay zekâ sohbeti + giscus yorumları
   Yapılandırma: /config.js  (SITE_CONFIG)
   Her hikâye sayfası kendi window.STORY nesnesini tanımlar:
   { id: "...", title: "...", context: "hikâyenin kısa özeti (AI'ya bağlam olarak gider)" } */

(function () {
  var cfg = window.SITE_CONFIG || {};
  var story = window.STORY || { id: "bilinmiyor", title: "", context: "" };

  /* ---------- Yapay zekâ sohbeti ---------- */
  var log = document.getElementById("chat-log");
  var form = document.getElementById("chat-form");
  var input = document.getElementById("chat-input");
  var sendBtn = document.getElementById("chat-send");
  var history = []; // {role:"user"|"assistant", content:"..."}

  function addMsg(cls, text) {
    var el = document.createElement("div");
    el.className = "msg " + cls;
    el.textContent = text;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }

  if (!cfg.chatWorkerUrl) {
    addMsg("sys", "Yapay zekâ sohbeti henüz etkinleştirilmedi. (Site sahibi: README-KURULUM.md içindeki Cloudflare adımlarını tamamlayıp config.js dosyasına Worker adresini yazın.)");
    input.disabled = true;
    sendBtn.disabled = true;
  } else {
    addMsg("ai", "Merhaba! Ben bu hikâyenin sohbet asistanıyım. “" + story.title + "” hakkında merak ettiklerinizi sorabilirsiniz — tarihî olay, kişiler ya da işin matematiği hakkında.");
  }

  function send() {
    var text = (input.value || "").trim();
    if (!text || sendBtn.disabled) return;
    if (text.length > 1000) text = text.slice(0, 1000);
    input.value = "";
    addMsg("user", text);
    history.push({ role: "user", content: text });

    sendBtn.disabled = true;
    var typing = addMsg("sys", "yanıt yazılıyor…");

    fetch(cfg.chatWorkerUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        storyId: story.id,
        storyTitle: story.title,
        storyContext: story.context,
        messages: history.slice(-12)
      })
    })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (data) {
        typing.remove();
        var reply = data.reply || "Üzgünüm, yanıt alınamadı.";
        addMsg("ai", reply);
        history.push({ role: "assistant", content: reply });
      })
      .catch(function () {
        typing.remove();
        addMsg("sys", "Bağlantı sorunu oluştu. Lütfen biraz sonra tekrar deneyin.");
        history.pop(); // gönderilemeyen mesajı geçmişten çıkar
      })
      .finally(function () {
        sendBtn.disabled = false;
        input.focus();
      });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    send();
  });
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });

  /* ---------- giscus yorumları ---------- */
  var yorumlar = document.getElementById("yorumlar");
  var g = cfg.giscus || {};
  if (g.repo && g.repoId && g.categoryId) {
    var s = document.createElement("script");
    s.src = "https://giscus.app/client.js";
    s.async = true;
    s.crossOrigin = "anonymous";
    s.setAttribute("data-repo", g.repo);
    s.setAttribute("data-repo-id", g.repoId);
    s.setAttribute("data-category", g.category || "General");
    s.setAttribute("data-category-id", g.categoryId);
    s.setAttribute("data-mapping", "pathname");
    s.setAttribute("data-strict", "0");
    s.setAttribute("data-reactions-enabled", "1");
    s.setAttribute("data-emit-metadata", "0");
    s.setAttribute("data-input-position", "top");
    s.setAttribute("data-theme", "preferred_color_scheme");
    s.setAttribute("data-lang", "tr");
    yorumlar.appendChild(s);
  } else {
    yorumlar.innerHTML =
      '<div class="placeholder">Okuyucu yorumları henüz etkinleştirilmedi. (Site sahibi: README-KURULUM.md içindeki giscus adımlarını tamamlayıp config.js dosyasını doldurun.)</div>';
  }
})();
