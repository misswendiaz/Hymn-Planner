import { getHymns } from "./hymns.js";
import { getSavedPlans, updatePlan } from "./plansStorage.js";
import { searchHymnVideo } from "./youtubeApi.js";
import { queueYoutubeRequest } from "./youtubeQueue.js";

/* =========================================================
   OFFLINE MODE + ADAPTIVE CONTROL
   ========================================================= */

// Offline mode switch (UI + behavior toggle)
let OFFLINE_MODE = false;

// Make sure UI always reflects state safely
function updateModeIndicator() {
  const el = appRoot?.querySelector(".mode-indicator");
  if (!el) return;

  el.textContent = OFFLINE_MODE
    ? "OFFLINE MODE (JSON ONLY)"
    : "ONLINE MODE (YouTube enabled)";
}

// Adaptive fallback controller
let youtubeFailureCount = 0;
const FAILURE_THRESHOLD = 3;

/* =========================================================
   STATE
   ========================================================= */

let allHymns = [];
let filteredHymns = [];
let appRoot = null;

// UI state
let currentSearch = "";
let currentFilterType = "all";
let currentFilterValue = "";

// Expanded UI state
const expandedCards = new Set();

// cache layer
const youtubeCache = new Map();

/* =========================================================
   INIT
   ========================================================= */

export async function initLibraryPage(root) {
  appRoot = root;

  allHymns = await getHymns();
  filteredHymns = [...allHymns];

  root.innerHTML = `
    <section class="library">

      <div class="library-header">
        <h1 class="page-title">Hymns Library</h1>

        <div class="mode-indicator">
          ${OFFLINE_MODE ? "OFFLINE MODE (JSON ONLY)" : "ONLINE MODE (YouTube enabled)"}
        </div>

        <div class="toolbar">
          <input id="searchInput" placeholder="Search by title or number..." />

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

      <div id="hymnGrid" class="hymn-grid"></div>

    </section>
  `;

  bindEvents(root);

  window.addEventListener("plans:updated", () => {
    renderHymns(appRoot);
  });

  ensureModal(root);
  renderHymns(root);
  updateModeIndicator();
}

/* =========================================================
   MODAL LOGIC
   ========================================================= */

function openUseModal(hymn) {
  ensureModal(appRoot);

  const modal = appRoot.querySelector("#useModal");
  const title = modal.querySelector("#modalHymnTitle");
  const planSelect = modal.querySelector("#modalPlan");

  const plans = getSavedPlans();

  title.textContent = `${hymn.number}. ${hymn.title}`;

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

  const close = () => modal.classList.add("hidden");

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

/* =========================================================
   EVENTS
   ========================================================= */

function bindEvents(root) {
  const searchInput = root.querySelector("#searchInput");
  const filterType = root.querySelector("#filterType");
  const filterValue = root.querySelector("#filterValue");
  const applyFilter = root.querySelector("#applyFilter");
  const clearFilter = root.querySelector("#clearFilter");

  searchInput.addEventListener("input", (e) => {
    currentSearch = e.target.value.toLowerCase();
    renderHymns(root);
  });

  filterType.addEventListener("change", (e) => {
    currentFilterType = e.target.value;
  });

  filterValue.addEventListener("input", (e) => {
    currentFilterValue = e.target.value.toLowerCase();
  });

  applyFilter.addEventListener("click", () => renderHymns(root));

  clearFilter.addEventListener("click", () => {
    currentSearch = "";
    currentFilterType = "all";
    currentFilterValue = "";

    searchInput.value = "";
    filterValue.value = "";
    filterType.value = "all";

    renderHymns(root);
  });

  root.addEventListener("click", (e) => {
    const viewButton = e.target.closest("[data-action='view']");
    const useButton = e.target.closest("[data-action='use']");
    const refreshButton = e.target.closest("[data-action='refresh']");

    if (viewButton) toggleDetails(viewButton.dataset.id);
    if (useButton) handleUseHymn(useButton.dataset.id);

    if (refreshButton) {
      refreshYoutubeVideo(refreshButton.dataset.id);
    }
  });
}

/* =========================================================
   MODAL INJECTION
   ========================================================= */

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

/* =========================================================
   YOUTUBE RESOLUTION
   ========================================================= */

async function resolveYoutubeVideo(hymn, force = false) {
  // Hard stop all API usage in offline mode
  if (OFFLINE_MODE) return null;

  const cached = youtubeCache.get(hymn.id);
  if (cached && !force) return cached;

  const query =
    hymn.youtube_query ||
    `${hymn.number} ${hymn.title} hymn piano accompaniment`;

  try {
    const result = await searchHymnVideo(query);
    const videoId = result?.videoId || null;

    youtubeCache.set(hymn.id, videoId);
    return videoId;
  } catch (err) {
    console.warn("YouTube request failed: ", err);
    // Treat only real API failures as failure signal
    youtubeFailureCount++;

    if (youtubeFailureCount >= FAILURE_THRESHOLD) {
      OFFLINE_MODE = true;
      updateModeIndicator();
      console.warn("⚠️ Auto OFFLINE MODE triggered due to failures.");
    }

    return null;
  }
}

/* =========================================================
   RENDER
   ========================================================= */

async function renderHymns(root) {
  const container = root.querySelector("#hymnGrid");

  filteredHymns = allHymns.filter((hymn) => {
    const matchesSearch =
      hymn.title.toLowerCase().includes(currentSearch) ||
      String(hymn.number).includes(currentSearch);

    return matchesSearch && applyFilterLogic(hymn);
  });

  container.innerHTML = filteredHymns.map(renderHymnCard).join("");

  setupVideoObservers();
}

/* =========================================================
   FILTER LOGIC (UNCHANGED)
   ========================================================= */

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

/* =========================================================
   CARD RENDERING
   ========================================================= */

function renderHymnCard(hymn) {
  const isExpanded = expandedCards.has(hymn.id);

  return `
    <div class="hymn-card">

      <div class="hymn-header">
        <h3>${hymn.number}. ${hymn.title}</h3>
      </div>

      <div class="video-container" id="video-${hymn.id}">
        <p class="muted">Loading accompaniment...</p>
      </div>

      <div class="hymn-actions">
        <button data-action="view" data-id="${hymn.id}">View</button>
        <button data-action="use" data-id="${hymn.id}">Use</button>

        <button data-action="refresh" data-id="${hymn.id}">
          Refresh Video
        </button>
      </div>

      ${
        isExpanded
          ? `
        <div class="hymn-details">
          <p><strong>Topics:</strong> ${(hymn.topics || []).join(", ")}</p>
          <p><strong>Keywords:</strong> ${(hymn.keywords || []).join(", ")}</p>
          <p><strong>Mood:</strong> ${hymn.mood || "-"}</p>
        </div>
      `
          : ""
      }

    </div>
  `;
}

/* =========================================================
   UI HELPERS
   ========================================================= */

function toggleDetails(id) {
  if (expandedCards.has(id)) expandedCards.delete(id);
  else expandedCards.add(id);

  renderHymns(appRoot);
}

function handleUseHymn(hymnId) {
  const hymn = allHymns.find((h) => h.id === hymnId);
  if (!hymn) return;

  openUseModal(hymn);
}

/* =========================================================
   VIDEO LOADING
   ========================================================= */

function loadVideoForCard(hymn) {
  const container = document.querySelector(`#video-${hymn.id}`);
  if (!container) return;

  // FIX: offline mode hard stop
  if (OFFLINE_MODE) {
    container.innerHTML = `<p class="muted">Video disabled (offline mode)</p>`;
    return;
  }

  const cached = youtubeCache.get(hymn.id);

  if (cached !== undefined && cached !== null) {
    renderVideo(container, cached);
    return;
  }

  if (cached === null) {
    container.innerHTML = `<p class="muted">No video available</p>`;
    return;
  }

  queueYoutubeRequest(hymn, (videoId) => {
    // Adaptive failure tracking
    if (!videoId) youtubeFailureCount++;
    else youtubeFailureCount = 0;

    if (youtubeFailureCount >= FAILURE_THRESHOLD) {
      OFFLINE_MODE = true;
      updateModeIndicator();
      console.warn("⚠️ Auto OFFLINE MODE triggered.");
    }

    youtubeCache.set(hymn.id, videoId);
    renderVideo(container, videoId);
  });
}

/* =========================================================
   RENDER VIDEO
   ========================================================= */

function renderVideo(container, videoId) {
  container.innerHTML = videoId
    ? `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`
    : `<p class="muted">No video available</p>`;
}

/* =========================================================
   REFRESH (SAFE)
   ========================================================= */

async function refreshYoutubeVideo(hymnId) {
  const hymn = allHymns.find((h) => h.id === hymnId);
  if (!hymn) return;

  const container = document.querySelector(`#video-${hymn.id}`);
  if (!container) return;

  if (OFFLINE_MODE) {
    container.innerHTML = `<p class="muted">Offline mode enabled</p>`;
    return;
  }

  container.innerHTML = `<p class="muted">Searching new video...</p>`;

  const videoId = await resolveYoutubeVideo(hymn, true);

  container.innerHTML = videoId
    ? `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`
    : `<p class="muted">No video found</p>`;
}

/* =========================================================
   OBSERVER
   ========================================================= */

function setupVideoObservers() {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const hymnId = el.dataset.hymnId;

        const hymn = allHymns.find((h) => h.id === hymnId);
        if (!hymn) return;

        loadVideoForCard(hymn);

        obs.unobserve(el);
      });
    },
    { rootMargin: "200px" },
  );

  document.querySelectorAll(".video-container").forEach((el) => {
    el.dataset.hymnId = el.id.replace("video-", "");
    observer.observe(el);
  });
}
