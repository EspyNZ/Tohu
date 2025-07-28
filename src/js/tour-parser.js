export class TourParser {
  parse(text) {
    const tour = {
      title: '',
      duration: '',
      distance: '',
      startingPoint: '',
      notableStops: [],
      introduction: '',
      stops: [],
      journeys: [],
      conclusion: ''
    }

    try {
      // Parse basic information
      tour.title = this.extractField(text, 'TOUR TITLE') || 'Hidden Gems Tour'
      tour.duration = this.extractField(text, 'DURATION') || 'N/A'
      tour.distance = this.extractField(text, 'DISTANCE') || 'N/A'
      tour.startingPoint = this.extractField(text, 'STARTING POINT') || 'N/A'
      

      // Parse introduction and conclusion
      tour.introduction = this.extractSection(text, 'INTRODUCTION', 'STOPS') || 'Welcome to this hidden gems tour!'
      tour.conclusion = this.extractSection(text, 'CONCLUSION') || 'Thank you for joining this hidden gems tour!'

      // Parse stops
      tour.stops = this.parseStops(text)
      
      // Parse journeys
      tour.journeys = this.parseJourneys(text)

    } catch (error) {
      console.error('Error parsing tour content:', error)
      throw new Error(`Failed to parse tour content: ${error.message}`)
    }

    return tour
  }

  extractField(text, fieldName) {
    const regex = new RegExp(`\\*\\*${fieldName}:\\*\\*\\s*(.+)`, 'i')
    const match = text.match(regex)
    return match ? match[1].trim() : null
  }

  extractSection(text, startSection, endSection = null) {
    let regex
    if (endSection) {
      regex = new RegExp(`\\*\\*${startSection}:\\*\\*\\s*([\\s\\S]+?)(?=\\*\\*${endSection}:\\*\\*)`, 'i')
    } else {
      regex = new RegExp(`\\*\\*${startSection}:\\*\\*\\s*([\\s\\S]+?)$`, 'i')
    }
    
    const match = text.match(regex)
    return match ? match[1].trim() : null
  }

  parseStops(text) {
    const stops = []
    const stopPattern = /\*\*Stop (\d+): ([^*]+)\*\*\s*([\s\S]*?)(?=\*\*(?:Stop \d+:|Journey to Stop \d+:|CONCLUSION:)|$)/gi
    
    let stopMatch
    while ((stopMatch = stopPattern.exec(text)) !== null) {
      const stop = {
        number: parseInt(stopMatch[1]),
        name: stopMatch[2].trim(),
        description: '',
        coordinates: null,
        googlePlaceId: null,
        hiddenHistory: '',
        localTip: ''
      }

      const stopContent = stopMatch[3].trim()
      
      // Parse stop details
      stop.description = this.extractStopDetail(stopContent, 'Description')
      stop.googlePlaceId = this.extractStopDetail(stopContent, 'Google Place ID')
      stop.coordinates = this.extractCoordinates(stopContent)
      stop.youAreHere = this.extractStopDetail(stopContent, 'You Are Here')
      stop.theHook = this.extractStopDetail(stopContent, 'The Hook')
      stop.fascinatingFacts = this.extractStopDetail(stopContent, 'Fascinating Facts')
      stop.storiesVoices = this.extractStopDetail(stopContent, 'Stories & Voices')
      stop.interactiveMoment = this.extractStopDetail(stopContent, 'Interactive Moment')
      stop.photoOp = this.extractStopDetail(stopContent, 'Photo Op')
      stop.hiddenHistory = this.extractStopDetail(stopContent, 'Hidden History')
      stop.localTip = this.extractStopDetail(stopContent, 'Local Tip')

      stops.push(stop)
    }

    return stops
  }

  parseJourneys(text) {
    const journeys = []
    const journeyPattern = /\*\*Journey to Stop (\d+):\*\*\s*([\s\S]*?)(?=\*\*Stop \d+:|$)/gi
    
    let journeyMatch
    while ((journeyMatch = journeyPattern.exec(text)) !== null) {
      journeys.push({
        toStop: parseInt(journeyMatch[1]),
        description: journeyMatch[2].trim()
      })
    }

    return journeys
  }

  extractStopDetail(content, detailName) {
    const regex = new RegExp(`- \\*\\*${detailName}:\\*\\*\\s*([^-]+)`, 'i')
    const match = content.match(regex)
    return match ? match[1].trim() : ''
  }

  extractCoordinates(content) {
    const coordMatch = content.match(/- \*\*Coordinates:\*\*\s*\[\s*([^,\]]+)\s*,\s*([^\]]+)\s*\]/i)
    if (coordMatch) {
      return {
        latitude: parseFloat(coordMatch[1].trim()),
        longitude: parseFloat(coordMatch[2].trim())
      }
    }
    return null
  }
}