import { createMoodSelect } from "./selectMoods.js";

// Renders the Generator page in the main
export async function initGeneratorPage(root) {
  // Creates the page structure
  root.innerHTML = `
  <section class="generator">
    <h1>Hymns Generator</h1>

    <!-- INPUT PANEL -->
    <!-- Topics -->
    <div class="topics">
      <label for="topic1">Topic 1</label>
      <input id="topic1" placeholder="Topic 1" required>
      
      <label for="topic2">Topic 2</label>
      <input id="topic2" placeholder="Topic 2">
      
      <label for="topic3">Topic 3</label>
      <input id="topic3" placeholder="Topic 3">
    </div>

    <!-- Mood Dropdown -->
    <div id="mood-container"></div>
    
    <!-- Generate Hymns Button -->
    <button id="generateButton">Generate Hymns</button>

    <!-- OUTPUT PANEL -->
  <!-- Suggested Hymns -->
  <div class="suggestions">
    <h2>Hymn Suggestions</h2>
    <p>Opening Hymn: <span id="opening"></span></p>
    <p>Sacrament Hymn: <span id="sacrament"></span></p>
    <p>Intermediate Hymn: <span id="intermediate"></span></p>
    <p>Closing Hymn: <span id="closing"></span></p>

    <!-- Save Button -->
    <button id="saveButton">Save</button>

    <!-- Print Button -->
    <button id="printButton">Print</button>
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
    generateButton.addEventListener("click", () => {
      const data = {
        topic1: root.querySelector("#topic1")?.value || "",
        topic2: root.querySelector("#topic2")?.value || "",
        topic3: root.querySelector("#topic3")?.value || "",
        mood: root.querySelector("#mood")?.value || "",
      };

      console.log("Generate Payload: ", data);

      // Connect to hymn recommendation engine
    });
  }
}
