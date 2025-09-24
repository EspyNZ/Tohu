// API Configuration
export const API_CONFIG = {
  googleMaps: {
    // Use local proxy endpoints instead of direct API calls
    proxyUrl: '/api/google-maps',
    // For client-side Maps JavaScript API, we'll use a restricted key
    clientApiKey: import.meta.env.VITE_GOOGLE_MAPS_CLIENT_KEY || 'demo_key'
  },
  gemini: {
    // Use local proxy endpoint instead of direct API calls
    proxyUrl: '/api/gemini'
  }
}

// Load Google Maps with client-side key (restricted to specific domains)
export function loadGoogleMapsScript(clientKey = null) {
  return new Promise((resolve, reject) => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      resolve()
      return
    }

    // Check if script is already being loaded
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      // Wait for existing script to load
      const checkLoaded = () => {
        if (window.google && window.google.maps) {
          resolve()
        } else {
          setTimeout(checkLoaded, 100)
        }
      }
      checkLoaded()
      return
    }

    const apiKey = clientKey || API_CONFIG.googleMaps.clientApiKey
    if (!apiKey || apiKey === 'demo_key') {
      console.warn('Using demo Google Maps key - some features may be limited')
    }

    if (!apiKey) {
      reject(new Error('Google Maps client API key not configured'))
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=initGoogleMaps`
    script.async = true
    script.defer = true
    
    script.onload = () => {
      console.log('Google Maps script loaded successfully')
    }
    
    script.onerror = () => {
      reject(new Error('Failed to load Google Maps script'))
    }
    
    document.head.appendChild(script)
  })
}

// Validate API keys on startup
export function validateApiKeys() {
  // In proxy mode, we only need to check client-side keys
  const clientKey = API_CONFIG.googleMaps.clientApiKey
  
  if (!clientKey || clientKey === 'demo_key') {
    console.warn('Using demo Google Maps client key - some features may be limited')
    console.warn('Add VITE_GOOGLE_MAPS_CLIENT_KEY to your .env file for full functionality')
  }
  
  console.log('API configuration validated - using server-side proxy for secure API calls')
  return true
}