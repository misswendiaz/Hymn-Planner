// Cache to avoid repeated network requests
let hymnsCache = null;

// Fetches hymn dataset from JSON file
export async function getHymns() {
  // Return cached version if already loaded
  if (hymnsCache) return hymnsCache;

  // BASE_URL is required for correct routing in Vite deployments
  const BASE = import.meta.env.BASE_URL;

  try {
    // Fetch hymn dataset from hymns.json
    const response = await fetch(`${BASE}json/hymns.json`);

    // Handle HTTP errors
    if (!response.ok) {
      throw new Error(`Failed to load hymns.json (HTTP ${response.status})`);
    }

    // Parse JSON response
    const data = await response.json();

    // Validate structure before using it
    if (!data || !Array.isArray(data.hymns)) {
      throw new Error("Invalid hymns.json format: expected { hymns: [] }");
    }

    // Freeze array to prevent accidental mutation
    hymnsCache = Object.freeze([...data.hymns]);

    return hymnsCache;
  } catch (error) {
    // Centralized error logging for debugging
    console.error("Hymn loading error: ", error);
    throw error;
  }
}
