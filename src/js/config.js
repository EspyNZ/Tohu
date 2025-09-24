// API Configuration
export const API_CONFIG = {
  googleMaps: {
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    placesApiUrl: 'https://maps.googleapis.com/maps/api/place'
  },
  gemini: {
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
  }
}

// Dynamic Google Maps script loader
export function loadGoogleMapsScript() {
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

    const apiKey = API_CONFIG.googleMaps.apiKey
    if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
      reject(new Error('Google Maps API key not configured'))
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
  const missing = []
  
  if (!API_CONFIG.googleMaps.apiKey || API_CONFIG.googleMaps.apiKey === 'your_google_maps_api_key_here') {
    missing.push('Google Maps API Key')
  }
  
  if (!API_CONFIG.gemini.apiKey || API_CONFIG.gemini.apiKey === 'your_gemini_api_key_here') {
    missing.push('Gemini API Key')
  }
  
  if (missing.length > 0) {
    console.warn('Missing API keys:', missing.join(', '))
    console.warn('Please add your API keys to the .env file in the project root')
    return false
  }
  
  return true
}