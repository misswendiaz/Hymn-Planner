import { getMoods } from "./moods.js";

// Creates a Mood dropdown
export async function createMoodSelect(
  id,
  labelText = "Mood",
  selectedValue = "",
) {
  // Fetch moods from moods.json
  const moods = await getMoods();

  // Convert selected value to lower case for safe comparison and prevents crash when selectedValue is missing
  const normalizedSelected = (selectedValue || "").toLowerCase();
  return `
    <!-- Mood -->
    <div class="form-group mood-select">

      
      <label for="${id}">${labelText}</label>
      <select id="${id}" name="${id}" aria-label="${labelText}">

        <!-- Default Option -->
        <option value="">Any</option>

        ${
          moods
            .map((mood) => {
              // Convert mood value to lower case for consistent comparison
              const value = mood.toLowerCase();

              // Pre-select option if it matches the current value
              const selected = value === normalizedSelected ? "selected" : "";

              // Return HTML for a single option
              return `<option value="${value}" ${selected}>${mood}</option>
            `;
            })
            .join("") // Combine all option strings into one HTML block
        }

      </select>
    </div>
  `;
}
