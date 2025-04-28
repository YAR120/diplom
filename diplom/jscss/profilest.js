document.addEventListener("DOMContentLoaded", () => {  
    const editProfileBtn = document.getElementById("editProfileBtn");  
    const setStatusBtn = document.getElementById("setStatusBtn");  
    const editModal = document.getElementById("editModal");  
    const closeModal = document.getElementById("closeModal");  
    const saveChangesBtn = document.getElementById("saveChangesBtn");  
    const statusModal = document.getElementById("statusModal");  
    const closeStatusModal = document.getElementById("closeStatusModal");  
    const confirmStatusBtn = document.getElementById("confirmStatusBtn");  

    editProfileBtn.addEventListener("click", () => {  
        document.getElementById("emailInput").value = document.getElementById("email").innerText;  
        document.getElementById("phoneInput").value = document.getElementById("phone").innerText;  
        document.getElementById("aboutMeInput").value = document.getElementById("aboutMeText").innerText;  
        editModal.style.display = "block";  
    });  

    closeModal.addEventListener("click", () => {  
        editModal.style.display = "none";  
    });  

    window.addEventListener("click", (event) => {  
        if (event.target === editModal) {  
            editModal.style.display = "none";  
        }  
    });  

    saveChangesBtn.addEventListener("click", () => {  
        document.getElementById("email").innerText = document.getElementById("emailInput").value;  
        document.getElementById("phone").innerText = document.getElementById("phoneInput").value;  
        document.getElementById("aboutMeText").innerText = document.getElementById("aboutMeInput").value;  
        editModal.style.display = "none";  
    });  

    // Функциональность для установки статуса  
    setStatusBtn.addEventListener("click", () => {  
        statusModal.style.display = "block";  
    });  

    closeStatusModal.addEventListener("click", () => {  
        statusModal.style.display = "none";  
    });  

    window.addEventListener("click", (event) => {  
        if (event.target === statusModal) {  
            statusModal.style.display = "none";  
        }  
    });  

    confirmStatusBtn.addEventListener("click", () => {  
        const selectedStatus = document.getElementById("statusSelect").value;  
        document.getElementById("status").innerText = selectedStatus;  
        statusModal.style.display = "none";  
    });  
});