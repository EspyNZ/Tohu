import './styles/main.css'
import { TourGenerator } from './js/tour-generator.js'
import { UIController } from './js/ui-controller.js'
import { PlacesService } from './js/places-service.js'
import { validateApiKeys, loadGoogleMapsScript } from './js/config.js'

console.log('main.js: Script started.')

// Validate API keys before proceeding
if (!validateApiKeys()) {
  console.error('main.js: API keys validation failed. Some features may not work.')
  // Show user-friendly error message
  document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.container')
    if (container) {
      const errorDiv = document.createElement('div')
      errorDiv.className = 'error-message'
      errorDiv.style.marginBottom = '2rem'
      errorDiv.innerHTML = `
        <strong>⚠️ Configuration Required</strong><br>
        API keys are missing. Please add your API keys to the .env file to use all features.<br>
        <small>Check the browser console for detailed instructions.</small>
      `
      container.insertBefore(errorDiv, container.firstChild)
    }
  })
}

// Define the Google Maps callback function globally
window.initGoogleMaps = function() {
  console.log('Google Maps API loaded successfully (initGoogleMaps callback).')
  
  // Directly notify PlacesService that Google Maps is loaded
  PlacesService.notifyMapsLoaded()
  console.log('PlacesService notified that Google Maps is loaded')
}

// Load Google Maps script dynamically with API key from environment
loadGoogleMapsScript().catch(error => {
  console.error('main.js: Failed to load Google Maps:', error)
  // Show user-friendly error message
  document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.container')
    if (container) {
      const errorDiv = document.createElement('div')
      errorDiv.className = 'error-message'
      errorDiv.style.marginBottom = '2rem'
      errorDiv.innerHTML = `
        <strong>🗺️ Maps Unavailable</strong><br>
        ${error.message}<br>
        <small>Some features may be limited without Google Maps.</small>
      `
      container.insertBefore(errorDiv, container.firstChild)
    }
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