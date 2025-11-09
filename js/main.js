document.addEventListener("DOMContentLoaded", () => {
  const tablesEl = document.getElementById("tables");
  const form = document.getElementById("bookingForm");

  // Mock data for availability
  const mockTables = [
    { id: 1, seats: 2, status: "available" },
    { id: 2, seats: 4, status: "reserved" },
    { id: 3, seats: 6, status: "available" },
    { id: 4, seats: 4, status: "reserved" },
    { id: 5, seats: 2, status: "available" },
  ];

  if (tablesEl) {
    tablesEl.innerHTML = mockTables
      .map(
        (t) => `
        <div class="table-card ${t.status}">
          <h4>Table ${t.id}</h4>
          <p>Seats: ${t.seats}</p>
          <p>Status: ${t.status === "available" ? "Available" : "Reserved"}</p>
        </div>`
      )
      .join("");
  }

  // Mock booking submission
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      document.getElementById("formMessage").classList.remove("hidden");
      document.getElementById("formMessage").textContent =
        "Your table has been reserved successfully!";
      form.reset();
    });
  }
});
