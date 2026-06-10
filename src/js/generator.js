import { createMoodSelect } from "./selectMoods.js";
import { generateHymnPlan } from "./recommendationEngine.js";
import { savePlan } from "./plansStorage.js";

let currentPlan = null;
let lastInput = null;
let isGenerating = false;

/* =========================================================
   INIT
   ========================================================= */

export async function initGeneratorPage(root) {
  root.innerHTML = `
  <section class="generator">
    <h1 class="page-title">Hymns Generator</h1>

    <div class="generator">

      <div class="panel-card">

        <h2 class="card-title">Topics</h2>

        <div class="topics">
          <label>Topic 1</label>
          <input id="topic1" placeholder="Topic 1">

          <label>Topic 2</label>
          <input id="topic2" placeholder="Topic 2">

          <label>Topic 3</label>
          <input id="topic3" placeholder="Topic 3">
        </div>

        <div id="mood-container"></div>

        <div class="generate-button">
          <button id="generateButton">Generate Hymns</button>
        </div>

      </div>

      <div class="panel-card">

        <h2 class="card-title">Hymn Suggestions</h2>

        <div class="suggestions">
          <p>Opening: <span id="opening"></span></p>
          <p>Sacrament: <span id="sacrament"></span></p>
          <p>Intermediate: <span id="intermediate"></span></p>
          <p>Closing: <span id="closing"></span></p>
        </div>

        <div class="actions-bar">
          <button id="saveButton">Save</button>
          <button id="printButton">Print</button>
        </div>

      </div>
    </div>
  </section>`;

  /* =========================================================
     MOOD SELECT
     ========================================================= */

  const moodContainer = root.querySelector("#mood-container");
  moodContainer.innerHTML = await createMoodSelect("mood", "Select Mood");

  /* =========================================================
     GENERATE BUTTON
     ========================================================= */

  const generateButton = root.querySelector("#generateButton");

  generateButton.addEventListener("click", async () => {
    if (isGenerating) return;

    isGenerating = true;
    generateButton.textContent = "Generating...";

    try {
      const data = {
        topic1: root.querySelector("#topic1")?.value?.trim() || "",
        topic2: root.querySelector("#topic2")?.value?.trim() || "",
        topic3: root.querySelector("#topic3")?.value?.trim() || "",
        mood: root.querySelector("#mood")?.value?.trim() || "",
      };

      lastInput = data;

      const plan = await generateHymnPlan(data);

      console.log("RAW PLAN:", plan);

      /* =========================================================
         SAFETY NORMALIZATION (CRITICAL FIX)
         ========================================================= */

      currentPlan = {
        opening: plan?.opening ?? null,
        sacrament: plan?.sacrament ?? null,
        intermediate: plan?.intermediate ?? null,
        closing: plan?.closing ?? null,
      };

      const getTitle = (h) => h?.title ?? "No match";

      root.querySelector("#opening").textContent = getTitle(
        currentPlan.opening,
      );
      root.querySelector("#sacrament").textContent = getTitle(
        currentPlan.sacrament,
      );
      root.querySelector("#intermediate").textContent = getTitle(
        currentPlan.intermediate,
      );
      root.querySelector("#closing").textContent = getTitle(
        currentPlan.closing,
      );
    } catch (err) {
      console.error("Generation failed:", err);
      alert("Failed to generate hymn plan. Check console.");
    } finally {
      isGenerating = false;
      generateButton.textContent = "Generate Hymns";
    }
  });

  /* =========================================================
     SAVE BUTTON
     ========================================================= */

  const saveButton = root.querySelector("#saveButton");

  saveButton.addEventListener("click", () => {
    if (!currentPlan) {
      alert("No generated plan to save yet.");
      return;
    }

    const planToSave = {
      id: `plan-${Date.now()}`,
      createdAt: new Date().toISOString(),
      input: lastInput || {},

      hymns: {
        opening: currentPlan.opening?.id ?? null,
        sacrament: currentPlan.sacrament?.id ?? null,
        intermediate: currentPlan.intermediate?.id ?? null,
        closing: currentPlan.closing?.id ?? null,
      },
    };

    console.log("Saving Plan:", planToSave);

    savePlan(planToSave);
  });

  /* =========================================================
     PRINT BUTTON
     ========================================================= */

  root.querySelector("#printButton").addEventListener("click", () => {
    window.print();
  });
}
