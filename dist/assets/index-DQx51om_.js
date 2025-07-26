(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))n(t);new MutationObserver(t=>{for(const s of t)if(s.type==="childList")for(const i of s.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&n(i)}).observe(document,{childList:!0,subtree:!0});function o(t){const s={};return t.integrity&&(s.integrity=t.integrity),t.referrerPolicy&&(s.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?s.credentials="include":t.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(t){if(t.ep)return;t.ep=!0;const s=o(t);fetch(t.href,s)}})();class c{constructor(){this.apiKey="AIzaSyC6SsNshtIswEOiUVKTs1ZqRGdR9fOWx4s",this.apiUrl="https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"}async generateTour(e,o){const n=this.createPrompt(e,o);try{if(this.shouldUseMockData())return{tourText:this.generateMockTour(e,o),prompt:n};const s={contents:[{role:"user",parts:[{text:n}]}]},i=await fetch(`${this.apiUrl}?key=${this.apiKey}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)});if(!i.ok){const l=await i.json();throw new Error(`API error ${i.status} - ${l.error?.message||i.statusText}`)}const a=await i.json();if(a.candidates?.[0]?.content?.parts?.[0]?.text)return{tourText:a.candidates[0].content.parts[0].text,prompt:n};throw new Error("Unexpected API response structure")}catch(t){throw console.error("Error generating tour:",t),t}}createPrompt(e,o){return`You are a local tour guide with loads of amazing reviews on your ability to create fun, immersive local tours.

Create a detailed walking tour guide for "${e}" with exactly ${o} stops. Structure your response EXACTLY as follows:

**TOUR TITLE:** [Create an evocative title]
**DURATION:** [e.g., "90 minutes"]
**DISTANCE:** [e.g., "2.5 km"]
**STARTING POINT:** [Name and brief description]
**NOTABLE STOPS:** [List the ${o} main stops, ordered to follow a logical walking path with minimal backtracking]

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
[Repeat format for all ${o} stops]

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
- Ensure photo selections complement the storytelling and help visualize the experience`}shouldUseMockData(){return!this.apiKey||this.apiKey==="YOUR_API_KEY_HERE"}generateMockTour(e,o){return`**TOUR TITLE:** Hidden Stories of ${e}

**DURATION:** ${60+o*15} minutes

**DISTANCE:** ${(o*.4).toFixed(1)} km

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
Our journey through ${e} reveals how a place becomes more than just buildings and streets – it becomes a living story written by everyone who calls it home. From the historic square where generations have gathered to the cozy café where new friendships bloom daily, we've seen how community spirit transforms ordinary spaces into extraordinary places. As you continue exploring ${e}, remember that every doorway, every corner, every friendly face has a story to tell. The real magic isn't in the grand monuments but in the daily rhythms of life that make this place uniquely special. Welcome to the neighborhood – you're now part of its ongoing story.`}}class h{parse(e){const o={title:"",duration:"",distance:"",startingPoint:"",notableStops:[],introduction:"",stops:[],journeys:[],conclusion:""};try{o.title=this.extractField(e,"TOUR TITLE")||"Hidden Gems Tour",o.duration=this.extractField(e,"DURATION")||"N/A",o.distance=this.extractField(e,"DISTANCE")||"N/A",o.startingPoint=this.extractField(e,"STARTING POINT")||"N/A";const n=this.extractField(e,"NOTABLE STOPS");n&&(o.notableStops=n.split(",").map(t=>t.trim())),o.introduction=this.extractSection(e,"INTRODUCTION","STOPS")||"Welcome to this hidden gems tour!",o.conclusion=this.extractSection(e,"CONCLUSION")||"Thank you for joining this hidden gems tour!",o.stops=this.parseStops(e),o.journeys=this.parseJourneys(e)}catch(n){throw console.error("Error parsing tour content:",n),new Error(`Failed to parse tour content: ${n.message}`)}return o}extractField(e,o){const n=new RegExp(`\\*\\*${o}:\\*\\*\\s*(.+)`,"i"),t=e.match(n);return t?t[1].trim():null}extractSection(e,o,n=null){let t;n?t=new RegExp(`\\*\\*${o}:\\*\\*\\s*([\\s\\S]+?)(?=\\*\\*${n}:\\*\\*)`,"i"):t=new RegExp(`\\*\\*${o}:\\*\\*\\s*([\\s\\S]+?)$`,"i");const s=e.match(t);return s?s[1].trim():null}parseStops(e){const o=[],n=/\*\*Stop (\d+): ([^*]+)\*\*\s*([\s\S]*?)(?=\*\*(?:Stop \d+:|Journey to Stop \d+:|CONCLUSION:)|$)/gi;let t;for(;(t=n.exec(e))!==null;){const s={number:parseInt(t[1]),name:t[2].trim(),description:"",coordinates:null,pexelsPhotoId:null,hiddenHistory:"",localTip:""},i=t[3].trim();s.description=this.extractStopDetail(i,"Description"),s.pexelsPhotoId=this.extractStopDetail(i,"Pexels Photo ID"),s.youAreHere=this.extractStopDetail(i,"You Are Here"),s.theHook=this.extractStopDetail(i,"The Hook"),s.fascinatingFacts=this.extractStopDetail(i,"Fascinating Facts"),s.storiesVoices=this.extractStopDetail(i,"Stories & Voices"),s.interactiveMoment=this.extractStopDetail(i,"Interactive Moment"),s.photoOp=this.extractStopDetail(i,"Photo Op"),s.hiddenHistory=this.extractStopDetail(i,"Hidden History"),s.localTip=this.extractStopDetail(i,"Local Tip"),s.coordinates=this.extractCoordinates(i),o.push(s)}return o}parseJourneys(e){const o=[],n=/\*\*Journey to Stop (\d+):\*\*\s*([\s\S]*?)(?=\*\*Stop \d+:|$)/gi;let t;for(;(t=n.exec(e))!==null;)o.push({toStop:parseInt(t[1]),description:t[2].trim()});return o}extractStopDetail(e,o){const n=new RegExp(`- \\*\\*${o}:\\*\\*\\s*([^-]+)`,"i"),t=e.match(n);return t?t[1].trim():""}extractCoordinates(e){const o=e.match(/- \*\*Coordinates:\*\*\s*\[([^,]+),\s*([^\]]+)\]/i);return o?{latitude:parseFloat(o[1].trim()),longitude:parseFloat(o[2].trim())}:null}}class d{constructor(){this.bindElements()}bindElements(){this.elements={tourTitle:document.getElementById("tourTitle"),summaryDuration:document.getElementById("summaryDuration"),summaryDistance:document.getElementById("summaryDistance"),summaryStartingPoint:document.getElementById("summaryStartingPoint"),summaryNotableStops:document.getElementById("summaryNotableStops"),tourIntro:document.getElementById("tourIntro"),tourStopsContainer:document.getElementById("tourStopsContainer"),tourConclusion:document.getElementById("tourConclusion")}}render(e){this.renderHeader(e),this.renderSummary(e),this.renderIntroduction(e),this.renderStops(e),this.renderConclusion(e)}renderHeader(e){this.elements.tourTitle.textContent=e.title}renderSummary(e){this.elements.summaryDuration.textContent=e.duration,this.elements.summaryDistance.textContent=e.distance,this.elements.summaryStartingPoint.textContent=e.startingPoint,this.elements.summaryNotableStops.innerHTML="";let o=[];e.notableStops&&e.notableStops.length>0&&e.notableStops[0].trim()!==""?o=e.notableStops:o=e.stops.slice(0,5).map(n=>n.name||`Stop ${n.number}`),o.forEach(n=>{const t=document.createElement("li");t.textContent=n.trim(),this.elements.summaryNotableStops.appendChild(t)})}renderIntroduction(e){const n=e.introduction.split(". "),t=Math.ceil(n.length/2),s=n.slice(0,t).join(". "),i=` We'll start at ${e.startingPoint||"our meeting point"} and follow a carefully planned route covering ${e.distance||"the local area"}. The entire experience should take approximately ${e.duration||"90 minutes"} at a comfortable walking pace.`;this.elements.tourIntro.textContent=s+i}renderStops(e){this.elements.tourStopsContainer.innerHTML="",e.stops.forEach((o,n)=>{this.renderTourStop(o);const t=e.journeys.find(s=>s.toStop===o.number+1);t&&this.renderJourneyBetweenStops(t.description)})}renderTourStop(e){const o=document.createElement("div");o.className="tour-stop";const n=e.pexelsPhotoId||"2387873",t=`https://images.pexels.com/photos/${n}/pexels-photo-${n}.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop`,s="https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop";o.innerHTML=`
      <div class="tour-stop-number">${e.number}</div>
      <h3 class="ml-10">${e.name||"Unknown Location"}</h3>
      <div class="tour-stop-content">
        ${e.youAreHere?`<div class="you-are-here"><div class="section-icon">📍</div><div class="section-title">You Are Here</div><p>${e.youAreHere}</p></div>`:""}
        <img src="${t}" alt="View of ${e.name}" class="tour-image" 
             onerror="this.onerror=null;this.src='${s}';">
        <p class="mt-4 text-gray-800">${e.description||""}</p>
        ${this.renderStorySection(e)}
        ${e.fascinatingFacts?`<div class="fascinating-facts"><div class="section-icon">💡</div><div class="section-title">Fascinating Facts</div><div class="facts-content">${this.formatFacts(e.fascinatingFacts)}</div></div>`:""}
        ${e.hiddenHistory?`<div class="tour-detail-heading">Hidden History</div><p class="tour-detail-content">${e.hiddenHistory}</p>`:""}
        ${this.renderCaptureTheMomentSection(e)}
        ${e.localTip?`<div class="tour-detail-heading">Local Tip</div><p class="tour-detail-content">${e.localTip}</p>`:""}
        ${e.coordinates?this.renderMapLink(e):""}
      </div>
    `,this.elements.tourStopsContainer.appendChild(o)}renderStorySection(e){const o=e.theHook&&e.theHook.trim(),n=e.storiesVoices&&e.storiesVoices.trim();if(!o&&!n)return"";let t="";return o&&(t+=`<p class="hook-content">${e.theHook}</p>`),n&&(t+=`<blockquote class="stories-content">${e.storiesVoices}</blockquote>`),`<div class="story-section"><div class="section-icon">📖</div><div class="section-title">The Story</div>${t}</div>`}renderCaptureTheMomentSection(e){const o=e.interactiveMoment&&e.interactiveMoment.trim(),n=e.photoOp&&e.photoOp.trim();if(!o&&!n)return"";let t="";return o&&(t+=`<div class="interactive-content"><strong>Experience:</strong> ${e.interactiveMoment}</div>`),n&&(t+=`<div class="photo-content"><strong>Photo Opportunity:</strong> ${e.photoOp}</div>`),`<div class="capture-moment-section"><div class="section-icon">📸</div><div class="section-title">Capture the Moment</div>${t}</div>`}formatFacts(e){let o=[];return e.includes("•")?o=e.split("•").filter(n=>n.trim()).map(n=>n.trim()):e.includes("- ")?o=e.split(/- /).filter(n=>n.trim()).map(n=>n.trim()):e.includes(`
`)?o=e.split(`
`).filter(n=>n.trim()).map(n=>n.trim().replace(/^[-•]\s*/,"")):o=e.split(/\.(?=\s[A-Z])/).filter(n=>n.trim()).map(n=>{const t=n.trim();return t.endsWith(".")?t:t+"."}),o=o.filter(n=>n.length>3),`<ul class="facts-list">${o.map(n=>`<li>${n}</li>`).join("")}</ul>`}renderMapLink(e){return`
      <p class="mt-4 text-gray-600">
        <a href="https://www.google.com/maps/search/?api=1&query=${e.coordinates.latitude},${e.coordinates.longitude}" 
           target="_blank" class="map-link">
          <svg class="map-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
          </svg>
          View on Map (${e.coordinates.latitude}, ${e.coordinates.longitude})
        </a>
      </p>
    `}renderJourneyBetweenStops(e){const o=document.createElement("div");o.className="tour-journey-between-stops",o.innerHTML=`<strong>Along the Way:</strong> ${e}`,this.elements.tourStopsContainer.appendChild(o)}renderConclusion(e){const n=e.conclusion.split(". "),t=Math.ceil(n.length/2),s=n.slice(0,t).join(". ");this.elements.tourConclusion.textContent=s}}class u{constructor(){this.map=null,this.infoWindow=null,this.markers=[]}initMap(e,o){if(console.log("MapController: initMap called with stops:",o),!window.google||!window.google.maps){console.error("Google Maps API not loaded");return}try{const n={lat:37.7749,lng:-122.4194};this.map=new google.maps.Map(document.getElementById(e),{zoom:10,center:n,mapTypeId:"roadmap"}),this.infoWindow=new google.maps.InfoWindow,console.log("Map initialized successfully"),o&&o.length>0?this.addMarkers(o):console.warn("No stops provided to display on map")}catch(n){console.error("Error initializing map:",n)}}addMarkers(e){console.log("Adding markers for stops:",e),this.clearMarkers();const o=new google.maps.LatLngBounds;let n=0;e.forEach((t,s)=>{if(t.coordinates&&t.coordinates.latitude&&t.coordinates.longitude){const i={lat:t.coordinates.latitude,lng:t.coordinates.longitude},a=new google.maps.Marker({position:i,map:this.map,title:t.name||`Stop ${t.number}`,animation:google.maps.Animation.DROP,label:{text:t.number?t.number.toString():(s+1).toString(),color:"white",fontWeight:"bold"}});a.addListener("click",()=>{const l=`
            <div class="info-window-content">
              <h3>${t.name||`Stop ${t.number}`}</h3>
              <p>${t.description||"No description available"}</p>
              ${t.coordinates?`<p><small>Coordinates: ${t.coordinates.latitude}, ${t.coordinates.longitude}</small></p>`:""}
            </div>
          `;this.infoWindow.setContent(l),this.infoWindow.open(this.map,a)}),this.markers.push(a),o.extend(i),n++}else console.warn(`Stop ${s+1} (${t.name}) has no valid coordinates:`,t.coordinates)}),n>0?(n===1?(this.map.setCenter(o.getCenter()),this.map.setZoom(15)):this.map.fitBounds(o),console.log(`Successfully added ${n} markers to the map`)):console.warn("No valid coordinates found in any stops")}clearMarkers(){this.markers.forEach(e=>{e.setMap(null)}),this.markers=[]}showMap(){this.map&&google.maps.event.trigger(this.map,"resize")}}class m{constructor(e){this.tourGenerator=e,this.tourParser=new h,this.tourRenderer=new d,this.mapController=new u,this.isDebugMode=!1,this.currentTour=null}init(){this.bindElements(),this.attachEventListeners(),this.initializeSliders()}bindElements(){this.elements={locationInput:document.getElementById("locationInput"),stopsSlider:document.getElementById("stopsSlider"),generateTourBtn:document.getElementById("generateTourBtn"),buttonText:document.getElementById("buttonText"),loadingSpinner:document.getElementById("loadingSpinner"),errorMessage:document.getElementById("errorMessage"),infoMessage:document.getElementById("infoMessage"),tourOutput:document.getElementById("tourOutput"),loadingScreen:document.getElementById("loadingScreen"),loadingMessage:document.getElementById("loadingMessage"),debugInfo:document.getElementById("debugInfo"),debugContent:document.getElementById("debugContent"),promptContent:document.getElementById("promptContent"),inputSectionContainer:document.getElementById("inputSectionContainer"),newTourBtn:document.getElementById("newTourBtn"),viewMapBtn:document.getElementById("viewMapBtn"),mapContainer:document.getElementById("mapContainer"),backToTourBtn:document.getElementById("backToTourBtn")},this.loadingMessages=["Putting on our explorer hat...","Consulting the local pigeons for insider tips...","Bribing the neighborhood cats for secret routes...","Asking the coffee shops where they hide the good stuff...","Convincing the street art to reveal its stories...","Negotiating with the local ghosts for historical gossip...","Teaching our AI to walk in comfortable shoes...","Collecting whispers from the old buildings...","Decoding the secret language of park benches...","Interviewing the most interesting lamp posts...","Finding the spots even Google Maps doesn't know...","Asking the locals 'but where do YOU actually go?'...","Discovering places that don't exist on Instagram...","Uncovering the neighborhood's best-kept secrets...","Almost ready to blow your mind..."],this.currentMessageIndex=0,this.messageInterval=null}attachEventListeners(){this.elements.generateTourBtn.addEventListener("click",()=>{this.generateTour()}),document.addEventListener("keydown",o=>{o.ctrlKey&&o.key==="d"&&(o.preventDefault(),this.toggleDebugMode())}),this.elements.locationInput.addEventListener("keypress",o=>{o.key==="Enter"&&this.generateTour()}),this.elements.newTourBtn.addEventListener("click",()=>{this.showSearchInterface()}),this.elements.viewMapBtn.addEventListener("click",()=>{this.showMapPage()}),this.elements.backToTourBtn.addEventListener("click",()=>{this.showTourPage()});const e=document.querySelector(".new-tour-nav-btn");e&&e.addEventListener("click",()=>{this.showSearchInterface()})}initializeSliders(){}async generateTour(){const e=this.elements.locationInput.value.trim(),o=parseInt(this.elements.stopsSlider.value);let n="";if(!e){this.showError("Please enter a location for the tour.");return}this.clearMessages(),this.elements.tourOutput.classList.add("hidden"),this.showLoadingScreen();try{const t=await this.tourGenerator.generateTour(e,o),s=t.tourText;n=t.prompt,this.isDebugMode&&(this.elements.debugContent.textContent=`Raw tour text length: ${s.length}

${s.substring(0,500)}...`,this.elements.promptContent.textContent=n);const i=this.tourParser.parse(s);console.log("Parsed tour data:",{title:i.title,notableStops:i.notableStops,stopsCount:i.stops.length}),this.currentTour=i,this.hideLoadingScreen(),this.showTourInterface(),this.tourRenderer.render(i),this.elements.tourOutput.classList.remove("hidden"),this.showInfo("Tour generated successfully! Scroll down to explore.")}catch(t){this.hideLoadingScreen(),this.showError(`Failed to generate tour: ${t.message}. Please try again.`),console.error("Error generating tour:",t),this.isDebugMode&&(this.elements.debugInfo.style.display="block",this.elements.promptContent.textContent=n)}}showLoadingScreen(){this.elements.loadingScreen.classList.remove("hidden"),this.currentMessageIndex=0,this.cycleLoadingMessages(),this.messageInterval=setInterval(()=>{this.cycleLoadingMessages()},2e3)}hideLoadingScreen(){this.elements.loadingScreen.classList.add("hidden"),this.messageInterval&&(clearInterval(this.messageInterval),this.messageInterval=null)}cycleLoadingMessages(){this.elements.loadingMessage.textContent=this.loadingMessages[this.currentMessageIndex],this.currentMessageIndex=(this.currentMessageIndex+1)%this.loadingMessages.length}setLoading(e){this.elements.generateTourBtn.disabled=e,this.elements.buttonText.textContent=e?"Generating...":"Generate Tour",this.elements.loadingSpinner.classList.toggle("hidden",!e)}showError(e){this.elements.errorMessage.textContent=e,this.elements.errorMessage.classList.remove("hidden"),this.elements.infoMessage.classList.add("hidden")}showInfo(e){this.elements.infoMessage.textContent=e,this.elements.infoMessage.classList.remove("hidden"),this.elements.errorMessage.classList.add("hidden")}clearMessages(){this.elements.errorMessage.classList.add("hidden"),this.elements.infoMessage.classList.add("hidden")}toggleDebugMode(){this.isDebugMode=!this.isDebugMode,this.elements.debugInfo.style.display=this.isDebugMode?"block":"none"}showTourInterface(){this.elements.inputSectionContainer.classList.add("hidden"),this.elements.newTourBtn.classList.remove("hidden")}showSearchInterface(){this.elements.inputSectionContainer.classList.remove("hidden"),this.elements.newTourBtn.classList.add("hidden"),this.elements.tourOutput.classList.add("hidden"),this.elements.mapContainer.classList.add("hidden"),this.clearMessages()}showMapPage(){if(!this.currentTour||!this.currentTour.stops){this.showError("No tour data available for map display.");return}this.elements.tourOutput.classList.add("hidden"),this.elements.inputSectionContainer.classList.add("hidden"),this.elements.newTourBtn.classList.add("hidden"),this.elements.mapContainer.classList.remove("hidden"),this.clearMessages(),setTimeout(()=>{this.mapController.initMap("map",this.currentTour.stops),this.mapController.showMap()},100)}showTourPage(){this.elements.mapContainer.classList.add("hidden"),this.elements.tourOutput.classList.remove("hidden"),this.elements.newTourBtn.classList.remove("hidden"),this.clearMessages()}}window.initGoogleMaps=function(){console.log("Google Maps API loaded successfully")};document.addEventListener("DOMContentLoaded",()=>{const r=new c;new m(r).init()});
