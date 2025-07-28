import './styles/main.css'
import { TourGenerator } from './js/tour-generator.js'
import { UIController } from './js/ui-controller.js'

console.log('main.js: Script started.')

// Declare and instantiate uiController directly on the window object
// This makes it globally accessible as soon as the script loads.
try {
  window.uiController = new UIController(new TourGenerator())
  console.log('main.js: uiController instantiated and assigned to window.uiController.')
} catch (error) {
  console.error('main.js: Error instantiating uiController:', error)
}

// Global function for Google Maps API callback
// This is needed because the Google Maps API script calls this function
// once it has loaded.
window.initGoogleMaps = function() {
  console.log('Google Maps API loaded successfully (initGoogleMaps callback).')
  // The UIController's init method will handle service initialization.
  // No need to re-initialize placesService here directly.
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