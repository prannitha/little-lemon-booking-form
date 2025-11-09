document.getElementById('bookingForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const guests = document.getElementById('guests').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;

    const message = `Hey ${name}, your table for ${guests} guest(s) has been booked on ${date} at ${time}. See you soon at Little Lemon! 🍋`;

    document.getElementById('confirmation-message').innerText = message;

    document.getElementById('bookingForm').classList.add('hidden');
    document.getElementById('confirmation').classList.remove('hidden');
});
