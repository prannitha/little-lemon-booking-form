/**
 * tests/form.test.js
 * Run with: npm test
 */
import { JSDOM } from "jsdom";
import { BookingManager } from "../js/app.js";

// Because our modules use browser localStorage, we will provide a fake
// localStorage by creating a JSDOM instance and grabbing window.localStorage.

describe("BookingManager", () => {
  let manager;

  beforeEach(() => {
    // JSDOM with localStorage
    const dom = new JSDOM(`<!doctype html><html><body></body></html>`, {
      url: "http://localhost"
    });
    global.window = dom.window;
    global.document = dom.window.document;
    global.localStorage = dom.window.localStorage;

    // reset localStorage
    localStorage.clear();
    manager = new BookingManager();
  });

  test("initial tables seeded", () => {
    expect(manager.tables.length).toBeGreaterThanOrEqual(1);
  });

  test("create booking when tables available", () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const dateISO = d.toISOString().slice(0,10);
    const timeISO = "19:00";

    const res = manager.createBooking({
      name: "Alice",
      email: "alice@example.com",
      phone: "+919876543210",
      guests: 2,
      date: dateISO,
      time: timeISO
    });

    expect(res.success).toBe(true);
    expect(res.booking).toHaveProperty("tableId");
    expect(manager.bookings.length).toBe(1);
  });

  test("refuse booking when no tables available", () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const dateISO = d.toISOString().slice(0,10);
    const timeISO = "20:00";

    // Reserve all tables for the same date/time
    manager.tables.forEach((t, idx) => {
      manager.createBooking({
        name: `G${idx}`,
        email: `g${idx}@example.com`,
        phone: "+1234567890",
        guests: t.seats,
        date: dateISO,
        time: timeISO
      });
    });

    // Now try to create another booking — should fail
    const res2 = manager.createBooking({
      name: "Z",
      email: "z@example.com",
      phone: "+919999999999",
      guests: 2,
      date: dateISO,
      time: timeISO
    });

    expect(res2.success).toBe(false);
    expect(res2.error).toMatch(/No tables available/i);
  });
});
