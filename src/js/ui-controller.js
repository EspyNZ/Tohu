import { validateApiKeys } from './config.js'
import { TourParser } from './tour-parser.js'
import { TourRenderer } from './tour-renderer.js'
import { MapController } from './map-controller.js'

export class UIController {
  constructor(tourGenerator) {
    this.tourGenerator = tourGenerator
    this.tourParser = new TourParser()
    this.tourRenderer = new TourRenderer()
    this.mapController = new MapController()
    this.currentTour = null
    this.userCurrentLocation = null
  }

  init() {
    // Validate API keys on startup
    if (!validateApiKeys()) {
      this.showError('Missing API keys. Please check your environment configuration.')
      return
    }
    
    this.bindElements()
    this.attachEventListeners()
    this.initializeSliders()
    
    // Request user's location on page load for better geocoding
    this.requestLocationOnLoad()
  }

  bindElements() {
    this.elements = {
      dreamTourInput: document.getElementById('dreamTourInput'),
      locationInput: document.getElementById('locationInput'),
      tourLengthSlider: document.getElementById('tourLengthSlider'),
      generateTourBtn: document.getElementById('generateTourBtn'),
      buttonText: document.getElementById('buttonText'),
      loadingSpinner: document.getElementById('loadingSpinner'),
      errorMessage: document.getElementById('errorMessage'),
      infoMessage: document.getElementById('infoMessage'),
      tourOutput: document.getElementById('tourOutput'),
      loadingScreen: document.getElementById('loadingScreen'),
      loadingMessage: document.getElementById('loadingMessage'),
      debugInfo: document.getElementById('debugInfo'),
      debugContent: document.getElementById('debugContent'),
      promptContent: document.getElementById('promptContent'),
      inputSectionContainer: document.getElementById('inputSectionContainer'),
      newTourBtn: document.getElementById('newTourBtn'),
      viewMapBtn: document.getElementById('viewMapBtn'),
      mapContainer: document.getElementById('mapContainer'),
      backToTourBtn: document.getElementById('backToTourBtn'),
      debugPanel: document.getElementById('debugPanel'),
      debugToggleBtn: document.getElementById('debugToggleBtn'),
      debugContent: document.getElementById('debugContent'),
      promptContent: document.getElementById('promptContent'),
      useCurrentLocationBtn: document.getElementById('useCurrentLocationBtn')
    }
    
    // Store these as direct properties for more reliable access
    this._flexibleLengthToggle = document.getElementById('flexibleLengthToggle')
    this._tourLengthValue = document.getElementById('tourLengthValue')
    
    // Toggle buttons
    this.toggleButtons = document.querySelectorAll('.toggle-btn')
    this.activeToggles = new Set()
    
    // Loading messages
    this.loadingMessages = [
      "Putting on our explorer hat...",
      "Mapping hidden pathways and secret corners...",
      "Consulting local storytellers and historians...",
      "Uncovering tales that guidebooks never tell...",
      "Finding the heartbeat of your destination...",
      "Weaving together stories of past and present...",
      "Discovering the soul behind the scenery...",
      "Connecting you with authentic local experiences...",
      "Revealing the layers beneath the surface...",
      "Crafting your personalized adventure...",
      "Gathering whispers from ancient walls...",
      "Unlocking doors to hidden histories...",
      "Curating moments that matter...",
      "Building bridges between you and place...",
      "Almost ready to blow your mind..."
    ]
    
    this.currentMessageIndex = 0
    this.messageInterval = null
  }

  attachEventListeners() {
    // Toggle button event listeners
    this.toggleButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.handleToggleClick(button)
      })
    })

    this.elements.generateTourBtn.addEventListener('click', () => {
      this.generateTour()
    })

    // Tour length slider value display
    this.elements.tourLengthSlider.addEventListener('input', () => {
      this.updateTourLengthDisplay()
    })

    // Make slider labels clickable
    const sliderLabels = document.querySelectorAll('.slider-label')
    sliderLabels.forEach((label, index) => {
      label.addEventListener('click', () => {
        if (!this._flexibleLengthToggle?.checked && this.elements.tourLengthSlider) {
          // Map labels to slider values: Short=2, Medium=5, Long=8
          const values = [2, 5, 8]
          this.elements.tourLengthSlider.value = values[index]
          this.updateTourLengthDisplay()
        }
      })
    })

    // Flexible length toggle
    if (this._flexibleLengthToggle) {
      this._flexibleLengthToggle.addEventListener('change', () => {
        this.handleFlexibleLengthToggle()
      })
    }

    // Debug panel toggle
    if (this.elements.debugToggleBtn) {
      this.elements.debugToggleBtn.addEventListener('click', () => {
        this.toggleDebugPanel()
      })
    }

    // Simple debug button
    const simpleDebugBtn = document.getElementById('simpleDebugBtn')
    if (simpleDebugBtn) {
      simpleDebugBtn.addEventListener('click', () => {
        this.toggleDebugPanel()
      })
    }

    // Enable debug panel with Ctrl+D
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault()
        this.toggleDebugPanel()
      }
    })

    // Enable debug panel with Ctrl+Shift+D as alternative
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault()
        this.toggleDebugPanel()
      }
    })

    // Show debug panel on triple-click of logo
    const logo = document.getElementById('tohuLogo')
    if (logo) {
      let clickCount = 0
      logo.addEventListener('click', () => {
        clickCount++
        setTimeout(() => { clickCount = 0 }, 500)
        if (clickCount === 3) {
          this.toggleDebugPanel()
        }
      })
    }
    // Allow Enter key to generate tour
    this.elements.dreamTourInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.generateTour()
      }
    })

    // New tour button event listener
    this.elements.newTourBtn.addEventListener('click', () => {
      this.showSearchInterface()
    })

    // Map navigation event listeners
    this.elements.viewMapBtn.addEventListener('click', () => {
      this.showMapPage()
    })

    this.elements.backToTourBtn.addEventListener('click', () => {
      this.showTourPage()
    })

    // New tour navigation button event listener
    const newTourNavBtn = document.querySelector('.new-tour-nav-btn')
    if (newTourNavBtn) {
      newTourNavBtn.addEventListener('click', () => {
        this.showSearchInterface()
      })
    }

    // Current location button event listener
    if (this.elements.useCurrentLocationBtn) {
      this.elements.useCurrentLocationBtn.addEventListener('click', () => {
        this.handleUseCurrentLocation()
      })
    }
  }

  initializeSliders() {
    // Initialize tour length display
    this.updateTourLengthDisplay()
  }

  updateTourLengthDisplay() {
    if (!this._tourLengthValue) return
    
    if (this._flexibleLengthToggle && this._flexibleLengthToggle.checked) {
      this._tourLengthValue.textContent = 'Flexible'
    } else {
      const tourLength = parseInt(this.elements.tourLengthSlider.value)
      const numberOfStops = Math.max(3, Math.min(10, Math.round(2 + (tourLength * 0.8))))
      const duration = Math.round(45 + (tourLength * 15))
      this._tourLengthValue.textContent = `${numberOfStops} stops (${duration} minutes)`
    }
  }

  handleFlexibleLengthToggle() {
    const sliderContainer = document.querySelector('.slider-container')
    const sliderLabels = document.querySelectorAll('.slider-label')
    if (!sliderContainer) return
    
    if (this._flexibleLengthToggle && this._flexibleLengthToggle.checked) {
      sliderContainer.classList.add('disabled')
      this.elements.tourLengthSlider.disabled = true
      sliderLabels.forEach(label => label.style.pointerEvents = 'none')
    } else {
      sliderContainer.classList.remove('disabled')
      this.elements.tourLengthSlider.disabled = false
      sliderLabels.forEach(label => label.style.pointerEvents = 'auto')
    }
    
    this.updateTourLengthDisplay()
  }

  handleToggleClick(button) {
    const toggleType = button.dataset.toggle
    
    // Handle mutually exclusive toggles for transportation
    if (toggleType === 'driving' || toggleType === 'biking' || toggleType === 'walking') {
      // Remove both driving and biking if either is clicked
      this.activeToggles.delete('walking')
      this.activeToggles.delete('driving') 
      this.activeToggles.delete('biking')
      this.toggleButtons.forEach(btn => {
        if (btn.dataset.toggle === 'walking' || btn.dataset.toggle === 'driving' || btn.dataset.toggle === 'biking') {
          btn.classList.remove('active')
        }
      })
    }
    
    // Toggle the clicked button
    if (!this.activeToggles.has(toggleType)) {
      this.activeToggles.add(toggleType)
      button.classList.add('active')
    } else {
      // Allow deselecting transportation mode (none selected is valid)
      this.activeToggles.delete(toggleType)
      button.classList.remove('active')
    }
  }

  getTourLength() {
    if (this._flexibleLengthToggle && this._flexibleLengthToggle.checked) {
      return 'flexible'
    }
    return parseInt(this.elements.tourLengthSlider.value)
  }

  async generateTour() {
    const dreamTour = this.elements.dreamTourInput.value.trim()
    const specificLocation = this.elements.locationInput.value.trim()
    const tourLength = this.getTourLength()
    const toggleOptions = Array.from(this.activeToggles)
    let capturedPrompt = ''

    if (!dreamTour) {
      this.showError('Please describe your dream tour.')
      return
    }

    // Check if location can be determined before proceeding
    const effectiveLocation = this.tourGenerator.getEffectiveLocation(dreamTour, specificLocation)
    if (!effectiveLocation) {
      this.showError('Please specify a location either in your dream tour description or in the advanced settings.')
      return
    }

    this.clearMessages()
    this.elements.tourOutput.classList.add('hidden')
    this.showLoadingScreen()

    try {
      const result = await this.tourGenerator.generateTour(dreamTour, specificLocation, toggleOptions, tourLength, this.userCurrentLocation)
      const tourText = result.tourText
      capturedPrompt = result.prompt
      
      // Update debug panel content
      if (this.elements.debugContent && this.elements.promptContent) {
        this.elements.debugContent.textContent = `Raw tour text length: ${tourText.length} characters\n\n${tourText.substring(0, 1000)}${tourText.length > 1000 ? '...' : ''}`
        this.elements.promptContent.textContent = capturedPrompt
      }

      const tour = this.tourParser.parse(tourText)
      
      // Debug log to check parsed tour data
      console.log('Parsed tour data:', {
        title: tour.title,
        notableStops: tour.notableStops,
        stopsCount: tour.stops.length
      })
      
      // Store the current tour for map display
      this.currentTour = tour
      
      // Hide loading screen before showing results
      this.hideLoadingScreen()
      
      // Hide search interface and show new tour button
      this.showTourInterface()
      
      await this.tourRenderer.render(tour)
      
      this.elements.tourOutput.classList.remove('hidden')
      this.showInfo('Tour generated successfully! Scroll down to explore.')
      
    } catch (error) {
      this.hideLoadingScreen()
      this.showError(`Failed to generate tour: ${error.message}. Please try again.`)
      console.error('Error generating tour:', error)
      
      // Update debug panel with error info
      if (this.elements.debugContent && this.elements.promptContent) {
        this.elements.debugContent.textContent = `Error: ${error.message}`
        this.elements.promptContent.textContent = capturedPrompt
      }
    }
  }

  showLoadingScreen() {
    this.elements.loadingScreen.classList.remove('hidden')
    this.currentMessageIndex = 0
    this.cycleLoadingMessages()
    
    // Start cycling through messages
    this.messageInterval = setInterval(() => {
      this.cycleLoadingMessages()
    }, 2000) // Change message every 2 seconds
  }

  hideLoadingScreen() {
    this.elements.loadingScreen.classList.add('hidden')
    if (this.messageInterval) {
      clearInterval(this.messageInterval)
      this.messageInterval = null
    }
  }

  cycleLoadingMessages() {
    this.elements.loadingMessage.textContent = this.loadingMessages[this.currentMessageIndex]
    this.currentMessageIndex = (this.currentMessageIndex + 1) % this.loadingMessages.length
  }

  setLoading(isLoading) {
    this.elements.generateTourBtn.disabled = isLoading
    this.elements.buttonText.textContent = isLoading ? 'Generating...' : 'Generate Tour'
    this.elements.loadingSpinner.classList.toggle('hidden', !isLoading)
  }

  showError(message) {
    this.elements.errorMessage.textContent = message
    this.elements.errorMessage.classList.remove('hidden')
    this.elements.infoMessage.classList.add('hidden')
  }

  showInfo(message) {
    this.elements.infoMessage.textContent = message
    this.elements.infoMessage.classList.remove('hidden')
    this.elements.errorMessage.classList.add('hidden')
  }

  clearMessages() {
    this.elements.errorMessage.classList.add('hidden')
    this.elements.infoMessage.classList.add('hidden')
  }

  toggleDebugPanel() {
    if (this.elements.debugPanel) {
      this.elements.debugPanel.classList.toggle('is-open')
    }
  }

  showTourInterface() {
    // Hide search interface
    this.elements.inputSectionContainer.classList.add('hidden')
    // Show new tour button
    this.elements.newTourBtn.classList.remove('hidden')
  }

  showSearchInterface() {
    // Show search interface
    this.elements.inputSectionContainer.classList.remove('hidden')
    // Hide new tour button and tour output
    // Hide new tour button, tour output, and map container
    this.elements.newTourBtn.classList.add('hidden')
    this.elements.tourOutput.classList.add('hidden')
    this.elements.mapContainer.classList.add('hidden')
    // Clear any messages
    this.clearMessages()
  }

  showMapPage() {
    if (!this.currentTour || !this.currentTour.stops) {
      this.showError('No tour data available for map display.')
      return
    }

    // Hide tour output and input section
    this.elements.tourOutput.classList.add('hidden')
    this.elements.inputSectionContainer.classList.add('hidden')
    this.elements.newTourBtn.classList.add('hidden')
    
    // Show map container
    this.elements.mapContainer.classList.remove('hidden')
    
    // Clear any messages
    this.clearMessages()
    
    // Initialize map with current tour stops
    // Add a small delay to ensure the container is visible before initializing the map
    setTimeout(() => {
      this.mapController.initMap('map', this.currentTour.stops)
      this.mapController.showMap()
      
      // Pass the map instance to PlacesService instances for proper initialization
      if (this.mapController.map) {
        this.tourGenerator.placesService.setMap(this.mapController.map)
        this.tourRenderer.placesService.setMap(this.mapController.map)
      }
    }, 100)
  }

  showTourPage() {
    // Hide map container
    this.elements.mapContainer.classList.add('hidden')
    
    // Show tour output and new tour button
    this.elements.tourOutput.classList.remove('hidden')
    this.elements.newTourBtn.classList.remove('hidden')
    
    // Clear any messages
    this.clearMessages()
  }

  async handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      this.showError('Geolocation is not supported by this browser.')
      return
    }

    const button = this.elements.useCurrentLocationBtn
    button.classList.add('loading')
    button.disabled = true

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        })
      })

      this.userCurrentLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }

      // Update the location input placeholder to indicate current location is being used
      this.elements.locationInput.placeholder = '📍 Using your current location for better results'
      this.elements.locationInput.style.fontStyle = 'italic'
      this.elements.locationInput.style.color = 'var(--primary-color)'

      this.showInfo('Current location detected! This will help provide more accurate local results.')

    } catch (error) {
      console.error('Error getting current location:', error)
      
      let errorMessage = 'Unable to get your current location. '
      if (error.code === error.PERMISSION_DENIED) {
        errorMessage += 'Please allow location access and try again.'
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        errorMessage += 'Location information is unavailable.'
      } else if (error.code === error.TIMEOUT) {
        errorMessage += 'Location request timed out.'
      } else {
        errorMessage += 'Please try again or enter a location manually.'
      }
      
      this.showError(errorMessage)
      this.userCurrentLocation = null
    } finally {
      button.classList.remove('loading')
      button.disabled = false
    }
  }

  async requestLocationOnLoad() {
    // Only request location if geolocation is supported and we don't already have it
    if (!navigator.geolocation || this.userCurrentLocation) {
      return
    }

    try {
      // Request location silently without showing loading states
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false, // Use less accurate but faster location
          timeout: 5000, // Shorter timeout for background request
          maximumAge: 600000 // Accept location up to 10 minutes old
        })
      })

      this.userCurrentLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
      
      this.userCurrentLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
    } catch (error) {
      // Silently fail - don't show error messages for background location requests
      console.log('Background location request failed (this is normal):', error.message)
      this.userCurrentLocation = null
    }
  }
}