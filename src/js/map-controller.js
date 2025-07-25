export class MapController {
  constructor() {
    this.map = null
    this.infoWindow = null
    this.markers = []
  }

  initMap(mapElementId, stops) {
    console.log("MapController: initMap called with stops:", stops)
    
    if (!window.google || !window.google.maps) {
      console.error("Google Maps API not loaded")
      return
    }

    try {
      // Default center (will be adjusted based on stops)
      const defaultCenter = { lat: 37.7749, lng: -122.4194 }

      // Create the map
      this.map = new google.maps.Map(document.getElementById(mapElementId), {
        zoom: 10,
        center: defaultCenter,
        mapTypeId: "roadmap",
      })

      // Initialize info window
      this.infoWindow = new google.maps.InfoWindow()

      console.log("Map initialized successfully")

      // Add markers for tour stops
      if (stops && stops.length > 0) {
        this.addMarkers(stops)
      } else {
        console.warn("No stops provided to display on map")
      }
    } catch (error) {
      console.error("Error initializing map:", error)
    }
  }

  addMarkers(stops) {
    console.log("Adding markers for stops:", stops)
    
    // Clear existing markers
    this.clearMarkers()

    const bounds = new google.maps.LatLngBounds()
    let validStopsCount = 0

    stops.forEach((stop, index) => {
      if (stop.coordinates && stop.coordinates.latitude && stop.coordinates.longitude) {
        const position = {
          lat: stop.coordinates.latitude,
          lng: stop.coordinates.longitude
        }

        // Create marker
        const marker = new google.maps.Marker({
          position: position,
          map: this.map,
          title: stop.name || `Stop ${stop.number}`,
          animation: google.maps.Animation.DROP,
          label: {
            text: stop.number ? stop.number.toString() : (index + 1).toString(),
            color: "white",
            fontWeight: "bold"
          }
        })

        // Add click listener for info window
        marker.addListener("click", () => {
          const content = `
            <div class="info-window-content">
              <h3>${stop.name || `Stop ${stop.number}`}</h3>
              <p>${stop.description || 'No description available'}</p>
              ${stop.coordinates ? `<p><small>Coordinates: ${stop.coordinates.latitude}, ${stop.coordinates.longitude}</small></p>` : ''}
            </div>
          `
          this.infoWindow.setContent(content)
          this.infoWindow.open(this.map, marker)
        })

        this.markers.push(marker)
        bounds.extend(position)
        validStopsCount++
      } else {
        console.warn(`Stop ${index + 1} (${stop.name}) has no valid coordinates:`, stop.coordinates)
      }
    })

    // Fit map to show all markers
    if (validStopsCount > 0) {
      if (validStopsCount === 1) {
        // If only one marker, center on it with a reasonable zoom
        this.map.setCenter(bounds.getCenter())
        this.map.setZoom(15)
      } else {
        // If multiple markers, fit bounds
        this.map.fitBounds(bounds)
      }
      console.log(`Successfully added ${validStopsCount} markers to the map`)
    } else {
      console.warn("No valid coordinates found in any stops")
    }
  }

  clearMarkers() {
    this.markers.forEach(marker => {
      marker.setMap(null)
    })
    this.markers = []
  }

  showMap() {
    if (this.map) {
      // Trigger resize to ensure map renders properly when container becomes visible
      google.maps.event.trigger(this.map, 'resize')
    }
  }
}