import { API_CONFIG } from './config.js'
import { PlacesService } from './places-service.js'

export class TourGenerator {
  constructor() {
    this.apiKey = API_CONFIG.gemini.apiKey
    this.apiUrl = API_CONFIG.gemini.apiUrl
    this.placesService = new PlacesService()
  }

  async generateTour(dreamTourDescription, specificLocation, toggleOptions = [], tourLength = 5, userCurrentLocation = null, userCountry = null) {
    console.log('TourGenerator: Starting generateTour with params:', {
      dreamTourDescription,
      specificLocation,
      toggleOptions,
      tourLength,
      userCurrentLocation,
      userCountry
    })
    
    // Use AI to extract location and understand context
    console.log('TourGenerator: Using AI to extract location and context')
    const contextAnalysis = await this.analyzeUserContext(dreamTourDescription, specificLocation, toggleOptions, userCurrentLocation, userCountry)
    console.log('TourGenerator: AI context analysis result:', contextAnalysis)
    
    if (contextAnalysis.location) {
      console.log('TourGenerator: About to geocode location')
      const locationData = await this.placesService.geocodeLocation(contextAnalysis.location, userCurrentLocation, userCountry)
      console.log('TourGenerator: Geocoding result:', locationData)
      
      if (!locationData) {
        const locationHint = contextAnalysis.country ? ` in ${contextAnalysis.country}` : ''
        throw new Error(`Could not find the location "${contextAnalysis.location}"${locationHint}. Please provide a more specific location in the advanced settings or describe the location more clearly in your dream tour.`)
      }
      
      console.log('TourGenerator: About to find nearby places')
      const centerLocation = `${locationData.lat},${locationData.lng}`
      const nearbyPlaces = await this.placesService.findInterestingPlaces(centerLocation, 2000, dreamTourDescription, contextAnalysis.enhancedToggles)
      console.log('TourGenerator: Found nearby places:', nearbyPlaces.length)
      
      console.log('TourGenerator: Creating prompt')
      const prompt = this.createPrompt(dreamTourDescription, contextAnalysis.location, contextAnalysis.enhancedToggles, tourLength, locationData, nearbyPlaces, contextAnalysis.country, contextAnalysis)
      console.log('TourGenerator: Prompt created, length:', prompt.length)
      
      try {
        // For development, use mock data first
        if (this.shouldUseMockData()) {
          console.log('TourGenerator: Using mock data')
          return {
            tourText: this.generateMockTour(dreamTourDescription, contextAnalysis.location, contextAnalysis.enhancedToggles, tourLength),
            prompt: prompt
          }
        }

        console.log('TourGenerator: Making API call to Gemini')
        const chatHistory = [{ role: "user", parts: [{ text: prompt }] }]
        const payload = { contents: chatHistory }
        
        const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        console.log('TourGenerator: API response status:', response.status)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(`API error ${response.status} - ${errorData.error?.message || response.statusText}`)
        }

        const result = await response.json()
        console.log('TourGenerator: API response received, processing...')

        if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
          console.log('TourGenerator: Successfully extracted tour text from API response')
          return {
            tourText: result.candidates[0].content.parts[0].text,
            prompt: prompt
          }
        } else {
          throw new Error('Unexpected API response structure')
        }
      } catch (error) {
        console.error('Error generating tour:', error)
        
        // Check for network/API key issues
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          throw new Error('Unable to connect to the tour generation service. Please check your internet connection and ensure your VITE_GEMINI_API_KEY is valid and enabled for the Gemini API in Google Cloud Console. If using localhost, verify there are no IP restrictions on your API key.')
        }
        
        // Check for quota exceeded errors and fall back to mock data
        if (error.message && (error.message.includes('429') || error.message.includes('quota exceeded'))) {
          console.warn('TourGenerator: Gemini API quota exceeded, falling back to mock data')
          return {
            tourText: this.generateMockTour(dreamTourDescription, effectiveLocation, toggleOptions, tourLength),
            prompt: prompt
          }
        }
        
        throw error
      }
    } else {
      throw new Error('No location could be determined from your tour description. Please provide a more specific location in the advanced settings.')
    }
  }

  async analyzeUserContext(dreamTourDescription, specificLocation, toggleOptions, userCurrentLocation, userCountry) {
    console.log('TourGenerator: Analyzing user context with AI')
    
    // Create a focused prompt for context analysis
    const analysisPrompt = `You are an expert tour planning assistant. Analyze the user's request and extract key information.

USER INPUT:
Dream Tour: "${dreamTourDescription}"
Specific Location: "${specificLocation || 'Not specified'}"
Current Toggle Options: ${toggleOptions.join(', ') || 'None'}
User's Current Country: ${userCountry || 'Unknown'}

TASK: Extract and analyze the following information from the user's input:

1. LOCATION: What specific location are they interested in? Look for:
   - City names, neighborhoods, regions
   - Country/region identifiers (NZ, UK, NYC, etc.)
   - Geographic references
   
2. PRIMARY INTERESTS: What are they most interested in? Categories like:
   - Food & Drink (cafes, restaurants, bars, pubs, food markets)
   - Sports & Recreation (football clubs, stadiums, sports venues)
   - Arts & Culture (galleries, street art, music venues, theaters)
   - History & Heritage (historical sites, museums, monuments)
   - Nature & Outdoors (parks, beaches, hiking trails)
   - Shopping & Local Business (markets, boutiques, local shops)
   - Nightlife & Entertainment (clubs, bars, live music)
   - Architecture & Landmarks (buildings, churches, unique structures)

3. TRANSPORTATION: What mode seems most appropriate?
   - Walking (short distances, urban exploration)
   - Cycling (medium distances, bike-friendly areas)
   - Driving (longer distances, multiple locations)

4. TOUR STYLE: What type of experience do they want?
   - Hidden gems and local secrets
   - Popular attractions and landmarks  
   - Cultural immersion
   - Active/adventure focused
   - Relaxed and leisurely

Respond in this EXACT JSON format:
{
  "location": "extracted location (e.g., 'North Shore, Auckland, New Zealand')",
  "country": "country name if identifiable",
  "primaryInterests": ["interest1", "interest2", "interest3"],
  "suggestedTransportation": "walking|cycling|driving",
  "tourStyle": "description of preferred tour style",
  "enhancedToggles": ["suggested toggle options based on interests"],
  "confidence": "high|medium|low",
  "reasoning": "brief explanation of your analysis"
}`

    try {
      // For development, use mock analysis if no API key
      if (this.shouldUseMockData()) {
        console.log('TourGenerator: Using mock context analysis')
        return this.generateMockContextAnalysis(dreamTourDescription, specificLocation, toggleOptions, userCountry)
      }

      console.log('TourGenerator: Making API call for context analysis')
      const chatHistory = [{ role: "user", parts: [{ text: analysisPrompt }] }]
      const payload = { contents: chatHistory }
      
      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        console.warn('Context analysis API call failed, using fallback')
        return this.generateMockContextAnalysis(dreamTourDescription, specificLocation, toggleOptions, userCountry)
      }

      const result = await response.json()
      
      if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
        const analysisText = result.candidates[0].content.parts[0].text
        console.log('TourGenerator: Raw AI analysis response:', analysisText)
        
        // Extract JSON from the response
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const contextAnalysis = JSON.parse(jsonMatch[0])
          console.log('TourGenerator: Parsed context analysis:', contextAnalysis)
          return contextAnalysis
        } else {
          console.warn('Could not extract JSON from AI response, using fallback')
          return this.generateMockContextAnalysis(dreamTourDescription, specificLocation, toggleOptions, userCountry)
        }
      } else {
        console.warn('Unexpected AI response structure, using fallback')
        return this.generateMockContextAnalysis(dreamTourDescription, specificLocation, toggleOptions, userCountry)
      }
    } catch (error) {
      console.error('Error in context analysis:', error)
      return this.generateMockContextAnalysis(dreamTourDescription, specificLocation, toggleOptions, userCountry)
    }
  }
  getEffectiveLocation(dreamTourDescription, specificLocation) {
    // First check if specific location is provided
    if (specificLocation && specificLocation.trim()) {
      return specificLocation.trim()
    }
    
    // Fall back to extracting from dream tour description
    return this._extractLocationFromDreamTour(dreamTourDescription)
  }
  _extractLocationFromDreamTour(dreamTour) {
    // Enhanced location extraction for freeform input
    const locationPatterns = [
      // Country/region abbreviations with locations (e.g., "North shore NZ", "Brooklyn NYC")
      /^([A-Z][a-zA-Z\s,'-]+?\s+(?:NZ|NYC|UK|USA|AU|CA|US))\s+/i,
      /^([A-Z][a-zA-Z\s,'-]+?\s+(?:New Zealand|Australia|United Kingdom|United States|Canada))\s+/i,
      
      // Location + country/region patterns
      /^([A-Z][a-zA-Z\s,'-]+?)\s+(?:NZ|NYC|UK|USA|AU|CA|US)\s+/i,
      /^([A-Z][a-zA-Z\s,'-]+?)\s+(?:New Zealand|Australia|United Kingdom|United States|Canada)\s+/i,
      
      // Direct location patterns (most common in freeform input)
      /^([A-Z][a-zA-Z\s,'-]+?)\s+(?:local|history|tour|walk|guide|experience|adventure)/i,
      /^([A-Z][a-zA-Z\s,'-]+?)\s+(?:hidden|secret|gems|spots|places)/i,
      /^([A-Z][a-zA-Z\s,'-]+?)\s+(?:food|cafe|coffee|restaurant|pub|bar)/i,
      /^([A-Z][a-zA-Z\s,'-]+?)\s+(?:art|street|culture|music|nightlife)/i,
      /^([A-Z][a-zA-Z\s,'-]+?)\s+(?:football|soccer|rugby|cricket|tennis|sports)/i,
      /^([A-Z][a-zA-Z\s,'-]+?)\s+(?:clubs|venues|stadiums|grounds)/i,
      
      // Preposition-based patterns
      /\bin\s+([A-Z][a-zA-Z\s,]+?)(?:\s|,|\.|\?|!|$)/g,
      /\bat\s+([A-Z][a-zA-Z\s,]+?)(?:\s|,|\.|\?|!|$)/g,
      /\baround\s+([A-Z][a-zA-Z\s,]+?)(?:\s|,|\.|\?|!|$)/g,
      /\bnear\s+([A-Z][a-zA-Z\s,]+?)(?:\s|,|\.|\?|!|$)/g,
      
      // Location at the end patterns
      /(?:tour|walk|guide|experience|adventure)\s+(?:of|in|around)\s+([A-Z][a-zA-Z\s,'-]+?)(?:\s|,|\.|\?|!|$)/i,
      
      // Simple capitalized word patterns (fallback)
      /^([A-Z][a-zA-Z\s,'-]{2,}?)(?:\s+(?:local|history|tour|walk|guide|experience|adventure|hidden|secret|gems|spots|places|food|cafe|coffee|restaurant|pub|bar|art|street|culture|music|nightlife))/i
    ]
    
    for (const pattern of locationPatterns) {
      const match = dreamTour.match(pattern)
      if (match) {
        let location = match[1]
        if (location) {
          // Clean up the location
          location = location.replace(/^(in|at|around|near|of)\s+/i, '').trim()
          location = location.replace(/[,\.!?]+$/, '').trim() // Remove trailing punctuation
          
          // Filter out very short matches and common words
          if (location.length > 2 && 
              !location.match(/^(the|a|an|my|your|our|their|this|that|some|many|few|local|history|tour|walk|guide|experience|adventure|hidden|secret|gems|spots|places|food|cafe|coffee|restaurant|pub|bar|art|street|culture|music|nightlife|football|soccer|rugby|cricket|tennis|sports|clubs|venues|stadiums|grounds)$/i)) {
            console.log('Extracted location from dream tour:', location)
            return location
          }
        }
      }
    }
    
    console.log('No location found in dream tour:', dreamTour)
    return null
  }

  createPrompt(dreamTourDescription, effectiveLocation, toggleOptions, tourLength, locationData, nearbyPlaces, userCountry = null, contextAnalysis = null) {
    // Determine tour parameters based on toggles
    const isBiking = toggleOptions.includes('biking')
    const isDriving = toggleOptions.includes('driving')
    const isWalking = toggleOptions.includes('walking')
    const includeCafe = toggleOptions.includes('cafe')
    const includePub = toggleOptions.includes('pub')
    const includeCelebs = toggleOptions.includes('celebs')
    const includeHistory = toggleOptions.includes('history')
    
    // Handle flexible vs fixed tour length
    let tourLengthGuidance = ''
    let numberOfStops = 5 // default
    let maxDistance = '2 km'
    let tourDuration = '90 minutes'
    
    if (tourLength === 'flexible') {
      tourLengthGuidance = 'FLEXIBLE LENGTH: Adapt the tour length naturally based on the content and location. Use your judgment for the optimal number of stops (typically 3-8) and duration that best serves the user\'s dream tour description.'
    } else {
      // Calculate based on slider value (1-10)
      numberOfStops = Math.max(3, Math.min(10, Math.round(2 + (tourLength * 0.8))))
      maxDistance = `${Math.round(1 + (tourLength * 0.5))} km`
      tourDuration = `${Math.round(45 + (tourLength * 15))} minutes`
      tourLengthGuidance = `FIXED LENGTH: Create exactly ${numberOfStops} stops with approximately ${tourDuration} duration and maximum ${maxDistance} total distance.`
    }
    
    // Determine transportation mode
    let transportation = 'walking'
    let transportationGuidance = ''
    
    if (isDriving) {
      transportation = 'driving'
      if (tourLength !== 'flexible') {
        maxDistance = `${Math.round(5 + (tourLength * 2))} km`
        tourDuration = `${Math.round(60 + (tourLength * 20))} minutes`
      }
      transportationGuidance = 'DRIVING TOUR: Design for car travel with parking considerations, longer distances between stops, and drive-by commentary.'
    } else if (isBiking) {
      transportation = 'cycling'
      if (tourLength !== 'flexible') {
        maxDistance = `${Math.round(3 + (tourLength * 1.2))} km`
        tourDuration = `${Math.round(50 + (tourLength * 12))} minutes`
      }
      transportationGuidance = 'CYCLING TOUR: Design for bicycle travel with bike-friendly routes, secure parking spots, and cycling-appropriate distances.'
    } else if (isWalking) {
      transportation = 'walking'
      transportationGuidance = 'WALKING TOUR: Design for pedestrian travel with comfortable walking distances and engaging street-level experiences.'
    } else {
      // No transportation mode selected - let AI decide based on context
      transportationGuidance = 'ADAPTIVE TRANSPORTATION: Choose the most appropriate transportation mode (walking, cycling, or driving) based on the user\'s dream tour description, location, and practical considerations.'
    }
    
    // Build content focus requirements
    let contentFocus = []
    if (includeCafe) {
      contentFocus.push('CAFÉ CULTURE: Include at least one exceptional local café as a dedicated stop, focusing on their specialty drinks, atmosphere, and role in the community.')
    }
    if (includePub) {
      contentFocus.push('PUB & BAR SCENE: Include at least one authentic local pub or bar as a dedicated stop, highlighting their atmosphere, local favorites, and social significance.')
    }
    if (includeCelebs) {
      contentFocus.push('CELEBRITY CONNECTIONS: Weave in stories of famous people, celebrities, and notable personalities connected to the locations, with specific names and their relationships to each place.')
    }
    if (includeHistory) {
      contentFocus.push('HISTORICAL DEPTH: Emphasize historical facts, hidden stories, and historical connections at each location, including specific dates and how the past influences the present.')
    }
    
    // Build content focus section
    const contentFocusSection = contentFocus.length > 0 
      ? `\n\nCONTENT FOCUS REQUIREMENTS:\n${contentFocus.map(focus => `- ${focus}`).join('\n')}`
      : ''
    
    // Build nearby places information for the prompt
    let nearbyPlacesInfo = ''
    if (nearbyPlaces && nearbyPlaces.length > 0) {
      nearbyPlacesInfo = `\n\nVERIFIED NEARBY PLACES (use these for accurate coordinates and Place IDs):\n`
      nearbyPlaces.forEach((place, index) => {
        const lat = typeof place.geometry.location.lat === 'function' 
          ? place.geometry.location.lat() 
          : place.geometry.location.lat
        const lng = typeof place.geometry.location.lng === 'function' 
          ? place.geometry.location.lng() 
          : place.geometry.location.lng
        
        nearbyPlacesInfo += `${index + 1}. ${place.name}\n`
        nearbyPlacesInfo += `   - Place ID: ${place.place_id}\n`
        nearbyPlacesInfo += `   - Coordinates: ${lat}, ${lng}\n`
        nearbyPlacesInfo += `   - Distance: ${place.distance}m from center\n`
        if (place.types && place.types.length > 0) {
          nearbyPlacesInfo += `   - Types: ${place.types.join(', ')}\n`
        }
        if (place.rating) {
          nearbyPlacesInfo += `   - Rating: ${place.rating}/5\n`
        }
        nearbyPlacesInfo += `\n`
      })
      
      nearbyPlacesInfo += `IMPORTANT: When selecting stops for your tour, prioritize using places from this verified list above. These have accurate coordinates and Google Place IDs that will display correctly on maps. If you must include a location not on this list, ensure you provide completely accurate, real coordinates and a valid Google Place ID.\n`
    }
    
    // Add country context if available
    const countryContext = userCountry ? ` Note: The user is currently in ${userCountry}, so focus on the ${effectiveLocation} in ${userCountry} specifically.` : ''
    
    // Add AI context analysis if available
    const aiContextSection = contextAnalysis ? `

AI CONTEXT ANALYSIS:
- Primary Interests Detected: ${contextAnalysis.primaryInterests.join(', ')}
- Tour Style: ${contextAnalysis.tourStyle}
- Suggested Transportation: ${contextAnalysis.suggestedTransportation}
- AI Reasoning: ${contextAnalysis.reasoning}
- Confidence Level: ${contextAnalysis.confidence}

IMPORTANT: Use this AI analysis to better understand the user's intent and tailor the tour accordingly. The detected interests should heavily influence your stop selection and content focus.` : ''
    
    return `You are an expert local tour guide renowned for creating immersive, authentic experiences that go beyond typical tourist attractions.

USER'S DREAM TOUR: "${dreamTourDescription}"
LOCATION: ${effectiveLocation} (coordinates: ${locationData.lat}, ${locationData.lng})${countryContext}${aiContextSection}

PRIMARY DIRECTIVE - CONTENT-FIRST APPROACH:
Your #1 priority is fulfilling the user's specific dream tour request: "${dreamTourDescription}"
- If they want "cake tour" - focus ENTIRELY on bakeries, patisseries, and cake shops, NOT castles or landmarks
- If they want "street art" - focus on murals, graffiti, artist studios, NOT museums or galleries
- If they want "music venues" - focus on live music bars, concert halls, record shops, NOT general entertainment
- If they want "hidden cafés" - focus on unique coffee experiences, NOT tourist café chains
- The user's specific interests ALWAYS take precedence over famous landmarks or obvious attractions
- Only include landmarks if they directly serve the user's stated interest (e.g., a castle with a famous bakery)

TOUR PARAMETERS:
${tourLengthGuidance}
${transportationGuidance}${contentFocusSection}

AUTHENTICITY & HIDDEN GEMS REQUIREMENTS:
- SERVE THE USER'S VISION FIRST: The user's dream tour description is your primary guide - everything else is secondary
- PRIORITIZE THEMATIC RELEVANCE: Every stop must directly relate to the user's stated interests
- AVOID GENERIC LANDMARKS: Skip famous sites unless they specifically serve the user's dream tour theme
- SEEK AUTHENTIC EXPERIENCES: Choose locations where real local life happens, not staged tourist experiences
- FIND THE UNTOLD STORIES: Every stop should reveal something most visitors never learn
- EMPHASIZE COMMUNITY CONNECTIONS: Include places that are meaningful to local residents
- DISCOVER THE UNEXPECTED: Look for surprising elements that challenge assumptions about the area

ROUTING REQUIREMENTS:
- CREATE A LOGICAL PATH: Plan stops in geographical order to minimize backtracking
- OPTIMIZE FOR TRANSPORTATION: Consider the chosen mode (walking/cycling/driving) when sequencing stops
- USE EFFICIENT ROUTING: If stops are A, B, C, D - route them as A→B→C→D, not A→C→B→D
- MINIMIZE TRAVEL TIME: Keep transitions between stops as short as practical
- CONSIDER NATURAL FLOW: Route should feel like a natural journey, not random jumping around
- REFERENCE COORDINATES: Use the provided coordinates from verified nearby places to plan optimal sequencing

CRITICAL TECHNICAL REQUIREMENTS:
- Every stop MUST have accurate coordinates (latitude, longitude) and valid Google Place ID
- Research real locations in ${effectiveLocation} - do not approximate or invent coordinates
- Use actual Google Place IDs that will work for photo retrieval${nearbyPlacesInfo}

TOUR CREATION APPROACH:
1. PRIORITIZE THE USER'S VISION: "${dreamTourDescription}" is your primary directive - build everything around this
2. FIND THEME-SPECIFIC LOCATIONS: Seek places that directly serve the user's stated interests, not general attractions
3. CREATE AUTHENTIC EXPERIENCES: Focus on genuine local culture, not tourist traps
4. TELL THEMATIC STORIES: Every stop should advance the user's specific dream tour theme
5. PROVIDE PRACTICAL VALUE: Include actionable tips, hidden gems, and local insights
6. PLAN EFFICIENT ROUTING: Sequence stops geographically to create a smooth, logical journey
7. DELIVER ON THE PROMISE: Ensure the tour fulfills exactly what the user requested in "${dreamTourDescription}"

CONTENT SELECTION PRIORITY ORDER:
1. Places that directly serve the user's dream tour theme (e.g., bakeries for "cake tour")
2. Local favorites and hidden gems within that theme
3. Authentic community spaces related to the theme
4. Supporting locations that enhance the thematic experience
5. NEVER: Generic tourist attractions unless they specifically serve the theme

Structure your response EXACTLY as follows:

**TOUR TITLE:** [Create an evocative title that captures the essence of "${dreamTourDescription}" in ${effectiveLocation}]
**DURATION:** [${tourLength === 'flexible' ? 'Flexible duration based on your pace and interests' : tourDuration}]
**DISTANCE:** [${tourLength === 'flexible' ? 'Comfortable distance for the chosen transportation mode' : maxDistance}]
**STARTING POINT:** [Name of starting location near ${locationData.formatted_address} - Brief description of where it is located and how to find it]

**INTRODUCTION:**
[Write a warm, engaging introduction that directly addresses the user's dream tour request. Start with acknowledgment: "You asked for '${dreamTourDescription}', and that's exactly what we're going to discover together in ${effectiveLocation}!" Connect their vision to what makes this location special. Use 'we' language throughout. Keep it concise but inspiring.]

**STOPS:**

${tourLength === 'flexible' ? '**Stop 1: [Location Name]**' : `**Stop 1: [Location Name]**`}
- **You Are Here:** [Describe exactly where to position yourself and what you should see. E.g., "You should be standing in front of the large red brick building with white columns. If you look to your right, you'll see the green park with the fountain. Behind you is the busy main street with the coffee shops."]
- **Description:** [Vivid, sensory-rich description that connects to the user's interests from "${dreamTourDescription}". Make the place come alive with specific details.]
- **Coordinates:** [latitude, longitude]
- **Google Place ID:** [Google Place ID]
- **The Hook:** [Connect this location to the user's dream tour interests with an intriguing question or revelation]

**Journey to Stop 2:**
[Brief description of what to notice during travel, connecting the narrative between stops]

${tourLength === 'flexible' ? '[Continue with additional stops as appropriate for the tour concept]' : `[Repeat format for all ${numberOfStops} stops]`}

**CONCLUSION:**
[Reflective wrap-up that circles back to the user's original dream tour request: "Your vision of '${dreamTourDescription}' has guided us to these meaningful encounters..." Connect the experience to their initial desires and provide suggestions for continuing the adventure.]

WRITING STYLE:
- Write as a passionate local who genuinely loves sharing hidden stories
- Use "we" language consistently - you're guiding a friend
- Create anticipation and curiosity between stops
- Balance informative content with conversational warmth
- Focus on authentic experiences over tourist attractions
- Make every detail serve the user's original vision from "${dreamTourDescription}"`
  }

  shouldUseMockData() {
    return !this.apiKey || this.apiKey === "YOUR_API_KEY_HERE"
  }

  generateMockTour(dreamTourDescription, effectiveLocation, toggleOptions, tourLength) {
    const isBiking = toggleOptions.includes('biking')
    const isDriving = toggleOptions.includes('driving')
    
    // Calculate based on tour length slider (1-10)
    let stops = Math.max(3, Math.min(10, Math.round(2 + (tourLength * 0.8))))
    let duration = Math.round(45 + (tourLength * 15))
    let distance = Math.round(1 + (tourLength * 0.5) * 10) / 10
    
    if (isDriving) {
      distance = Math.round((5 + (tourLength * 2)) * 10) / 10
      duration = Math.round(60 + (tourLength * 20))
    } else if (isBiking) {
      distance = Math.round((3 + (tourLength * 1.2)) * 10) / 10
      duration = Math.round(50 + (tourLength * 12))
    }
    
    return `**TOUR TITLE:** Your Dream Tour of ${effectiveLocation}

**DURATION:** ${duration} minutes

**DISTANCE:** ${distance.toFixed(1)} km

**STARTING POINT:** Central ${effectiveLocation} - Gateway to local discoveries

**NOTABLE STOPS:** Historic Square, Local Café, Hidden Garden, Community Hub, Scenic Viewpoint

**INTRODUCTION:**
You asked for "${dreamTourDescription}", and that's exactly what we're going to discover together in ${effectiveLocation}! We're embarking on a journey that will reveal the hidden character of this remarkable place while fulfilling your specific vision. As we walk these streets together, we'll uncover the experiences you're seeking - from authentic local encounters to the unique atmosphere that makes this community special. This tour is crafted specifically around your interests and will show you ${effectiveLocation} through the lens of your dreams. Get ready to experience exactly what you hoped for, plus some delightful surprises that even longtime residents might have missed.

**STOPS:**

**Stop 1: Historic Town Square**
- **Description:** Standing in this vibrant square, you're at the heart of ${location}'s social life. The weathered cobblestones beneath your feet have witnessed centuries of gatherings, celebrations, and daily life. Notice how the surrounding buildings create a natural amphitheater, their varied architectural styles telling the story of different eras. The old fountain in the center isn't just decorative – it was once the primary water source for the entire community, and locals still gather here during festivals and markets.
- **Coordinates:** [40.7589, -73.9851]
- **Pexels Photo ID:** 1591447
- **Hidden History:** This square was originally a marketplace where traveling merchants would set up their stalls. Local legend says that a famous writer once gave impromptu readings here, launching their career from these very stones.
- **Local Tip:** Visit early morning when the light hits the buildings just right, and you might catch the local baker setting up their outdoor display – their sourdough is legendary among residents.
- **Nearby Businesses:** Just steps away, Heritage Coffee Roasters serves single-origin beans (2-minute walk), while Vintage Books & Maps offers rare local history collections (across the square). The Artisan Bakery on the corner is famous for their morning pastries.

**Journey to Stop 2:**
As we leave the square, notice the narrow alleyway to your left. This was once the main thoroughfare before the modern roads were built. The worn grooves in the stone walls show where countless cart wheels once passed.

**Stop 2: The Corner Café**
- **Description:** This unassuming café is the neighborhood's living room, where conversations flow as freely as the coffee. The mismatched furniture and walls covered in local artwork create an atmosphere that's both cozy and inspiring. The owner knows everyone's usual order and serves as an unofficial community bulletin board. The aroma of freshly baked pastries mingles with the sound of animated discussions about everything from local politics to weekend plans.
- **Coordinates:** [40.7591, -73.9849]
- **Pexels Photo ID:** 302899
- **Hidden History:** This building was once a telegraph office, the communication hub of the community. The original brass fittings are still visible if you know where to look, hidden behind the modern coffee machine.
- **Local Tip:** Try their signature blend – it's roasted by a local artisan who sources beans directly from small farms. The owner is always happy to share the story behind each cup.
- **Nearby Businesses:** Next door, Handmade Pottery Studio offers ceramics classes (1-minute walk), while The Local Gallery features rotating exhibitions by neighborhood artists (3-minute walk). Green Thumb Plant Shop specializes in urban gardening supplies.

**CONCLUSION:**
Our journey through ${effectiveLocation} has brought your dream tour to life, revealing exactly the kind of experiences you were hoping for. From the historic square where generations have gathered to the cozy café where authentic local connections happen daily, we've discovered the heart of what makes this place special. Your vision of "${dreamTourDescription}" has guided us to these meaningful encounters and hidden gems. As you continue exploring ${effectiveLocation}, remember that the experiences you sought are all around you – every doorway, every corner, every friendly face has a story to tell. The real magic you were looking for isn't in the grand monuments but in these authentic moments that make this place uniquely special. Your dream tour has become reality – you're now part of its ongoing story.`
  }

  generateMockContextAnalysis(dreamTourDescription, specificLocation, toggleOptions, userCountry) {
    // Fallback logic that's smarter than regex but doesn't require API
    let location = specificLocation || null
    let country = userCountry || null
    let primaryInterests = []
    let enhancedToggles = [...toggleOptions]
    
    const description = dreamTourDescription.toLowerCase()
    
    // Extract location using improved logic
    if (!location) {
      // Look for common location patterns
      const locationPatterns = [
        /^([A-Z][a-zA-Z\s,'-]+?\s+(?:NZ|NYC|UK|USA|AU|CA|US))/i,
        /^([A-Z][a-zA-Z\s,'-]+?\s+(?:New Zealand|Australia|United Kingdom|United States|Canada))/i,
        /\bin\s+([A-Z][a-zA-Z\s,'-]+?)(?:\s|,|\.|\?|!|$)/i,
        /^([A-Z][a-zA-Z\s,'-]{2,}?)(?:\s+(?:football|soccer|rugby|cricket|tennis|sports|clubs|venues|stadiums|grounds|cafes|coffee|restaurants|pubs|bars|art|street|culture|music|nightlife|history|historical|heritage|parks|beaches|hiking|shopping|markets|boutiques))/i
      ]
      
      for (const pattern of locationPatterns) {
        const match = dreamTourDescription.match(pattern)
        if (match && match[1]) {
          location = match[1].trim()
          break
        }
      }
    }
    
    // Detect country from location
    if (location && !country) {
      if (location.includes('NZ') || location.toLowerCase().includes('new zealand')) {
        country = 'New Zealand'
      } else if (location.includes('NYC') || location.toLowerCase().includes('new york')) {
        country = 'United States'
      } else if (location.includes('UK') || location.toLowerCase().includes('united kingdom')) {
        country = 'United Kingdom'
      } else if (location.includes('AU') || location.toLowerCase().includes('australia')) {
        country = 'Australia'
      }
    }
    
    // Detect primary interests
    const interestMap = {
      'food': ['cafe', 'coffee', 'restaurant', 'food', 'dining', 'eat', 'bakery', 'market'],
      'sports': ['football', 'soccer', 'rugby', 'cricket', 'tennis', 'sports', 'clubs', 'stadium', 'ground'],
      'arts': ['art', 'gallery', 'street art', 'music', 'theater', 'culture', 'creative'],
      'history': ['history', 'historical', 'heritage', 'museum', 'monument', 'ancient'],
      'nightlife': ['pub', 'bar', 'nightlife', 'club', 'drinks', 'beer', 'wine'],
      'nature': ['park', 'beach', 'hiking', 'nature', 'outdoor', 'garden', 'trail']
    }
    
    for (const [interest, keywords] of Object.entries(interestMap)) {
      if (keywords.some(keyword => description.includes(keyword))) {
        primaryInterests.push(interest)
        
        // Add relevant toggles
        if (interest === 'food' && !enhancedToggles.includes('cafe')) {
          enhancedToggles.push('cafe')
        }
        if (interest === 'nightlife' && !enhancedToggles.includes('pub')) {
          enhancedToggles.push('pub')
        }
        if (interest === 'history' && !enhancedToggles.includes('history')) {
          enhancedToggles.push('history')
        }
      }
    }
    
    // Suggest transportation
    let suggestedTransportation = 'walking'
    if (description.includes('drive') || description.includes('car')) {
      suggestedTransportation = 'driving'
    } else if (description.includes('bike') || description.includes('cycle')) {
      suggestedTransportation = 'cycling'
    }
    
    return {
      location: location,
      country: country,
      primaryInterests: primaryInterests,
      suggestedTransportation: suggestedTransportation,
      tourStyle: primaryInterests.length > 0 ? `Focused on ${primaryInterests.join(', ')}` : 'General exploration',
      enhancedToggles: enhancedToggles,
      confidence: location ? 'medium' : 'low',
      reasoning: `Extracted location: "${location}", detected interests: ${primaryInterests.join(', ') || 'general'}`
    }
  }

}