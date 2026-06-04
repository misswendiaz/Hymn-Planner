import { getHymns } from "./hymns.js";

// Defines how each hymn slot should be filled
const slotRules = {
  // Opening Hymns
  opening: {
    topicBoost: 10,
    keywordBoost: 5,
    moodBoost: 6,
    preferredMoods: [
      "joyfully",
      "cheerfully",
      "enthusiastically",
      "brightly",
      "boldly",
      "triumphantly",
    ],
    topics: [
      "faith",
      "praise",
      "zion",
      "missionary work",
      "gathering of israel",
    ],
  },

  // Sacrament Hymns
  sacrament: {
    topicBoost: 15,
    keywordBoost: 10,
    moodBoost: 8,
    strictTopics: [
      "atonement of jesus christ",
      "jesus christ",
      "sacrament",
      "repentance",
      "forgiveness",
      "crucifixion",
      "resurrection",
      "plan of salvation",
    ],
    preferredMoods: [
      "reverently",
      "prayerfully",
      "thoughtfully",
      "reflectively",
      "solemnly",
    ],
    strictMode: true,
  },

  // Intermediate Hymns
  intermediate: {
    topicBoost: 12,
    keywordBoost: 6,
    moodBoost: 6,
    preferredMoods: [
      "boldly",
      "confidently",
      "triumphantly",
      "with conviction",
      "with spirit",
    ],
    topics: [
      "testimony",
      "faith",
      "missionary work",
      "service",
      "discipleship",
      "zion",
    ],
  },

  // Closing Hymns
  closing: {
    topicBoost: 10,
    keywordBoost: 5,
    moodBoost: 6,

    preferredMoods: ["gratefully", "peacefully", "joyfully", "reverently"],

    topics: ["testimony", "faith", "gratitude", "discipleship", "service"],
  },
};

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
  const rules = slotRules[slot];

  let best = null;
  let bestScore = -Infinity;

  for (const hymn of hymns) {
    // Skip hymns used in another slot
    if (usedIds.has(hymn.id)) continue;

    const score = scoreHymn(hymn, userInput, rules);

    if (score > bestScore) {
      bestScore = score;
      best = hymn;
    }
  }

  // Mark selected hymn as used
  if (best) {
    usedIds.add(best.id);
  }

  return best;
}

const normalize = (s) => (s || "").toLowerCase().trim();

// checks if ANY item contains the query
const containsMatch = (list, query) => {
  const q = normalize(query);
  return list.some((item) => item.includes(q) || q.includes(item));
};

// Computes how well a hymn matches
function scoreHymn(hymn, userInput, rules) {
  // Prevents crash when userInput is undefined
  userInput = userInput || {};

  let score = 0;

  // Normalize hymn metadata for comparison
  const topics = Array.isArray(hymn.topics)
    ? hymn.topics.map((t) => normalize(t))
    : [];
  const keywords = Array.isArray(hymn.keywords)
    ? hymn.keywords.map((k) => normalize(k))
    : [];
  const mood = typeof hymn.mood === "string" ? hymn.mood.toLowerCase() : "";

  // Normalize user input topics
  const inputTopics = [userInput.topic1, userInput.topic2, userInput.topic3]

    .filter((t) => typeof t === "string" && t.trim().length > 0)
    .map((t) => t.trim().toLowerCase());

  const inputMood =
    typeof userInput.mood === "string" ? userInput.mood.toLowerCase() : "";

  // Topic Matching
  for (const t of inputTopics) {
    const isTopicMatch = containsMatch(topics, t);
    const isKeywordMatch = keywords.includes(normalize(t));

    if (isTopicMatch) score += rules.topicBoost;
    if (isKeywordMatch) score += rules.keywordBoost;
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
    const strictTopics = rules.strictTopics || [];
    const match = strictTopics.some((t) => containsMatch(topics, t));

    // Reject hymn not matching sacred constraints
    if (!match) {
      return -Infinity;
    }
  }

  return score;
}
