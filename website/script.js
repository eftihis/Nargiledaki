// Sanity configuration
const SANITY_PROJECT_ID = 'hfmr6n6v';
const SANITY_DATASET = 'production';
const SANITY_API_VERSION = '2023-05-03';

// Current language state
let currentLanguage = 'en';

// DOM elements
const carousel = document.getElementById('flavour-carousel');
const langButtons = document.querySelectorAll('.lang-btn');

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
    const li = document.createElement('li');
    li.className = 'flavour-card';
    
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
    
    // Apply theme colors if available
    let cardContentStyle = '';
    let textStyle = '';
    let iconColor = '#d2d3db'; // default color
    
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
            cardContentStyle = `style="${styles.join('; ')}"`;
        }
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
    
    li.innerHTML = `
        <div class="card-image">
            <img src="${imageUrl}" alt="${flavour.imageAlt || name}" loading="lazy">
        </div>
        <div class="card-content" ${cardContentStyle}>
            <div class="card-header">
                <h3 class="card-title" ${textStyle}>${name}</h3>
                <span class="card-price" ${textStyle}>€${flavour.price}</span>
            </div>
            <p class="card-description" ${textStyle}>${description}</p>
            <div class="card-footer">
                <div class="card-tags">${tagsHtml}</div>
                ${iconHtml}
            </div>
            ${shishaIcon}
        </div>
    `;
    
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
    
    // Make cards focusable
    carousel.addEventListener('click', (e) => {
        const card = e.target.closest('.flavour-card');
        if (card) {
            card.tabIndex = 0;
            card.focus();
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    init();
    setupKeyboardNavigation();
}); 