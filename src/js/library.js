import { getHymns } from "./hymns.js";
import { getSavedPlans, updatePlan } from "./plansStorage.js";
import { searchHymnVideo } from "./youtubeAPI.js";

/* =========================================================
   STATE
   ========================================================= */

let appRoot = null;

let allHymns = [];
let filteredHymns = [];

let currentSearch = "";
let currentFilterType = "all";
let currentFilterValue = "";

const youtubeCache = new Map();

/* =========================================================
   INIT
   ========================================================= */

export async function initLibraryPage(root) {
  appRoot = root;

  // Load hymns from precomputed JSON (NO API CALLS)
  allHymns = await getHymns();
  filteredHymns = [...allHymns];

  root.innerHTML = `
    <section class="library">

      <div class="library-header">
        <h1 class="page-title">Hymns Library</h1>

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

  // Global event delegation for dynamic cards
  window.addEventListener("click", (e) => {
    const viewBtn = e.target.closest("[data-action='view']");
    const useBtn = e.target.closest("[data-action='use']");
    const refreshBtn = e.target.closest("[data-action='refresh']");

    if (viewBtn) {
      const card = viewBtn.closest(".hymn-card");

      if (card) {
        card.classList.add("flipped");

        setTimeout(() => {
          card.classList.remove("flipped");
        }, 600);
      }

      handleViewHymn(viewBtn.dataset.id);
    }

    if (useBtn) handleUseHymn(useBtn.dataset.id);
    if (refreshBtn) refreshYoutubeVideo(refreshBtn.dataset.id);
  });

  ensureModal(root);

  renderHymns(root);
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
}

/* =========================================================
   RENDER (PERFORMANCE SAFE)
   ========================================================= */

async function renderHymns(root) {
  const container = root.querySelector("#hymnGrid");

  filteredHymns = allHymns.filter((h) => {
    const matchesSearch =
      h.title.toLowerCase().includes(currentSearch) ||
      String(h.number).includes(currentSearch);

    return matchesSearch && applyFilterLogic(h);
  });

  container.innerHTML = "";

  // Batch rendering prevents UI freeze on 400+ hymns
  const batchSize = 50;
  let index = 0;

  function renderBatch() {
    const batch = filteredHymns
      .slice(index, index + batchSize)
      .map(renderHymnCard)
      .join("");

    container.insertAdjacentHTML("beforeend", batch);

    index += batchSize;

    if (index < filteredHymns.length) {
      requestAnimationFrame(renderBatch);
    }
  }

  renderBatch();
  requestAnimationFrame(() => {
    document.querySelectorAll(".video-container").forEach((el) => {
      const id = el.id.replace("video-", "");
      const hymn = allHymns.find((h) => h.id === id);
      if (hymn) loadVideoForCard(hymn);
    });
  });
}

/* =========================================================
   FILTER LOGIC
   ========================================================= */

function applyFilterLogic(hymn) {
  if (currentFilterType === "all") return true;

  const value = currentFilterValue.trim();
  if (!value) return true;

  if (currentFilterType === "topic") {
    return (hymn.topics || "").toLowerCase().includes(value);
  }

  if (currentFilterType === "keyword") {
    return (hymn.keywords || "").toLowerCase().includes(value);
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
  return `
    <div class="hymn-card" data-id="${hymn.id}">

      <div class="flip-inner">

        <!-- FRONT SIDE -->
        <div class="flip-front">

          <div class="hymn-header">
            <h3>${hymn.number}. ${hymn.title}</h3>
          </div>

          <div class="video-container" id="video-${hymn.id}">
            <p class="muted">Loading...</p>
          </div>

          <div class="hymn-actions">
            <button data-action="view" data-id="${hymn.id}">View</button>
            <button data-action="use" data-id="${hymn.id}">Use</button>
            <button data-action="refresh" data-id="${hymn.id}">Refresh</button>
          </div>

        </div>

        <!-- BACK SIDE -->
        <div class="flip-back">
          <div class="hymn-details">
            <h3>Quick Info</h3>
            <p><strong>Mood:</strong> ${hymn.mood || "-"}</p>
            <p><strong>Topics:</strong> ${hymn.topics || "-"}</p>
          </div>
        </div>

      </div>
    </div>
  `;
}

/* =========================================================
   USE HYMN MODAL
   ========================================================= */

function handleUseHymn(hymnId) {
  const hymn = allHymns.find((h) => h.id === hymnId);
  if (!hymn) return;

  openUseModal(hymn);
}

/* =========================================================
   VIEW HYMN MODAL
   ========================================================= */
function handleViewHymn(hymnId) {
  const hymn = allHymns.find((h) => h.id === hymnId);
  if (!hymn) return;

  const modal = appRoot.querySelector("#viewModal");

  const title = modal.querySelector("#viewTitle");
  const meta = modal.querySelector("#viewMeta");
  const openBtn = modal.querySelector("#openExternalLinks");
  const closeBtn = modal.querySelector("#closeView");

  // -----------------------------
  // TITLE
  // -----------------------------
  title.textContent = `${hymn.number}. ${hymn.title}`;

  // -----------------------------
  // FULL HYMN DETAILS (RESTORED)
  // -----------------------------
  meta.innerHTML = `
    <div class="view-details">

      <p><strong>Source:</strong> ${hymn.source || "-"}</p>

      <p><strong>Mood:</strong> ${hymn.mood || "-"}</p>

      <p><strong>Topics:</strong> ${
        Array.isArray(hymn.topics) ? hymn.topics.join(", ") : hymn.topics || "-"
      }</p>

      <p><strong>Keywords:</strong> ${
        Array.isArray(hymn.keywords)
          ? hymn.keywords.join(", ")
          : hymn.keywords || "-"
      }</p>

      <p><strong>Scripture References:</strong> ${hymn.scripture || "-"}</p>

    </div>
  `;

  // -----------------------------
  // SINGLE LINK (LYRICS + SHEET MUSIC)
  // -----------------------------
  const link = hymn.lyrics_link;

  openBtn.onclick = () => {
    if (link) window.open(link, "_blank");
  };

  openBtn.textContent = "View Lyrics & Sheet Music";

  // -----------------------------
  // CLOSE MODAL
  // -----------------------------
  closeBtn.onclick = () => {
    modal.classList.add("hidden");
  };

  modal.classList.remove("hidden");
}

/* =========================================================
   HYMN MODAL 
   ========================================================= */

function openUseModal(hymn) {
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
          Plan (${new Date(p.createdAt).toLocaleString()})
        </option>
      `,
      )
      .join("")}
  `;

  modal.classList.remove("hidden");

  bindModalActions(modal, hymn);
}

/* =========================================================
   BIND MODALS
   ========================================================= */
function bindModalActions(modal, hymn) {
  const confirmBtn = modal.querySelector("#confirmUse");
  const cancelBtn = modal.querySelector("#cancelUse");

  const slotSelect = modal.querySelector("#modalSlot");
  const planSelect = modal.querySelector("#modalPlan");

  const close = () => modal.classList.add("hidden");

  confirmBtn.onclick = () => {
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

  cancelBtn.onclick = close;
}

/* =========================================================
   MODAL INJECTION
   ========================================================= */

function ensureModal(root) {
  if (!root.querySelector("#useModal")) {
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

  // ✅ NEW: VIEW MODAL
  if (!root.querySelector("#viewModal")) {
    root.insertAdjacentHTML(
      "beforeend",
      `
      <div id="viewModal" class="modal hidden">
        <div class="modal-content">

          <h2 id="viewTitle">Hymn Details</h2>

          <p id="viewMeta"></p>

          <button id="openExternalLinks">
            View Lyrics & Sheet Music
          </button>

          <button id="closeView">Close</button>

        </div>
      </div>
      `,
    );
  }
}

/* =========================================================
   REFRESH
   ========================================================= */

async function refreshYoutubeVideo(hymnId) {
  const hymn = allHymns.find((h) => h.id === hymnId);
  if (!hymn) return;

  const container = document.querySelector(`#video-${hymn.id}`);
  if (!container) return;

  container.innerHTML = `<p class="muted">Searching new video...</p>`;

  try {
    // build query (same logic as your earlier system)
    const query =
      hymn.youtube_query ||
      `${hymn.number} ${hymn.title} hymn piano accompaniment`;

    const result = await searchHymnVideo(query);

    const videoId = result?.videoId || null;

    if (!videoId) {
      container.innerHTML = `<p class="muted">No video found</p>`;
      return;
    }

    // update cache ONLY (do not touch JSON)
    youtubeCache.set(hymn.id, videoId);

    // re-render iframe
    container.innerHTML = `
      <iframe
        src="https://www.youtube.com/embed/${videoId}"
        frameborder="0"
        allowfullscreen
        loading="lazy"
      ></iframe>
    `;
  } catch (err) {
    console.warn("[Refresh Failed]", err);
    container.innerHTML = `<p class="muted">Refresh failed</p>`;
  }
}

/* =========================================================
   VIDEO-LOADER
   ========================================================= */

function loadVideoForCard(hymn) {
  const container = document.querySelector(`#video-${hymn.id}`);
  if (!container) return;

  const videoId = hymn.youtubeId;

  if (!videoId) {
    container.innerHTML = `<p class="muted">No video available</p>`;
    return;
  }

  container.innerHTML = `
    <iframe
      src="https://www.youtube.com/embed/${videoId}"
      frameborder="0"
      allowfullscreen
      loading="lazy"
    ></iframe>
  `;
}
