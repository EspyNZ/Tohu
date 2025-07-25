import './styles/main.css'
import { TourGenerator } from './js/tour-generator.js'
import { UIController } from './js/ui-controller.js'

// Global function for Google Maps API callback
window.initGoogleMaps = function() {
  console.log('Google Maps API loaded successfully')
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  const tourGenerator = new TourGenerator()
  const uiController = new UIController(tourGenerator)
  uiController.init()
})