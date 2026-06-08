const BASE_URL = "https://api.datamuse.com/words";

// Fetch related words from Datamuse
async function fetchWords(query) {
  const url = `${BASE_URL}?ml=${encodeURIComponent(query)}&max=8`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    return data.map((item) => item.word);
  } catch (err) {
    console.warn("[Datamuse] Failed for:", query, err);
    return [];
  }
}

// Expand a list of topics using Datamuse
export async function expandTopics(topics = []) {
  const results = new Set();

  for (const t of topics) {
    const words = await fetchWords(t);
    results.add(t); // keep original

    for (const w of words) {
      results.add(w.toLowerCase());
    }
  }

  return [...results];
}
