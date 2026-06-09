import { searchHymnVideo } from "./youtubeApi.js";

const queue = [];
let isProcessing = false;

const DELAY_MS = 400;

// Public API
export function queueYoutubeRequest(hymn, onResult) {
  queue.push({ hymn, onResult });
  processQueue();
}

// Worker
async function processQueue() {
  if (isProcessing) return;
  isProcessing = true;

  while (queue.length > 0) {
    const { hymn, onResult } = queue.shift();

    try {
      const query =
        hymn.youtube_query ||
        `${hymn.number} ${hymn.title} hymn piano accompaniment`;

      const result = await searchHymnVideo(query);
      const videoId = result?.videoId || null;

      onResult(videoId);
    } catch (err) {
      console.warn("YouTube queue error:", err);
      onResult(null);
    }

    await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  isProcessing = false;
}
