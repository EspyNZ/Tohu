import { API_CONFIG } from './config.js'

export class PlacesService {
  constructor() {
    this.apiKey = API_CONFIG.googleMaps.apiKey
    this.baseUrl = API_CONFIG.googleMaps.placesApiUrl
  }

  async searchNearbyPlaces(location, radius = 1000, type = 'point_of_interest') {
    try {
      const url = `${this.baseUrl}/nearbysearch/json?location=${location}&radius=${radius}&type=${type}&key=${this.apiKey}`
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Places API error: ${response.status}`)
      }
      
      const data = await response.json()
      return data.results || []
    } catch (error) {
      console.error('Error fetching nearby places:', error)
      return []
    }
  }

  async getPlaceDetails(placeId) {
    try {
      const fields = 'name,formatted_address,geometry,photos,rating,types,website,opening_hours'
      const url = `${this.baseUrl}/details/json?place_id=${placeId}&fields=${fields}&key=${this.apiKey}`
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Place Details API error: ${response.status}`)
      }
      
      const data = await response.json()
      return data.result
    } catch (error) {
      console.error('Error fetching place details:', error)
      return null
    }
  }

  async geocodeLocation(address) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}`
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`)
      }
      
      const data = await response.json()
      if (data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location
        return {
          lat: location.lat,
          lng: location.lng,
          formatted_address: data.results[0].formatted_address
        }
      }
      return null
    } catch (error) {
      console.error('Error geocoding location:', error)
      return null
    }
  }

  getPhotoUrl(photoReference, maxWidth = 600) {
    if (!photoReference) return null
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