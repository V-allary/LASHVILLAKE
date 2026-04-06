document.addEventListener("DOMContentLoaded", function () {
  // =========================
  // ELEMENT SELECTORS
  // =========================
  const navbar = document.querySelector(".custom-navbar");
  const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
  const sections = document.querySelectorAll("section[id]");
  const contactForm = document.getElementById("contactForm");
  const bookingForm = document.getElementById("bookingForm");
  const navbarCollapse = document.querySelector(".navbar-collapse");
  const bsCollapse = navbarCollapse ? new bootstrap.Collapse(navbarCollapse, { toggle: false }) : null;

  // =========================
  // PAGE LOAD ANIMATION
  // =========================
  document.body.style.opacity = "0";
  document.body.style.transition = "opacity 0.8s ease";

  window.addEventListener("load", () => {
    document.body.style.opacity = "1";
  });

  // =========================
  // STICKY NAVBAR ON SCROLL
  // =========================
  function handleNavbarScroll() {
    if (!navbar) return;

    if (window.scrollY > 50) {
      navbar.style.background = "rgba(255, 255, 255, 0.95)";
      navbar.style.boxShadow = "0 8px 30px rgba(138, 43, 226, 0.12)";
      navbar.style.padding = "10px 0";
    } else {
      navbar.style.background = "rgba(255, 255, 255, 0.88)";
      navbar.style.boxShadow = "0 4px 20px rgba(138, 43, 226, 0.08)";
      navbar.style.padding = "14px 0";
    }
  }

  window.addEventListener("scroll", handleNavbarScroll);
  handleNavbarScroll();

  // =========================
  // ACTIVE NAV LINK ON SCROLL
  // =========================
  function setActiveNavLink() {
    let currentSection = "";

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;

      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentSection = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      const href = link.getAttribute("href");

      if (href === `#${currentSection}`) {
        link.classList.add("active");
      }
    });
  }

  window.addEventListener("scroll", setActiveNavLink);
  setActiveNavLink();

  // =========================
  // AUTO CLOSE MOBILE MENU
  // =========================
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth < 992 && navbarCollapse && navbarCollapse.classList.contains("show")) {
        bsCollapse.hide();
      }
    });
  });

  // =========================
  // SMOOTH SCROLL FOR INTERNAL LINKS
  // =========================
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");

      if (targetId.length > 1) {
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
          e.preventDefault();

          const navbarHeight = navbar ? navbar.offsetHeight : 0;
          const targetPosition = targetSection.offsetTop - navbarHeight + 2;

          window.scrollTo({
            top: targetPosition,
            behavior: "smooth"
          });
        }
      }
    });
  });

  // =========================
  // CONTACT FORM SUBMISSION DEMO
  // =========================
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const submitBtn = contactForm.querySelector("button[type='submit']");
      const originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = "Sending...";

      setTimeout(() => {
        showLuxuryAlert("✨ Thank you! Your inquiry has been sent successfully. LashVilla Kenya will contact you soon.");
        contactForm.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }, 1200);
    });
  }

  // =========================
  // BOOKING FORM SUBMISSION (REAL BACKEND)
  // =========================
  if (bookingForm) {
    bookingForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const submitBtn = bookingForm.querySelector("button[type='submit']");
      const originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = "Processing...";

      const formData = new FormData(bookingForm);

      const bookingData = {
        clientName: formData.get("clientName")?.trim(),
        phone: formData.get("phone")?.trim(),
        service: formData.get("service")?.trim(),
        lashTech: formData.get("lashTech")?.trim(),
        date: formData.get("date")?.trim(),
        timeSlot: formData.get("timeSlot")?.trim(),
      };

      try {
        
        const response = await fetch("http://localhost:5000/book", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(bookingData)
        });

        const result = await response.json();

        if (response.ok) {
          showLuxuryAlert("✨ Booking confirmed successfully! LashVilla has received your appointment.");
          bookingForm.reset();
        } else {
          showLuxuryAlert(result.message || "Unable to complete booking. Please try again.");
        }

      } catch (error) {
        console.error("Booking Error:", error);
        showLuxuryAlert("Server connection failed. Please try again later.");
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  // =========================
  // LUXURY CUSTOM ALERT
  // =========================
  function showLuxuryAlert(message) {
    const existingAlert = document.querySelector(".luxury-alert");
    if (existingAlert) existingAlert.remove();

    const alertBox = document.createElement("div");
    alertBox.className = "luxury-alert";
    alertBox.innerHTML = `
      <div class="luxury-alert-content">
        <span>${message}</span>
        <button class="luxury-alert-close">&times;</button>
      </div>
    `;

    document.body.appendChild(alertBox);

    setTimeout(() => {
      alertBox.classList.add("show");
    }, 50);

    const closeBtn = alertBox.querySelector(".luxury-alert-close");
    closeBtn.addEventListener("click", () => {
      alertBox.classList.remove("show");
      setTimeout(() => alertBox.remove(), 300);
    });

    setTimeout(() => {
      if (document.body.contains(alertBox)) {
        alertBox.classList.remove("show");
        setTimeout(() => {
          if (document.body.contains(alertBox)) {
            alertBox.remove();
          }
        }, 300);
      }
    }, 5000);
  }

  // =========================
  // SCROLL TO TOP BUTTON
  // =========================
  const scrollTopBtn = document.createElement("button");
  scrollTopBtn.className = "scroll-top-btn";
  scrollTopBtn.setAttribute("aria-label", "Scroll to top");
  scrollTopBtn.innerHTML = `<i class="bi bi-arrow-up"></i>`;
  document.body.appendChild(scrollTopBtn);

  function toggleScrollTopBtn() {
    if (window.scrollY > 300) {
      scrollTopBtn.classList.add("show");
    } else {
      scrollTopBtn.classList.remove("show");
    }
  }

  window.addEventListener("scroll", toggleScrollTopBtn);
  toggleScrollTopBtn();

  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });

  // =========================
  // HERO BUTTON MICRO INTERACTION
  // =========================
  const heroButtons = document.querySelectorAll(".btn-primary-custom, .btn-outline-custom, .btn-booking");

  heroButtons.forEach((btn) => {
    btn.addEventListener("mouseenter", () => {
      btn.style.transform = "translateY(-3px) scale(1.01)";
    });

    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
    });
  });

  // =========================
  // REVEAL CARDS ON SCROLL
  // =========================
  const revealItems = document.querySelectorAll(".service-card, .testimonial-card, .feature-box, .contact-form-card, .stat-card");

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.transform = "translateY(0)";
          entry.target.style.opacity = "1";
          entry.target.style.transition = "all 0.8s ease";
        }
      });
    },
    {
      threshold: 0.15
    }
  );

  revealItems.forEach((item) => {
    item.style.opacity = "0";
    item.style.transform = "translateY(30px)";
    revealObserver.observe(item);
  });

  // =========================
  // DYNAMIC CURRENT YEAR IN FOOTER
  // =========================
  const footerParagraphs = document.querySelectorAll(".footer-section p");
  footerParagraphs.forEach((p) => {
    if (p.innerHTML.includes("&copy;")) {
      p.innerHTML = `&copy; ${new Date().getFullYear()} LashVilla Kenya. All Rights Reserved.`;
    }
  });
});