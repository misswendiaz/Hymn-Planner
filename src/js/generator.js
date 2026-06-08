import { createMoodSelect } from "./selectMoods.js";
import { generateHymnPlan } from "./recommendationEngine.js";
import { savePlan } from "./plansStorage.js";

let currentPlan = null;
let lastInput = null;

// Renders the Generator page in the main
export async function initGeneratorPage(root) {
  // Creates the page structure
  root.innerHTML = `
  <section class="generator">
    <h1 class="page-title">Hymns Generator</h1>

    <div class="generator">
      
      <div class="panel-card">

      <!-- INPUT PANEL -->

      <!-- Topics -->
        <h2 class="card-title">Topics</h2>
        <div class="topics">
          <label for="topic1">Topic 1</label>
          <input class="topics" id="topic1" placeholder="Topic 1">

          <label for="topic2">Topic 2</label>
          <input class="topics" id="topic2" placeholder="Topic 2">

          <label for="topic3">Topic 3</label>
          <input class="topics" id="topic3" placeholder="Topic 3">
        </div>
        
        <!-- Mood Dropdown -->
        <div id="mood-container"></div>

        <!-- Generate Hymns Button -->
        <div class="generate-button">
          <button id="generateButton">Generate Hymns</button>
        </div>

      </div>

      

      <div class="panel-card">

        <!-- OUTPUT PANEL -->

        <!-- Suggested Hymns -->
        <div class="suggestions">

          <h2 class="card-title">Hymn Suggestions</h2>

          <div class="suggestions">
            <p>Opening Hymn: <span id="opening"></span></p>
            <p>Sacrament Hymn: <span id="sacrament"></span></p>
            <p>Intermediate Hymn: <span id="intermediate"></span></p>
            <p>Closing Hymn: <span id="closing"></span></p>
          </div>

          <!-- Actions -->

          <div class="actions-bar">
            <!-- Save Button -->
            <button id="saveButton">Save</button>

            <!-- Print Button -->
            <button id="printButton">Print</button>
          </div>

        </div>
      </div>
    </div>

  </section>`;

  // Mood selection injection
  const moodContainer = root.querySelector("#mood-container");
  if (moodContainer) {
    moodContainer.innerHTML = await createMoodSelect("mood", "Select Mood");
  }

  // Handles the Generate Hymns button click
  const generateButton = root.querySelector("#generateButton");

  if (generateButton) {
    generateButton.addEventListener("click", async () => {
      const data = {
        topic1: root.querySelector("#topic1")?.value || "",
        topic2: root.querySelector("#topic2")?.value || "",
        topic3: root.querySelector("#topic3")?.value || "",
        mood: root.querySelector("#mood")?.value || "",
      };

      console.log("Generate Payload: ", data);

      lastInput = data;

      // Connect to hymn recommendation engine
      const plan = await generateHymnPlan(data);

      console.log("CURRENT PLAN:", plan);
      console.log("LAST INPUT:", data);
      console.log("PLAN RESULT: ", plan);

      currentPlan = plan;

      // Render results
      const getTitle = (h) => h?.title ?? "No match";
      root.querySelector("#opening").textContent = getTitle(plan.opening);
      root.querySelector("#sacrament").textContent = getTitle(plan.sacrament);
      root.querySelector("#intermediate").textContent = getTitle(
        plan.intermediate,
      );
      root.querySelector("#closing").textContent = getTitle(plan.closing);
    });
  }

  // Handles the Save button click
  const saveButton = root.querySelector("#saveButton");

  if (saveButton) {
    saveButton.addEventListener("click", () => {
      // Prevent saving if nothing was generated yet
      if (!currentPlan) {
        console.warn("No plan to save yet.");
        return;
      }

      const planToSave = {
        id: `plan-${Date.now()}`,
        createdAt: new Date().toISOString(),

        // Store user inputs
        input: lastInput,

        // Stores generated hymns
        hymns: {
          opening: currentPlan.opening,
          sacrament: currentPlan.sacrament,
          intermediate: currentPlan.intermediate,
          closing: currentPlan.closing,
        },
      };

      console.log("CURRENT PLAN:", currentPlan);
      console.log("LAST INPUT:", lastInput);
      console.log("PLAN TO SAVE:", planToSave);

      savePlan(planToSave);

      console.log("Saved Plan: ", planToSave);
    });
  }

  // Handles the Print button click
  const printButton = root.querySelector("#printButton");

  if (printButton) {
    printButton.addEventListener("click", () => {
      window.print();
    });
  }
}
