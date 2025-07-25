export class TourGenerator {
  constructor() {
    this.apiKey = "AIzaSyC6SsNshtIswEOiUVKTs1ZqRGdR9fOWx4s"
    this.apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
  }

  async generateTour(location, numberOfStops) {
    const prompt = this.createPrompt(location, numberOfStops)
    
    try {
      // For development, use mock data first
      if (this.shouldUseMockData()) {
        return {
          tourText: this.generateMockTour(location, numberOfStops),
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

  createPrompt(location, numberOfStops) {
    return `You are a local tour guide with loads of amazing reviews on your ability to create fun, immersive local tours.

Create a detailed walking tour guide for "${location}" with exactly ${numberOfStops} stops. Structure your response EXACTLY as follows:

**TOUR TITLE:** [Create an evocative title]
**DURATION:** [e.g., "90 minutes"]
**DISTANCE:** [e.g., "2.5 km"]
**STARTING POINT:** [Name and brief description]
**NOTABLE STOPS:** [List the ${numberOfStops} main stops, ordered to follow a logical walking path with minimal backtracking]

**INTRODUCTION:**
[Write a warm, engaging 150-200 word introduction that sets the scene and promises discovery. Use 'we' language, like a local showing a friend around. Start with a compelling hook - a question, surprising fact, or intriguing promise. Paint a picture of what makes this particular route special and hint at the unexpected stories you'll share. End with clear expectations about pace, duration, and what to bring.]

**STOPS:**

**Stop 1: [Location Name]**
- **You Are Here:** [Describe exactly where to position yourself and what you should see. E.g., "You should be standing in front of the large red brick building with white columns. If you look to your right, you'll see the green park with the fountain. Behind you is the busy main street with the coffee shops."]
- **You Are Here:** [Describe exactly where to position yourself and what you should see. E.g., "You should be standing in front of the large red brick building with white columns. If you look to your right, you'll see the green park with the fountain. Behind you is the busy main street with the coffee shops."]
- **Description:** [100-150 words of vivid, sensory-rich storytelling. Make the place come alive with specific architectural details, atmosphere, sounds, smells, or visual elements.]
- **Coordinates:** [latitude, longitude]
- **Pexels Photo ID:** [Specific, realistic photo ID that matches this scene]
- **The Hook:** [Start with an intriguing question, surprising revelation, or "Wait until you hear this..." moment that immediately grabs attention and makes people want to know more.]
- **Fascinating Facts:** [2-3 specific, lesser-known facts about this location - could be historical, architectural, cultural, or statistical. Include dates, numbers, or specific details that bring the place to life.]
- **Stories & Voices:** [Include a compelling anecdote, local legend, or actual quote from a historical figure, resident, or visitor connected to this place. If using a quote, attribute it properly.]
- **Hidden History:** [Dig deeper into one significant historical event, transformation, or mystery connected to this spot.]
- **Interactive Moment:** [Give people something to do, look for, or notice. E.g., "Look up at the third window on the left - see that crack? That's from..." or "Touch the wall here and feel how..." or "Listen for the echo when you clap here."]
- **Local Tip:** [Food, drink, shortcut, timing, or experience only locals know - be specific about names, prices, or exact locations.]
- **Photo Op:** [Suggest the best angle, time of day, or hidden vantage point for photos. Include what to frame and why this shot tells the story.]
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
- Use specific Pexels Photo IDs that capture the authentic mood and character of each location
- Favor atmospheric, candid imagery over generic stock photos
- Choose photos that show unique architectural details, local life, or distinctive features
- Ensure photo selections complement the storytelling and help visualize the experience`
  }

  shouldUseMockData() {
    return !this.apiKey || this.apiKey === "YOUR_API_KEY_HERE"
  }

  generateMockTour(location, stops) {
    return `**TOUR TITLE:** Hidden Stories of ${location}

**DURATION:** ${60 + (stops * 15)} minutes

**DISTANCE:** ${(stops * 0.4).toFixed(1)} km

**STARTING POINT:** Central ${location} - Gateway to local discoveries

**NOTABLE STOPS:** Historic Square, Local Café, Hidden Garden, Community Hub, Scenic Viewpoint

**INTRODUCTION:**
Welcome to ${location}, where every corner holds a story waiting to be discovered! We're embarking on a journey that will reveal the hidden character of this remarkable place. As we walk these streets together, we'll uncover tales of local heroes, secret histories, and the everyday magic that makes this community special. From bustling markets to quiet corners where time seems to stand still, this tour will show you ${location} through the eyes of those who call it home. Get ready to see familiar places in entirely new ways and discover gems that even longtime residents might have missed.

**STOPS:**

**Stop 1: Historic Town Square**
- **Description:** Standing in this vibrant square, you're at the heart of ${location}'s social life. The weathered cobblestones beneath your feet have witnessed centuries of gatherings, celebrations, and daily life. Notice how the surrounding buildings create a natural amphitheater, their varied architectural styles telling the story of different eras. The old fountain in the center isn't just decorative – it was once the primary water source for the entire community, and locals still gather here during festivals and markets.
- **Coordinates:** [40.7589, -73.9851]
- **Pexels Photo ID:** 1591447
- **The Hook:** [Start with an intriguing question, surprising revelation, or "Wait until you hear this..." moment that immediately grabs attention and makes people want to know more.]
- **Fascinating Facts:** [2-3 specific, lesser-known facts about this location - could be historical, architectural, cultural, or statistical. Include dates, numbers, or specific details that bring the place to life.]
- **Stories & Voices:** [Include a compelling anecdote, local legend, or actual quote from a historical figure, resident, or visitor connected to this place. If using a quote, attribute it properly.]
- **Hidden History:** [Interesting historical detail, anecdote, or legend]
- **Interactive Moment:** [Give people something to do, look for, or notice. E.g., "Look up at the third window on the left - see that crack? That's from..." or "Touch the wall here and feel how..." or "Listen for the echo when you clap here."]
- **Local Tip:** [Food, drink, shortcut, or experience only locals know]
- **Photo Op:** [Suggest the best angle, time of day, or hidden vantage point for photos. Include what to frame and why this shot tells the story.]
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

Photo Guidelines:
- Avoid generic stock photos that could apply to any location - be specific to the place's character

CRITICAL: Use highly specific and relevant Pexels Photo IDs that closely match the actual location type and atmosphere. For example:
  * For cafés: Use IDs showing cozy café interiors, coffee culture, or local dining scenes
  * For historic buildings: Use IDs of architectural details, heritage structures, or period buildings
  * For parks/gardens: Use IDs of green spaces, walking paths, or natural settings
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
  }
- **Pexels Photo ID:** 161154
- **Hidden History:** This square was originally a marketplace where traveling merchants would set up their stalls. Local legend says that a famous writer once gave impromptu readings here, launching their career from these very stones.
- **Local Tip:** Visit early morning when the light hits the buildings just right, and you might catch the local baker setting up their outdoor display – their sourdough is legendary among residents.

  }
}
  }
}
  }
}
  }
}