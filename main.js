document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("booking-form");
  const lashtech = document.getElementById("lashtech");
  const date = document.getElementById("date");
  const timeSelect = document.getElementById("time");

  // =========================
  // UPDATE AVAILABLE TIMES
  // =========================
  async function updateAvailableTimes() {
    if (!lashtech.value || !date.value) return;

    try {
      const res = await fetch(`/available-times?lashtech=${lashtech.value}&date=${date.value}`);
      const bookedTimes = await res.json();

      // Reset all options
      [...timeSelect.options].forEach(option => {
        if (option.value !== "") {
          option.disabled = false;
          option.textContent = option.value;
        }
      });

      // Disable booked ones
      bookedTimes.forEach(time => {
        const option = [...timeSelect.options].find(opt => opt.value === time);
        if (option) {
          option.disabled = true;
          option.textContent = option.value + " (Booked ❌)";
        }
      });

    } catch (error) {
      console.error("Error loading available times:", error);
    }
  }

  lashtech.addEventListener("change", updateAvailableTimes);
  date.addEventListener("change", updateAvailableTimes);

  // =========================
  // FORM SUBMISSION
  // =========================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      name: document.getElementById("name").value,
      phone: document.getElementById("phone").value,
      service: document.getElementById("service").value,
      lashtech: lashtech.value,
      date: date.value,
      time: timeSelect.value
    };

    try {
      const response = await fetch("/submit-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        showLuxuryAlert(result.message || "Booking successful 💖");
        form.reset();

        // Reset time dropdown
        [...timeSelect.options].forEach(option => {
          option.disabled = false;
          option.textContent = option.value;
        });

      } else {
        showLuxuryAlert(result.message || "Booking failed ❌");
      }

    } catch (error) {
      console.error("Submit error:", error);
      showLuxuryAlert("Server error ⚠️");
    }
  });

  // =========================
  // LUXURY ALERT
  // =========================
  function showLuxuryAlert(message) {
    const alert = document.createElement("div");
    alert.className = "luxury-alert";

    alert.innerHTML = `
      <div class="luxury-alert-content">
        <span>${message}</span>
        <button class="luxury-alert-close">&times;</button>
      </div>
    `;

    document.body.appendChild(alert);

    setTimeout(() => alert.classList.add("show"), 100);

    alert.querySelector(".luxury-alert-close").onclick = () => {
      alert.remove();
    };

    setTimeout(() => {
      alert.remove();
    }, 4000);
  }

  // =========================
  // SCROLL TO TOP BUTTON
  // =========================
  const scrollBtn = document.createElement("button");
  scrollBtn.className = "scroll-top-btn";
  scrollBtn.innerHTML = "↑";

  document.body.appendChild(scrollBtn);

  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      scrollBtn.classList.add("show");
    } else {
      scrollBtn.classList.remove("show");
    }
  });

  scrollBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });

});