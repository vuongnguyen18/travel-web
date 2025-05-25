window.addEventListener("DOMContentLoaded", function () {
  // Form validation and submission
  const form = document.getElementById("contactForm");
  const submitBtn = document.getElementById("submitBtn");

  submitBtn.addEventListener("click", function (e) {
    e.preventDefault(); // prevent form submission

    let hasError = false;

    // Get values
    const firstName = document.getElementById("validationCustom01").value.trim();
    const lastName = document.getElementById("validationCustom02").value.trim();
    const email = document.getElementById("input-email").value.trim();
    const phone = document.getElementById("phone-number").value.trim();
    const message = document.getElementById("message").value.trim();

    // Clear previous error messages
    document.getElementById("emailError").textContent = "";
    document.getElementById("phoneError").textContent = "";
    document.getElementById("messageError").textContent = "";
    document.getElementById("firstNameError").textContent = "";
    document.getElementById("lastNameError").textContent = "";

    // Validate first name
    if (!firstName) {
      document.getElementById("firstNameError").textContent =
        "First name is required.";
      hasError = true;
    }

    // Validate last name
    if (!lastName) {
      document.getElementById("lastNameError").textContent =
        "Last name is required.";
      hasError = true;
    }

    // Validate email
    if (!email || !email.includes("@") || !email.includes(".")) {
      document.getElementById("emailError").textContent =
        "Please enter a valid email.";
      hasError = true;
    }

    // Validate phone number (digits only, max length 10)
    if (!phone) {
      document.getElementById("phoneError").textContent = "Phone number is required.";
      hasError = true;
    } else if (!/^\d+$/.test(phone)) {
      document.getElementById("phoneError").textContent = "Phone number must contain only digits.";
      hasError = true;
    } else if (phone.length !== 10) {
      document.getElementById("phoneError").textContent = "Phone number must be exactly 10 digits long.";
      hasError = true;
    }

    // Validate message
    if (!message) {
      document.getElementById("messageError").textContent =
        "Please provide a message.";
      hasError = true;
    }

    // If no errors, submit the form
    if (!hasError) {
      form.submit(); // allows form to submit normally
    }
  });

  // Contact info cards click interaction
  document.querySelectorAll(".contact-info-card").forEach((card) => {
    card.addEventListener("click", () => {
      // Remove 'selected' from all cards and reset aria-pressed
      document.querySelectorAll(".contact-info-card").forEach((c) => {
        c.classList.remove("selected");
        c.setAttribute("aria-pressed", "false");
      });

      // Add 'selected' to clicked card and set aria-pressed
      card.classList.add("selected");
      card.setAttribute("aria-pressed", "true");

      // Show the message below
      const office = card.getAttribute("data-office");
      const email = card.getAttribute("data-email");
      const messageDiv = document.getElementById("selectionMessage");
      messageDiv.textContent = `You are choosing the ${office} site. Your response will be sent to ${email}.`;
      messageDiv.classList.remove("visually-hidden");
    });

    // Accessibility: allow keyboard enter and space key to trigger click
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.click();
      }
    });
  });
});
