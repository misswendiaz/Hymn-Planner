import { expandTopics } from "./datamuseService.js";
import { getHymns } from "./hymns.js";
import { SACRAMENT_HYMN_IDS } from "./sacramentRegistry.js";
import { SLOT_RULES } from "./slotRules.js";

// Generate hymn recommendations for all the slots
export async function generateHymnPlan(userInput) {
  // Load dataset from JSON
  const hymns = await getHymns();

  // Tracks used hymns to avoid duplicates
  const usedIds = new Set();

  // Extract base topics from user input
  const baseTopics = [
    userInput?.topic1,
    userInput?.topic2,
    userInput?.topic3,
  ].filter(Boolean);

  // Expand topics using Datamuse API
  const expandedTopics = await expandTopics(baseTopics);

  // Build enriched user input object
  const enrichedInput = {
    ...userInput,
    expandedTopics: expandedTopics,
  };

  // Generate hymns per slot using scoring engine
  return {
    opening: pickBestHymn(hymns, enrichedInput, "opening", usedIds),
    sacrament: pickBestHymn(hymns, enrichedInput, "sacrament", usedIds),
    intermediate: pickBestHymn(hymns, enrichedInput, "intermediate", usedIds),
    closing: pickBestHymn(hymns, enrichedInput, "closing", usedIds),
  };
}

// Select best hymn for a given slot
function pickBestHymn(hymns, userInput, slot, usedIds) {
  // Load slot-specific scoring rules
  const rules = SLOT_RULES[slot];

  // Makes sure slot exists
  if (!rules) {
    console.warn("[SlotRules] Invalid Slot: ", slot);
    return null;
  }

  // Build candidate pool
  let pool = hymns;

  // Hard filter for sacrament only
  if (slot === "sacrament") {
    pool = hymns.filter((hymn) => SACRAMENT_HYMN_IDS.has(hymn.id));
  }

  // Score all hymns in pool
  const scored = [];

  for (const hymn of pool) {
    // Prevent duplicate hymn usage across slots
    if (usedIds.has(hymn.id)) continue;

    const score = scoreHymn(hymn, userInput, rules);

    // Ignore invalid candidates
    if (score === -Infinity) continue;

    scored.push({ hymn, score });
  }

  // Handle empty results
  if (scored.length === 0) {
    console.warn("[Engine] No valid hymns for slot: ", slot);
    return null;
  }

  // Sort by score (highest first)
  scored.sort((a, b) => b.score - a.score);

  // Take TOP N candidates for randomness pool
  const TOP_N = 20;
  const topPool = scored.slice(0, TOP_N);

  const finalPool = topPool.length ? topPool : scored;

  // Random selection from top candidates
  const selected =
    finalPool[Math.floor(Math.random() * finalPool.length)]?.hymn;

  if (!selected) return null;

  // Mark hymn as used so it won't appear again
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
  const inputTopics = (userInput.expandedTopics || [])
    .filter((t) => typeof t === "string" && t.trim().length > 0)
    .map(normalize);

  const inputMood = normalize(userInput.mood);

  // Topic matching
  for (const t of inputTopics) {
    if (containsMatch(topics, t)) score += rules.topicBoost;
    if (containsMatch(keywords, t)) score += rules.keywordBoost;
  }

  // Slot-specific topic bonus
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

  // Sacrament strict filter
  if (rules.strictMode) {
    const strictTopics = (rules.strictTopics || []).map(normalize);

    const hasMatch = strictTopics.some(
      (strict) => topics.includes(strict) || keywords.includes(strict),
    );

    if (hasMatch) {
      score += rules.moodBoost * 2;
    }
  }

  // Small randomness to prevent identical results
  score += Math.random() * 8;

  if (import.meta.env?.DEV) {
    console.log("[Score]: ", hymn.title, score);
  }

  return score;
}
