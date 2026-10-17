/* ===== Booking Grooming — validasi (Orang 5) ===== */

const BOOKING_MESSAGES = {
  ownerName: {
    empty: "Nama pemilik wajib diisi.",
    short: "Nama pemilik minimal 2 huruf."
  },
  petType: { empty: "Pilih jenis hewan: kucing atau anjing." },
  service: { empty: "Pilih salah satu paket grooming." },
  bookingDate: {
    empty: "Tanggal booking wajib diisi.",
    past: "Tanggal tidak boleh di masa lalu. Pilih hari ini atau setelahnya."
  }
};

// Tanggal lokal (bukan UTC) dalam format yyyy-mm-dd
function toLocalISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Fungsi murni: mengembalikan objek { field: pesan } — kosong berarti valid
function validateBooking(data, todayISO) {
  const errors = {};
  const name = (data.ownerName || "").trim();

  if (!name) errors.ownerName = BOOKING_MESSAGES.ownerName.empty;
  else if (name.length < 2) errors.ownerName = BOOKING_MESSAGES.ownerName.short;

  if (!data.petType) errors.petType = BOOKING_MESSAGES.petType.empty;
  if (!data.service) errors.service = BOOKING_MESSAGES.service.empty;

  if (!data.bookingDate) errors.bookingDate = BOOKING_MESSAGES.bookingDate.empty;
  else if (data.bookingDate < todayISO) errors.bookingDate = BOOKING_MESSAGES.bookingDate.past;

  return errors;
}

function formatTanggal(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric"
  });
}

if (typeof document !== "undefined") {
  const form = document.getElementById("booking-form");
  const successBox = document.getElementById("booking-success");
  const FIELDS = ["ownerName", "petType", "service", "bookingDate"];

  const dateInput = document.getElementById("bookingDate");
  dateInput.min = toLocalISO(new Date()); // tanggal lampau tidak bisa dipilih dari kalender

  function showError(field, message) {
    const input = document.getElementById(field);
    document.getElementById("err-" + field).textContent = message || "";
    input.classList.toggle("border-red-600", Boolean(message));
    input.classList.toggle("border-peach", !message);
    input.setAttribute("aria-invalid", message ? "true" : "false");
  }

  function clearErrors() {
    FIELDS.forEach(f => showError(f, ""));
  }

  form.addEventListener("submit", event => {
    event.preventDefault();

    const data = {};
    FIELDS.forEach(f => (data[f] = form.elements[f].value));

    const errors = validateBooking(data, toLocalISO(new Date()));
    clearErrors();
    successBox.classList.add("hidden");

    const firstInvalid = FIELDS.find(f => errors[f]);
    if (firstInvalid) {
      FIELDS.forEach(f => showError(f, errors[f]));
      document.getElementById(firstInvalid).focus();
      return;
    }

    successBox.innerHTML = `
      <p class="font-heading font-semibold text-lg mb-2">Booking berhasil dikirim!</p>
      <ul class="space-y-1">
        <li><span class="font-semibold">Pemilik:</span> ${escapeHTML(data.ownerName.trim())}</li>
        <li><span class="font-semibold">Hewan:</span> ${escapeHTML(data.petType)}</li>
        <li><span class="font-semibold">Layanan:</span> ${escapeHTML(data.service)}</li>
        <li><span class="font-semibold">Tanggal:</span> ${formatTanggal(data.bookingDate)}</li>
      </ul>
      <p class="mt-2 text-sm">Terima kasih! Tim PawCare akan menghubungi kamu untuk konfirmasi jadwal.</p>`;
    successBox.classList.remove("hidden");
    successBox.focus();

    form.reset();
  });

  // Error pada kolom hilang begitu pengguna memperbaikinya
  FIELDS.forEach(f => {
    const el = document.getElementById(f);
    el.addEventListener(el.tagName === "SELECT" ? "change" : "input", () => showError(f, ""));
  });

  // Dipanggil oleh tombol "Booking Sekarang" di modal paket (Orang 4)
  window.bookService = function (packageName) {
    document.getElementById("service").value = packageName;
    showError("service", "");
    successBox.classList.add("hidden");
    document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
    document.getElementById("ownerName").focus({ preventScroll: true });
  };
}

function escapeHTML(text) {
  return String(text).replace(/[&<>"']/g, c => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

if (typeof module !== "undefined") module.exports = { validateBooking, toLocalISO };
