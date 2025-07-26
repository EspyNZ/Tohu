import { TourParser } from './tour-parser.js'
import { TourRenderer } from './tour-renderer.js'
import { MapController } from './map-controller.js'

export class UIController {
  constructor(tourGenerator) {
    this.tourGenerator = tourGenerator
    this.tourParser = new TourParser()
    this.tourRenderer = new TourRenderer()
    this.mapController = new MapController()
    this.isDebugMode = false
    this.currentTour = null
  }

  init() {
    this.bindElements()
    this.attachEventListeners()
    this.initializeSliders()
  }

  bindElements() {
    this.elements = {
      locationInput: document.getElementById('locationInput'),
      stopsSlider: document.getElementById('stopsSlider'),
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
      backToTourBtn: document.getElementById('backToTourBtn')
    }
    
    // Loading messages
    this.loadingMessages = [
      "Putting on our explorer hat...",
      "Consulting the local pigeons for insider tips...",
      "Bribing the neighborhood cats for secret routes...",
      "Asking the coffee shops where they hide the good stuff...",
      "Convincing the street art to reveal its stories...",
      "Negotiating with the local ghosts for historical gossip...",
      "Teaching our AI to walk in comfortable shoes...",
      "Collecting whispers from the old buildings...",
      "Decoding the secret language of park benches...",
      "Interviewing the most interesting lamp posts...",
      "Finding the spots even Google Maps doesn't know...",
      "Asking the locals 'but where do YOU actually go?'...",
      "Discovering places that don't exist on Instagram...",
      "Uncovering the neighborhood's best-kept secrets...",
      "Almost ready to blow your mind..."
    ]
    
    this.currentMessageIndex = 0
    this.messageInterval = null
  }

  attachEventListeners() {
    this.elements.generateTourBtn.addEventListener('click', () => {
      this.generateTour()
    })

    // Enable debug mode with Ctrl+D
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault()
        this.toggleDebugMode()
      }
    })

    // Allow Enter key to generate tour
    this.elements.locationInput.addEventListener('keypress', (e) => {
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
  }

  initializeSliders() {
  }

  async generateTour() {
    const location = this.elements.locationInput.value.trim()
    const numberOfStops = parseInt(this.elements.stopsSlider.value)
    let capturedPrompt = ''

    if (!location) {
      this.showError('Please enter a location for the tour.')
      return
    }

    this.clearMessages()
    this.elements.tourOutput.classList.add('hidden')
    this.showLoadingScreen()

    try {
      const result = await this.tourGenerator.generateTour(location, numberOfStops)
      const tourText = result.tourText
      capturedPrompt = result.prompt
      
      if (this.isDebugMode) {
        this.elements.debugContent.textContent = `Raw tour text length: ${tourText.length}\n\n${tourText.substring(0, 500)}...`
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
      
      this.tourRenderer.render(tour)
      
      this.elements.tourOutput.classList.remove('hidden')
      this.showInfo('Tour generated successfully! Scroll down to explore.')
      
    } catch (error) {
      this.hideLoadingScreen()
      this.showError(`Failed to generate tour: ${error.message}. Please try again.`)
      console.error('Error generating tour:', error)
      
      if (this.isDebugMode) {
        this.elements.debugInfo.style.display = 'block'
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

  toggleDebugMode() {
    this.isDebugMode = !this.isDebugMode
    this.elements.debugInfo.style.display = this.isDebugMode ? 'block' : 'none'
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
}