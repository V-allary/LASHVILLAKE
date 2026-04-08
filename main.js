document.addEventListener("DOMContentLoaded", () => {

  // =========================
  // BOOKING FORM SUBMIT
  // =========================
  const form = document.getElementById("booking-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Collect form data
    const data = {
      name: document.getElementById("name").value,
      phone: document.getElementById("phone").value,
      service: document.getElementById("service").value,
      lashtech: document.getElementById("lashtech").value,
      date: document.getElementById("date").value,
      time: document.getElementById("time").value
    };

    try {
      const response = await fetch("https://lashvillake.onrender.com/submit-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        showLuxuryAlert("Booking submitted successfully 💖");
        form.reset();
      } else {
        showLuxuryAlert("Something went wrong ❌");
      }

    } catch (error) {
      console.error("Error:", error);
      showLuxuryAlert("Server error ⚠️");
    }
  });


  // =========================
  // LUXURY ALERT FUNCTION
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

    // Close button
    alert.querySelector(".luxury-alert-close").onclick = () => {
      alert.remove();
    };

    // Auto remove
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


  // =========================
  // ACTIVE NAV LINK ON SCROLL
  // =========================
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  window.addEventListener("scroll", () => {
    let current = "";

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;

      if (pageYOffset >= sectionTop && pageYOffset < sectionTop + sectionHeight) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href").includes(current)) {
        link.classList.add("active");
      }
    });
  });


  // =========================
  // CLOSE MOBILE NAV ON CLICK
  // =========================
  const navItems = document.querySelectorAll(".navbar-nav .nav-link");
  const navbarCollapse = document.getElementById("mainNav");

  navItems.forEach(item => {
    item.addEventListener("click", () => {
      if (navbarCollapse.classList.contains("show")) {
        new bootstrap.Collapse(navbarCollapse).hide();
      }
    });
  });

});