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
    return false
  }
  
  return true
}