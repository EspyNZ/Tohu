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

      // Use the new Place class
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

      // Attempt 1: Use Places API searchByText with location bias
      console.log('Attempt 1: Places API searchByText with location bias')
      try {
        if (!enhancedAddress || enhancedAddress.trim().length === 0) {
          throw new Error('Empty textQuery parameter')
        }
        
        const request = {
          textQuery: enhancedAddress,
          fields: ['id', 'displayName', 'location', 'formattedAddress']
        }
        
        // Add location bias if user's current location is available
        if (biasLocation) {
          request.locationBias = {
            center: { lat: biasLocation.lat, lng: biasLocation.lng },
            radius: 200000 // 200km radius bias
          }
          console.log('Geocoding with location bias:', biasLocation)
        }

        console.log('PlacesService: Making searchByText request:', request)
        const { places } = await google.maps.places.Place.searchByText(request)
        
        if (places && places.length > 0) {
          const place = places[0]
          console.log('Geocoded location (Attempt 1):', place.formattedAddress, 'from query:', enhancedAddress)
          return {
            lat: place.location.lat(),
            lng: place.location.lng(),
            formatted_address: place.formattedAddress
          }
        }
      } catch (error) {
        console.warn('Attempt 1 failed:', {
          message: error.message,
          status: error.status,
          code: error.code,
          details: error.details || 'No additional details'
        })
      }

      // Attempt 2: Use Places API searchByText without location bias (if bias was used)
      if (biasLocation) {
        console.log('Attempt 2: Places API searchByText without location bias')
        try {
          if (!enhancedAddress || enhancedAddress.trim().length === 0) {
            throw new Error('Empty textQuery parameter')
          }
          
          const request = {
            textQuery: enhancedAddress,
            fields: ['id', 'displayName', 'location', 'formattedAddress']
          }

          console.log('PlacesService: Making searchByText request (no bias):', request)
          const { places } = await google.maps.places.Place.searchByText(request)
          
          if (places && places.length > 0) {
            const place = places[0]
            console.log('Geocoded location (Attempt 2):', place.formattedAddress, 'from query:', enhancedAddress)
            return {
              lat: place.location.lat(),
              lng: place.location.lng(),
              formatted_address: place.formattedAddress
            }
          }
        } catch (error) {
          console.warn('Attempt 2 failed:', {
            message: error.message,
            status: error.status,
            code: error.code,
            details: error.details || 'No additional details'
          })
        }
      }

      // Attempt 3: Fallback to traditional Geocoder API
      console.log('Attempt 3: Traditional Geocoder API fallback')
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
            console.log('Geocoded location (Attempt 3):', location.formatted_address, 'from query:', enhancedAddress)
            return {
              lat: location.geometry.location.lat(),
              lng: location.geometry.location.lng(),
              formatted_address: location.formatted_address
            }
          }
        } catch (error) {
          console.warn('Attempt 3 failed:', {
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

  async findInterestingPlaces(centerLocation, radiusMeters = 2000, dreamTourDescription = '', toggleOptions = []) {
    await PlacesService.waitForMapsToLoad()
    
    try {
      console.log('Finding interesting places near:', centerLocation, 'within', radiusMeters, 'meters', 'for dream tour:', dreamTourDescription, 'with options:', toggleOptions)
      
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

      // Generate dynamic search parameters based on user interests
      const searchParams = this._generateSearchParameters(dreamTourDescription, toggleOptions)
      console.log('Generated search parameters:', searchParams)

      // Search using includedTypes (more precise)
      for (const placeType of searchParams.includedTypes) {
        try {
          if (!placeType || placeType.trim().length === 0) {
            console.warn('PlacesService: Skipping empty place type')
            continue
          }
          
          const request = {
            includedTypes: [placeType],
            fields: ['id', 'displayName', 'location', 'types', 'rating'],
            locationBias: {
              center: center,
              radius: radiusMeters
            },
            maxResultCount: 10
          }

          console.log('PlacesService: Making searchByText request for type:', placeType, request)
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
          console.warn(`PlacesService: Error searching for type ${placeType}:`, {
            message: error.message,
            status: error.status,
            code: error.code,
            details: error.details || 'No additional details'
          })
          // Continue with other queries even if one fails
        }
      }

      // Search using text queries (broader search)
      for (const query of searchParams.textQueries) {
        try {
          if (!query || query.trim().length === 0) {
            console.warn('PlacesService: Skipping empty text query')
            continue
          }
          
          const request = {
            textQuery: query,
            fields: ['id', 'displayName', 'location', 'types', 'rating'],
            locationBias: {
              center: center,
              radius: radiusMeters
            },
            maxResultCount: 8
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
          console.warn(`PlacesService: Error searching for query ${query}:`, {
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
      
      console.log(`Found ${limitedPlaces.length} interesting places near ${centerLocation} based on user interests`)
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

  // Helper method to generate search parameters based on user interests
  _generateSearchParameters(dreamTourDescription = '', toggleOptions = []) {
    const includedTypes = new Set()
    const textQueries = new Set()
    
    // Convert to lowercase for easier matching
    const description = dreamTourDescription.toLowerCase()
    
    // Map toggle options to Google Places API types and queries
    if (toggleOptions.includes('cafe')) {
      includedTypes.add('cafe')
      includedTypes.add('coffee_shop')
      textQueries.add('specialty coffee')
      textQueries.add('local cafes')
    }
    
    if (toggleOptions.includes('pub')) {
      includedTypes.add('bar')
      includedTypes.add('night_club')
      textQueries.add('local pubs')
      textQueries.add('craft beer')
    }
    
    if (toggleOptions.includes('history')) {
      includedTypes.add('museum')
      includedTypes.add('historical_landmark')
      textQueries.add('historical sites')
      textQueries.add('heritage buildings')
      textQueries.add('monuments')
    }
    
    if (toggleOptions.includes('celebs')) {
      textQueries.add('celebrity homes')
      textQueries.add('famous filming locations')
      textQueries.add('celebrity restaurants')
    }
    
    // Analyze dream tour description for specific interests
    const interestMappings = {
      // Music-related
      'music': { types: ['night_club'], queries: ['music venues', 'live music', 'concert halls'] },
      'concert': { types: ['night_club'], queries: ['concert venues', 'music halls'] },
      'band': { types: ['night_club'], queries: ['live music venues', 'band venues'] },
      'jazz': { types: ['night_club'], queries: ['jazz clubs', 'jazz venues'] },
      'rock': { types: ['night_club'], queries: ['rock venues', 'music clubs'] },
      'classical': { types: [], queries: ['concert halls', 'opera houses', 'classical music venues'] },
      
      // Art-related
      'art': { types: ['art_gallery', 'museum'], queries: ['art galleries', 'street art', 'public art'] },
      'gallery': { types: ['art_gallery'], queries: ['art galleries', 'contemporary art'] },
      'street art': { types: [], queries: ['street art', 'murals', 'graffiti art'] },
      'sculpture': { types: ['art_gallery'], queries: ['sculpture parks', 'public sculptures'] },
      'painting': { types: ['art_gallery'], queries: ['art galleries', 'painting exhibitions'] },
      
      // Food-related
      'food': { types: ['restaurant', 'meal_takeaway'], queries: ['local restaurants', 'food markets', 'street food'] },
      'restaurant': { types: ['restaurant'], queries: ['local restaurants', 'fine dining'] },
      'market': { types: [], queries: ['food markets', 'farmers markets', 'local markets'] },
      'street food': { types: ['meal_takeaway'], queries: ['street food', 'food trucks'] },
      'cuisine': { types: ['restaurant'], queries: ['ethnic restaurants', 'local cuisine'] },
      
      // History-related
      'history': { types: ['museum', 'historical_landmark'], queries: ['historical sites', 'heritage buildings'] },
      'historical': { types: ['museum', 'historical_landmark'], queries: ['historical landmarks', 'heritage sites'] },
      'heritage': { types: ['historical_landmark'], queries: ['heritage buildings', 'historical sites'] },
      'monument': { types: ['historical_landmark'], queries: ['monuments', 'memorials'] },
      'ancient': { types: ['historical_landmark'], queries: ['ancient sites', 'archaeological sites'] },
      
      // Nature-related
      'park': { types: ['park'], queries: ['parks', 'gardens', 'green spaces'] },
      'garden': { types: ['park'], queries: ['botanical gardens', 'public gardens'] },
      'nature': { types: ['park'], queries: ['nature reserves', 'parks', 'outdoor spaces'] },
      'beach': { types: [], queries: ['beaches', 'waterfront', 'coastal areas'] },
      'hiking': { types: ['park'], queries: ['hiking trails', 'nature walks'] },
      
      // Architecture-related
      'architecture': { types: ['church', 'synagogue', 'hindu_temple'], queries: ['architectural landmarks', 'historic buildings'] },
      'building': { types: ['church', 'synagogue'], queries: ['historic buildings', 'architectural sites'] },
      'church': { types: ['church'], queries: ['historic churches', 'religious architecture'] },
      'cathedral': { types: ['church'], queries: ['cathedrals', 'religious buildings'] },
      
      // Shopping-related
      'shopping': { types: ['shopping_mall', 'clothing_store'], queries: ['shopping districts', 'local markets'] },
      'boutique': { types: ['clothing_store'], queries: ['boutique shops', 'local boutiques'] },
      'vintage': { types: ['clothing_store'], queries: ['vintage shops', 'antique stores'] },
      
      // Entertainment-related
      'theater': { types: [], queries: ['theaters', 'performing arts venues'] },
      'cinema': { types: ['movie_theater'], queries: ['historic cinemas', 'movie theaters'] },
      'entertainment': { types: ['amusement_park'], queries: ['entertainment venues', 'attractions'] },
      
      // Cultural-related
      'culture': { types: ['museum', 'art_gallery'], queries: ['cultural sites', 'cultural centers'] },
      'cultural': { types: ['museum', 'art_gallery'], queries: ['cultural landmarks', 'cultural attractions'] },
      'local': { types: [], queries: ['local attractions', 'neighborhood gems'] },
      'hidden': { types: [], queries: ['hidden gems', 'secret spots', 'local favorites'] },
      'secret': { types: [], queries: ['secret locations', 'hidden places'] }
    }
    
    // Apply interest mappings based on description content
    for (const [keyword, mapping] of Object.entries(interestMappings)) {
      if (description.includes(keyword)) {
        mapping.types.forEach(type => includedTypes.add(type))
        mapping.queries.forEach(query => textQueries.add(query))
      }
    }
    
    // Add fallback searches if no specific interests were identified
    if (includedTypes.size === 0 && textQueries.size === 0) {
      console.log('No specific interests identified, using fallback searches')
      includedTypes.add('tourist_attraction')
      includedTypes.add('point_of_interest')
      textQueries.add('local attractions')
      textQueries.add('points of interest')
    }
    
    return {
      includedTypes: Array.from(includedTypes),
      textQueries: Array.from(textQueries)
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