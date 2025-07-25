export class TourRenderer {
  constructor() {
    this.bindElements()
  }

  bindElements() {
    this.elements = {
      tourTitle: document.getElementById('tourTitle'),
      summaryDuration: document.getElementById('summaryDuration'),
      summaryDistance: document.getElementById('summaryDistance'),
      summaryStartingPoint: document.getElementById('summaryStartingPoint'),
      summaryNotableStops: document.getElementById('summaryNotableStops'),
      tourIntro: document.getElementById('tourIntro'),
      tourStopsContainer: document.getElementById('tourStopsContainer'),
      tourConclusion: document.getElementById('tourConclusion')
    }
  }

  render(tour) {
    this.renderHeader(tour)
    this.renderSummary(tour)
    this.renderIntroduction(tour)
    this.renderStops(tour)
    this.renderConclusion(tour)
  }

  renderHeader(tour) {
    this.elements.tourTitle.textContent = tour.title
  }

  renderSummary(tour) {
    this.elements.summaryDuration.textContent = tour.duration
    this.elements.summaryDistance.textContent = tour.distance
    this.elements.summaryStartingPoint.textContent = tour.startingPoint

    // Clear and populate notable stops
    this.elements.summaryNotableStops.innerHTML = ''
    tour.notableStops.forEach(stop => {
      const li = document.createElement('li')
      li.textContent = stop
      this.elements.summaryNotableStops.appendChild(li)
    })
  }

  renderIntroduction(tour) {
    this.elements.tourIntro.textContent = tour.introduction
  }

  renderStops(tour) {
    this.elements.tourStopsContainer.innerHTML = ''

    tour.stops.forEach((stop, index) => {
      this.renderTourStop(stop)
      
      // Add journey commentary if it exists
      const journey = tour.journeys.find(j => j.toStop === stop.number + 1)
      if (journey) {
        this.renderJourneyBetweenStops(journey.description)
      }
    })
  }

  renderTourStop(stop) {
    const stopDiv = document.createElement('div')
    stopDiv.className = 'tour-stop'

    // Use specific Pexels photo ID if available, otherwise use a more neutral default
    const photoId = stop.pexelsPhotoId || '2387873'
    const imageUrl = `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop`
    const fallbackUrl = 'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop'

    stopDiv.innerHTML = `
      <div class="tour-stop-number">${stop.number}</div>
      <h3 class="ml-10">${stop.name || 'Unknown Location'}</h3>
      <div class="tour-stop-content">
        ${stop.youAreHere ? `<div class="you-are-here"><div class="section-icon">📍</div><div class="section-title">You Are Here</div><p>${stop.youAreHere}</p></div>` : ''}
        <img src="${imageUrl}" alt="View of ${stop.name}" class="tour-image" 
             onerror="this.onerror=null;this.src='${fallbackUrl}';">
        <p class="mt-4 text-gray-800">${stop.description || ''}</p>
        ${this.renderStorySection(stop)}
        ${stop.fascinatingFacts ? `<div class="fascinating-facts"><div class="section-icon">💡</div><div class="section-title">Fascinating Facts</div><div class="facts-content">${this.formatFacts(stop.fascinatingFacts)}</div></div>` : ''}
        ${stop.hiddenHistory ? `<div class="tour-detail-heading">Hidden History</div><p class="tour-detail-content">${stop.hiddenHistory}</p>` : ''}
        ${this.renderCaptureTheMomentSection(stop)}
        ${stop.localTip ? `<div class="tour-detail-heading">Local Tip</div><p class="tour-detail-content">${stop.localTip}</p>` : ''}
        ${stop.coordinates ? this.renderMapLink(stop) : ''}
      </div>
    `
    
    this.elements.tourStopsContainer.appendChild(stopDiv)
  }

  renderStorySection(stop) {
    const hasHook = stop.theHook && stop.theHook.trim()
    const hasStories = stop.storiesVoices && stop.storiesVoices.trim()
    
    if (!hasHook && !hasStories) return ''
    
    let content = ''
    if (hasHook) {
      content += `<p class="hook-content">${stop.theHook}</p>`
    }
    if (hasStories) {
      content += `<blockquote class="stories-content">${stop.storiesVoices}</blockquote>`
    }
    
    return `<div class="story-section"><div class="section-icon">📖</div><div class="section-title">The Story</div>${content}</div>`
  }
  
  renderCaptureTheMomentSection(stop) {
    const hasInteractive = stop.interactiveMoment && stop.interactiveMoment.trim()
    const hasPhotoOp = stop.photoOp && stop.photoOp.trim()
    
    if (!hasInteractive && !hasPhotoOp) return ''
    
    let content = ''
    if (hasInteractive) {
      content += `<div class="interactive-content"><strong>Experience:</strong> ${stop.interactiveMoment}</div>`
    }
    if (hasPhotoOp) {
      content += `<div class="photo-content"><strong>Photo Opportunity:</strong> ${stop.photoOp}</div>`
    }
    
    return `<div class="capture-moment-section"><div class="section-icon">📸</div><div class="section-title">Capture the Moment</div>${content}</div>`
  }

  formatFacts(factsText) {
    // Clean up the facts text and create proper bullet points
    let facts = []
    
    // Handle different bullet point formats
    if (factsText.includes('•')) {
      facts = factsText.split('•').filter(fact => fact.trim()).map(fact => fact.trim())
    } else if (factsText.includes('- ')) {
      facts = factsText.split(/- /).filter(fact => fact.trim()).map(fact => fact.trim())
    } else if (factsText.includes('\n')) {
      // Handle line breaks as separators
      facts = factsText.split('\n').filter(fact => fact.trim()).map(fact => fact.trim().replace(/^[-•]\s*/, ''))
    } else {
      // Split by periods and create facts, but be careful with abbreviations
      facts = factsText.split(/\.(?=\s[A-Z])/).filter(fact => fact.trim()).map(fact => {
        const trimmed = fact.trim()
        return trimmed.endsWith('.') ? trimmed : trimmed + '.'
      })
    }
    
    // Remove empty facts and ensure proper formatting
    facts = facts.filter(fact => fact.length > 3)
    
    return `<ul class="facts-list">${facts.map(fact => `<li>${fact}</li>`).join('')}</ul>`
  }

  renderMapLink(stop) {
    return `
      <p class="mt-4 text-gray-600">
        <a href="https://www.google.com/maps/search/?api=1&query=${stop.coordinates.latitude},${stop.coordinates.longitude}" 
           target="_blank" class="map-link">
          <svg class="map-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
          </svg>
          View on Map (${stop.coordinates.latitude}, ${stop.coordinates.longitude})
        </a>
      </p>
    `
  }

  renderJourneyBetweenStops(commentary) {
    const journeyDiv = document.createElement('div')
    journeyDiv.className = 'tour-journey-between-stops'
    journeyDiv.innerHTML = `<strong>Along the Way:</strong> ${commentary}`
    this.elements.tourStopsContainer.appendChild(journeyDiv)
  }

  renderConclusion(tour) {
    this.elements.tourConclusion.textContent = tour.conclusion
  }
}