document.addEventListener("DOMContentLoaded", () => {
  const f = document.querySelector("[data-contact-form]");
  if (!f) return;
  f.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = f.querySelector("[name='nama']").value.trim(),
      need = f.querySelector("[name='kebutuhan']").value.trim(),
      msg = f.querySelector("[name='pesan']").value.trim();
    const text = [
      "Assalamu'alaikum, saya ingin konsultasi paket Umrah/Haji melalui Mitra HisarGlobal.",
      name ? `Nama: ${name}` : "",
      need ? `Kebutuhan: ${need}` : "",
      msg ? `Pesan: ${msg}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    window.open(buildWhatsAppLink(text), "_blank", "noopener");
  });
});
