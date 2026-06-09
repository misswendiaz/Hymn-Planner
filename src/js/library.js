import { getHymns } from "./hymns.js";
import { getSavedPlans, updatePlan } from "./plansStorage.js";

let allHymns = [];
let filteredHymns = [];
let appRoot = null;

// Current UI state
let currentSearch = "";
let currentFilterType = "all";
let currentFilterValue = "";

// Tracks expanded hymn details per card
const expandedCards = new Set();

// Initializes Library page
export async function initLibraryPage(root) {
  appRoot = root;

  // Load hymns from dataset
  allHymns = await getHymns();
  filteredHymns = [...allHymns];

  // Build page layout
  root.innerHTML = `
    <section class="library">

      <!-- HEADER -->
      <div class="library-header">
        <h1 class="page-title">Hymn Library</h1>

        <!-- SEARCH TOOLBAR -->
        <div class="toolbar">

          <input id="searchInput" placeholder="Search by title or number..." />

          <!-- FILTER TOOLBAR -->
          <select id="filterType">
            <option value="all">All</option>
            <option value="topic">Topic</option>
            <option value="keyword">Keyword</option>
            <option value="mood">Mood</option>
          </select>

          <input id="filterValue" placeholder="Filter value..." />

          <button id="applyFilter">Apply</button>
          <button id="clearFilter">Clear</button>

        </div>
      </div>

      <!-- HYMN GRID -->
      <div id="hymnGrid" class="hymn-grid"></div>

    </section>
  `;

  // Bind events
  bindEvents(root);

  window.addEventListener("plans:updated", () => {
    renderHymns(appRoot);
  });

  // Ensure modal exists once at startup
  ensureModal(root);

  // Initial render
  renderHymns(root);
}

function openUseModal(hymn) {
  ensureModal(appRoot);

  const modal = appRoot.querySelector("#useModal");
  const title = modal.querySelector("#modalHymnTitle");
  const planSelect = modal.querySelector("#modalPlan");

  const plans = getSavedPlans();

  title.textContent = `${hymn.number}. ${hymn.title}`;

  // populate plans dropdown
  planSelect.innerHTML = `
    <option value="__new__">+ Create New Plan</option>
    ${plans
      .map(
        (p) => `
        <option value="${p.id}">
          ${new Date(p.createdAt).toLocaleString()}
        </option>
      `,
      )
      .join("")}
  `;

  modal.classList.remove("hidden");

  bindModalActions(modal, hymn);
}

function bindModalActions(modal, hymn) {
  const confirmButton = modal.querySelector("#confirmUse");
  const cancelButton = modal.querySelector("#cancelUse");

  const slotSelect = modal.querySelector("#modalSlot");
  const planSelect = modal.querySelector("#modalPlan");

  const close = () => {
    modal.classList.add("hidden");
  };

  confirmButton.onclick = () => {
    const slot = slotSelect.value;
    const planChoice = planSelect.value;

    let targetPlan;

    if (planChoice === "__new__") {
      targetPlan = {
        id: `plan-${Date.now()}`,
        createdAt: new Date().toISOString(),
        input: {},
        hymns: {
          opening: null,
          sacrament: null,
          intermediate: null,
          closing: null,
        },
      };

      const existingPlans = getSavedPlans();
      existingPlans.push(targetPlan);

      updatePlan(targetPlan);
    } else {
      const plans = getSavedPlans();
      targetPlan = plans.find((p) => p.id === planChoice);

      if (!targetPlan) {
        alert("Selected plan no longer exists.");
        return;
      }
    }

    targetPlan.hymns = targetPlan.hymns || {};
    targetPlan.hymns[slot] = hymn.id;

    updatePlan(targetPlan);

    window.dispatchEvent(
      new CustomEvent("plans:updated", {
        detail: { planId: targetPlan.id },
      }),
    );

    close();
  };

  cancelButton.onclick = close;
}

// Event binding
function bindEvents(root) {
  const searchInput = root.querySelector("#searchInput");
  const filterType = root.querySelector("#filterType");
  const filterValue = root.querySelector("#filterValue");
  const applyFilter = root.querySelector("#applyFilter");
  const clearFilter = root.querySelector("#clearFilter");

  // Search handler
  searchInput.addEventListener("input", (e) => {
    currentSearch = e.target.value.toLowerCase();
    renderHymns(root);
  });

  // Filter type handler
  filterType.addEventListener("change", (e) => {
    currentFilterType = e.target.value;
  });

  // Filter value handler
  filterValue.addEventListener("input", (e) => {
    currentFilterValue = e.target.value.toLowerCase();
  });

  // Apply filter
  applyFilter.addEventListener("click", () => {
    renderHymns(root);
  });

  // Clear filter
  clearFilter.addEventListener("click", () => {
    currentSearch = "";
    currentFilterType = "all";
    currentFilterValue = "";

    searchInput.value = "";
    filterValue.value = "";
    filterType.value = "all";

    renderHymns(root);
  });

  // Event delegation for hymn cards
  root.addEventListener("click", (e) => {
    const viewButton = e.target.closest("[data-action='view']");
    const useButton = e.target.closest("[data-action='use']");

    if (viewButton) {
      toggleDetails(viewButton.dataset.id);
    }

    if (useButton) {
      handleUseHymn(useButton.dataset.id);
    }
  });
}

// Inject modal
function ensureModal(root) {
  if (root.querySelector("#useModal")) return;

  root.insertAdjacentHTML(
    "beforeend",
    `
    <div id="useModal" class="modal hidden">
      <div class="modal-content">

        <h2>Use Hymn</h2>

        <p id="modalHymnTitle"></p>

        <label>Slot</label>
        <select id="modalSlot">
          <option value="opening">Opening</option>
          <option value="sacrament">Sacrament</option>
          <option value="intermediate">Intermediate</option>
          <option value="closing">Closing</option>
        </select>

        <label>Target Plan</label>
        <select id="modalPlan"></select>

        <button id="confirmUse">Add Hymn</button>
        <button id="cancelUse">Cancel</button>

      </div>
    </div>
    `,
  );
}

// Render hymn grid
function renderHymns(root) {
  const container = root.querySelector("#hymnGrid");

  filteredHymns = allHymns.filter((hymn) => {
    const matchesSearch =
      hymn.title.toLowerCase().includes(currentSearch) ||
      String(hymn.number).includes(currentSearch);

    const matchesFilter = applyFilterLogic(hymn);

    return matchesSearch && matchesFilter;
  });

  container.innerHTML = filteredHymns.map(renderHymnCard).join("");
}

// Filter
function applyFilterLogic(hymn) {
  if (currentFilterType === "all") return true;

  const value = currentFilterValue.toLowerCase();

  if (!value) return true;

  if (currentFilterType === "topic") {
    return (hymn.topics || []).some((t) => t.toLowerCase().includes(value));
  }

  if (currentFilterType === "keyword") {
    return (hymn.keywords || []).some((k) => k.toLowerCase().includes(value));
  }

  if (currentFilterType === "mood") {
    return (hymn.mood || "").toLowerCase().includes(value);
  }

  return true;
}

// Hymn card rendering
function renderHymnCard(hymn) {
  const isExpanded = expandedCards.has(hymn.id);

  return `
    <div class="hymn-card">

      <!-- HEADER -->
      <div class="hymn-header">
        <h3>${hymn.number}. ${hymn.title}</h3>
      </div>

      <!-- YOUTUBE VIDEO -->
      <div class="video-container">
        ${
          hymn.youtubeId
            ? `<iframe
                src="https://www.youtube.com/embed/${hymn.youtubeId}"
                frameborder="0"
                allowfullscreen
              ></iframe>`
            : `<p class="muted">No video available</p>`
        }
      </div>

      <!-- ACTION BUTTONS -->
      <div class="hymn-actions">
        <button data-action="view" data-id="${hymn.id}">
          View
        </button>

        <button data-action="use" data-id="${hymn.id}">
          Use
        </button>
      </div>

      <!-- DETAILS PANEL -->
      ${
        isExpanded
          ? `
        <div class="hymn-details">

          <p><strong>Topics:</strong> ${(hymn.topics || []).join(", ")}</p>
          <p><strong>Keywords:</strong> ${(hymn.keywords || []).join(", ")}</p>
          <p><strong>Mood:</strong> ${hymn.mood || "-"}</p>

          ${
            hymn.scriptures
              ? `<p><strong>Scriptures:</strong> ${hymn.scriptures}</p>`
              : ""
          }

        </div>
      `
          : ""
      }

    </div>
  `;
}

// View details toggle
function toggleDetails(id) {
  if (expandedCards.has(id)) {
    expandedCards.delete(id);
  } else {
    expandedCards.add(id);
  }

  renderHymns(appRoot);
}

// Use hymn
function handleUseHymn(hymnId) {
  const hymn = allHymns.find((h) => h.id === hymnId);
  if (!hymn) return;

  openUseModal(hymn);
}
