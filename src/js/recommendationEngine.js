import { getHymns } from "./hymns.js";
import { SLOT_RULES } from "./slotRules.js";

// Generate hymn recommendations for all the slots
export async function generateHymnPlan(userInput) {
  // Load dataset from JSON
  const hymns = await getHymns();

  // Tracks used hymns to avoid duplicates
  const usedIds = new Set();

  // Return structure hymn plan
  return {
    opening: pickBestHymn(hymns, userInput, "opening", usedIds),
    sacrament: pickBestHymn(hymns, userInput, "sacrament", usedIds),
    intermediate: pickBestHymn(hymns, userInput, "intermediate", usedIds),
    closing: pickBestHymn(hymns, userInput, "closing", usedIds),
  };
}

// Select best hymn for a given slot
function pickBestHymn(hymns, userInput, slot, usedIds) {
  const rules = SLOT_RULES[slot];

  if (!rules) {
    console.warn("[SlotRules] Invalid Slot: ", slot);
    return null;
  }

  // Store scored hymns intead of picking immediately
  const scored = [];

  for (const hymn of hymns) {
    // Skip hymns used in another slot
    if (usedIds.has(hymn.id)) continue;

    const score = scoreHymn(hymn, userInput, rules);

    // Ignore invalid candidates
    if (score === -Infinity) continue;

    scored.push({ hymn, score });
  }

  // No candidate at all
  if (scored.length === 0) {
    console.warn("[Engine] No valid hymns for slot: ", slot);
    return null;
  }

  // Sort by score (highest first)
  scored.sort((a, b) => b.score - a.score);

  // Take TOP N candidates for randomness pool
  const TOP_N = 20;
  const pool = scored.slice(0, TOP_N);

  const finalPool = pool.length ? pool : scored;

  const selected =
    finalPool[Math.floor(Math.random() * finalPool.length)]?.hymn;

  if (!selected) return null;

  usedIds.add(selected.id);
  return selected;
}

const normalize = (s) => (typeof s === "string" ? s.toLowerCase().trim() : "");

// Checks if ANY item contains the query
const containsMatch = (list, query) => {
  const q = normalize(query);

  return list.some((item) => {
    if (typeof item !== "string") return false;
    return item.includes(q) || q.includes(item);
  });
};

// Computes how well a hymn matches
function scoreHymn(hymn, userInput, rules) {
  // Prevents crash when userInput is undefined
  userInput = userInput || {};

  let score = 0;

  // Normalize hymn metadata for comparison
  const topics = (hymn.topics || []).map(normalize);
  const keywords = (hymn.keywords || []).map(normalize);
  const mood = normalize(hymn.mood);

  // Normalize user input topics
  const inputTopics = [userInput.topic1, userInput.topic2, userInput.topic3]
    .filter((t) => typeof t === "string" && t.trim().length > 0)
    .map(normalize);

  const inputMood = normalize(userInput.mood);

  // Topic Matching
  for (const t of inputTopics) {
    if (containsMatch(topics, t)) score += rules.topicBoost;
    if (containsMatch(keywords, t)) score += rules.keywordBoost;
  }

  // Slot-Specific Topic Bonus
  if (Array.isArray(rules.topics)) {
    for (const t of rules.topics) {
      if (containsMatch(topics, t)) {
        score += rules.topicBoost;
      }
    }
  }

  // Mood-Matching
  let moodScore = 0;

  const preferredMatch = rules.preferredMoods?.includes(mood);

  const moodMatch =
    inputMood && (mood.includes(inputMood) || inputMood.includes(mood));

  if (preferredMatch) {
    moodScore += rules.moodBoost;
  } else if (moodMatch) {
    moodScore += rules.moodBoost;
  }

  score += Math.min(moodScore, rules.moodBoost * 1.5);

  // Sacrament Strict Filter
  if (rules.strictMode) {
    const strictTopics = (rules.strictTopics || []).map(normalize);

    const match = strictTopics.some(
      (strict) =>
        topics.some((t) => t.includes(strict)) ||
        keywords.some((k) => k.includes(strict)),
    );

    // Reject hymn not matching sacred constraints
    if (!match) {
      return -Infinity;
    }
  }

  // Small randomness to prevent identical results
  score += Math.random() * 8;

  if (import.meta.env?.DEV) {
    console.log("[Score]: ", hymn.title, score);
  }

  return score;
}
