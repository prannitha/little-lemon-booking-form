document.getElementById("bookingForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const guests = document.getElementById("guests").value;

  if (name === "" || guests <= 0) {
    alert("Please fill all required fields correctly.");
    return;
  }

  document.getElementById("confirmationMsg").classList.remove("hidden");
  this.reset();
});
