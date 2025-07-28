import './styles/main.css'
import { TourGenerator } from './js/tour-generator.js'
import { UIController } from './js/ui-controller.js'

// Declare and instantiate uiController directly on the window object
// This makes it globally accessible as soon as the script loads.
window.uiController = new UIController(new TourGenerator())

// Global function for Google Maps API callback
// This is needed because the Google Maps API script calls this function
// once it has loaded.
window.initGoogleMaps = function() {
  console.log('Google Maps API loaded successfully')
  // Ensure map services are initialized if uiController is already available
  if (window.uiController && window.uiController.tourGenerator && window.uiController.tourGenerator.placesService) {
    window.uiController.tourGenerator.placesService.initializeServices()
  }
  if (window.uiController && window.uiController.tourRenderer && window.uiController.tourRenderer.placesService) {
    window.uiController.tourRenderer.placesService.initializeServices()
  }
}

// Initialize the UI components that rely on the DOM being fully loaded.
document.addEventListener('DOMContentLoaded', () => {
  window.uiController.init()
})

// Also make it available without the window prefix for console convenience
window.addEventListener('load', () => {
  window.uiController = window.uiController
  console.log('uiController is now available globally')
})