import { getHymns } from "./hymns.js";
import { SLOT_RULES } from "./slotRules.js";
import { getSavedPlans, deletePlan, updatePlan } from "./plansStorage";

let appRoot = null;

// Stores editable plans
let draftPlans = [];

// Tracks edit mode per plan
const editMode = new Set();

// Slot labels
const SLOT_LABELS = {
  opening: "Opening",
  sacrament: "Sacrament",
  intermediate: "Intermediate",
  closing: "Closing",
};

// Title case formatter for slot labels
const formatSlotLabel = (slot) => SLOT_LABELS[slot] || slot;

// Fix central refresh function
function refresh() {
  loadDraftPlans();
  renderPlans(appRoot);
}

// Draft plans loading
function loadDraftPlans() {
  const savedPlans = getSavedPlans();

  draftPlans = JSON.parse(JSON.stringify(savedPlans || []));

  // Normalize hymn slots → always store IDs only
  draftPlans = draftPlans.map((p) => ({
    ...p,
    hymns: Object.fromEntries(
      Object.entries(p.hymns || {}).map(([slot, value]) => [
        slot,
        value && typeof value === "object" ? value.id : (value ?? null),
      ]),
    ),
  }));
}

// Initializes the Plans page
export function initPlansPage(root) {
  appRoot = root;

  root.innerHTML = `
    <section class="plans">
        <h1>Saved Hymn Plans</h1>
        
        <!-- Container where plans will be rendered -->
        <div id="plansContainer"></div>
    </section>`;

  // Initial load
  loadDraftPlans();
  renderPlans(appRoot);
}

// Reads the localStorage and renders all saved plans
async function renderPlans(root) {
  const container = root.querySelector("#plansContainer");

  const hymns = await getHymns();

  if (draftPlans.length === 0) {
    container.innerHTML = `<p>No saved plans yet.</p>`;
    return;
  }

  container.innerHTML = draftPlans
    .map((plan) => planCard(plan, hymns))
    .join("");

  attachEventsOnce(root, hymns);
}

// Builds each plan card
function planCard(plan, hymns) {
  const isEditing = editMode.has(plan.id);
  return `
    <div class="plan-card" data-plan="${plan.id}">
          <div class="action-bar">
            <!-- Date -->
            <h3>${new Date(plan.createdAt).toLocaleString()}</h3>

            <div class="actions">
              <!-- Edit Toggle -->
              <button data-action="edit" data-id="${plan.id}" aria-label="Edit Plan">
                <img src="./images/edit.svg" alt="Edit"/>
              </button>

              ${
                isEditing
                  ? `
                <!-- Save Icon -->
                <button data-action="save" data-id="${plan.id}" aria-label="Save Plan">
                  <img src="./images/save.svg" alt="Save"/>
                </button>

                <!-- Reset Icon -->
                <button data-action="reset" data-id="${plan.id}" aria-label="Reset Changes">
                  <img src="./images/reset.svg" alt="Reset"/>
                </button>`
                  : ""
              }

              <!-- Print Icon -->
              <button data-action="print" data-id="${plan.id}" aria-label="Print Plan">
                <img src="./images/print.svg" alt="Print"/>
              </button>

              <!-- Delete Icon --><button data-action="delete" data-id="${plan.id}" aria-label="Delete Plan">
                <img src="./images/delete.svg" alt="Delete"/>
              </button>
            </div>
          </div>

          <hr/>
          
          <!--Input Summary-->
          <p><strong>Input:</strong></p>
          <p>Topic 1: ${plan.input?.topic1 || "-"}</p>
          <p>Topic 2: ${plan.input?.topic2 || "-"}</p>
          <p>Topic 3: ${plan.input?.topic3 || "-"}</p>
          <p>Mood: ${plan.input?.mood || "-"}</p>
          
          <hr/>
          
          <!-- Hymn Results -->
          ${renderSlot(plan, "opening", hymns, isEditing)}
          ${renderSlot(plan, "sacrament", hymns, isEditing)}
          ${renderSlot(plan, "intermediate", hymns, isEditing)}
          ${renderSlot(plan, "closing", hymns, isEditing)}
      </div>`;
}

// Filter hymns according to slot rules
function filterHymnsBySlot(hymns, slot) {
  const rules = SLOT_RULES[slot];

  // If no rules exist, return all hymns
  if (!rules) return hymns;

  return hymns.filter((hymn) => {
    const topics = (hymn.topics || []).map((t) => t.toLowerCase());
    const keywords = (hymn.keywords || []).map((k) => k.toLowerCase());

    // Sacrament strict filter
    if (slot === "sacrament") {
      const strict = (rules.strictTopics || []).map((s) => s.toLowerCase());

      return strict.some(
        (s) =>
          topics.some((t) => t.includes(s)) ||
          keywords.some((k) => k.includes(s)),
      );
    }

    // Other slots
    const allTags = [...topics, ...keywords];
    return (rules.topics || []).some((t) => {
      const normT = t.toLowerCase();
      return allTags.some((tag) => tag.includes(normT));
    });
  });
}

// Render slot
function renderSlot(plan, slot, hymns, isEditing) {
  const list = filterHymnsBySlot(hymns, slot);
  const current = String(plan.hymns?.[slot] ?? "");

  return `
  <div class="slot">
    <label>${formatSlotLabel(slot)}</label>

    <select data-slot="${slot}" data-plan="${plan.id}" ${!isEditing ? "disabled" : ""}>
      ${list
        .map(
          (h) => `
            <option value="${h.id}" ${String(h.id) === current ? "selected" : ""}>
              ${h.title}
            </option>
          `,
        )
        .join("")}
    </select>
  </div>
`;
}

// Event Handlers
let boundContainer = null;

function attachEventsOnce(root) {
  const container = root.querySelector("#plansContainer");

  if (boundContainer === container) return;
  boundContainer = container;

  container.addEventListener("click", (e) => {
    const button = e.target.closest("button");
    if (!button) return;

    const id = button.dataset.id;
    const action = button.dataset.action;

    switch (action) {
      case "edit":
        toggleEdit(id);
        refresh();
        break;

      case "save":
        savePlan(id);
        refresh();
        break;

      case "reset":
        resetPlan(id);
        refresh();
        break;

      case "print":
        printPlan(id);
        break;

      case "delete":
        deletePlan(id);
        refresh();
        break;
    }
  });

  // UI-only update (not persisted until SAVE)
  container.addEventListener("change", (e) => {
    const select = e.target.closest("select");
    if (!select) return;

    const planId = select.dataset.plan;
    const slot = select.dataset.slot;

    const plan = draftPlans.find((p) => p.id === planId);
    if (!plan) return;

    if (!plan.hymns) plan.hymns = {};
    plan.hymns[slot] = String(select.value);
  });
}

// Actions
function toggleEdit(id) {
  if (editMode.has(id)) editMode.delete(id);
  else editMode.add(id);
}

function savePlan(id) {
  const plan = draftPlans.find((p) => p.id === id);
  if (!plan) return;

  updatePlan(plan);
  editMode.delete(id);

  refresh();
}

function resetPlan(id) {
  const saved = getSavedPlans();
  const original = saved.find((p) => p.id === id);

  const draft = draftPlans.find((p) => p.id === id);
  if (!draft || !original) return;

  draft.hymns = Object.fromEntries(
    Object.entries(original.hymns || {}).map(([slot, value]) => [
      slot,
      value && typeof value === "object" ? value.id : (value ?? null),
    ]),
  );

  editMode.delete(id);

  refresh();
}

function printPlan(id) {
  const target = document.querySelector(`[data-plan="${id}"]`);
  if (!target) return;

  document
    .querySelectorAll(".plan-card")
    .forEach((el) => el.classList.remove("print-target"));

  target.classList.add("print-target");

  setTimeout(() => {
    window.print();
    target.classList.remove("print-target");
  }, 50);
}
