document.addEventListener("DOMContentLoaded", () => {
    // Елементи DOM
    const editProfileBtn = document.getElementById("editProfileBtn");
    const setStatusBtn = document.getElementById("setStatusBtn");
    const ordersIcon = document.getElementById("ordersIcon");
    const editModal = document.getElementById("editModal");
    const closeModal = document.getElementById("closeModal");
    const saveChangesBtn = document.getElementById("saveChangesBtn");
    const statusModal = document.getElementById("statusModal");
    const closeStatusModal = document.getElementById("closeStatusModal");
    const confirmStatusBtn = document.getElementById("confirmStatusBtn");
    const ordersModal = document.getElementById("ordersModal");
    const closeOrdersModal = document.getElementById("closeOrdersModal");
    const localTimeElement = document.getElementById("localTime");
    const logoutBtn = document.getElementById("logoutBtn");
    const usernameDisplay = document.getElementById("usernameDisplay");
    const emailInput = document.getElementById("emailInput");
    const phoneInput = document.getElementById("phoneInput");
    const aboutMeInput = document.getElementById("aboutMeInput");
    const emailDisplay = document.getElementById("email");
    const phoneDisplay = document.getElementById("phone");
    const aboutMeDisplay = document.getElementById("aboutMeText");

    const authToken = localStorage.getItem("authToken");
    console.log("Auth token:", authToken);

    if (!authToken) {
        alert("Будь ласка, увійдіть в систему");
        window.location.href = "Untitled-1.html";
        return;
    }

    let userRole = null;
    let userId = null; // Додаємо змінну для зберігання userId

    // Функція для показу повідомлень
    const showMessage = (message, isError = false, container = document.body) => {
        const msg = document.createElement("div");
        msg.textContent = message;
        msg.style.position = "fixed";
        msg.style.bottom = "20px";
        msg.style.right = "20px";
        msg.style.padding = "10px";
        msg.style.backgroundColor = isError ? "#ff4444" : "#4caf50";
        msg.style.color = "white";
        msg.style.borderRadius = "5px";
        container.appendChild(msg);
        setTimeout(() => msg.remove(), 3000);
    };

    // Завантаження даних профілю
    const fetchUserData = async () => {
        try {
            console.log("Fetching user data with token:", authToken);
            const response = await fetch("http://localhost:3000/api/profile", {
                headers: { "Authorization": `Bearer ${authToken}` }
            });
            console.log("Response status:", response.status);
            console.log("Response OK:", response.ok);

            if (!response.ok) {
                const errorData = await response.json();
                console.log("Error response:", errorData);
                throw new Error("Помилка завантаження даних профілю: " + (errorData.error || response.statusText));
            }

            const data = await response.json();
            console.log("User data:", data);

            if (data.error) {
                showMessage("Помилка: " + data.error, true);
                localStorage.removeItem("authToken");
                localStorage.removeItem("userRole");
                window.location.href = "Untitled-1.html";
                return;
            }

            usernameDisplay.textContent = data.username || "Невідомий користувач";
            emailDisplay.textContent = data.email || "немає даних";
            phoneDisplay.textContent = data.phone || "немає даних";
            aboutMeDisplay.textContent = data.aboutMe || "Тут ваша інформація про себе.";
            document.getElementById("status").textContent = localStorage.getItem("status") || "Активний";
            userRole = data.role;
            userId = data.id; // Оновлено: використовуємо data.id замість data.userId
            localStorage.setItem("userRole", data.role);
            localStorage.setItem("userId", data.id); // Зберігаємо userId у localStorage
        } catch (error) {
            console.error("Fetch user data error:", error);
            showMessage("Сталася помилка при завантаженні профілю: " + error.message, true);
            localStorage.removeItem("authToken");
            localStorage.removeItem("userRole");
            window.location.href = "Untitled-1.html";
        }
    };

    fetchUserData();

    // Вихід з системи
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userId");
        window.location.href = "Untitled-1.html";
    });

    // Відкриття модального вікна редагування профілю
    editProfileBtn.addEventListener("click", () => {
        emailInput.value = emailDisplay.textContent !== "немає даних" ? emailDisplay.textContent : "";
        phoneInput.value = phoneDisplay.textContent !== "немає даних" ? phoneDisplay.textContent : "";
        aboutMeInput.value = aboutMeDisplay.textContent !== "Тут ваша інформація про себе." ? aboutMeDisplay.textContent : "";
        editModal.style.display = "flex";
        editModal.classList.remove("modal-close");
        editModal.classList.add("modal-open");
    });

    // Закриття модального вікна редагування
    closeModal.addEventListener("click", () => {
        editModal.classList.remove("modal-open");
        editModal.classList.add("modal-close");
        setTimeout(() => {
            editModal.style.display = "none";
        }, 300);
    });

    // Збереження змін профілю
    saveChangesBtn.addEventListener("click", async () => {
        const email = emailInput.value.trim();
        const phone = phoneInput.value.trim();
        const aboutMe = aboutMeInput.value.trim();

        if (!email) {
            showMessage("Email є обов'язковим", true);
            return;
        }
        if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
            showMessage("Невірний формат email", true);
            return;
        }
        if (phone && !/\+380[0-9]{9}/.test(phone)) {
            showMessage("Телефон має бути у форматі +380XXXXXXXXX", true);
            return;
        }

        try {
            const response = await fetch("/update-profile", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`
                },
                body: JSON.stringify({ email, phone, aboutMe })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Помилка оновлення профілю");
            }

            emailDisplay.textContent = email || "немає даних";
            phoneDisplay.textContent = phone || "немає даних";
            aboutMeDisplay.textContent = aboutMe || "Тут ваша інформація про себе.";
            editModal.classList.remove("modal-open");
            editModal.classList.add("modal-close");
            setTimeout(() => {
                editModal.style.display = "none";
            }, 300);
            showMessage("Профіль успішно оновлено");
        } catch (error) {
            showMessage(error.message, true);
        }
    });

    // Відкриття модального вікна статусу
    setStatusBtn.addEventListener("click", () => {
        statusModal.style.display = "flex";
        statusModal.classList.remove("modal-close");
        statusModal.classList.add("modal-open");
    });

    // Закриття модального вікна статусу
    closeStatusModal.addEventListener("click", () => {
        statusModal.classList.remove("modal-open");
        statusModal.classList.add("modal-close");
        setTimeout(() => {
            statusModal.style.display = "none";
        }, 300);
    });

    // Підтвердження статусу
    confirmStatusBtn.addEventListener("click", () => {
        const selectedStatus = document.getElementById("statusSelect").value;
        document.getElementById("status").textContent = selectedStatus;
        localStorage.setItem("status", selectedStatus);
        statusModal.classList.remove("modal-open");
        statusModal.classList.add("modal-close");
        setTimeout(() => {
            statusModal.style.display = "none";
        }, 300);
    });

    // Отримання замовлень
    const fetchOrders = async () => {
        try {
            const response = await fetch("/api/orders", {
                headers: { "Authorization": `Bearer ${authToken}` }
            });
            if (!response.ok) throw new Error("Помилка завантаження замовлень");
            const data = await response.json();
            if (data.error) {
                showMessage("Помилка: " + data.error, true);
                return [];
            }
            // Сортуємо замовлення за датою (найновіші першими)
            return data.sort((a, b) => new Date(b.date) - new Date(a.date));
        } catch (error) {
            showMessage("Сталася помилка при завантаженні замовлень", true);
            return [];
        }
    };

    // Отримання історії замовлень
    const fetchOrderHistory = async () => {
        try {
            const role = userRole || localStorage.getItem("userRole");
            let url = "/api/orders/history";

            // Для рुनिया "user" додаємо параметр userId, щоб отримати лише їх замовлення
            if (role === "user") {
                const currentUserId = userId || localStorage.getItem("userId");
                if (!currentUserId) throw new Error("Не знайдено ID користувача");
                url = `/api/orders/history?userId=${currentUserId}`;
            }

            const response = await fetch(url, {
                headers: { "Authorization": `Bearer ${authToken}` }
            });
            if (!response.ok) throw new Error("Помилка завантаження історії замовлень");
            const data = await response.json();
            if (data.error) {
                showMessage("Помилка: " + data.error, true);
                return [];
            }
            // Сортуємо історію замовлень за датою (найновіші першими)
            return data.sort((a, b) => new Date(b.date) - new Date(a.date));
        } catch (error) {
            showMessage("Сталася помилка при завантаженні історії замовлень: " + error.message, true);
            return [];
        }
    };

    // Рендеринг замовлень
    const renderOrders = async () => {
        const activeOrdersContainer = document.getElementById("active-orders");
        const historyOrdersContainer = document.getElementById("history-orders");

        // Показуємо індикатор завантаження
        activeOrdersContainer.innerHTML = "<p>Завантаження...</p>";
        historyOrdersContainer.innerHTML = "<p>Завантаження...</p>";

        const orders = await fetchOrders();
        const orderHistory = await fetchOrderHistory();

        activeOrdersContainer.innerHTML = "";
        historyOrdersContainer.innerHTML = "";

        const role = userRole || localStorage.getItem("userRole");

        // Фільтрація активних замовлень (тільки pending)
        const activeOrders = orders.filter(order => order.status.toLowerCase() === "pending");

        // Рендеринг активних замовлень (тільки pending)
        if (activeOrders.length === 0) {
            activeOrdersContainer.innerHTML = "<p>Немає активних замовлень.</p>";
        } else {
            activeOrders.forEach(order => {
                const orderStatus = order.status ? order.status.toLowerCase() : "";
                const orderDiv = document.createElement("div");
                orderDiv.classList.add("order-card");
                let orderActions = "";
                if (role === "admin" || role === "manager") {
                    orderActions = `
                        <div class="order-actions">
                            <button class="confirm-btn" data-id="${order.id}">Підтвердити</button>
                            <button class="reject-btn" data-id="${order.id}">Відхилити</button>
                        </div>
                    `;
                } else if (role === "user") {
                    orderActions = `
                        <div class="order-actions">
                            <button class="cancel-btn" data-id="${order.id}">Відмовитись від замовлення</button>
                        </div>
                    `;
                }
                orderDiv.innerHTML = `
                    <div class="order-header">
                        <h4>Замовлення #${order.orderNumber || order.id}</h4>
                    </div>
                    <div class="order-details">
                        <div class="detail-row">
                            <span class="detail-label">Статус:</span>
                            <span class="detail-value" data-status="${orderStatus}">
                                Очікує підтвердження
                            </span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Користувач:</span>
                            <span class="detail-value">${order.username}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Телефон:</span>
                            <span class="detail-value">${order.phone}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Технологія:</span>
                            <span class="detail-value">${order.technology}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Дата:</span>
                            <span class="detail-value">${order.date}</span>
                        </div>
                    </div>
                    ${orderActions}
                `;
                activeOrdersContainer.appendChild(orderDiv);
            });
        }

        // Рендеринг історії замовлень
        if (orderHistory.length === 0) {
            historyOrdersContainer.innerHTML = "<p>Немає історії замовлень.</p>";
        } else {
            orderHistory.forEach(order => {
                const orderStatus = order.status ? order.status.toLowerCase() : "";
                const orderDiv = document.createElement("div");
                orderDiv.classList.add("order-card");
                let deleteButton = "";
                // Додаємо кнопку видалення для всіх ролей, якщо статус confirmed
                if (orderStatus === "confirmed") {
                    deleteButton = `
                        <button class="delete-btn" data-id="${order.id}" title="Видалити замовлення">
                            <img src="https://cdn-icons-png.flaticon.com/512/1214/1214428.png" alt="Delete Icon" class="delete-icon"/>
                        </button>
                    `;
                } else if (role === "admin" || role === "manager") {
                    // Для admin і manager дозволяємо видаляти також rejected, declined, cancelled
                    if (orderStatus === "rejected" || orderStatus === "declined" || orderStatus === "cancelled") {
                        deleteButton = `
                            <button class="delete-btn" data-id="${order.id}" title="Видалити замовлення">
                                <img src="https://cdn-icons-png.flaticon.com/512/1214/1214428.png" alt="Delete Icon" class="delete-icon"/>
                            </button>
                        `;
                    }
                }
                orderDiv.innerHTML = `
                    <div class="order-header">
                        <h4>Замовлення #${order.orderNumber || order.id}</h4>
                        ${deleteButton}
                    </div>
                    <div class="order-details">
                        <div class="detail-row">
                            <span class="detail-label">Статус:</span>
                            <span class="detail-value" data-status="${orderStatus}">
                                ${orderStatus === "confirmed" ? "Підтверджено" : orderStatus === "rejected" ? "Відхилено" : orderStatus === "declined" ? "Відхилено" : "Скасовано"}
                            </span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Користувач:</span>
                            <span class="detail-value">${order.username}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Телефон:</span>
                            <span class="detail-value">${order.phone}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Технологія:</span>
                            <span class="detail-value">${order.technology}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Дата:</span>
                            <span class="detail-value">${order.date}</span>
                        </div>
                    </div>
                `;
                historyOrdersContainer.appendChild(orderDiv);
            });
        }

        // Переключаємо вкладки
        document.querySelectorAll(".tab-button").forEach(button => {
            button.addEventListener("click", () => {
                document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
                document.querySelectorAll(".tab-content").forEach(content => content.style.display = "none");

                button.classList.add("active");
                const tab = button.getAttribute("data-tab");
                document.getElementById(`${tab}-orders`).style.display = "block";
            });
        });

        if (!role) return;

        if (role === "admin" || role === "manager") {
            document.querySelectorAll(".confirm-btn").forEach(btn => {
                btn.addEventListener("click", async e => {
                    const orderId = e.target.getAttribute("data-id");
                    try {
                        const response = await fetch(`/api/orders/${orderId}/confirm`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${authToken}`
                            }
                        });
                        if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.error || "Помилка підтвердження замовлення");
                        }
                        const data = await response.json();
                        if (data.error) {
                            showMessage("Помилка: " + data.error, true, ordersModal);
                            return;
                        }
                        showMessage(`Замовлення #${orderId} підтверджено!`, false, ordersModal);
                        await renderOrders();
                    } catch (error) {
                        showMessage("Сталася помилка при підтвердженні замовлення: " + error.message, true, ordersModal);
                    }
                });
            });

            document.querySelectorAll(".reject-btn").forEach(btn => {
                btn.addEventListener("click", async e => {
                    const orderId = e.target.getAttribute("data-id");
                    try {
                        const response = await fetch(`/api/orders/${orderId}/reject`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${authToken}`
                            }
                        });
                        if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.error || "Помилка відхилення замовлення");
                        }
                        const data = await response.json();
                        if (data.error) {
                            showMessage("Помилка: " + data.error, true, ordersModal);
                            return;
                        }
                        showMessage(`Замовлення #${orderId} відхилено!`, false, ordersModal);
                        await renderOrders();
                    } catch (error) {
                        showMessage("Сталася помилка при відхиленні замовлення: " + error.message, true, ordersModal);
                    }
                });
            });

            document.querySelectorAll(".delete-btn").forEach(btn => {
                btn.addEventListener("click", async e => {
                    const id = e.target.getAttribute("data-id") || e.target.parentElement.getAttribute("data-id");
                    if (confirm(`Ви впевнені, що хочете видалити замовлення #${id}?`)) {
                        try {
                            const url = `/api/orders/${id}`;
                            const response = await fetch(url, {
                                method: "DELETE",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": `Bearer ${authToken}`
                                }
                            });
                            if (!response.ok) {
                                const errorData = await response.json();
                                throw new Error(errorData.error || `Помилка видалення замовлення`);
                            }
                            const data = await response.json();
                            if (data.error) {
                                showMessage("Помилка: " + data.error, true, ordersModal);
                                return;
                            }
                            showMessage(`Замовлення #${id} видалено!`, false, ordersModal);
                            await renderOrders();
                        } catch (error) {
                            showMessage(`Сталася помилка при видаленні замовлення: ` + error.message, true, ordersModal);
                        }
                    }
                });
            });
        } else if (role === "user") {
            document.querySelectorAll(".cancel-btn").forEach(btn => {
                btn.addEventListener("click", async e => {
                    const orderId = e.target.getAttribute("data-id");
                    try {
                        const response = await fetch(`/api/orders/${orderId}`, {
                            method: "DELETE",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${authToken}`
                            }
                        });
                        if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.error || "Помилка скасування замовлення");
                        }
                        const data = await response.json();
                        if (data.error) {
                            showMessage("Помилка: " + data.error, true, ordersModal);
                            return;
                        }
                        showMessage(`Замовлення #${orderId} скасовано!`, false, ordersModal);
                        await renderOrders();
                    } catch (error) {
                        showMessage("Сталася помилка при скасуванні замовлення: " + error.message, true, ordersModal);
                    }
                });
            });

            // Додаємо обробник для кнопки видалення підтверджених замовлень (для user)
            document.querySelectorAll(".delete-btn").forEach(btn => {
                btn.addEventListener("click", async e => {
                    const orderId = e.target.getAttribute("data-id") || e.target.parentElement.getAttribute("data-id");
                    if (confirm(`Ви впевнені, що хочете видалити замовлення #${orderId}?`)) {
                        try {
                            const response = await fetch(`/api/orders/${orderId}`, {
                                method: "DELETE",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": `Bearer ${authToken}`
                                }
                            });
                            if (!response.ok) {
                                const errorData = await response.json();
                                throw new Error(errorData.error || "Помилка видалення замовлення");
                            }
                            const data = await response.json();
                            if (data.error) {
                                showMessage("Помилка: " + data.error, true, ordersModal);
                                return;
                            }
                            showMessage(`Замовлення #${orderId} видалено!`, false, ordersModal);
                            await renderOrders();
                        } catch (error) {
                            showMessage("Сталася помилка при видаленні замовлення: " + error.message, true, ordersModal);
                        }
                    }
                });
            });
        }
    };

    // Відкриття модального вікна замовлень
    ordersIcon.addEventListener("click", async () => {
        await renderOrders();
        ordersModal.style.display = "flex";
        ordersModal.classList.remove("modal-close");
        ordersModal.classList.add("modal-open");
    });

    // Закриття модального вікна замовлень
    closeOrdersModal.addEventListener("click", () => {
        ordersModal.classList.remove("modal-open");
        ordersModal.classList.add("modal-close");
        setTimeout(() => {
            ordersModal.style.display = "none";
        }, 300);
    });

    // Оновлення часу
    function updateTime() {
        const now = new Date();
        const options = { hour: "numeric", minute: "numeric", second: "numeric", hour12: false };
        const localTimeString = now.toLocaleString("uk-UA", options);
        localTimeElement.textContent = `${localTimeString} місцевий час`;
    }

    setInterval(updateTime, 1000);
    updateTime();
});