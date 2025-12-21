// Mobile Menu Toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileNav = document.querySelector('.mobile-nav');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileNav.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
    });
}

// Close mobile menu when clicking on a link
document.querySelectorAll('.mobile-nav a').forEach(link => {
    link.addEventListener('click', () => {
        mobileNav.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
    });
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Header Scroll Effect
let lastScroll = 0;
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        header.style.padding = '0.5rem 0';
        header.style.boxShadow = '0 2px 30px rgba(0, 0, 0, 0.4)';
    } else {
        header.style.padding = '0.75rem 0';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
    }

    lastScroll = currentScroll;
});

// Form Tabs
const formTabs = document.querySelectorAll('.form-tab');
const formContents = document.querySelectorAll('.form-content');

formTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');

        // Remove active class from all tabs and contents
        formTabs.forEach(t => t.classList.remove('active'));
        formContents.forEach(c => c.classList.remove('active'));

        // Add active class to clicked tab and corresponding content
        tab.classList.add('active');
        document.getElementById(`${targetTab}-form`).classList.add('active');

        // Recalculate price
        calculatePrice();
    });
});

// Quick Location Buttons
document.querySelectorAll('.quick-loc').forEach(btn => {
    btn.addEventListener('click', () => {
        const field = btn.getAttribute('data-field');
        const value = btn.getAttribute('data-value');
        const input = document.getElementById(field);

        if (input) {
            input.value = value;
            calculatePrice();
        }
    });
});

// Quick Destinations Bar
document.querySelectorAll('.quick-dest-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const dest = item.getAttribute('data-dest');
        const destinationInput = document.getElementById('destination');

        if (destinationInput && dest) {
            destinationInput.value = dest;
        }

        // Scroll to reservation form
        document.getElementById('reservation').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });

        calculatePrice();
    });
});

// FAQ Accordion
const faqQuestions = document.querySelectorAll('.faq-question');

faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
        const faqItem = question.parentElement;
        const isActive = faqItem.classList.contains('active');

        // Close all FAQ items
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
        });

        // Open clicked item if it wasn't active
        if (!isActive) {
            faqItem.classList.add('active');
        }
    });
});

// Add Stop Functionality
let stopCount = 0;
const maxStops = 3;
const btnAddStop = document.querySelector('.btn-add-stop');
const arretsList = document.getElementById('arrets-list');

if (btnAddStop) {
    btnAddStop.addEventListener('click', () => {
        if (stopCount < maxStops) {
            stopCount++;
            const stopDiv = document.createElement('div');
            stopDiv.className = 'form-group stop-item';
            stopDiv.innerHTML = `
                <label><i class="fas fa-map-marker-alt"></i> Arrêt ${stopCount}</label>
                <div style="display: flex; gap: 0.5rem;">
                    <input type="text" placeholder="Adresse de l'arrêt ${stopCount}" class="stop-input" style="flex: 1;">
                    <button type="button" class="btn-remove-stop" onclick="removeStop(this)">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            arretsList.appendChild(stopDiv);

            if (stopCount >= maxStops) {
                btnAddStop.disabled = true;
                btnAddStop.style.opacity = '0.5';
                btnAddStop.innerHTML = '<i class="fas fa-info-circle"></i> Maximum 3 arrêts atteints';
            }

            calculatePrice();
        }
    });
}

// Remove Stop Function
window.removeStop = function(btn) {
    btn.closest('.stop-item').remove();
    stopCount--;

    if (btnAddStop) {
        btnAddStop.disabled = false;
        btnAddStop.style.opacity = '1';
        btnAddStop.innerHTML = '<i class="fas fa-plus"></i> Ajouter un arrêt intermédiaire';
    }

    // Renumber remaining stops
    const stops = arretsList.querySelectorAll('.stop-item');
    stops.forEach((stop, index) => {
        const label = stop.querySelector('label');
        const input = stop.querySelector('input');
        label.innerHTML = `<i class="fas fa-map-marker-alt"></i> Arrêt ${index + 1}`;
        input.placeholder = `Adresse de l'arrêt ${index + 1}`;
    });

    calculatePrice();
};

// Select Vehicle Function
window.selectVehicle = function(vehicleType) {
    const vehicleSelect = document.getElementById('vehicle');
    const vehicleHourlySelect = document.getElementById('vehicle-hourly');

    if (vehicleSelect) {
        vehicleSelect.value = vehicleType;
    }
    if (vehicleHourlySelect) {
        vehicleHourlySelect.value = vehicleType;
    }

    // Scroll to reservation form
    document.getElementById('reservation').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });

    calculatePrice();
};

// Price Estimation
const departInput = document.getElementById('depart');
const destinationInput = document.getElementById('destination');
const vehicleSelect = document.getElementById('vehicle');
const vehicleHourlySelect = document.getElementById('vehicle-hourly');
const durationSelect = document.getElementById('duration');
const estimatedPriceElement = document.getElementById('estimated-price');

// Base prices
const basePrices = {
    'eco': 35,
    'berline': 50,
    'van': 70,
    'prestige': 90,
    'vip': 120
};

const hourlyRates = {
    'eco': 45,
    'berline': 55,
    'van': 70,
    'prestige': 90,
    'vip': 120
};

// Destination prices (from Paris center)
const destinationPrices = {
    'Aéroport CDG': { eco: 55, berline: 65, van: 85, prestige: 120, vip: 150 },
    'Aéroport Charles de Gaulle': { eco: 55, berline: 65, van: 85, prestige: 120, vip: 150 },
    'Aéroport Orly': { eco: 45, berline: 55, van: 75, prestige: 100, vip: 130 },
    "Aéroport d'Orly": { eco: 45, berline: 55, van: 75, prestige: 100, vip: 130 },
    'Aéroport Beauvais': { eco: 120, berline: 140, van: 180, prestige: 220, vip: 280 },
    'Disneyland Paris': { eco: 65, berline: 75, van: 95, prestige: 130, vip: 160 },
    'Gare du Nord': { eco: 25, berline: 35, van: 50, prestige: 70, vip: 90 },
    'Gare de Lyon': { eco: 25, berline: 35, van: 50, prestige: 70, vip: 90 },
    'Gare Montparnasse': { eco: 25, berline: 35, van: 50, prestige: 70, vip: 90 }
};

function calculatePrice() {
    const activeTab = document.querySelector('.form-tab.active');
    const isHourly = activeTab && activeTab.getAttribute('data-tab') === 'hourly';

    if (isHourly) {
        calculateHourlyPrice();
    } else {
        calculateTransferPrice();
    }
}

function calculateTransferPrice() {
    const depart = departInput?.value || '';
    const destination = destinationInput?.value || '';
    const vehicle = vehicleSelect?.value || 'berline';

    if (!depart || !destination || !vehicle) {
        if (estimatedPriceElement) {
            estimatedPriceElement.textContent = '-- €';
        }
        return;
    }

    let price = basePrices[vehicle] || 50;

    // Check if destination has a fixed price
    for (const [dest, prices] of Object.entries(destinationPrices)) {
        if (destination.toLowerCase().includes(dest.toLowerCase()) ||
            depart.toLowerCase().includes(dest.toLowerCase())) {
            price = prices[vehicle] || price;
            break;
        }
    }

    // Add stop prices
    const stopPrice = stopCount * 10;
    price += stopPrice;

    // Add some variation based on text length (simulate distance)
    const textLength = (depart.length + destination.length) / 10;
    price += Math.floor(textLength);

    if (estimatedPriceElement) {
        estimatedPriceElement.textContent = `${price}€`;
        estimatedPriceElement.style.animation = 'none';
        estimatedPriceElement.offsetHeight; // Trigger reflow
        estimatedPriceElement.style.animation = 'fadeInUp 0.3s ease';
    }
}

function calculateHourlyPrice() {
    const vehicle = vehicleHourlySelect?.value || 'berline';
    const duration = parseInt(durationSelect?.value) || 2;

    const hourlyRate = hourlyRates[vehicle] || 55;
    const price = hourlyRate * duration;

    if (estimatedPriceElement) {
        estimatedPriceElement.textContent = `${price}€`;
        estimatedPriceElement.style.animation = 'none';
        estimatedPriceElement.offsetHeight;
        estimatedPriceElement.style.animation = 'fadeInUp 0.3s ease';
    }
}

// Update price on input changes
if (departInput) departInput.addEventListener('input', calculatePrice);
if (destinationInput) destinationInput.addEventListener('input', calculatePrice);
if (vehicleSelect) vehicleSelect.addEventListener('change', calculatePrice);
if (vehicleHourlySelect) vehicleHourlySelect.addEventListener('change', calculatePrice);
if (durationSelect) durationSelect.addEventListener('change', calculatePrice);

// Option checkboxes price update
document.querySelectorAll('.option-checkbox input').forEach(checkbox => {
    checkbox.addEventListener('change', calculatePrice);
});

// Reservation Form Submission
const reservationForm = document.getElementById('reservation-form');

if (reservationForm) {
    reservationForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const submitBtn = reservationForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        // Animation de soumission
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
        submitBtn.disabled = true;

        // Simuler l'envoi
        setTimeout(() => {
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Réservation confirmée !';
            submitBtn.style.background = '#28a745';

            // Afficher message de succès
            alert('Votre réservation a été reçue ! Nous vous contacterons dans les plus brefs délais pour confirmer.');

            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.style.background = '';
                submitBtn.disabled = false;
                reservationForm.reset();
                stopCount = 0;
                if (arretsList) arretsList.innerHTML = '';
                if (btnAddStop) {
                    btnAddStop.disabled = false;
                    btnAddStop.style.opacity = '1';
                    btnAddStop.innerHTML = '<i class="fas fa-plus"></i> Ajouter un arrêt intermédiaire';
                }
                if (estimatedPriceElement) {
                    estimatedPriceElement.textContent = '-- €';
                }
            }, 3000);
        }, 1500);
    });
}

// Contact Form Submission
const contactForm = document.querySelector('.contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi...';
        submitBtn.disabled = true;

        setTimeout(() => {
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Message envoyé !';
            submitBtn.style.background = '#28a745';

            alert('Votre message a été envoyé ! Nous vous répondrons dans les plus brefs délais.');

            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.style.background = '';
                submitBtn.disabled = false;
                contactForm.reset();
            }, 2000);
        }, 1500);
    });
}

// Intersection Observer for Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Apply animations to elements
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll(
        '.service-card, .destination-card, .vehicle-card-horizontal, .review-card, .faq-item, .feature-list li, .zone-category'
    );

    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s ease ${index * 0.05}s, transform 0.6s ease ${index * 0.05}s`;
        observer.observe(el);
    });

    // Set minimum date for reservation
    const dateInput = document.getElementById('date');
    const dateHourlyInput = document.getElementById('date-hourly');
    const today = new Date().toISOString().split('T')[0];

    if (dateInput) dateInput.min = today;
    if (dateHourlyInput) dateHourlyInput.min = today;

    // Initial price calculation
    calculatePrice();
});

// Language selector (placeholder functionality)
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // Here you would implement actual language switching
    });
});

// Console welcome message
console.log('%c🚗 TAXI VTC PARIS', 'color: #a27d34; font-size: 24px; font-weight: bold;');
console.log('%cService de transport premium à Paris et Île-de-France', 'color: #666; font-size: 14px;');
console.log('%c📞 01 87 66 55 18', 'color: #a27d34; font-size: 16px;');
console.log('%c🌐 www.taxivtcparis.fr', 'color: #666; font-size: 12px;');
