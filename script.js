document.addEventListener("DOMContentLoaded", function () {
  // Функція для встановлення обробників подій
  const setupEventListeners = () => {
    const registrationForm = document.getElementById("registrationForm");
    const loginForm = document.getElementById("loginForm");

    // Обробка форми реєстрації
    if (registrationForm) {
      registrationForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const submitButton = registrationForm.querySelector(
          'button[type="submit"]'
        );
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = "Завантаження...";
        }

        const username = document.querySelector("#regUsername").value;
        const fullName = document.querySelector("#regFullName").value;
        const email = document.querySelector("#regEmail").value;
        const phone = document.querySelector("#regPhone").value;
        const password = document.querySelector("#registerPassword").value;

        console.log("Дані для реєстрації:", {
          username,
          fullName,
          email,
          phone,
          password,
        });

        fetch("/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, fullName, email, phone, password }),
        })
          .then((response) => {
            console.log("Відповідь сервера (реєстрація):", response);
            if (!response.ok) {
              throw new Error(
                `Помилка ${response.status}: ${response.statusText}`
              );
            }
            return response.json();
          })
          .then((data) => {
            console.log("Дані від сервера (реєстрація):", data);
            if (data.error) {
              alert("Помилка: " + data.error);
            } else {
              alert(data.message);
              document.getElementById("registrationForm").reset();
              closeModal("registrationModal");
            }
          })
          .catch((error) => {
            console.error("Помилка при реєстрації:", error);
            alert("Сталася помилка під час реєстрації: " + error.message);
          })
          .finally(() => {
            if (submitButton) {
              submitButton.disabled = false;
              submitButton.textContent = "Зареєструвати";
            }
          });
      });
    }

    // Обробка форми авторизації
    if (loginForm) {
      loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const submitButton = loginForm.querySelector('button[type="submit"]');
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = "Завантаження...";
        }

        const username = document.querySelector("#loginUsername").value;
        const password = document.querySelector("#loginPassword").value;
        const rememberMe = true;

        console.log("Дані для авторизації:", {
          username,
          password,
          rememberMe,
        });

        fetch("/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password, rememberMe: true }),
        })
          .then((response) => {
            console.log("Відповідь сервера (авторизація):", response);
            if (!response.ok) {
              throw new Error(
                `Помилка ${response.status}: ${response.statusText}`
              );
            }
            return response.json();
          })
          .then((data) => {
            console.log("Дані від сервера (авторизація):", data);
            if (data.error) {
              alert("Помилка: " + data.error);
            } else {
              alert(data.message);
              closeModal("loginModal");
              if (data.authToken && true) {
                localStorage.setItem("authToken", data.authToken);
                console.log("authToken збережено:", data.authToken);
              }
              updateUserInterface(data.role);
            }
          })
          .catch((error) => {
            console.error("Помилка при авторизації:", error);
            alert("Сталася помилка під час авторизації: " + error.message);
          })
          .finally(() => {
            if (submitButton) {
              submitButton.disabled = false;
              submitButton.textContent = "Увійти";
            }
          });
      });
    }
  };

  // Функція для автоматичної авторизації за токеном при завантаженні сторінки
  const autoLoginWithToken = () => {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      fetch("/auth/login-with-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authToken }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              `Помилка ${response.status}: ${response.statusText}`
            );
          }
          return response.json();
        })
        .then((data) => {
          console.log("Авторизація за токеном:", data);
          if (data.message === "Авторизація за токеном успішна!") {
            updateUserInterface(data.role);
          } else {
            console.error("Помилка авторизації за токеном:", data.error);
            localStorage.removeItem("authToken");
            updateUserInterface(null);
          }
        })
        .catch((error) => {
          console.error("Помилка при авторизації за токеном:", error);
          localStorage.removeItem("authToken");
          updateUserInterface(null);
        });
    } else {
      updateUserInterface(null);
    }
  };

  // Функція для оновлення інтерфейсу після авторизації
  const updateUserInterface = (role) => {
    const authButtons = document.querySelector(".auth-buttons");
    if (!authButtons) {
      console.error("Елемент .auth-buttons не знайдено!");
      return;
    }

    if (role) {
      authButtons.innerHTML = `
                <a href="/profile" class="button">Профіль</a>
                <a href="#" class="button" onclick="logout()">Вихід</a>
            `;
      if (role === "admin") {
        const adminLink = document.createElement("a");
        adminLink.className = "button";
        adminLink.textContent = "Адмін-панель";
        adminLink.href = "/admin-panel";
        authButtons.appendChild(adminLink);
      }
    } else {
      authButtons.innerHTML = `
                <a href="#login" class="button" onclick="showModal('loginModal')">Авторизація</a>
                <a href="#register" class="button" onclick="showModal('registrationModal')">Реєстрація</a>
            `;
    }
  };

  // Функція для виходу з акаунту
  window.logout = () => {
    localStorage.removeItem("authToken");
    updateUserInterface(null);
    alert("Ви вийшли з акаунту!");
  };

  // Функція для закриття модального вікна
  window.closeModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("modal-open");
      modal.classList.add("modal-close");
      setTimeout(() => {
        modal.style.display = "none";
      }, 300);
    }
  };

  // Функція для відкриття модального вікна
  window.showModal = (modalId) => {
    const modals = document.querySelectorAll(".modal");
    modals.forEach((modal) => {
      if (modal.style.display === "flex") {
        modal.classList.remove("modal-open");
        modal.classList.add("modal-close");
        setTimeout(() => {
          modal.style.display = "none";
        }, 300);
      }
    });

    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = "flex";
      modal.classList.remove("modal-close");
      modal.classList.add("modal-open");
    } else {
      console.error(`Modal with id "${modalId}" not found`);
    }
  };

  // Функція для перемикання між формами входу та реєстрації
  window.toggleAuthForms = () => {
    const loginModal = document.getElementById("loginModal");
    const registrationModal = document.getElementById("registrationModal");

    if (loginModal.style.display === "flex") {
      closeModal("loginModal");
      setTimeout(() => showModal("registrationModal"), 300);
    } else {
      closeModal("registrationModal");
      setTimeout(() => showModal("loginModal"), 300);
    }

    document.getElementById("loginForm").reset();
    document.getElementById("registrationForm").reset();
  };

  // Функція для показу/приховування пароля
  window.togglePasswordVisibility = (inputId) => {
    const passwordInput = document.getElementById(inputId);
    const toggleIcon = passwordInput.nextElementSibling.querySelector("i");
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      toggleIcon.classList.remove("fa-eye");
      toggleIcon.classList.add("fa-eye-slash");
    } else {
      passwordInput.type = "password";
      toggleIcon.classList.remove("fa-eye-slash");
      toggleIcon.classList.add("fa-eye");
    }
  };

  // Завантаження заголовка
  fetch("header/header1.html")
    .then((response) => response.text())
    .then((data) => {
      const headerContainer = document.getElementById("header-container");
      if (headerContainer) {
        headerContainer.innerHTML = data;
        setupEventListeners();
        autoLoginWithToken();
      } else {
        console.error('Element with id "header-container" not found');
      }
    })
    .catch((error) =>
      console.error("Помилка при завантаженні заголовка:", error)
    );

  // Оновлення часу в реальному часі
  function updateTime() {
    const localTimeElement = document.getElementById("localTime");
    if (localTimeElement) {
      const now = new Date();
      const formattedTime =
        now.getHours().toString().padStart(2, "0") +
        ":" +
        now.getMinutes().toString().padStart(2, "0") +
        ":" +
        now.getSeconds().toString().padStart(2, "0");
      localTimeElement.textContent = `${formattedTime} місцевий час`;
    }
  }
  setInterval(updateTime, 1000);
});
