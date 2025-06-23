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
        totalEl.textContent = `Total: €${total.toFixed(2)}`;
    }
    
    // Show empty message if no items
    if (list.children.length === 0) {
        // Remove total element if it exists
        if (totalEl) {
            totalEl.remove();
        }
        
        const empty = document.createElement('p');
        empty.textContent = 'Your cart is empty.';
        empty.style.textAlign = 'center';
        empty.style.color = 'var(--text-color-muted)';
        empty.style.marginTop = 'auto';
        cartOverlay.appendChild(empty);
    } else {
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
        totalEl.textContent = `Total: €${total.toFixed(2)}`;
        cartOverlay.appendChild(totalEl);
        
        // Add event listeners for cart item controls
        addCartItemListeners(list);
    } else {
        const empty = document.createElement('p');
        empty.textContent = 'Your cart is empty.';
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