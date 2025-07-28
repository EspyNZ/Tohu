import './styles/main.css'
import { TourGenerator } from './js/tour-generator.js'
import { UIController } from './js/ui-controller.js'

// Make uiController globally accessible for debugging
let uiController = null

// Global function for Google Maps API callback
window.initGoogleMaps = function() {
  console.log('Google Maps API loaded successfully')
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  const tourGenerator = new TourGenerator()
  uiController = new UIController(tourGenerator)
  window.uiController = uiController
  uiController.init()
})