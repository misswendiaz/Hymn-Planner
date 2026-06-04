let moodsCache = null;

export async function getMoods() {
  // Return cached version if already loaded
  if (moodsCache) return moodsCache;

  try {
    // Fetch mood data from moods.json
    const response = await fetch("/src/public/json/moods.json");

    // Handle HTTP errors
    if (!response.ok) {
      throw new Error(`Failed to load moods.json (HTTP ${response.status})`);
    }

    // Parse JSON response
    const data = await response.json();

    // Validate structure before using it
    if (!data || !Array.isArray(data.moods)) {
      throw new Error("Invalid moods.json format: expected { moods: [] }");
    }

    // Freeze array to prevent accidental mutation
    moodsCache = Object.freeze([...data.moods]);

    return moodsCache;
  } catch (error) {
    // Centralized error logging for debugging
    console.error("Error loading moods: ", error);

    // Return to an empty array so the interface can continue working
    moodsCache = [];
    return moodsCache;
  }
}
