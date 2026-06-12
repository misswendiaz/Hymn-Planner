/* =========================================================
   CACHE (prevents repeated network requests)
   ========================================================= */

let hymnsCache = null;

/* =========================================================
   MAIN DATA FETCH FUNCTION
   ========================================================= */

export async function getHymns() {
  // If already loaded, return cached version immediately
  if (hymnsCache) return hymnsCache;

  // Vite base path ensures correct deployment routing
  const BASE = import.meta.env.BASE_URL;

  try {
    /* -----------------------------------------------------
       FETCH JSON FILE
    ----------------------------------------------------- */
    const response = await fetch(`${BASE}json/hymns.json`);

    // Fail fast if HTTP request fails
    if (!response.ok) {
      throw new Error(`Failed to load hymns.json (HTTP ${response.status})`);
    }

    /* -----------------------------------------------------
       PARSE JSON
    ----------------------------------------------------- */
    const data = await response.json();

    /* -----------------------------------------------------
       NORMALIZE DATA FORMAT
    ----------------------------------------------------- */
    const hymnsArray = Array.isArray(data) ? data : data?.hymns;

    /* -----------------------------------------------------
       VALIDATION
       Ensures dataset is usable before rendering app
    ----------------------------------------------------- */
    if (!Array.isArray(hymnsArray)) {
      console.error("Invalid JSON structure received:", data);

      throw new Error(
        "Invalid hymns.json format: expected array or { hymns: [] }",
      );
    }

    /* -----------------------------------------------------
       IMMUTABLE CACHE STORAGE
       Prevents accidental runtime modification of dataset
    ----------------------------------------------------- */
    hymnsCache = Object.freeze([...hymnsArray]);

    return hymnsCache;
  } catch (error) {
    /* -----------------------------------------------------
       CENTRALIZED ERROR HANDLING
    ----------------------------------------------------- */
    console.error("Hymn loading error:", error);
    throw error;
  }
}
