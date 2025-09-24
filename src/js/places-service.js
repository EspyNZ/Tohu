import { API_CONFIG } from './config.js'

export class PlacesService {
  static _mapsLoadedPromise = null
  static _mapsLoadedResolve = null

  static {
    // Initialize the promise that will be resolved when Google Maps is loaded
    PlacesService._mapsLoadedPromise = new Promise((resolve) => {
      PlacesService._mapsLoadedResolve = resolve
    })
  }

  static notifyMapsLoaded() {
    if (PlacesService._mapsLoadedResolve) {
      PlacesService._mapsLoadedResolve()
      console.log('PlacesService: Google Maps loading promise resolved')
    }
  }

  static async waitForMapsToLoad() {
    console.log('PlacesService: Waiting for Google Maps to load...')
    
    // Check if Google Maps and Places are already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log('PlacesService: Google Maps and Places already loaded')
      return Promise.resolve()
    }
    
    // Add a timeout fallback in case the callback never fires
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => {
        console.warn('PlacesService: Google Maps loading timeout, proceeding anyway')
        resolve()
      }, 10000) // 10 second timeout
    })
    
    // Wait for both the promise and the Places library to be available
    const mapsAndPlacesReady = PlacesService._mapsLoadedPromise.then(() => {
      return new Promise((resolve) => {
        const checkPlaces = () => {
          if (window.google && window.google.maps && window.google.maps.places) {
            console.log('PlacesService: Places library confirmed loaded')
            resolve()
          } else {
            console.log('PlacesService: Waiting for Places library...')
            setTimeout(checkPlaces, 100)
          }
        }
        checkPlaces()
      })
    })
    
    // Race between the maps loading and the timeout
    await Promise.race([mapsAndPlacesReady, timeoutPromise])
    console.log('PlacesService: Google Maps wait completed')
    return Promise.resolve()
  }

  constructor() {
    this.apiKey = API_CONFIG.googleMaps.apiKey
    this._mapInstance = null
    this.geocoder = null
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
    await PlacesService.waitForMapsToLoad()
    
    try {
      console.log('getPlaceDetails called with placeId:', placeId)
      
      // Validate placeId before making API call
      if (!placeId || typeof placeId !== 'string' || placeId.trim().length === 0) {
        console.warn('PlacesService: Invalid placeId - empty or not a string:', placeId)
        return null
      }

      // Check for basic placeId format (no spaces, reasonable length)
      const trimmedPlaceId = placeId.trim()
      if (trimmedPlaceId.includes(' ') || trimmedPlaceId.length < 10) {
        console.warn('PlacesService: Invalid placeId format:', trimmedPlaceId)
        return null
      }

      if (!window.google || !window.google.maps || !window.google.maps.places) {
        console.error('PlacesService: Google Maps Places API not available after waiting')
        return null
      }

      // Use the new Place class (this still works client-side with restricted key)
      const place = new google.maps.places.Place({
        id: trimmedPlaceId,
        requestedLanguage: 'en'
      })

      // Fetch place details
      console.log('Fetching place details for:', trimmedPlaceId)
      const fieldsRequest = {
        fields: ['displayName', 'formattedAddress', 'location', 'photos', 'rating', 'types', 'websiteURI', 'regularOpeningHours']
      }
      console.log('PlacesService: Making fetchFields request:', fieldsRequest)
      
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
      console.warn('PlacesService: Place details failed:', {
        placeId: placeId,
        message: error.message,
        status: error.status,
        code: error.code,
        details: error.details || 'No additional details'
      })
      return null
    }
  }

  async getCountryFromCoordinates(latitude, longitude) {
    await PlacesService.waitForMapsToLoad()
    
    try {
      if (!this.geocoder) {
        this.initializeServices()
      }
      
      if (!this.geocoder) {
        console.warn('Geocoder not available')
        return null
      }

      const latlng = { lat: latitude, lng: longitude }
      
      const result = await new Promise((resolve, reject) => {
        this.geocoder.geocode({ location: latlng }, (results, status) => {
          if (status === 'OK' && results && results.length > 0) {
            resolve(results)
          } else {
            reject(new Error(`Reverse geocoding failed: ${status}`))
          }
        })
      })

      // Extract country from address components
      for (const result of result) {
        for (const component of result.address_components) {
          if (component.types.includes('country')) {
            console.log('Detected country:', component.long_name)
            return component.long_name
          }
        }
      }
      
      return null
    } catch (error) {
      console.warn('Error getting country from coordinates:', error)
      return null
    }
  }

  async geocodeLocation(address, biasLocation = null, countryHint = null) {
    await PlacesService.waitForMapsToLoad()
    
    // Validate input parameters
    if (!address || typeof address !== 'string' || address.trim().length === 0) {
      console.warn('PlacesService: Invalid address parameter:', address)
      return null
    }
    
    // Initialize enhancedAddress outside try block to ensure it's always defined
    let enhancedAddress = address
    
    try {
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        console.error('PlacesService: Google Maps Places API not available after waiting')
        return null
      }

      // Enhance address with country hint if provided and address doesn't already contain country info
      if (countryHint && !this.containsCountryInfo(address)) {
        enhancedAddress = `${address}, ${countryHint}`
        console.log('Enhanced address with country hint:', enhancedAddress)
      }

      // Initialize Geocoder service if not already done
      if (!this.geocoder) {
        this.initializeServices()
      }

      // Attempt 1: Use server proxy for Places API searchByText
      console.log('Attempt 1: Places API searchByText with location bias')
      try {
        // Use server proxy for geocoding to keep API key secure
        const geocodeResult = await this.proxyGeocode(enhancedAddress, biasLocation)
        if (geocodeResult) {
          console.log('Geocoded location (Attempt 1 - Proxy):', geocodeResult.formatted_address, 'from query:', enhancedAddress)
          return geocodeResult
        }
      } catch (error) {
        console.warn('Attempt 1 failed:', {
          message: error.message,
          status: error.status,
          code: error.code,
          details: error.details || 'No additional details'
        })
      }

      // Attempt 2: Fallback to traditional Geocoder API (client-side)
      console.log('Attempt 2: Traditional Geocoder API fallback')
      if (this.geocoder) {
        try {
          const geocodeRequest = { address: enhancedAddress }
          
          // Add location bias for traditional geocoder if available
          if (biasLocation) {
            geocodeRequest.bounds = new google.maps.LatLngBounds(
              new google.maps.LatLng(biasLocation.lat - 0.1, biasLocation.lng - 0.1),
              new google.maps.LatLng(biasLocation.lat + 0.1, biasLocation.lng + 0.1)
            )
          }

          console.log('PlacesService: Making Geocoder request:', geocodeRequest)
          const result = await new Promise((resolve, reject) => {
            this.geocoder.geocode(geocodeRequest, (results, status) => {
              if (status === 'OK' && results && results.length > 0) {
                resolve(results)
              } else {
                reject(new Error(`Geocoding failed with status: ${status}`))
              }
            })
          })

          if (result && result.length > 0) {
            const location = result[0]
            console.log('Geocoded location (Attempt 2):', location.formatted_address, 'from query:', enhancedAddress)
            return {
              lat: location.geometry.location.lat(),
              lng: location.geometry.location.lng(),
              formatted_address: location.formatted_address
            }
          }
        } catch (error) {
          console.warn('Attempt 2 failed:', {
            message: error.message,
            status: error.status || 'Unknown',
            details: error.details || 'No additional details'
          })
        }
      }

      console.warn('All geocoding attempts failed for:', enhancedAddress)
      return null
    } catch (error) {
      console.error('PlacesService: Geocoding failed for:', enhancedAddress, {
        message: error.message,
        status: error.status,
        code: error.code,
        stack: error.stack
      })
      return null
    }
  }

  // New method to use server proxy for geocoding
  async proxyGeocode(address, biasLocation = null) {
    try {
      const params = new URLSearchParams({
        endpoint: 'geocode/json',
        address: address
      })

      if (biasLocation) {
        params.append('bounds', `${biasLocation.lat-0.1},${biasLocation.lng-0.1}|${biasLocation.lat+0.1},${biasLocation.lng+0.1}`)
      }

      const response = await fetch(`${API_CONFIG.googleMaps.proxyUrl}?${params}`)
      const data = await response.json()

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const result = data.results[0]
        return {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
          formatted_address: result.formatted_address
        }
      }

      return null
    } catch (error) {
      console.warn('Proxy geocoding failed:', error)
      return null
    }
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
    await PlacesService.waitForMapsToLoad()
    
    try {
      console.log('Finding interesting places near:', centerLocation, 'within', radiusMeters, 'meters')
      
      // Validate input parameters
      if (!centerLocation || typeof centerLocation !== 'string') {
        console.warn('PlacesService: Invalid centerLocation parameter:', centerLocation)
        return []
      }
      
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        console.error('PlacesService: Google Maps Places API not available after waiting')
        return []
      }

      // Parse center location coordinates
      const [lat, lng] = centerLocation.split(',').map(coord => parseFloat(coord.trim()))
      if (isNaN(lat) || isNaN(lng)) {
        console.warn('PlacesService: Invalid center location coordinates:', centerLocation)
        return []
      }

      const center = { lat, lng }
      const places = []

      // Define search categories for interesting places
      const searchQueries = [
        'tourist attractions',
        'museums',
        'parks',
        'historical sites',
        'art galleries',
        'landmarks',
        'churches',
        'markets',
        'viewpoints',
        'cultural sites'
      ]

      // Search for each category
      for (const query of searchQueries) {
        try {
          if (!query || query.trim().length === 0) {
            console.warn('PlacesService: Skipping empty search query')
            continue
          }
          
          const request = {
            textQuery: query,
            fields: ['id', 'displayName', 'location', 'types', 'rating'],
            locationBias: {
              center: center,
              radius: radiusMeters
            },
            maxResultCount: 10
          }

          console.log('PlacesService: Making searchByText request for query:', query, request)
          const { places: searchResults } = await google.maps.places.Place.searchByText(request)
          
          if (searchResults && searchResults.length > 0) {
            for (const place of searchResults) {
              // Check if place is within our radius and not already added
              if (place.location && place.id && place.displayName) {
                const distance = this.calculateDistance(
                  center.lat, center.lng,
                  place.location.lat(), place.location.lng()
                )
                
                if (distance <= radiusMeters && !places.find(p => p.place_id === place.id)) {
                  places.push({
                    name: place.displayName,
                    place_id: place.id,
                    geometry: {
                      location: {
                        lat: () => place.location.lat(),
                        lng: () => place.location.lng()
                      }
                    },
                    types: place.types || [],
                    rating: place.rating || null,
                    distance: Math.round(distance)
                  })
                }
              }
            }
          }
        } catch (error) {
          console.warn(`PlacesService: Error searching for ${query}:`, {
            message: error.message,
            status: error.status,
            code: error.code,
            details: error.details || 'No additional details'
          })
          // Continue with other queries even if one fails
        }
      }

      // Sort by distance and limit results
      places.sort((a, b) => a.distance - b.distance)
      const limitedPlaces = places.slice(0, 20) // Limit to top 20 closest places
      
      console.log(`Found ${limitedPlaces.length} interesting places near ${centerLocation}`)
      return limitedPlaces
      
    } catch (error) {
      console.error('PlacesService: Error finding interesting places:', {
        centerLocation: centerLocation,
        message: error.message,
        status: error.status,
        code: error.code,
        stack: error.stack
      })
      return []
    }
  }

  // Helper method to calculate distance between two points
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000 // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1)
    const dLng = this.toRadians(lng2 - lng1)
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180)
  }

  containsCountryInfo(address) {
    // Check if address already contains country or region information
    const countryIndicators = [
      ',', // Comma usually indicates city, country format
      'new zealand', 'nz', 'australia', 'au', 'united kingdom', 'uk', 'usa', 'us',
      'canada', 'ca', 'france', 'germany', 'italy', 'spain', 'japan', 'china',
      'india', 'brazil', 'mexico', 'south africa', 'egypt', 'russia', 'norway',
      'sweden', 'denmark', 'finland', 'netherlands', 'belgium', 'switzerland',
      'austria', 'portugal', 'greece', 'turkey', 'thailand', 'singapore',
      'malaysia', 'indonesia', 'philippines', 'vietnam', 'south korea',
      'taiwan', 'hong kong', 'argentina', 'chile', 'peru', 'colombia'
    ]
    
    const lowerAddress = address.toLowerCase()
    return countryIndicators.some(indicator => lowerAddress.includes(indicator))
  }

  async findPlaceIdByCoordinatesAndName(latitude, longitude, name) {
    await PlacesService.waitForMapsToLoad()
    
    try {
      console.log('findPlaceIdByCoordinatesAndName called:', { latitude, longitude, name })
      
      // Validate input parameters
      if (typeof latitude !== 'number' || typeof longitude !== 'number' || isNaN(latitude) || isNaN(longitude)) {
        console.warn('PlacesService: Invalid coordinates:', { latitude, longitude })
        return null
      }
      
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        console.warn('PlacesService: Invalid name parameter:', name)
        return null
      }
      
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        console.error('PlacesService: Google Maps Places API not available after waiting')
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

      console.log('PlacesService: Making searchByText request for place ID lookup:', request)
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
      console.warn('PlacesService: Place ID lookup failed:', {
        latitude: latitude,
        longitude: longitude,
        name: name,
        message: error.message,
        status: error.status,
        code: error.code,
        details: error.details || 'No additional details'
      })
      return null
    }
  }
}