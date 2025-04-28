function changeImage(src) {  
    document.getElementById('mainImage').src = src;  
}  

function toggleTable() {  
    const characteristics = document.querySelector('.characteristics');  
    const btnToggle = document.querySelector('.btn-toggle');  

    if (characteristics.style.display === 'none' || characteristics.style.display === '') {  
        characteristics.style.display = 'block';  
        btnToggle.classList.add('active');  
    } else {  
        characteristics.style.display = 'none';  
        btnToggle.classList.remove('active');  
    }  
}