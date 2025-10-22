// main.js - Funcionalidades para ČOMMØN PL4CE STOR3!

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 ČOMMØN PL4CE STOR3! - Tienda cargada');
    
    // Smooth scroll para enlaces internos
    initSmoothScroll();
    
    // Animaciones de entrada
    initScrollAnimations();
    
    // Funcionalidades del carrito
    initCartFunctionality();
});

// Smooth Scroll
function initSmoothScroll() {
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    
    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Animaciones al hacer scroll
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observar elementos para animar
    const animatedElements = document.querySelectorAll('.product-card, .hero-content');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Funcionalidad básica del carrito
function initCartFunctionality() {
    let cart = JSON.parse(localStorage.getItem('commonPlaceCart')) || [];
    
    // Botones de agregar al carrito
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-primary') && !e.target.classList.contains('btn-disabled')) {
            const productCard = e.target.closest('.product-card');
            if (productCard) {
                addToCart(productCard);
            }
        }
    });

    function addToCart(productCard) {
        const productName = productCard.querySelector('.product-title').textContent;
        const productPrice = productCard.querySelector('.product-price').textContent;
        const productImage = productCard.querySelector('.product-image').src;
        
        const product = {
            id: Date.now(),
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: 1
        };
        
        cart.push(product);
        localStorage.setItem('commonPlaceCart', JSON.stringify(cart));
        
        showNotification('Producto agregado al carrito');
        updateCartCounter();
    }

    function showNotification(message) {
        // Crear notificación
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--marron-elegante);
            color: white;
            padding: 1rem 2rem;
            border-radius: 4px;
            z-index: 10000;
            font-weight: 600;
            letter-spacing: 1px;
            text-transform: uppercase;
            font-family: 'Courier New', monospace;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    function updateCartCounter() {
        // Actualizar contador del carrito (si existe)
        const cartCounter = document.querySelector('.cart-counter');
        if (cartCounter) {
            cartCounter.textContent = cart.length;
        }
    }
}

// Estilos para las animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .cart-counter {
        background: var(--dorado);
        color: var(--acento-urbano);
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.7rem;
        font-weight: 700;
        position: absolute;
        top: -5px;
        right: -5px;
    }
`;
document.head.appendChild(style);