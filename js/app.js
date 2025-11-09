// js/app.js
// Responsible for booking state, persistence, availability logic

export class BookingManager {
  constructor(storageKey = "littleLemonBookings") {
    this.storageKey = storageKey;
    this.tablesKey = "littleLemonTables";
    this._initDefaultTables();
    this.bookings = this._readBookings();
    this.tables = this._readTables();
  }

  _initDefaultTables() {
    // If tables not present, seed with a few tables (id, capacity)
    if (!localStorage.getItem(this.tablesKey)) {
      const defaultTables = [
        { id: "T1", seats: 2 },
        { id: "T2", seats: 2 },
        { id: "T3", seats: 4 },
        { id: "T4", seats: 4 },
        { id: "T5", seats: 6 }
      ];
      localStorage.setItem(this.tablesKey, JSON.stringify(defaultTables));
    }
  }

  _readTables() {
    return JSON.parse(localStorage.getItem(this.tablesKey) || "[]");
  }

  _writeTables(tables) {
    this.tables = tables;
    localStorage.setItem(this.tablesKey, JSON.stringify(tables));
  }

  _readBookings() {
    return JSON.parse(localStorage.getItem(this.storageKey) || "[]");
  }

  _writeBookings(bookings) {
    this.bookings = bookings;
    localStorage.setItem(this.storageKey, JSON.stringify(bookings));
  }

  // returns an array of bookings for a particular date/time
  bookingsFor(dateISO, timeISO) {
    return this.bookings.filter(b => b.date === dateISO && b.time === timeISO);
  }

  // find available tables for date/time and required seats
  findAvailableTables(dateISO, timeISO, seats = 1) {
    const reserved = new Set(this.bookingsFor(dateISO, timeISO).map(b => b.tableId));
    return this.tables.filter(t => t.seats >= seats && !reserved.has(t.id));
  }

  // create a booking; tableId will be assigned automatically (best-fit)
  createBooking({ name, email, phone, guests, date, time, requests }) {
    // Basic validation should be done before call - class will trust inputs are valid
    // choose the smallest table that fits guests and is available
    const available = this.findAvailableTables(date, time, Number(guests));
    if (available.length === 0) {
      return { success: false, error: "No tables available for selected time" };
    }
    // best fit: smallest seats >= guests
    available.sort((a,b) => a.seats - b.seats);
    const chosen = available[0];
    const booking = {
      id: `B${Date.now()}`, // simple unique id
      tableId: chosen.id,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      guests: Number(guests),
      date,
      time,
      requests: (requests || "").trim(),
      createdAt: new Date().toISOString()
    };
    const newBookings = [...this.bookings, booking];
    this._writeBookings(newBookings);
    return { success: true, booking };
  }

  cancelBooking(bookingId) {
    const newBookings = this.bookings.filter(b => b.id !== bookingId);
    this._writeBookings(newBookings);
    return { success: true };
  }

  // clear all bookings (for development)
  clearAllBookings() {
    this._writeBookings([]);
  }
}

// Singleton helper: use a single manager instance across pages
export const manager = new BookingManager();
