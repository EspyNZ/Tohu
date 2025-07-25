(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))s(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const n of i.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&s(n)}).observe(document,{childList:!0,subtree:!0});function t(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerPolicy&&(i.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?i.credentials="include":o.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(o){if(o.ep)return;o.ep=!0;const i=t(o);fetch(o.href,i)}})();class c{constructor(){this.apiKey="AIzaSyC6SsNshtIswEOiUVKTs1ZqRGdR9fOWx4s",this.apiUrl="https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"}async generateTour(e,t){const s=this.createPrompt(e,t);try{if(this.shouldUseMockData())return{tourText:this.generateMockTour(e,t),prompt:s};const i={contents:[{role:"user",parts:[{text:s}]}]},n=await fetch(`${this.apiUrl}?key=${this.apiKey}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(i)});if(!n.ok){const l=await n.json();throw new Error(`API error ${n.status} - ${l.error?.message||n.statusText}`)}const a=await n.json();if(a.candidates?.[0]?.content?.parts?.[0]?.text)return{tourText:a.candidates[0].content.parts[0].text,prompt:s};throw new Error("Unexpected API response structure")}catch(o){throw console.error("Error generating tour:",o),o}}createPrompt(e,t){return`You are a local tour guide with loads of amazing reviews on your ability to create fun, immersive local tours.

Create a detailed walking tour guide for "${e}" with exactly ${t} stops. Structure your response EXACTLY as follows:

**TOUR TITLE:** [Create an evocative title]
**DURATION:** [e.g., "90 minutes"]
**DISTANCE:** [e.g., "2.5 km"]
**STARTING POINT:** [Name and brief description]
**NOTABLE STOPS:** [List the ${t} main stops, ordered to follow a logical walking path with minimal backtracking]

**INTRODUCTION:**
[Write a warm, engaging 150-200 word introduction that sets the scene and promises discovery. Use 'we' language, like a local showing a friend around. Start with a compelling hook - a question, surprising fact, or intriguing promise. Paint a picture of what makes this particular route special and hint at the unexpected stories you'll share. End with clear expectations about pace, duration, and what to bring.]

**STOPS:**

**Stop 1: [Location Name]**
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
[Repeat format for all ${t} stops]

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
- Ensure photo selections complement the storytelling and help visualize the experience`}shouldUseMockData(){return!this.apiKey||this.apiKey==="YOUR_API_KEY_HERE"}generateMockTour(e,t){return`**TOUR TITLE:** Hidden Stories of ${e}

**DURATION:** ${60+t*15} minutes

**DISTANCE:** ${(t*.4).toFixed(1)} km

**STARTING POINT:** Central ${e} - Gateway to local discoveries

**NOTABLE STOPS:** Historic Square, Local Café, Hidden Garden, Community Hub, Scenic Viewpoint

**INTRODUCTION:**
Welcome to ${e}, where every corner holds a story waiting to be discovered! We're embarking on a journey that will reveal the hidden character of this remarkable place. As we walk these streets together, we'll uncover tales of local heroes, secret histories, and the everyday magic that makes this community special. From bustling markets to quiet corners where time seems to stand still, this tour will show you ${e} through the eyes of those who call it home. Get ready to see familiar places in entirely new ways and discover gems that even longtime residents might have missed.

**STOPS:**

**Stop 1: Historic Town Square**
- **Description:** Standing in this vibrant square, you're at the heart of ${e}'s social life. The weathered cobblestones beneath your feet have witnessed centuries of gatherings, celebrations, and daily life. Notice how the surrounding buildings create a natural amphitheater, their varied architectural styles telling the story of different eras. The old fountain in the center isn't just decorative – it was once the primary water source for the entire community, and locals still gather here during festivals and markets.
- **Coordinates:** [40.7589, -73.9851]
- **Pexels Photo ID:** 1591447
- **Hidden History:** This square was originally a marketplace where traveling merchants would set up their stalls. Local legend says that a famous writer once gave impromptu readings here, launching their career from these very stones.
- **Local Tip:** Visit early morning when the light hits the buildings just right, and you might catch the local baker setting up their outdoor display – their sourdough is legendary among residents.

**Journey to Stop 2:**
As we leave the square, notice the narrow alleyway to your left. This was once the main thoroughfare before the modern roads were built. The worn grooves in the stone walls show where countless cart wheels once passed.

**Stop 2: The Corner Café**
- **Description:** This unassuming café is the neighborhood's living room, where conversations flow as freely as the coffee. The mismatched furniture and walls covered in local artwork create an atmosphere that's both cozy and inspiring. The owner knows everyone's usual order and serves as an unofficial community bulletin board. The aroma of freshly baked pastries mingles with the sound of animated discussions about everything from local politics to weekend plans.
- **Coordinates:** [40.7591, -73.9849]
- **Pexels Photo ID:** 302899
- **Hidden History:** This building was once a telegraph office, the communication hub of the community. The original brass fittings are still visible if you know where to look, hidden behind the modern coffee machine.
- **Local Tip:** Try their signature blend – it's roasted by a local artisan who sources beans directly from small farms. The owner is always happy to share the story behind each cup.

**CONCLUSION:**
Our journey through ${e} reveals how a place becomes more than just buildings and streets – it becomes a living story written by everyone who calls it home. From the historic square where generations have gathered to the cozy café where new friendships bloom daily, we've seen how community spirit transforms ordinary spaces into extraordinary places. As you continue exploring ${e}, remember that every doorway, every corner, every friendly face has a story to tell. The real magic isn't in the grand monuments but in the daily rhythms of life that make this place uniquely special. Welcome to the neighborhood – you're now part of its ongoing story.`}}class h{parse(e){const t={title:"",duration:"",distance:"",startingPoint:"",notableStops:[],introduction:"",stops:[],journeys:[],conclusion:""};try{t.title=this.extractField(e,"TOUR TITLE")||"Hidden Gems Tour",t.duration=this.extractField(e,"DURATION")||"N/A",t.distance=this.extractField(e,"DISTANCE")||"N/A",t.startingPoint=this.extractField(e,"STARTING POINT")||"N/A";const s=this.extractField(e,"NOTABLE STOPS");s&&(t.notableStops=s.split(",").map(o=>o.trim())),t.introduction=this.extractSection(e,"INTRODUCTION","STOPS")||"Welcome to this hidden gems tour!",t.conclusion=this.extractSection(e,"CONCLUSION")||"Thank you for joining this hidden gems tour!",t.stops=this.parseStops(e),t.journeys=this.parseJourneys(e)}catch(s){throw console.error("Error parsing tour content:",s),new Error(`Failed to parse tour content: ${s.message}`)}return t}extractField(e,t){const s=new RegExp(`\\*\\*${t}:\\*\\*\\s*(.+)`,"i"),o=e.match(s);return o?o[1].trim():null}extractSection(e,t,s=null){let o;s?o=new RegExp(`\\*\\*${t}:\\*\\*\\s*([\\s\\S]+?)(?=\\*\\*${s}:\\*\\*)`,"i"):o=new RegExp(`\\*\\*${t}:\\*\\*\\s*([\\s\\S]+?)$`,"i");const i=e.match(o);return i?i[1].trim():null}parseStops(e){const t=[],s=/\*\*Stop (\d+): ([^*]+)\*\*\s*([\s\S]*?)(?=\*\*(?:Stop \d+:|Journey to Stop \d+:|CONCLUSION:)|$)/gi;let o;for(;(o=s.exec(e))!==null;){const i={number:parseInt(o[1]),name:o[2].trim(),description:"",coordinates:null,pexelsPhotoId:null,hiddenHistory:"",localTip:""},n=o[3].trim();i.description=this.extractStopDetail(n,"Description"),i.pexelsPhotoId=this.extractStopDetail(n,"Pexels Photo ID"),i.youAreHere=this.extractStopDetail(n,"You Are Here"),i.theHook=this.extractStopDetail(n,"The Hook"),i.fascinatingFacts=this.extractStopDetail(n,"Fascinating Facts"),i.storiesVoices=this.extractStopDetail(n,"Stories & Voices"),i.interactiveMoment=this.extractStopDetail(n,"Interactive Moment"),i.photoOp=this.extractStopDetail(n,"Photo Op"),i.hiddenHistory=this.extractStopDetail(n,"Hidden History"),i.localTip=this.extractStopDetail(n,"Local Tip"),i.coordinates=this.extractCoordinates(n),t.push(i)}return t}parseJourneys(e){const t=[],s=/\*\*Journey to Stop (\d+):\*\*\s*([\s\S]*?)(?=\*\*Stop \d+:|$)/gi;let o;for(;(o=s.exec(e))!==null;)t.push({toStop:parseInt(o[1]),description:o[2].trim()});return t}extractStopDetail(e,t){const s=new RegExp(`- \\*\\*${t}:\\*\\*\\s*([^-]+)`,"i"),o=e.match(s);return o?o[1].trim():""}extractCoordinates(e){const t=e.match(/- \*\*Coordinates:\*\*\s*\[([^,]+),\s*([^\]]+)\]/i);return t?{latitude:parseFloat(t[1].trim()),longitude:parseFloat(t[2].trim())}:null}}class d{constructor(){this.bindElements()}bindElements(){this.elements={tourTitle:document.getElementById("tourTitle"),summaryDuration:document.getElementById("summaryDuration"),summaryDistance:document.getElementById("summaryDistance"),summaryStartingPoint:document.getElementById("summaryStartingPoint"),summaryNotableStops:document.getElementById("summaryNotableStops"),tourIntro:document.getElementById("tourIntro"),tourStopsContainer:document.getElementById("tourStopsContainer"),tourConclusion:document.getElementById("tourConclusion")}}render(e){this.renderHeader(e),this.renderSummary(e),this.renderIntroduction(e),this.renderStops(e),this.renderConclusion(e)}renderHeader(e){this.elements.tourTitle.textContent=e.title}renderSummary(e){this.elements.summaryDuration.textContent=e.duration,this.elements.summaryDistance.textContent=e.distance,this.elements.summaryStartingPoint.textContent=e.startingPoint,this.elements.summaryNotableStops.innerHTML="",e.notableStops.forEach(t=>{const s=document.createElement("li");s.textContent=t,this.elements.summaryNotableStops.appendChild(s)})}renderIntroduction(e){this.elements.tourIntro.textContent=e.introduction}renderStops(e){this.elements.tourStopsContainer.innerHTML="",e.stops.forEach((t,s)=>{this.renderTourStop(t);const o=e.journeys.find(i=>i.toStop===t.number+1);o&&this.renderJourneyBetweenStops(o.description)})}renderTourStop(e){const t=document.createElement("div");t.className="tour-stop";const s=e.pexelsPhotoId||"2387873",o=`https://images.pexels.com/photos/${s}/pexels-photo-${s}.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop`,i="https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop";t.innerHTML=`
      <div class="tour-stop-number">${e.number}</div>
      <h3 class="ml-10">${e.name||"Unknown Location"}</h3>
      <div class="tour-stop-content">
        ${e.youAreHere?`<div class="you-are-here"><div class="section-icon">📍</div><div class="section-title">You Are Here</div><p>${e.youAreHere}</p></div>`:""}
        <img src="${o}" alt="View of ${e.name}" class="tour-image" 
             onerror="this.onerror=null;this.src='${i}';">
        <p class="mt-4 text-gray-800">${e.description||""}</p>
        ${this.renderStorySection(e)}
        ${e.fascinatingFacts?`<div class="fascinating-facts"><div class="section-icon">💡</div><div class="section-title">Fascinating Facts</div><div class="facts-content">${this.formatFacts(e.fascinatingFacts)}</div></div>`:""}
        ${e.hiddenHistory?`<div class="tour-detail-heading">Hidden History</div><p class="tour-detail-content">${e.hiddenHistory}</p>`:""}
        ${this.renderCaptureTheMomentSection(e)}
        ${e.localTip?`<div class="tour-detail-heading">Local Tip</div><p class="tour-detail-content">${e.localTip}</p>`:""}
        ${e.coordinates?this.renderMapLink(e):""}
      </div>
    `,this.elements.tourStopsContainer.appendChild(t)}renderStorySection(e){const t=e.theHook&&e.theHook.trim(),s=e.storiesVoices&&e.storiesVoices.trim();if(!t&&!s)return"";let o="";return t&&(o+=`<p class="hook-content">${e.theHook}</p>`),s&&(o+=`<blockquote class="stories-content">${e.storiesVoices}</blockquote>`),`<div class="story-section"><div class="section-icon">📖</div><div class="section-title">The Story</div>${o}</div>`}renderCaptureTheMomentSection(e){const t=e.interactiveMoment&&e.interactiveMoment.trim(),s=e.photoOp&&e.photoOp.trim();if(!t&&!s)return"";let o="";return t&&(o+=`<div class="interactive-content"><strong>Experience:</strong> ${e.interactiveMoment}</div>`),s&&(o+=`<div class="photo-content"><strong>Photo Opportunity:</strong> ${e.photoOp}</div>`),`<div class="capture-moment-section"><div class="section-icon">📸</div><div class="section-title">Capture the Moment</div>${o}</div>`}formatFacts(e){let t=[];return e.includes("•")?t=e.split("•").filter(s=>s.trim()).map(s=>s.trim()):e.includes("- ")?t=e.split(/- /).filter(s=>s.trim()).map(s=>s.trim()):e.includes(`
`)?t=e.split(`
`).filter(s=>s.trim()).map(s=>s.trim().replace(/^[-•]\s*/,"")):t=e.split(/\.(?=\s[A-Z])/).filter(s=>s.trim()).map(s=>{const o=s.trim();return o.endsWith(".")?o:o+"."}),t=t.filter(s=>s.length>3),`<ul class="facts-list">${t.map(s=>`<li>${s}</li>`).join("")}</ul>`}renderMapLink(e){return`
      <p class="mt-4 text-gray-600">
        <a href="https://www.google.com/maps/search/?api=1&query=${e.coordinates.latitude},${e.coordinates.longitude}" 
           target="_blank" class="map-link">
          <svg class="map-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
          </svg>
          View on Map (${e.coordinates.latitude}, ${e.coordinates.longitude})
        </a>
      </p>
    `}renderJourneyBetweenStops(e){const t=document.createElement("div");t.className="tour-journey-between-stops",t.innerHTML=`<strong>Along the Way:</strong> ${e}`,this.elements.tourStopsContainer.appendChild(t)}renderConclusion(e){this.elements.tourConclusion.textContent=e.conclusion}}class u{constructor(e){this.tourGenerator=e,this.tourParser=new h,this.tourRenderer=new d,this.isDebugMode=!1}init(){this.bindElements(),this.attachEventListeners(),this.initializeSliders()}bindElements(){this.elements={locationInput:document.getElementById("locationInput"),stopsSlider:document.getElementById("stopsSlider"),generateTourBtn:document.getElementById("generateTourBtn"),buttonText:document.getElementById("buttonText"),loadingSpinner:document.getElementById("loadingSpinner"),errorMessage:document.getElementById("errorMessage"),infoMessage:document.getElementById("infoMessage"),tourOutput:document.getElementById("tourOutput"),loadingScreen:document.getElementById("loadingScreen"),loadingMessage:document.getElementById("loadingMessage"),debugInfo:document.getElementById("debugInfo"),debugContent:document.getElementById("debugContent"),promptContent:document.getElementById("promptContent"),inputSectionContainer:document.getElementById("inputSectionContainer"),newTourBtn:document.getElementById("newTourBtn")},this.loadingMessages=["Putting on our explorer hat...","Consulting the local pigeons for insider tips...","Bribing the neighborhood cats for secret routes...","Asking the coffee shops where they hide the good stuff...","Convincing the street art to reveal its stories...","Negotiating with the local ghosts for historical gossip...","Teaching our AI to walk in comfortable shoes...","Collecting whispers from the old buildings...","Decoding the secret language of park benches...","Interviewing the most interesting lamp posts...","Finding the spots even Google Maps doesn't know...","Asking the locals 'but where do YOU actually go?'...","Discovering places that don't exist on Instagram...","Uncovering the neighborhood's best-kept secrets...","Almost ready to blow your mind..."],this.currentMessageIndex=0,this.messageInterval=null}attachEventListeners(){this.elements.generateTourBtn.addEventListener("click",()=>{this.generateTour()}),document.addEventListener("keydown",e=>{e.ctrlKey&&e.key==="d"&&(e.preventDefault(),this.toggleDebugMode())}),this.elements.locationInput.addEventListener("keypress",e=>{e.key==="Enter"&&this.generateTour()}),this.elements.newTourBtn.addEventListener("click",()=>{this.showSearchInterface()})}initializeSliders(){}async generateTour(){const e=this.elements.locationInput.value.trim(),t=parseInt(this.elements.stopsSlider.value);let s="";if(!e){this.showError("Please enter a location for the tour.");return}this.clearMessages(),this.elements.tourOutput.classList.add("hidden"),this.showLoadingScreen();try{const o=await this.tourGenerator.generateTour(e,t),i=o.tourText;s=o.prompt,this.isDebugMode&&(this.elements.debugContent.textContent=`Raw tour text length: ${i.length}

${i.substring(0,500)}...`,this.elements.promptContent.textContent=s);const n=this.tourParser.parse(i);this.hideLoadingScreen(),this.showTourInterface(),this.tourRenderer.render(n),this.elements.tourOutput.classList.remove("hidden"),this.showInfo("Tour generated successfully! Scroll down to explore.")}catch(o){this.hideLoadingScreen(),this.showError(`Failed to generate tour: ${o.message}. Please try again.`),console.error("Error generating tour:",o),this.isDebugMode&&(this.elements.debugInfo.style.display="block",this.elements.promptContent.textContent=s)}}showLoadingScreen(){this.elements.loadingScreen.classList.remove("hidden"),this.currentMessageIndex=0,this.cycleLoadingMessages(),this.messageInterval=setInterval(()=>{this.cycleLoadingMessages()},2e3)}hideLoadingScreen(){this.elements.loadingScreen.classList.add("hidden"),this.messageInterval&&(clearInterval(this.messageInterval),this.messageInterval=null)}cycleLoadingMessages(){this.elements.loadingMessage.textContent=this.loadingMessages[this.currentMessageIndex],this.currentMessageIndex=(this.currentMessageIndex+1)%this.loadingMessages.length}setLoading(e){this.elements.generateTourBtn.disabled=e,this.elements.buttonText.textContent=e?"Generating...":"Generate Tour",this.elements.loadingSpinner.classList.toggle("hidden",!e)}showError(e){this.elements.errorMessage.textContent=e,this.elements.errorMessage.classList.remove("hidden"),this.elements.infoMessage.classList.add("hidden")}showInfo(e){this.elements.infoMessage.textContent=e,this.elements.infoMessage.classList.remove("hidden"),this.elements.errorMessage.classList.add("hidden")}clearMessages(){this.elements.errorMessage.classList.add("hidden"),this.elements.infoMessage.classList.add("hidden")}toggleDebugMode(){this.isDebugMode=!this.isDebugMode,this.elements.debugInfo.style.display=this.isDebugMode?"block":"none"}showTourInterface(){this.elements.inputSectionContainer.classList.add("hidden"),this.elements.newTourBtn.classList.remove("hidden")}showSearchInterface(){this.elements.inputSectionContainer.classList.remove("hidden"),this.elements.newTourBtn.classList.add("hidden"),this.elements.tourOutput.classList.add("hidden"),this.clearMessages()}}document.addEventListener("DOMContentLoaded",()=>{const r=new c;new u(r).init()});
