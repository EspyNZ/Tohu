import { API_CONFIG } from './config.js'
import { PlacesService } from './places-service.js'

export class TourGenerator {
  constructor() {
    this.apiKey = API_CONFIG.gemini.apiKey
    this.apiUrl = API_CONFIG.gemini.apiUrl
    this.placesService = new PlacesService()
  }

  async generateTour(location, toggleOptions = [], tourLength = 5) {
    // First, get location coordinates and nearby places
    const locationData = await this.placesService.geocodeLocation(location)
    if (!locationData) {
      throw new Error('Could not find the specified location. Please check the address and try again.')
    }

    const centerLocation = `${locationData.lat},${locationData.lng}`
    const nearbyPlaces = await this.placesService.findInterestingPlaces(centerLocation)
    
    const prompt = this.createPrompt(location, toggleOptions, tourLength, locationData, nearbyPlaces)
    
    try {
      // For development, use mock data first
      if (this.shouldUseMockData()) {
        return {
          tourText: this.generateMockTour(location, toggleOptions, tourLength),
          prompt: prompt
        }
      }

      const chatHistory = [{ role: "user", parts: [{ text: prompt }] }]
      const payload = { contents: chatHistory }
      
      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`API error ${response.status} - ${errorData.error?.message || response.statusText}`)
      }

      const result = await response.json()

      if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
        return {
          tourText: result.candidates[0].content.parts[0].text,
          prompt: prompt
        }
      } else {
        throw new Error('Unexpected API response structure')
      }
    } catch (error) {
      console.error('Error generating tour:', error)
      throw error
    }
  }

  createPrompt(location, toggleOptions, tourLength, locationData, nearbyPlaces) {
    // Determine tour parameters based on toggles
    const isBiking = toggleOptions.includes('biking')
    const isDriving = toggleOptions.includes('driving')
    const includeCafe = toggleOptions.includes('cafe')
    const includePub = toggleOptions.includes('pub')
    const includeCelebs = toggleOptions.includes('celebs')
    const includeHistory = toggleOptions.includes('history')
    
    // Calculate number of stops and distance based on tour length slider (1-10)
    const numberOfStops = Math.max(3, Math.min(10, Math.round(2 + (tourLength * 0.8))))
    let maxDistance = `${Math.round(1 + (tourLength * 0.5))} km`
    let tourDuration = `${Math.round(45 + (tourLength * 15))} minutes`
    // Calculate number of stops and distance based on tour length slider (1-9)
    const numberOfStops = Math.max(3, Math.min(10, Math.round(2 + (tourLength * 0.9))))
    let maxDistance = `${Math.round(1 + (tourLength * 0.6))} km`
    let tourDuration = `${Math.round(45 + (tourLength * 17))} minutes`
    
    // Determine transportation mode
    let transportation = 'Walking'
    if (isDriving) {
      transportation = 'Driving'
      maxDistance = `${Math.round(5 + (tourLength * 2))} km`
      tourDuration = `${Math.round(60 + (tourLength * 20))} minutes`
      maxDistance = `${Math.round(5 + (tourLength * 2.5))} km`
      tourDuration = `${Math.round(60 + (tourLength * 22))} minutes`
    } else if (isBiking) {
      transportation = 'Bicycle'
      maxDistance = `${Math.round(3 + (tourLength * 1.2))} km`
      tourDuration = `${Math.round(50 + (tourLength * 12))} minutes`
      maxDistance = `${Math.round(3 + (tourLength * 1.5))} km`
      tourDuration = `${Math.round(50 + (tourLength * 14))} minutes`
    }
    
    // Build special requirements text
    let specialRequirements = ''
    if (includeCafe) {
      specialRequirements += '\n- MANDATORY: Include at least one highly-rated local café as a stop, with details about their specialty drinks or food.'
    }
    if (includePub) {
      specialRequirements += '\n- MANDATORY: Include at least one highly-rated local pub or bar as a stop, with details about their atmosphere and local favorites.'
    }
    if (includeCelebs) {
      specialRequirements += '\n- MANDATORY: Research and mention any famous people, celebrities, historical figures, or notable personalities connected to each location. Include specific names and their connection to the place.'
    }
    if (includeHistory) {
      specialRequirements += '\n- MANDATORY: Emphasize historical facts, hidden history, and historical stories at each location. Include specific dates, historical events, and how the past connects to the present.'
    }
    if (isDriving) {
      specialRequirements += '\n- MANDATORY: This is a DRIVING tour. Mention parking availability, driving routes between stops, and any driving-specific considerations. Stops should be accessible by car with nearby parking.'
    } else if (isBiking) {
      specialRequirements += '\n- MANDATORY: This is a BIKING tour. Mention bike-friendly routes, where to park bikes safely, and any cycling-specific considerations. Adjust distances and timing for cycling pace.'
    }
    
    return `You are a local tour guide with loads of amazing reviews on your ability to create fun, immersive local tours.

CRITICAL REQUIREMENT: For every single stop in this tour, you MUST provide accurate coordinates (latitude, longitude) and a valid Google Place ID. These are essential for displaying images and maps. Research real locations in ${location} and use their actual coordinates and Google Place IDs. Do not make up or approximate these values.

Create a detailed ${transportation.toLowerCase()} tour guide for "${location}" (coordinates: ${locationData.lat}, ${locationData.lng}) with exactly ${numberOfStops} stops.

TOUR CONSTRAINTS:
- Maximum total distance: ${maxDistance}
- Target duration: ${tourDuration}
- Transportation: ${transportation}${specialRequirements}

BUSINESS RECOMMENDATIONS REQUIREMENT:
For each stop, research and mention 2-3 highly-rated nearby businesses such as:
- Local cafés and coffee shops with their specialties
- Art galleries, bookstores, or cultural venues
- Unique local shops or boutiques
- Restaurants with local cuisine
- Markets or food vendors
Include specific names, what they're known for, and approximate walking distance from the stop.

Structure your response EXACTLY as follows:

**TOUR TITLE:** [Create an evocative title]
**DURATION:** [Target: ${tourDuration}]
**DISTANCE:** [Maximum: ${maxDistance}]
**STARTING POINT:** [Name of starting location near ${locationData.formatted_address} - Brief description of where it is located and how to find it]

**INTRODUCTION:**
[Write a warm, engaging 150-200 word introduction that sets the scene and promises discovery. Use 'we' language, like a local showing a friend around. Start with a compelling hook - a question, surprising fact, or intriguing promise. Paint a picture of what makes this particular route special and hint at the unexpected stories you'll share. End with clear expectations about pace, duration, and what to bring.]

**STOPS:**

**Stop 1: [Location Name]**
- **You Are Here:** [Describe exactly where to position yourself and what you should see. E.g., "You should be standing in front of the large red brick building with white columns. If you look to your right, you'll see the green park with the fountain. Behind you is the busy main street with the coffee shops."]
- **Description:** [100-150 words of vivid, sensory-rich storytelling. Make the place come alive with specific architectural details, atmosphere, sounds, smells, or visual elements.]
- **Coordinates:** [latitude, longitude]
- **Google Place ID:** [Google Place ID]
- **The Hook:** [Start with an intriguing question, surprising revelation, or "Wait until you hear this..." moment that immediately grabs attention and makes people want to know more.]
- **Fascinating Facts:** [2-3 specific, lesser-known facts about this location - could be historical, architectural, cultural, or statistical. Include dates, numbers, or specific details that bring the place to life.]
- **Stories & Voices:** [Include a compelling anecdote, local legend, or actual quote from a historical figure, resident, or visitor connected to this place. If using a quote, attribute it properly.]
- **Hidden History:** [Dig deeper into one significant historical event, transformation, or mystery connected to this spot.]
- **Interactive Moment:** [Give people something to do, look for, or notice. E.g., "Look up at the third window on the left - see that crack? That's from..." or "Touch the wall here and feel how..." or "Listen for the echo when you clap here."]
- **Local Tip:** [Food, drink, shortcut, timing, or experience only locals know - be specific about names, prices, or exact locations.]
- **Photo Op:** [Suggest the best angle, time of day, or hidden vantage point for photos. Include what to frame and why this shot tells the story.]
- **Nearby Businesses:** [List 2-3 highly-rated nearby businesses with names, specialties, and walking distance. E.g., "Just 2 minutes away, Artisan Coffee Co. serves the city's best flat whites, while Gallery 42 (across the street) showcases emerging local artists."]
- **Walking Directions to Stop 2:** [Specific step-by-step directions. Include: crossing streets, which direction to walk, landmarks to pass, estimated time (e.g., "We're taking a quick 5-minute walk"), and exactly where to stop (e.g., "Stop when you reach the row of brick houses with the blue doors").]

**Journey to Stop 2:**
[50-100 words describing what you'll experience during the walk. Mention interesting sights, sounds, or neighborhood character you'll encounter along the way, and why this route connects the stories of both stops. Include a "walking question" to keep people engaged - something to ponder or look for during the journey.]

**Stop 2: [Location Name]**
[Repeat format for all ${numberOfStops} stops]

**CONCLUSION:**
[100-150 word reflective wrap-up that ties the experience together. Highlight how the locations and stories connect thematically or historically. Include a "parting gift" - one final surprising detail or local secret. End with specific suggestions for continuing the adventure: where to eat nearby, related neighborhoods to explore, or upcoming local events that connect to the tour themes.]

**Route Optimization Guidelines:**
- Plan the stops as a logical walking circuit (A→B→C→D) with minimal backtracking
- Consider geographic clusters: if 2-3 locations are within a block of each other, visit them consecutively
- Prefer routes that flow naturally with the city's layout (following main streets, waterfront, etc.)
- End at a meaningful location - either loop back near the start or conclude at a significant final destination
- Calculate walking times between stops and mention if any segment is longer than 10 minutes
- Account for elevation changes, stairs, or challenging terrain in your route planning

**Engagement & Interactivity Guidelines:**
- Start each stop with a hook that creates immediate curiosity or surprise
- Include interactive elements that engage multiple senses (touch, sound, smell, observation)
- Provide "walking questions" between stops to maintain engagement and anticipation
- Suggest specific photo opportunities that capture the story, not just the place
- Create moments of discovery rather than just information delivery
- Use cliffhangers: "But that's not the most surprising part - wait until we get to..."

**Content Enrichment Requirements:**
- Include at least 2 specific numerical facts per stop (dates, measurements, quantities, etc.)
- Weave in quotes from historical figures, local residents, or notable visitors when possible
- Reference specific architectural styles, building materials, or design elements
- Mention seasonal variations, best times to visit, or lighting conditions
- Include cross-references between stops when stories or themes connect

**Walking Direction Guidelines:**
- Provide step-by-step directions using landmarks and visual cues, not just street names
- Include timing estimates for each segment (e.g., "a quick 3-minute walk" or "about 8 minutes")
- Specify exactly where to stop using clear visual markers
- Mention any street crossings, traffic lights, or safety considerations
- Use relative directions based on how the person is positioned at each stop

**Tone Guidelines:**
- Write like a passionate storyteller who genuinely loves this place and wants to share its secrets
- Use "we" and "our" language consistently ("we'll discover," "our next stop")
- Create anticipation and curiosity with questions like "But guess what happened next?" or "You'd never know that..."
- Share personal insights and observations as if you've walked this route countless times
- Include gentle humor, surprising observations, and "insider knowledge" moments
- Balance informative content with conversational warmth and genuine enthusiasm
- Avoid tourist-trap language - focus on authentic, lived-in experiences
- Use present tense to make stories feel immediate and alive

**Location Selection Criteria:**
- Prioritize places with rich stories over conventionally "pretty" spots
- Mix different sensory experiences: places to taste, touch, hear, smell, and see
- Include at least one "hidden gem" that even locals might not know about
- Feature diverse perspectives and stories (not just dominant historical narratives)
- Ensure accessibility considerations are mentioned when relevant
- Choose locations that connect thematically - each stop should build on the previous one
- Include "living history" - places where the past still impacts the present day

**Photo Guidelines:**
- If a location has a Google Place ID, we can use Google Places photos
- Focus on locations that will have good visual documentation available
- Choose stops that show unique architectural details, local life, or distinctive features
- Ensure photo selections complement the storytelling and help visualize the experience`
  }

  shouldUseMockData() {
    return !this.apiKey || this.apiKey === "YOUR_API_KEY_HERE"
  }

  generateMockTour(location, toggleOptions, tourLength) {
    const isBiking = toggleOptions.includes('biking')
    const isDriving = toggleOptions.includes('driving')
    
    // Calculate based on tour length slider (1-10)
    let stops = Math.max(3, Math.min(10, Math.round(2 + (tourLength * 0.8))))
    let duration = Math.round(45 + (tourLength * 15))
    let distance = Math.round(1 + (tourLength * 0.5) * 10) / 10
    // Calculate based on tour length slider (1-9)
    let stops = Math.max(3, Math.min(10, Math.round(2 + (tourLength * 0.9))))
    let duration = Math.round(45 + (tourLength * 17))
    let distance = Math.round(1 + (tourLength * 0.6) * 10) / 10
    
    if (isDriving) {
      distance = Math.round((5 + (tourLength * 2)) * 10) / 10
      duration = Math.round(60 + (tourLength * 20))
      distance = Math.round((5 + (tourLength * 2.5)) * 10) / 10
      duration = Math.round(60 + (tourLength * 22))
    } else if (isBiking) {
      distance = Math.round((3 + (tourLength * 1.2)) * 10) / 10
      duration = Math.round(50 + (tourLength * 12))
      distance = Math.round((3 + (tourLength * 1.5)) * 10) / 10
      duration = Math.round(50 + (tourLength * 14))
    }
    
    return `**TOUR TITLE:** Hidden Stories of ${location}

**DURATION:** ${duration} minutes

**DISTANCE:** ${distance.toFixed(1)} km

**STARTING POINT:** Central ${location} - Gateway to local discoveries

**NOTABLE STOPS:** Historic Square, Local Café, Hidden Garden, Community Hub, Scenic Viewpoint

**INTRODUCTION:**
Welcome to ${location}, where every corner holds a story waiting to be discovered! We're embarking on a journey that will reveal the hidden character of this remarkable place. As we walk these streets together, we'll uncover tales of local heroes, secret histories, and the everyday magic that makes this community special. From bustling markets to quiet corners where time seems to stand still, this tour will show you ${location} through the eyes of those who call it home. Get ready to see familiar places in entirely new ways and discover gems that even longtime residents might have missed.

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
Our journey through ${location} reveals how a place becomes more than just buildings and streets – it becomes a living story written by everyone who calls it home. From the historic square where generations have gathered to the cozy café where new friendships bloom daily, we've seen how community spirit transforms ordinary spaces into extraordinary places. As you continue exploring ${location}, remember that every doorway, every corner, every friendly face has a story to tell. The real magic isn't in the grand monuments but in the daily rhythms of life that make this place uniquely special. Welcome to the neighborhood – you're now part of its ongoing story.`
  }
}