let hymnsCache = null;

export async function getHymns() {
  // Return cached version if already loaded
  if (hymnsCache) return hymnsCache;

  try {
    // Fetch hymn dataset from hymns.json
    const response = await fetch("/src/public/json/hymns.json");

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

    // Return to an empty array so the interface can continue working
    hymnsCache = [];
    return hymnsCache;
  }
}
