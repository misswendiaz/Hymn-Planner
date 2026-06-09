const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

// console.log("YOUTUBE KEY:", import.meta.env.VITE_YOUTUBE_API_KEY);

export async function searchHymnVideo(query) {
  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/search");

    url.searchParams.set("part", "snippet");
    url.searchParams.set("q", query);
    url.searchParams.set("type", "video");
    url.searchParams.set("maxResults", "1");
    url.searchParams.set("videoEmbeddable", "true");
    url.searchParams.set("key", API_KEY);

    console.log("REQUEST URL:", url.toString());

    const res = await fetch(url);

    const data = await res.json();

    if (!res.ok) {
      console.error("YouTube API Error:", data);
      return null;
    }

    if (!data.items?.length) return null;

    return {
      videoId: data.items[0].id.videoId,
    };
  } catch (err) {
    console.error("YouTube fetch failed:", err);
    return null;
  }
}
