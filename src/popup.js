import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyAN4Z82LgcsReNV2bXeLnruu9L2gwFDr70";

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Function to scrape recipe content from the webpage
async function scrapeRecipeFromPage() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const result = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: () => {
      const title = document.querySelector("h1")?.innerText || "No title found";
      const ingredients = Array.from(document.querySelectorAll(".single-list-item.grocery-list-item"))
        .map(el => el.innerText.trim());
      const instructions = Array.from(document.querySelectorAll(".instructions li")).map(el => el.innerText.trim());
      return { title, ingredients, instructions };
    }
  });

  if (result && result[0] && result[0].result) {
    return result[0].result;
  } else {
    throw new Error("No recipe content found on this page.");
  }
}

// Function to send the scraped recipe content to Gemini AI
async function analyzeRecipeWithGemini(recipe) {
  const prompt = `Here is a recipe:\n\nTitle: ${recipe.title}\n\nIngredients:\n${recipe.ingredients.join('\n')}\n\nInstructions:\n${recipe.instructions.join('\n')}`;
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// Function to save the AI response to Chrome storage
function saveResponseToChrome(url, response) {
  const data = { url, response, timestamp: new Date().toISOString() };
  chrome.storage.local.set({ [url]: data }, () => {
    console.log(`Response for ${url} saved to Chrome storage.`);
  });
}

// Function to load a specific recipe from Chrome storage based on URL
function loadResponseFromChrome(url) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([url], (result) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve(result[url]);
    });
  });
}

// Function to load all saved recipes from Chrome storage
function loadAllRecipesFromChrome() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(null, (items) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve(items);
    });
  });
}

// Function to delete a saved recipe
function deleteRecipe(url) {
  return new Promise((resolve) => {
    chrome.storage.local.remove([url], () => {
      console.log(`Recipe for ${url} deleted from Chrome storage.`);
      resolve();
    });
  });
}

// Function to display saved recipes in an accordion style
function displaySavedRecipes(recipes) {
  const savedRecipesContainer = document.getElementById("savedRecipesContainer");
  savedRecipesContainer.innerHTML = ""; // Clear previous recipes

  Object.keys(recipes).forEach(url => {
    const recipe = recipes[url];

    const recipeElement = document.createElement("div");
    recipeElement.classList.add("recipe");

    const recipeId = `recipe-${url.replace(/[^a-zA-Z0-9]/g, "")}`;
    recipeElement.innerHTML = `
      <button class="accordion">${recipe.url}</button>
      <div class="panel">
        <div class="recipe-details">
          <h4>${recipe.url}</h4>
          <p>${recipe.response.replace(/\n/g, '<br>')}</p> <!-- Better formatting for the response -->
          <small>Saved on: ${new Date(recipe.timestamp).toLocaleString()}</small>
          <br>
          <button class="delete-btn" data-url="${url}">Delete Recipe</button>
        </div>
      </div>
    `;

    savedRecipesContainer.appendChild(recipeElement);

    // Event listener for the delete button
    const deleteBtn = recipeElement.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", async () => {
      if (confirm("Are you sure you want to delete this recipe?")) {
        await deleteRecipe(url);
        recipeElement.remove(); // Remove the recipe element from the DOM
      }
    });

    // Event listener for accordion functionality
    const accordion = recipeElement.querySelector(".accordion");
    const panel = recipeElement.querySelector(".panel");
    accordion.addEventListener("click", () => {
      accordion.classList.toggle("active");
      if (panel.style.display === "block") {
        panel.style.display = "none";
      } else {
        panel.style.display = "block";
      }
    });
  });
}

// Button click handler to scrape the recipe and analyze it with Gemini AI
document.getElementById("crawlBtn").addEventListener("click", async () => {
  const messageElement = document.getElementById("message");
  const errorElement = document.getElementById("error");

  messageElement.textContent = "";
  errorElement.textContent = "";

  try {
    const recipe = await scrapeRecipeFromPage();
    messageElement.textContent = "Analyzing the recipe with Gemini AI...";
    const aiResponse = await analyzeRecipeWithGemini(recipe);
    messageElement.innerHTML = `<h3>Recipe Summary</h3><p>${aiResponse.replace(/\n/g, '<br>')}</p>`; // Better formatting
    saveResponseToChrome(recipe.title, aiResponse);
  } catch (error) {
    errorElement.textContent = `Error: ${error.message}`;
  }
});

// Button click handler to load and display saved recipes
document.getElementById("viewRecipesBtn").addEventListener("click", async () => {
  const savedRecipesContainer = document.getElementById("savedRecipesContainer");
  const messageElement = document.getElementById("message");

  savedRecipesContainer.innerHTML = '';
  messageElement.textContent = '';

  try {
    const recipes = await loadAllRecipesFromChrome();
    
    if (Object.keys(recipes).length > 0) {
      displaySavedRecipes(recipes);
    } else {
      messageElement.textContent = "No saved recipes found.";
    }
  } catch (error) {
    console.error("Error loading saved recipes:", error);
  }
});

// Load saved AI response when the popup opens
document.addEventListener("DOMContentLoaded", async () => {
  const messageElement = document.getElementById("message");
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab.url;

  try {
    const savedData = await loadResponseFromChrome(url);
    if (savedData) {
      messageElement.innerHTML = `<h3>Recipe Summary</h3><p>${savedData.response.replace(/\n/g, '<br>')}</p>`; // Better formatting
    }
  } catch (error) {
    console.error("Error loading saved response from Chrome storage:", error);
  }
});