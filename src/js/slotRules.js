const deepFreeze = (object) => {
  if (!object || typeof object !== "object") return object;

  Object.keys(object).forEach((key) => {
    if (typeof object[key] === "object" && object[key] !== null) {
      deepFreeze(object[key]);
    }
  });
  return Object.freeze(object);
};

// Defines how each hymn slot should be filled
export const SLOT_RULES = deepFreeze({
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
      "atonement",
      "sacrament",
      "crucifixion",
      "redeemer",
      "savior",
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
});
