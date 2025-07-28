import { API_CONFIG } from './config.js'

export class PlacesService {
  constructor() {
    this.apiKey = API_CONFIG.googleMaps.apiKey
    this.service = null
    this.geocoder = null
  }

  initializeServices() {
    if (window.google && window.google.maps) {
      this.service = new google.maps.places.PlacesService(document.createElement('div'))
      this.geocoder = new google.maps.Geocoder()
      return true
    }
    return false
  }

  async searchNearbyPlaces(location, radius = 1000, type = 'point_of_interest') {
    return new Promise((resolve) => {
      if (!this.initializeServices()) {
        console.warn('Google Maps API not loaded')
        resolve([])
        return
      }

      const [lat, lng] = location.split(',').map(coord => parseFloat(coord.trim()))
      const request = {
        location: new google.maps.LatLng(lat, lng),
        radius: radius,
        type: type
      }

      this.service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          resolve(results || [])
        } else {
          console.warn('Places search failed:', status)
          resolve([])
        }
      })
    })
  }

  async getPlaceDetails(placeId) {
    return new Promise((resolve) => {
      if (!this.initializeServices()) {
        console.warn('Google Maps API not loaded')
        resolve(null)
        return
      }

      const request = {
        placeId: placeId,
        fields: ['name', 'formatted_address', 'geometry', 'photos', 'rating', 'types', 'website', 'opening_hours']
      }

      this.service.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          resolve(place)
        } else {
          console.warn('Place details failed:', status)
          resolve(null)
        }
      })
    })
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

  getPhotoUrl(photoReference, maxWidth = 600) {
    if (!photoReference) return null
    if (photoReference.getUrl) {
      return photoReference.getUrl({ maxWidth: maxWidth })
    }
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${this.apiKey}`
  }

  async findInterestingPlaces(centerLocation, radiusMeters = 2000) {
    const interestingTypes = [
      'tourist_attraction',
      'museum',
      'art_gallery',
      'park',
      'church',
      'synagogue',
      'mosque',
      'hindu_temple',
      'cemetery',
      'library',
      'university',
      'school',
      'city_hall',
      'courthouse',
      'fire_station',
      'post_office',
      'subway_station',
      'train_station',
      'bus_station',
      'cafe',
      'restaurant',
      'bakery',
      'book_store',
      'clothing_store',
      'florist',
      'jewelry_store',
      'shoe_store',
      'shopping_mall',
      'supermarket',
      'pharmacy',
      'hospital',
      'dentist',
      'veterinary_care',
      'bank',
      'atm',
      'real_estate_agency',
      'travel_agency',
      'insurance_agency',
      'lawyer',
      'accounting',
      'beauty_salon',
      'hair_care',
      'spa',
      'gym',
      'amusement_park',
      'aquarium',
      'bowling_alley',
      'casino',
      'movie_theater',
      'night_club',
      'zoo'
    ]

    const allPlaces = []
    
    // Search for multiple types to get diverse results
    for (const type of interestingTypes.slice(0, 10)) { // Limit to avoid too many API calls
      try {
        const places = await this.searchNearbyPlaces(centerLocation, radiusMeters, type)
        allPlaces.push(...places)
      } catch (error) {
        console.warn(`Failed to search for ${type}:`, error)
      }
    }

    // Remove duplicates and sort by rating/prominence
    const uniquePlaces = allPlaces.filter((place, index, self) => 
      index === self.findIndex(p => p.place_id === place.place_id)
    )

    return uniquePlaces
      .filter(place => place.rating && place.rating > 3.5) // Only well-rated places
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 20) // Return top 20 places
  }
}