// js/ui.js
import { manager } from "./app.js";

/* -------------------------
   Validation utilities
   ------------------------- */
const validators = {
  name: v => v && v.trim().length >= 2,
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  phone: v => /^\+?\d{7,15}$/.test(v),
  guests: v => {
    const n = Number(v);
    return Number.isInteger(n) && n >= 1 && n <= 10;
  },
  date: v => {
    if (!v) return false;
    const d = new Date(v);
    // can't book in the past
    const today = new Date();
    today.setHours(0,0,0,0);
    return d >= today;
  },
  time: v => !!v
};

function showError(id, message) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = message || "";
  }
}

function clearErrors() {
  ["name-error","email-error","phone-error","guests-error","date-error","time-error"].forEach(id => showError(id,""));
}

/* -------------------------
   Booking form handling
   ------------------------- */
function handleFormSubmit(e) {
  e.preventDefault();
  clearErrors();

  const form = e.target;
  const data = {
    name: form.name.value,
    email: form.email.value,
    phone: form.phone.value,
    guests: form.guests.value,
    date: form.date.value,
    time: form.time.value,
    requests: form.requests.value
  };

  // Validate each field
  let valid = true;
  Object.keys(validators).forEach(key => {
    if (!validators[key](data[key])) {
      valid = false;
      showError(`${key}-error`, `Please provide a valid ${key}.`);
    }
  });

  if (!valid) {
    return;
  }

  // Create booking via manager
  const result = manager.createBooking(data);
  if (!result.success) {
    // show global error
    const successEl = document.getElementById("form-success");
    if (successEl) {
      successEl.classList.remove("hidden");
      successEl.textContent = result.error;
      successEl.style.background = "#ffcccc";
    } else {
      alert(result.error);
    }
    return;
  }

  // Success -> show confirmation
  const successEl = document.getElementById("form-success");
  if (successEl) {
    successEl.classList.remove("hidden");
    successEl.textContent = `Booking confirmed! Table ${result.booking.tableId} reserved for ${result.booking.guests} on ${result.booking.date} at ${result.booking.time}.`;
  }

  // clear form
  form.reset();

  // Broadcast update to other tabs/windows (storage event) for live update
  window.dispatchEvent(new Event("bookings-updated"));
}

/* -------------------------
   Bookings page rendering
   ------------------------- */
function renderTables() {
  const el = document.getElementById("tables");
  if (!el) return;
  const tables = manager.tables;
  // show availability for selected date/time if possible:
  // check page inputs for date/time (if present)
  const dateInput = document.getElementById("date");
  const timeInput = document.getElementById("time");
  let date = dateInput?.value || null;
  let time = timeInput?.value || null;

  el.innerHTML = "";

  tables.forEach(t => {
    const div = document.createElement("div");
    div.className = "table-card";
    const status = (date && time && manager.findAvailableTables(date, time, 1).some(at => at.id === t.id)) ? "available" : "reserved";
    div.classList.add(status === "available" ? "available" : "reserved");
    div.innerHTML = `<div><strong>Table ${t.id}</strong> · seats ${t.seats}</div>
                     <div class="status">${status.toUpperCase()}</div>`;
    el.appendChild(div);
  });
}

function renderBookingsList() {
  const el = document.getElementById("bookingsList");
  if (!el) return;
  const bookings = manager.bookings.sort((a,b) => new Date(a.date + " " + a.time) - new Date(b.date + " " + b.time));
  if (bookings.length === 0) {
    el.innerHTML = `<p>No upcoming bookings.</p>`;
    return;
  }
  el.innerHTML = "";
  bookings.forEach(b => {
    const div = document.createElement("div");
    div.className = "booking-item";
    div.innerHTML = `<div>
      <strong>${b.name}</strong>
      <div class="meta">${b.date} · ${b.time} · Table ${b.tableId} · ${b.guests} guest(s)</div>
    </div>
    <div>
      <button data-id="${b.id}" class="cancel-btn">Cancel</button>
    </div>
    `;
    el.appendChild(div);
  });

  // wire cancel buttons
  el.querySelectorAll(".cancel-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      if (!confirm("Cancel this booking?")) return;
      manager.cancelBooking(id);
      window.dispatchEvent(new Event("bookings-updated"));
    });
  });
}

/* -------------------------
   App init: determines which elements exist and wires them
   ------------------------- */
function init() {
  // If booking form exists (index.html)
  const form = document.getElementById("bookingForm");
  if (form) {
    form.addEventListener("submit", handleFormSubmit);

    // prefill date default to today
    const dateInput = document.getElementById("date");
    if (dateInput) {
      const today = new Date();
      dateInput.value = today.toISOString().slice(0,10);
    }
  }

  // On bookings page: render tables & bookings
  if (document.getElementById("tables") || document.getElementById("bookingsList")) {
    renderTables();
    renderBookingsList();

    // optional: allow user to choose date/time to preview availability (if date/time inputs exist)
    // (This page doesn't have form by default; if desired add a small form)
  }

  // Listen to storage changes (other tab updates) or custom event
  window.addEventListener("storage", () => { // cross-tab
    manager.bookings = manager._readBookings(); // refresh local manager state
    renderTables();
    renderBookingsList();
  });

  window.addEventListener("bookings-updated", () => {
    manager.bookings = manager._readBookings();
    renderTables();
    renderBookingsList();
  });
}

// run on DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
