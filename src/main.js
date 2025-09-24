import './styles/main.css'
import { TourGenerator } from './js/tour-generator.js'
import { UIController } from './js/ui-controller.js'
import { PlacesService } from './js/places-service.js'
import { loadGoogleMapsScript, validateApiKeys } from './js/config.js'

console.log('main.js: Script started.')

// Validate API keys first
if (!validateApiKeys()) {
  console.error('API keys validation failed. Please check your .env file.')
}

// Define the Google Maps callback function globally
window.initGoogleMaps = function() {
  console.log('Google Maps API loaded successfully (initGoogleMaps callback).')
  
  // Directly notify PlacesService that Google Maps is loaded
  PlacesService.notifyMapsLoaded()
  console.log('PlacesService notified that Google Maps is loaded')
}

// Load Google Maps script dynamically
loadGoogleMapsScript().catch(error => {
  console.error('Failed to load Google Maps:', error)
  // Show user-friendly error message
  document.addEventListener('DOMContentLoaded', () => {
    const errorDiv = document.createElement('div')
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #fee2e2;
      color: #dc2626;
      padding: 1rem 2rem;
      border-radius: 0.5rem;
      border: 1px solid #ef4444;
      z-index: 1000;
      font-family: Inter, sans-serif;
      font-size: 0.875rem;
      font-weight: 500;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    `
    errorDiv.textContent = 'Google Maps failed to load. Please check your API key configuration.'
    document.body.appendChild(errorDiv)
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv)
      }
    }, 10000)
  })
})

// Declare and instantiate uiController directly on the window object
// This makes it globally accessible as soon as the script loads.
try {
  window.uiController = new UIController(new TourGenerator())
  console.log('main.js: uiController instantiated and assigned to window.uiController.')
} catch (error) {
  console.error('main.js: Error instantiating uiController:', error)
}

// Initialize the UI components that rely on the DOM being fully loaded.
document.addEventListener('DOMContentLoaded', () => {
  console.log('main.js: DOMContentLoaded event fired.')
  if (window.uiController) {
    window.uiController.init()
    console.log('main.js: uiController.init() called.')
  } else {
    console.error('main.js: uiController is not available on DOMContentLoaded.')
  }
})

console.log('main.js: Script finished top-level execution.')