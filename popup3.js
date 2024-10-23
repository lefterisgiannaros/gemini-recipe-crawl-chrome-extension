
console.log("Gemini Nano Recipe Crawler Extension Started.");

// Define variables for UI feedback
const loader = document.getElementById('loader');
const message = document.getElementById('message');
const errorElement = document.getElementById('error');

// Show loader and messages function
function showLoader(isLoading) {
  loader.style.display = isLoading ? 'block' : 'none';
}

function showMessage(msg) {
  message.textContent = msg;
  console.log(msg);
  errorElement.textContent = '';
}

function showError(err) {
  errorElement.textContent = err;
  console.error(err);
  message.textContent = '';
}

// Clear messages
function clearMessages() {
  message.textContent = '';
  errorElement.textContent = '';
}

// Crawl button click event
document.getElementById("crawlBtn").addEventListener("click", async () => {
  clearMessages();
  showLoader(true);
  showMessage("Starting recipe crawl...");

  try {
    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log("Active tab:", tab);

    // Execute script to scrape recipes from the page
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: scrapeRecipes // This function will be executed on the current tab
    });

    console.log("Results from page scrape:", results);
    
    // Handle response from page script
    if (results && results[0] && results[0].result.length > 0) {
      showMessage("Recipes found! Sending to Gemini AI...");

      const recipes = results[0].result;
      const prompt = `Here is a recipe: ${JSON.stringify(recipes)}`;

      // Call Gemini API
      const generatedResult = await callGemini(prompt);

      if (generatedResult && generatedResult.response) {
        showMessage("AI Response: " + generatedResult.response.text());
      } else {
        showError("Failed to get a response from Gemini.");
      }
    } else {
      showMessage("No recipes found on the page.");
    }

  } catch (error) {
    showError("An error occurred: " + error.message);
  } finally {
    showLoader(false);
  }
});

// Function to scrape recipes (will be executed in the tab's context)
function scrapeRecipes() {
  let recipes = [];
  try {
    const title = document.querySelector("h1")?.innerText || "Unknown Title";
    const ingredients = Array.from(document.querySelectorAll(".ingredients li")).map(el => el.innerText);
    const instructions = Array.from(document.querySelectorAll(".instructions li")).map(el => el.innerText);

    if (title && ingredients.length > 0 && instructions.length > 0) {
      recipes.push({
        title,
        ingredients,
        instructions
      });
    }

    return recipes;
  } catch (error) {
    console.error("Error scraping the page:", error);
    return [];
  }
}

// Function to call Gemini API
async function callGemini(prompt) {
  try {
    const response = await fetch("https://api.gemini.com/nano/recipes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `AIzaSyAN4Z82LgcsReNV2bXeLnruu9L2gwFDr70` // Replace with your actual API key
      },
      body: JSON.stringify({ prompt })
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API request failed with status ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error calling Gemini:", error);
    throw error;
  }
}
