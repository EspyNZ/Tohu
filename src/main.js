import './styles/main.css'
import { TourGenerator } from './js/tour-generator.js'
import { UIController } from './js/ui-controller.js'
import { PlacesService } from './js/places-service.js'

console.log('main.js: Script started.')

// Define the Google Maps callback function globally
window.initGoogleMaps = function() {
  console.log('Google Maps API loaded successfully (initGoogleMaps callback).')
  
  // Directly notify PlacesService that Google Maps is loaded
  PlacesService.notifyMapsLoaded()
  console.log('PlacesService notified that Google Maps is loaded')
}

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