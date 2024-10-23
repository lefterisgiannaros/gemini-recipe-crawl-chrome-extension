
# Gemini Nano Recipe Crawler Chrome Extension

This Chrome extension scrapes recipes from the current webpage, sends them to **Google Gemini AI** for analysis, and displays the results. You can also save the AI-generated recipes and view them later through an accordion-style interface. This extension is perfect for users who want to easily retrieve and store recipe details from various websites.

## Features

- **Crawl Recipes**: Automatically scrape recipe data (title, ingredients, instructions) from a webpage.
- **Gemini AI Integration**: Send scraped recipes to Gemini AI for analysis and get detailed responses.
- **Save Recipes**: Store AI-generated recipes locally in Chrome's storage.
- **View Saved Recipes**: View all previously saved recipes using an accordion interface.
- **Delete Recipes**: Delete any saved recipes directly from the interface.

## Installation

To get started with this Chrome extension, follow these steps:

1. Clone or download this repository to your local machine:
   ```bash
   git clone https://github.com/your-username/recipe-crawler-extension.git
   ```

2. Open Chrome and navigate to `chrome://extensions/`.

3. Enable **Developer Mode** in the top-right corner.

4. Click on **Load unpacked** and select the folder where you cloned or downloaded this repository.

5. The extension should now appear in your Chrome extensions list and can be accessed via the extensions toolbar.

## Usage

1. **Crawl a Recipe**:
    - Navigate to a webpage containing a recipe.
    - Open the extension by clicking on the extension icon in your Chrome toolbar.
    - Click the **Crawl Recipes** button to scrape the recipe details and send them to Gemini AI for analysis.
    - The analyzed recipe will be displayed in the extension popup.

2. **View Saved Recipes**:
    - To view saved recipes, click the **View Saved Recipes** button in the extension popup.
    - A list of all previously saved recipes will be displayed in an accordion-style layout.
    - Click on a recipe title to expand and view the full recipe details.

3. **Delete a Saved Recipe**:
    - While viewing saved recipes, you can delete any recipe by clicking the **Delete Recipe** button.
    - A confirmation prompt will appear before the recipe is deleted from Chrome storage.

## Technical Details

- **Gemini AI Integration**: The extension integrates with Google Gemini AI to generate content based on the scraped recipe data.
- **Local Storage**: Recipes are stored using Chrome's `chrome.storage.local` API for future retrieval and display.
- **Accordion UI**: The saved recipes are displayed in a collapsible accordion-style format for better organization and readability.

## Development

If you wish to modify or extend this extension:

1. Ensure you have the necessary development environment set up for Chrome extensions (Node.js, npm, etc., if needed).
2. The main functionality is located in the `popup.js` file, while the user interface is defined in `popup.html`.
3. To modify the code, make your changes, and then reload the extension by going to `chrome://extensions/` and clicking the **Reload** button for this extension.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
