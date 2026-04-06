import re

with open('js/housing-stories.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace all occurrences of simulateAISearch with performAISearch
content = content.replace('simulateAISearch', 'performAISearch')

# Define the new implementation
new_impl = """window.performAISearch = async function(instanceId) {
  const zipInput = document.getElementById('zip' + instanceId);
  const typeSelect = document.getElementById('type' + instanceId);
  const resultsDiv = document.getElementById('aiResults' + instanceId);
  
  const zip = zipInput.value.trim();
  if (zip.length < 5) {
    alert("Please enter a valid 5-digit ZIP code.");
    return;
  }
  
  resultsDiv.innerHTML = "<div class='loader'>Searching real-time databases for " + zip + "...</div>";
  resultsDiv.classList.remove('hidden');
  resultsDiv.classList.add('visible');
  
  try {
    const response = await fetch(`https://api.zippopotam.us/us/${zip}`);
    if (!response.ok) {
      throw new Error("Invalid ZIP code");
    }
    
    const data = await response.json();
    const place = data.places[0];
    const city = place["place name"];
    const state = place["state"];
    const stateAbbr = place["state abbreviation"];
    
    // Construct dynamic real-time links based on location
    const formattedCity = encodeURIComponent(city);
    const formattedState = encodeURIComponent(state);
    
    let html = "<h4>📍 Real-Time Resources for " + city + ", " + stateAbbr + "</h4>";
    html += "<ul class='ai-resource-list'>";
    
    // Local Housing Authority (Google Search dynamic)
    const phaLink = `https://www.google.com/search?q=Public+Housing+Authority+${formattedCity}+${formattedState}`;
    html += `<li><a href='${phaLink}' target='_blank'><strong>Local Public Housing Authority</strong> - Contact for local housing lists</a></li>`;
    
    // State HUD Page
    const hudState = state.toLowerCase().replace(/ /g, "_");
    html += `<li><a href='https://www.hud.gov/states/${hudState}' target='_blank'><strong>HUD ${state} Office</strong> - Federal housing programs & info</a></li>`;
    
    html += `<li><a href='https://www.211.org/' target='_blank'><strong>211 Local Help</strong> - Community services in ${stateAbbr}</a></li>`;
    
    if (typeSelect.value === 'rent') {
      const rentLink = `https://www.google.com/search?q=Emergency+Rental+Assistance+${formattedCity}+${formattedState}`;
      html += `<li><a href='${rentLink}' target='_blank'><strong>Emergency Rental Assistance</strong> - Connect with local non-profits</a></li>`;
      html += "<li><a href='https://nlihc.org/era-dashboard' target='_blank'><strong>NLIHC ERA</strong> - National rental help dashboard</a></li>";
    } else {
      const ownLink = `https://www.google.com/search?q=First+Time+Homebuyer+Assistance+Programs+${formattedCity}+${formattedState}`;
      html += `<li><a href='${ownLink}' target='_blank'><strong>Buyer / Homeowner Assistance</strong> - Local grants</a></li>`;
      html += "<li><a href='https://www.consumerfinance.gov/housing/' target='_blank'><strong>CFPB Housing Tools</strong> - Federal homeowner support</a></li>";
    }
    
    html += "</ul><p class='ai-footnote'>Results generated in real-time based on your location.</p>";
    
    resultsDiv.innerHTML = html;
    
  } catch (err) {
    resultsDiv.innerHTML = "<p style='color: #ef4444; font-weight: 600; text-align: center;'>Sorry, we couldn't find data for ZIP code: " + zip + ". Please try another one.</p>";
  }
};"""

# Replace the block.
# Finding: window.performAISearch = function(instanceId) { ... };
# We will just split and replace it using a dirty trick or regex
import re
pattern = re.compile(r'window\.performAISearch = function\(instanceId\) \{.*?\};\n', re.DOTALL)
content = pattern.sub(new_impl + '\n', content)

with open('js/housing-stories.js', 'w', encoding='utf-8') as f:
    f.write(content)
