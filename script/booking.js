$("#mp-book").addEventListener("click", () => {
  $("#service").value = String(selectedPackageId);
  closeModal(modalPaket);
  $("#booking").scrollIntoView({ behavior: "smooth" });
  $("#owner").focus({ preventScroll: true });
});


const form = $("#booking-form");
const fields = {
  owner: { input: $("#owner"), error: $("#err-owner") },
  pet: { input: $("#pet"), error: $("#err-pet") },
  service: { input: $("#service"), error: $("#err-service") },
  date: { input: $("#date"), error: $("#err-date") }
};

// Isi opsi layanan dari data paket
for (const pkg of groomingPackages) {
  const option = document.createElement("option");
  option.value = String(pkg.id);
  option.textContent = `${pkg.name} – ${formatRupiah(pkg.price)}`;
  fields.service.input.appendChild(option);
}


function todayISO() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}
fields.date.input.min = todayISO();

function showError(name, message) {
  const { input, error } = fields[name];
  error.textContent = message;
  input.setAttribute("aria-invalid", message ? "true" : "false");
  if (message) input.setAttribute("aria-describedby", error.id);
  else input.removeAttribute("aria-describedby");
}


function validateField(name) {
  const value = fields[name].input.value.trim();

  if (name === "owner") {
    if (value === "") return "Nama pemilik wajib diisi.";
    if (value.length < 3) return "Nama pemilik minimal 3 huruf.";
  }
  if (name === "pet" && value === "") return "Pilih jenis hewan: kucing atau anjing.";
  if (name === "service" && value === "") return "Pilih salah satu paket grooming.";
  if (name === "date") {
    if (value === "") return "Tanggal booking wajib diisi.";
    if (value < todayISO()) return "Tanggal tidak boleh sebelum hari ini. Pilih hari ini atau setelahnya.";
  }
  return "";
}


for (const name of Object.keys(fields)) {
  const { input } = fields[name];
  const eventName = input.tagName === "SELECT" || input.type === "date" ? "change" : "input";
  input.addEventListener(eventName, () => {
    if (input.getAttribute("aria-invalid") === "true") showError(name, validateField(name));
    $("#booking-success").classList.add("hidden");
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  let firstInvalid = null;
  for (const name of Object.keys(fields)) {
    const message = validateField(name);
    showError(name, message);
    if (message && !firstInvalid) firstInvalid = fields[name].input;
  }

  if (firstInvalid) {
    firstInvalid.focus();
    $("#booking-success").classList.add("hidden");
    return;
  }

  // Semua valid: tampilkan konfirmasi
  const pkg = findPackage(Number(fields.service.input.value));
  const dateText = new Date(fields.date.input.value + "T00:00:00").toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  $("#booking-summary").textContent =
    `Terima kasih, ${fields.owner.input.value.trim()}. ` +
    `Booking ${pkg.name} (${formatRupiah(pkg.price)}) untuk ${fields.pet.input.value.toLowerCase()} Anda ` +
    `dijadwalkan pada ${dateText}.`;
  $("#booking-success").classList.remove("hidden");

  form.reset();
  for (const name of Object.keys(fields)) showError(name, "");
});
