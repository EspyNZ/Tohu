import { API_CONFIG } from './config.js'

export class PlacesService {
  constructor() {
    this.apiKey = API_CONFIG.googleMaps.apiKey
    this.geocoder = null
    this._mapInstance = null
  }

  setMap(map) {
    this._mapInstance = map
    // Re-initialize services with the map instance
    if (window.google && window.google.maps) {
      this.initializeServices()
    }
  }

  initializeServices() {
    if (window.google && window.google.maps) {
      this.geocoder = new google.maps.Geocoder()
      return true
    }
    return false
  }

  async searchNearbyPlaces(location, radius = 1000, type = 'point_of_interest') {
    // This method is deprecated with the new Places API
    // Return empty array to prevent errors
    console.warn('searchNearbyPlaces is not available with the new Places API')
    return []
  }

  async getPlaceDetails(placeId) {
    try {
      console.log('getPlaceDetails called with placeId:', placeId)
      
      // Validate placeId before making API call
      if (!placeId || typeof placeId !== 'string' || placeId.trim().length === 0) {
        console.warn('Invalid placeId: empty or not a string')
        return null
      }

      // Check for basic placeId format (no spaces, reasonable length)
      const trimmedPlaceId = placeId.trim()
      if (trimmedPlaceId.includes(' ') || trimmedPlaceId.length < 10) {
        console.warn('Invalid placeId format:', trimmedPlaceId)
        return null
      }

      if (!window.google || !window.google.maps || !window.google.maps.places) {
        console.warn('Google Maps Places API not loaded')
        return null
      }

      // Use the new Place class
      const place = new google.maps.places.Place({
        id: trimmedPlaceId,
        requestedLanguage: 'en'
      })

      // Fetch place details
      console.log('Fetching place details for:', trimmedPlaceId)
      const { place: placeResult } = await place.fetchFields({
        fields: ['displayName', 'formattedAddress', 'location', 'photos', 'rating', 'types', 'websiteURI', 'regularOpeningHours']
      })

      console.log('Place details fetched:', {
        name: placeResult.displayName,
        hasPhotos: !!(placeResult.photos && placeResult.photos.length > 0),
        photoCount: placeResult.photos ? placeResult.photos.length : 0
      })

      // Convert to format compatible with existing code
      return {
        name: placeResult.displayName,
        formatted_address: placeResult.formattedAddress,
        geometry: {
          location: placeResult.location
        },
        photos: placeResult.photos,
        rating: placeResult.rating,
        types: placeResult.types,
        website: placeResult.websiteURI,
        opening_hours: placeResult.regularOpeningHours
      }
    } catch (error) {
      console.warn('Place details failed:', error)
      return null
    }
  }

  async geocodeLocation(address) {
    return new Promise((resolve) => {
      if (!this.initializeServices()) {
        console.warn('Google Maps API not loaded')
        resolve(null)
        return
      }

      this.geocoder.geocode({ address: address }, (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
          const location = results[0].geometry.location
          resolve({
            lat: location.lat(),
            lng: location.lng(),
            formatted_address: results[0].formatted_address
          })
        } else {
          console.warn('Geocoding failed:', status)
          resolve(null)
        }
      })
    })
  }

  getPhotoUrl(photo, maxWidth = 600) {
    if (!photo) return null
    
    console.log('getPhotoUrl called with photo:', photo)
    
    try {
      // For the new Places API, photos have a getURI method
      if (typeof photo.getURI === 'function') {
        const url = photo.getURI({ maxWidth: maxWidth })
        console.log('Generated photo URL:', url)
        return url
      }
      
      // Alternative method for new Places API
      if (typeof photo.getUrl === 'function') {
        const url = photo.getUrl({ maxWidth: maxWidth })
        console.log('Generated photo URL (getUrl):', url)
        return url
      }
      
      // Fallback for old format
      if (photo.photo_reference) {
        return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photo.photo_reference}&key=${this.apiKey}`
      }
      
      console.warn('Photo object does not have expected methods:', Object.getOwnPropertyNames(photo))
      return null
    } catch (error) {
      console.warn('Error getting photo URL:', error)
      return null
    }
  }

  async findInterestingPlaces(centerLocation, radiusMeters = 2000) {
    // The new Places API doesn't have a direct equivalent for broad nearby search
    // Return empty array to prevent errors during tour generation
    console.warn('findInterestingPlaces is not available with the new Places API')
    return []
  }

  async findPlaceIdByCoordinatesAndName(latitude, longitude, name) {
    try {
      console.log('findPlaceIdByCoordinatesAndName called:', { latitude, longitude, name })
      
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        console.warn('Google Maps Places API not loaded')
        return null
      }

      // Use searchByText to find places matching the name
      const request = {
        textQuery: name,
        fields: ['id', 'displayName', 'location'],
        locationBias: {
          center: { lat: latitude, lng: longitude },
          radius: 500 // 500 meter radius
        }
      }

      const { places } = await google.maps.places.Place.searchByText(request)
      
      if (!places || places.length === 0) {
        console.warn('No places found for query:', name, 'at coordinates:', latitude, longitude)
        return null
      }

      console.log('Found', places.length, 'places for query:', name)

      // If multiple places found, find the closest one to our coordinates
      let closestPlace = places[0]
      let minDistance = Infinity

      if (places.length > 1 && window.google.maps.geometry) {
        const targetLocation = new google.maps.LatLng(latitude, longitude)
        
        for (const place of places) {
          if (place.location) {
            const placeLocation = new google.maps.LatLng(
              place.location.lat(), 
              place.location.lng()
            )
            const distance = google.maps.geometry.spherical.computeDistanceBetween(
              targetLocation, 
              placeLocation
            )
            
            if (distance < minDistance) {
              minDistance = distance
              closestPlace = place
            }
          }
        }
      }

      return closestPlace.id
    } catch (error) {
      console.warn('Place ID lookup failed:', error)
      return null
    }
  }
}