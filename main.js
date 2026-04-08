document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('booking-form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = {};

    formData.forEach((value, key) => {
      data[key] = value;
    });

    if (typeof iti !== "undefined") {
      data.phone = iti.getNumber();
    }

    try {
      const response = await fetch('https://lashvillake.onrender.com/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message);
        form.reset();
      } else {
        alert(result.error);
      }

    } catch (error) {
      console.error(error);
      alert('Something went wrong!');
    }
  });
});