# Nargiledaki Website

This directory contains the frontend website files for the Nargiledaki shisha bar menu.

## Files Structure

```
website/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and responsive design
├── script.js           # JavaScript for Sanity CMS integration
└── README.md           # This file
```

## Features

- **Horizontal scrolling carousel** with scroll-snap for flavour browsing
- **Responsive design** (desktop, tablet, mobile)
- **Bilingual support** (English/Greek)
- **Sanity CMS integration** for dynamic content
- **CSS Scroll-Driven Animations** for modern browsers
- **Accessibility features** with keyboard navigation

## Development

To run locally:

1. Open `index.html` in a web browser, or
2. Use a local server (recommended):
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

## CMS Integration

The website fetches data from Sanity CMS:
- **Project ID**: `hfmr6n6v`
- **Dataset**: `production`
- **API Version**: `2023-05-03`

## Browser Support

- Chrome 109+
- Firefox 109+
- Safari 15.6+
- Edge 109+

## Performance

- Lazy loading images
- Optimized Sanity CDN image transforms
- CSS-only animations where possible
- Minimal JavaScript footprint 