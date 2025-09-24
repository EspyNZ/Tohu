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

// Function to dynamically load Google Maps script with API key from environment
export function loadGoogleMapsScript() {
  return new Promise((resolve, reject) => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      console.log('Google Maps already loaded')
      resolve()
      return
    }

    // Check if script is already being loaded
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      console.log('Google Maps script already loading')
      // Wait for it to load
      const checkLoaded = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkLoaded)
          resolve()
        }
      }, 100)
      return
    }

    const apiKey = API_CONFIG.googleMaps.apiKey
    if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
      reject(new Error('Google Maps API key not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file.'))
      return
    }

    // Create and load the script
    const script = document.createElement('script')
    script.async = true
    script.defer = true
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=initGoogleMaps`
    
    script.onload = () => {
      console.log('Google Maps script loaded successfully')
      resolve()
    }
    
    script.onerror = () => {
      reject(new Error('Failed to load Google Maps script. Please check your API key and network connection.'))
    }
    
    document.head.appendChild(script)
  })
}

// Validate API keys on startup
export function validateApiKeys() {
  const missing = []
  const invalid = []
  
  if (!API_CONFIG.googleMaps.apiKey || API_CONFIG.googleMaps.apiKey === 'your_google_maps_api_key_here') {
    missing.push('Google Maps API Key (VITE_GOOGLE_MAPS_API_KEY)')
  }
  
  if (!API_CONFIG.gemini.apiKey || API_CONFIG.gemini.apiKey === 'your_gemini_api_key_here') {
    missing.push('Gemini API Key (VITE_GEMINI_API_KEY)')
  }
  
  if (missing.length > 0) {
    console.error('❌ Missing API keys:', missing.join(', '))
    console.error('📝 Please add these keys to your .env file in the project root.')
    console.error('📚 See README for instructions on obtaining API keys.')
    return false
  }
  
  console.log('✅ All API keys configured successfully')
  return true
}