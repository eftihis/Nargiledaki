// Sanity configuration
const SANITY_PROJECT_ID = 'hfmr6n6v';
const SANITY_DATASET = 'production';
const SANITY_API_VERSION = '2023-05-03';

// Current language state
let currentLanguage = 'en';

// DOM elements
const carousel = document.getElementById('flavour-carousel');
const langButtons = document.querySelectorAll('.lang-btn');

// ----------------- Shopping Cart State -----------------
const cartBtn = document.getElementById('cart-btn');
const cartOverlay = document.getElementById('cart-overlay');

let cart = JSON.parse(localStorage.getItem('cart') || '{}'); // { flavourId: quantity }
let allFlavours = []; // will be populated after flavours load

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function getCartCount() {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
}

function updateCartCount() {
    const countEl = document.getElementById('cart-count');
    if (countEl) {
        countEl.textContent = getCartCount();
    }
}

function addToCart(id, quantity = 1) {
    if (!id || quantity <= 0) return;
    cart[id] = (cart[id] || 0) + quantity;
    saveCart();
    updateCartCount();
    if (cartOverlay.classList.contains('open')) {
        updateCartDisplay();
    }
}

function removeFromCart(id, quantity = 1) {
    if (!id || !cart[id]) return;
    cart[id] = Math.max(0, cart[id] - quantity);
    if (cart[id] === 0) {
        delete cart[id];
    }
    saveCart();
    updateCartCount();
    if (cartOverlay.classList.contains('open')) {
        updateCartDisplay();
    }
}

function removeCartItem(id) {
    if (!id || !cart[id]) return;
    delete cart[id];
    saveCart();
    updateCartCount();
    if (cartOverlay.classList.contains('open')) {
        updateCartDisplay();
    }
}

function updateCartDisplay() {
    const list = cartOverlay.querySelector('.cart-items');
    if (!list) return;
    
    let total = 0;
    list.innerHTML = '';
    
    for (const [id, qty] of Object.entries(cart)) {
        const flavour = allFlavours.find(f => f._id === id);
        if (!flavour) continue;
        const itemName = getLocalizedText(flavour.name);
        const itemTotal = (flavour.price * qty);
        total += itemTotal;

        const li = document.createElement('li');
        li.className = 'cart-item';
        li.innerHTML = `
            <div class="cart-item-info">
                <span class="cart-item-name">${itemName}</span>
                <span class="cart-item-price">€${flavour.price}</span>
            </div>
            <div class="cart-item-controls">
                <button class="cart-qty-btn minus" data-id="${id}">
                    <span class="material-icons">remove</span>
                </button>
                <span class="cart-qty">${qty}</span>
                <button class="cart-qty-btn plus" data-id="${id}">
                    <span class="material-icons">add</span>
                </button>
                <button class="cart-remove-btn" data-id="${id}">
                    <span class="material-icons">delete</span>
                </button>
            </div>
        `;
        list.appendChild(li);
    }
    
    // Update total
    const totalEl = cartOverlay.querySelector('.cart-total');
    if (totalEl) {
        const totalText = currentLanguage === 'el' ? 'Σύνολο' : 'Total';
        totalEl.textContent = `${totalText}: €${total.toFixed(2)}`;
    }
    
    // Show empty message if no items
    if (list.children.length === 0) {
        // Remove total element if it exists
        if (totalEl) {
            totalEl.remove();
        }
        
        // Remove WhatsApp button if it exists
        const existingWhatsappBtn = cartOverlay.querySelector('.whatsapp-order-btn');
        if (existingWhatsappBtn) {
            existingWhatsappBtn.remove();
        }
        
        const empty = document.createElement('p');
        empty.textContent = currentLanguage === 'el' ? 'Το καλάθι σας είναι άδειο.' : 'Your cart is empty.';
        empty.style.textAlign = 'center';
        empty.style.color = 'var(--text-color-muted)';
        empty.style.marginTop = 'auto';
        cartOverlay.appendChild(empty);
    } else {
        // Remove existing WhatsApp button if it exists
        const existingWhatsappBtn = cartOverlay.querySelector('.whatsapp-order-btn');
        if (existingWhatsappBtn) {
            existingWhatsappBtn.remove();
        }
        
        // Add WhatsApp Order Button
        const whatsappBtn = document.createElement('button');
        whatsappBtn.className = 'whatsapp-order-btn';
        whatsappBtn.innerHTML = `
            <svg class="whatsapp-icon" viewBox="0 0 256 259" width="24" height="24" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid">
                <path d="m67.663 221.823 4.185 2.093c17.44 10.463 36.971 15.346 56.503 15.346 61.385 0 111.609-50.224 111.609-111.609 0-29.297-11.859-57.897-32.785-78.824-20.927-20.927-48.83-32.785-78.824-32.785-61.385 0-111.61 50.224-110.912 112.307 0 20.926 6.278 41.156 16.741 58.594l2.79 4.186-11.16 41.156 41.853-10.464Z" fill="#00E676"/>
                <path d="M219.033 37.668C195.316 13.254 162.531 0 129.048 0 57.898 0 .698 57.897 1.395 128.35c0 22.322 6.278 43.947 16.742 63.478L0 258.096l67.663-17.439c18.834 10.464 39.76 15.347 60.688 15.347 70.453 0 127.653-57.898 127.653-128.35 0-34.181-13.254-66.269-36.97-89.986ZM129.048 234.38c-18.834 0-37.668-4.882-53.712-14.648l-4.185-2.093-40.458 10.463 10.463-39.76-2.79-4.186C7.673 134.63 22.322 69.058 72.546 38.365c50.224-30.692 115.097-16.043 145.79 34.181 30.692 50.224 16.043 115.097-34.18 145.79-16.045 10.463-35.576 16.043-55.108 16.043Zm61.385-77.428-7.673-3.488s-11.16-4.883-18.136-8.371c-.698 0-1.395-.698-2.093-.698-2.093 0-3.488.698-4.883 1.396 0 0-.697.697-10.463 11.858-.698 1.395-2.093 2.093-3.488 2.093h-.698c-.697 0-2.092-.698-2.79-1.395l-3.488-1.395c-7.673-3.488-14.648-7.674-20.229-13.254-1.395-1.395-3.488-2.79-4.883-4.185-4.883-4.883-9.766-10.464-13.253-16.742l-.698-1.395c-.697-.698-.697-1.395-1.395-2.79 0-1.395 0-2.79.698-3.488 0 0 2.79-3.488 4.882-5.58 1.396-1.396 2.093-3.488 3.488-4.883 1.395-2.093 2.093-4.883 1.395-6.976-.697-3.488-9.068-22.322-11.16-26.507-1.396-2.093-2.79-2.79-4.883-3.488H83.01c-1.396 0-2.79.698-4.186.698l-.698.697c-1.395.698-2.79 2.093-4.185 2.79-1.395 1.396-2.093 2.79-3.488 4.186-4.883 6.278-7.673 13.951-7.673 21.624 0 5.58 1.395 11.161 3.488 16.044l.698 2.093c6.278 13.253 14.648 25.112 25.81 35.575l2.79 2.79c2.092 2.093 4.185 3.488 5.58 5.58 14.649 12.557 31.39 21.625 50.224 26.508 2.093.697 4.883.697 6.976 1.395h6.975c3.488 0 7.673-1.395 10.464-2.79 2.092-1.395 3.487-1.395 4.882-2.79l1.396-1.396c1.395-1.395 2.79-2.092 4.185-3.487 1.395-1.395 2.79-2.79 3.488-4.186 1.395-2.79 2.092-6.278 2.79-9.765v-4.883s-.698-.698-2.093-1.395Z" fill="#FFF"/>
            </svg>
            ${currentLanguage === 'el' ? 'Παραγγελία με WhatsApp' : 'Order with WhatsApp'}
        `;
        whatsappBtn.addEventListener('click', () => {
            const message = formatWhatsAppMessage();
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        });
        cartOverlay.appendChild(whatsappBtn);
        
        // Re-add event listeners only if there are items
        addCartItemListeners(list);
    }
}

function addCartItemListeners(list) {
    const minusBtns = list.querySelectorAll('.cart-qty-btn.minus');
    const plusBtns = list.querySelectorAll('.cart-qty-btn.plus');
    const removeBtns = list.querySelectorAll('.cart-remove-btn');
    
    minusBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            removeFromCart(id, 1);
        });
    });
    
    plusBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            addToCart(id, 1);
        });
    });
    
    removeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            removeCartItem(id);
        });
    });
}

function buildCartOverlay() {
    if (!cartOverlay) return;
    cartOverlay.innerHTML = '';

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-cart';
    closeBtn.innerHTML = '<span class="material-icons">close</span>';
    closeBtn.addEventListener('click', () => cartOverlay.classList.remove('open'));
    cartOverlay.appendChild(closeBtn);

    const list = document.createElement('ul');
    list.className = 'cart-items';

    let total = 0;
    for (const [id, qty] of Object.entries(cart)) {
        const flavour = allFlavours.find(f => f._id === id);
        if (!flavour) continue;
        const itemName = getLocalizedText(flavour.name);
        const itemTotal = (flavour.price * qty);
        total += itemTotal;

        const li = document.createElement('li');
        li.className = 'cart-item';
        li.innerHTML = `
            <div class="cart-item-info">
                <span class="cart-item-name">${itemName}</span>
                <span class="cart-item-price">€${flavour.price}</span>
            </div>
            <div class="cart-item-controls">
                <button class="cart-qty-btn minus" data-id="${id}">
                    <span class="material-icons">remove</span>
                </button>
                <span class="cart-qty">${qty}</span>
                <button class="cart-qty-btn plus" data-id="${id}">
                    <span class="material-icons">add</span>
                </button>
                <button class="cart-remove-btn" data-id="${id}">
                    <span class="material-icons">delete</span>
                </button>
            </div>
        `;
        list.appendChild(li);
    }

    if (list.children.length) {
        cartOverlay.appendChild(list);

        const totalEl = document.createElement('p');
        totalEl.className = 'cart-total';
        const totalText = currentLanguage === 'el' ? 'Σύνολο' : 'Total';
        totalEl.textContent = `${totalText}: €${total.toFixed(2)}`;
        cartOverlay.appendChild(totalEl);
        
        // WhatsApp Order Button
        const whatsappBtn = document.createElement('button');
        whatsappBtn.className = 'whatsapp-order-btn';
        whatsappBtn.innerHTML = `
            <svg class="whatsapp-icon" viewBox="0 0 256 259" width="24" height="24" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid">
                <path d="m67.663 221.823 4.185 2.093c17.44 10.463 36.971 15.346 56.503 15.346 61.385 0 111.609-50.224 111.609-111.609 0-29.297-11.859-57.897-32.785-78.824-20.927-20.927-48.83-32.785-78.824-32.785-61.385 0-111.61 50.224-110.912 112.307 0 20.926 6.278 41.156 16.741 58.594l2.79 4.186-11.16 41.156 41.853-10.464Z" fill="#00E676"/>
                <path d="M219.033 37.668C195.316 13.254 162.531 0 129.048 0 57.898 0 .698 57.897 1.395 128.35c0 22.322 6.278 43.947 16.742 63.478L0 258.096l67.663-17.439c18.834 10.464 39.76 15.347 60.688 15.347 70.453 0 127.653-57.898 127.653-128.35 0-34.181-13.254-66.269-36.97-89.986ZM129.048 234.38c-18.834 0-37.668-4.882-53.712-14.648l-4.185-2.093-40.458 10.463 10.463-39.76-2.79-4.186C7.673 134.63 22.322 69.058 72.546 38.365c50.224-30.692 115.097-16.043 145.79 34.181 30.692 50.224 16.043 115.097-34.18 145.79-16.045 10.463-35.576 16.043-55.108 16.043Zm61.385-77.428-7.673-3.488s-11.16-4.883-18.136-8.371c-.698 0-1.395-.698-2.093-.698-2.093 0-3.488.698-4.883 1.396 0 0-.697.697-10.463 11.858-.698 1.395-2.093 2.093-3.488 2.093h-.698c-.697 0-2.092-.698-2.79-1.395l-3.488-1.395c-7.673-3.488-14.648-7.674-20.229-13.254-1.395-1.395-3.488-2.79-4.883-4.185-4.883-4.883-9.766-10.464-13.253-16.742l-.698-1.395c-.697-.698-.697-1.395-1.395-2.79 0-1.395 0-2.79.698-3.488 0 0 2.79-3.488 4.882-5.58 1.396-1.396 2.093-3.488 3.488-4.883 1.395-2.093 2.093-4.883 1.395-6.976-.697-3.488-9.068-22.322-11.16-26.507-1.396-2.093-2.79-2.79-4.883-3.488H83.01c-1.396 0-2.79.698-4.186.698l-.698.697c-1.395.698-2.79 2.093-4.185 2.79-1.395 1.396-2.093 2.79-3.488 4.186-4.883 6.278-7.673 13.951-7.673 21.624 0 5.58 1.395 11.161 3.488 16.044l.698 2.093c6.278 13.253 14.648 25.112 25.81 35.575l2.79 2.79c2.092 2.093 4.185 3.488 5.58 5.58 14.649 12.557 31.39 21.625 50.224 26.508 2.093.697 4.883.697 6.976 1.395h6.975c3.488 0 7.673-1.395 10.464-2.79 2.092-1.395 3.487-1.395 4.882-2.79l1.396-1.396c1.395-1.395 2.79-2.092 4.185-3.487 1.395-1.395 2.79-2.79 3.488-4.186 1.395-2.79 2.092-6.278 2.79-9.765v-4.883s-.698-.698-2.093-1.395Z" fill="#FFF"/>
            </svg>
            ${currentLanguage === 'el' ? 'Παραγγελία με WhatsApp' : 'Order with WhatsApp'}
        `;
        whatsappBtn.addEventListener('click', () => {
            const message = formatWhatsAppMessage();
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        });
        cartOverlay.appendChild(whatsappBtn);
        
        // Add event listeners for cart item controls
        addCartItemListeners(list);
    } else {
        const empty = document.createElement('p');
        empty.textContent = currentLanguage === 'el' ? 'Το καλάθι σας είναι άδειο.' : 'Your cart is empty.';
        empty.style.textAlign = 'center';
        empty.style.color = 'var(--text-color-muted)';
        cartOverlay.appendChild(empty);
    }
}

function closeCart() {
    cartOverlay.classList.remove('open');
}

if (cartBtn) {
    cartBtn.addEventListener('click', () => {
        cartOverlay.classList.toggle('open');
        if (cartOverlay.classList.contains('open')) {
            buildCartOverlay();
        }
    });
}

// Close cart when clicking outside
document.addEventListener('click', (e) => {
    if (cartOverlay.classList.contains('open') && 
        !cartOverlay.contains(e.target) && 
        !cartBtn.contains(e.target)) {
        closeCart();
    }
});

// Close cart with ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cartOverlay.classList.contains('open')) {
        closeCart();
    }
});

// GROQ query to fetch flavours with all needed data
const FLAVOURS_QUERY = `
*[_type == "flavour"] | order(order asc) {
  _id,
  name,
  description,
  price,
  smokingTime,
  colour,
  textColor,
  order,
  "imageUrl": image.asset->url,
  "imageAlt": image.alt,
  slug,
  tags[]-> {
    title,
    "iconUrl": icon.asset->url
  }
}
`;

// Initialize the application
async function init() {
    setupLanguageToggle();
    await loadFlavours();
    updateCartCount();
}

// Setup language toggle functionality
function setupLanguageToggle() {
    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const newLang = btn.dataset.lang;
            if (newLang !== currentLanguage) {
                // Update active button
                langButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update language and reload content
                currentLanguage = newLang;
                updateLanguage();
                loadFlavours();
                // Update cart display if open
                if (cartOverlay.classList.contains('open')) {
                    updateCartDisplay();
                }
            }
        });
    });
}

// Update page language
function updateLanguage() {
    document.documentElement.lang = currentLanguage;
    
    // Update page title and other text based on language
    const titles = {
        en: 'Our Flavours',
        el: 'Οι Γεύσεις μας'
    };
    
    const menuTitle = document.querySelector('.menu-title');
    if (menuTitle) {
        menuTitle.textContent = titles[currentLanguage];
    }
}

// Fetch flavours from Sanity
async function fetchFlavours() {
    try {
        const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${encodeURIComponent(FLAVOURS_QUERY)}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.result || [];
    } catch (error) {
        console.error('Error fetching flavours:', error);
        return [];
    }
}

// Load and display flavours
async function loadFlavours() {
    // Show loading state
    carousel.innerHTML = '<li class="loading">Loading flavours...</li>';
    
    try {
        const flavours = await fetchFlavours();
        
        // store globally for cart reference
        allFlavours = flavours;
        
        if (flavours.length === 0) {
            carousel.innerHTML = '<li class="loading">No flavours found</li>';
            return;
        }
        
        // Clear loading state and render flavours
        carousel.innerHTML = '';
        flavours.forEach(flavour => {
            const card = createFlavourCard(flavour);
            carousel.appendChild(card);
        });
        
    } catch (error) {
        console.error('Error loading flavours:', error);
        carousel.innerHTML = '<li class="loading">Error loading flavours</li>';
    }
}

// Create a flavour card element
function createFlavourCard(flavour) {
    // Apply theme colors if available - declare variables first
    let cardStyle = '';
    let textStyle = '';
    let iconColor = '#d2d3db'; // default color
    
    const li = document.createElement('li');
    li.className = 'card-wrapper';
    
    const cardDiv = document.createElement('div');
    cardDiv.className = 'flavour-card';
    
    // Get localized content
    const name = getLocalizedText(flavour.name);
    const description = getLocalizedText(flavour.description);
    
    // Build tags HTML
    const tagsHtml = flavour.tags?.map(tag => {
        const tagTitle = getLocalizedText(tag.title);
        return `<span class="tag">${tagTitle}</span>`;
    }).join('') || '';
    
    // Get first tag icon if available
    const iconUrl = flavour.tags?.[0]?.iconUrl;
    const iconHtml = iconUrl ? `<img src="${iconUrl}" alt="Icon" class="card-icon">` : '';
    
    // Build image URL with Sanity transforms
    const imageUrl = flavour.imageUrl ? 
        `${flavour.imageUrl}?w=400&h=500&fit=crop&auto=format` : 
        'https://via.placeholder.com/400x500?text=No+Image';
    
    if (flavour.colour?.hex || flavour.textColor?.hex) {
        const styles = [];
        if (flavour.colour?.hex) {
            styles.push(`background-color: ${flavour.colour.hex}`);
        }
        if (flavour.textColor?.hex) {
            styles.push(`color: ${flavour.textColor.hex}`);
            textStyle = `style="color: ${flavour.textColor.hex};"`;
            // Set icon color to 50% opacity of text color
            iconColor = flavour.textColor.hex + '80'; // Add 80 for 50% opacity in hex
        }
        if (styles.length > 0) {
            cardStyle = styles.join('; ');
        }
    }
    
    // Apply the card style to the div element
    if (cardStyle) {
        cardDiv.setAttribute('style', cardStyle);
    }
    
    // SVG icon with dynamic color
    const shishaIcon = `
        <svg class="shisha-icon" viewBox="0 0 19.37 26.46" xmlns="http://www.w3.org/2000/svg">
            <path fill="${iconColor}" d="M9.68,26.46c-5.34,0-9.68-4.34-9.68-9.68v-7.09C0,4.34,4.34,0,9.68,0s9.68,4.34,9.68,9.68v7.09c0,5.34-4.34,9.68-9.68,9.68ZM9.68.48C4.61.48.48,4.61.48,9.68v7.09c0,5.08,4.13,9.21,9.21,9.21s9.21-4.13,9.21-9.21v-7.09C18.89,4.61,14.76.48,9.68.48Z"/>
            <path fill="${iconColor}" d="M12.05,18.92c-1.66.7-3.58-.08-4.29-1.74s.08-3.58,1.74-4.29l2.54,6.03Z"/>
            <path fill="${iconColor}" d="M7.31,6.67c1.66-.7,3.58.08,4.29,1.74.7,1.66-.08,3.58-1.74,4.29l-2.54-6.03Z"/>
            <rect fill="${iconColor}" x="4.92" y="20.38" width="9.53" height=".63"/>
        </svg>
    `;
    
    cardDiv.innerHTML = `
        <div class="card-image">
            <img src="${imageUrl}" alt="${flavour.imageAlt || name}" loading="lazy">
        </div>
        <div class="card-content">
            <div class="card-header">
                <h3 class="card-title" ${textStyle}>${name}</h3>
                <span class="card-price" ${textStyle}>€${flavour.price}</span>
            </div>
            <p class="card-description" ${textStyle}>${description}</p>
            <div class="card-footer">
                <div class="card-tags">${tagsHtml}</div>
                ${iconHtml}
            </div>
            <div class="card-bottom">
                ${shishaIcon}
                <div class="card-cart">
                    <button class="qty-btn minus" type="button">-</button>
                    <input type="number" class="qty-input" value="1" min="1">
                    <button class="qty-btn plus" type="button">+</button>
                    <button class="add-cart-btn" type="button" aria-label="Add to cart">
                        <span class="material-icons">add_shopping_cart</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Append the card div to the wrapper li
    li.appendChild(cardDiv);
    
    // --------- Quantity & Cart Event Listeners ---------
    const minusBtn = cardDiv.querySelector('.qty-btn.minus');
    const plusBtn = cardDiv.querySelector('.qty-btn.plus');
    const qtyInput = cardDiv.querySelector('.qty-input');
    const addBtn = cardDiv.querySelector('.add-cart-btn');

    minusBtn.addEventListener('click', () => {
        const current = parseInt(qtyInput.value) || 1;
        if (current > 1) qtyInput.value = current - 1;
    });

    plusBtn.addEventListener('click', () => {
        const current = parseInt(qtyInput.value) || 1;
        qtyInput.value = current + 1;
    });

    addBtn.addEventListener('click', () => {
        const quantity = parseInt(qtyInput.value) || 1;
        addToCart(flavour._id, quantity);
        qtyInput.value = 1; // reset after adding
    });
    
    return li;
}

// Get localized text based on current language
function getLocalizedText(textObj) {
    if (!textObj) return '';
    
    // If it's already a string, return it
    if (typeof textObj === 'string') return textObj;
    
    // Return localized version or fallback to English
    return textObj[currentLanguage] || textObj.en || textObj.el || '';
}

// Add keyboard navigation for accessibility
function setupKeyboardNavigation() {
    carousel.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            
            const cards = carousel.querySelectorAll('.flavour-card');
            const currentIndex = Array.from(cards).findIndex(card => 
                card === document.activeElement || card.contains(document.activeElement)
            );
            
            let nextIndex;
            if (e.key === 'ArrowLeft') {
                nextIndex = currentIndex > 0 ? currentIndex - 1 : cards.length - 1;
            } else {
                nextIndex = currentIndex < cards.length - 1 ? currentIndex + 1 : 0;
            }
            
            cards[nextIndex].focus();
            cards[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    init();
    setupKeyboardNavigation();
});

function formatWhatsAppMessage() {
    const orderTitle = currentLanguage === 'el' ? '🍃 *Παραγγελία Nargiledaki*' : '🍃 *Nargiledaki Order*';
    let message = `${orderTitle}\n\n`;
    
    let total = 0;
    for (const [id, qty] of Object.entries(cart)) {
        const flavour = allFlavours.find(f => f._id === id);
        if (!flavour) continue;
        const itemName = getLocalizedText(flavour.name);
        const itemTotal = (flavour.price * qty);
        total += itemTotal;
        
        message += `• ${itemName} x${qty} - €${itemTotal.toFixed(2)}\n`;
    }
    
    const totalText = currentLanguage === 'el' ? 'Σύνολο' : 'Total';
    const closingText = currentLanguage === 'el' 
        ? 'Παρακαλώ επιβεβαιώστε την παραγγελία μου και δώστε μου λεπτομέρειες παράδοσης. Ευχαριστώ! 🚀'
        : 'Please confirm my order and provide delivery details. Thank you! 🚀';
    
    message += `\n*${totalText}: €${total.toFixed(2)}*\n\n`;
    message += closingText;
    
    return message;
} 