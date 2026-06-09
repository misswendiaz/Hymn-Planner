import { searchHymnVideo } from "./youtubeApi.js";

// LocalStorage key helper
const cacheKey = (hymnId) => `yt_${hymnId}`;

export async function getHymnVideo(hymn) {
  if (!hymn?.id) return null;

  // Cache check
  const cached = localStorage.getItem(cacheKey(hymn.id));
  if (cached) {
    return cached;
  }

  // JSON fallback
  if (hymn.youtube_video_id) {
    localStorage.setItem(cacheKey(hymn.id), hymn.youtube_video_id);
    return hymn.youtube_video_id;
  }

  // Live YouTube API
  try {
    const query =
      hymn.youtube_query || `${hymn.title} LDS hymn piano accompaniment`;

    const result = await searchHymnVideo(query);

    if (result?.videoId) {
      localStorage.setItem(cacheKey(hymn.id), result.videoId);
      return result.videoId;
    }

    return null;
  } catch (err) {
    console.error("YouTube resolver failed:", err);
    return null;
  }
}
