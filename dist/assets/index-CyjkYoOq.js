(function () {
  let e = document.createElement(`link`).relList;
  if (e && e.supports && e.supports(`modulepreload`)) return;
  for (let e of document.querySelectorAll(`link[rel="modulepreload"]`)) n(e);
  new MutationObserver((e) => {
    for (let t of e)
      if (t.type === `childList`)
        for (let e of t.addedNodes)
          e.tagName === `LINK` && e.rel === `modulepreload` && n(e);
  }).observe(document, { childList: !0, subtree: !0 });
  function t(e) {
    let t = {};
    return (
      e.integrity && (t.integrity = e.integrity),
      e.referrerPolicy && (t.referrerPolicy = e.referrerPolicy),
      e.crossOrigin === `use-credentials`
        ? (t.credentials = `include`)
        : e.crossOrigin === `anonymous`
          ? (t.credentials = `omit`)
          : (t.credentials = `same-origin`),
      t
    );
  }
  function n(e) {
    if (e.ep) return;
    e.ep = !0;
    let n = t(e);
    fetch(e.href, n);
  }
})();
var e = null;
async function t() {
  if (e) return e;
  try {
    let t = await fetch(`/Hymn-Planner/json/moods.json`);
    if (!t.ok) throw Error(`Failed to load moods.json (HTTP ${t.status})`);
    let n = await t.json();
    if (!n || !Array.isArray(n.moods))
      throw Error(`Invalid moods.json format: expected { moods: [] }`);
    return ((e = Object.freeze([...n.moods])), e);
  } catch (e) {
    throw (console.error(`Error loading moods: `, e), e);
  }
}
async function n(e, n = `Mood`, r = ``) {
  let i = await t(),
    a = (r || ``).toLowerCase();
  return `
    <!-- Mood -->
    <div class="form-group mood-select">

      
      <label for="${e}">${n}</label>
      <select id="${e}" name="${e}" aria-label="${n}">

        <!-- Default Option -->
        <option value="">Any</option>

        ${i
          .map((e) => {
            let t = e.toLowerCase();
            return `<option value="${t}" ${t === a ? `selected` : ``}>${e}</option>
            `;
          })
          .join(``)}

      </select>
    </div>
  `;
}
var r = `https://api.datamuse.com/words`;
async function i(e) {
  let t = `${r}?ml=${encodeURIComponent(e)}&max=8`;
  try {
    return (await (await fetch(t)).json()).map((e) => e.word);
  } catch (t) {
    return (console.warn(`[Datamuse] Failed for:`, e, t), []);
  }
}
async function a(e = []) {
  let t = new Set();
  for (let n of e) {
    let e = await i(n);
    t.add(n);
    for (let n of e) t.add(n.toLowerCase());
  }
  return [...t];
}
var o = null;
async function s() {
  if (o) return o;
  try {
    let e = await fetch(`/Hymn-Planner/json/hymns.json`);
    if (!e.ok) throw Error(`Failed to load hymns.json (HTTP ${e.status})`);
    let t = await e.json();
    if (!t || !Array.isArray(t.hymns))
      throw Error(`Invalid hymns.json format: expected { hymns: [] }`);
    return ((o = Object.freeze([...t.hymns])), o);
  } catch (e) {
    throw (console.error(`Hymn loading error: `, e), e);
  }
}
var c = new Set(
    `H85-169.H85-170.H85-171.H85-172.H85-173.H85-174.H85-175.H85-176.H85-177.H85-178.H85-179.H85-180.H85-181.H85-182.H85-183.H85-184.H85-185.H85-186.H85-187.H85-188.H85-189.H85-190.H85-191.H85-192.H85-193.H85-194.H85-195.H85-196.HHC-1007.HHC-1008.HHC-1009.HHC-1016.HHC-1017`.split(
      `.`,
    ),
  ),
  l = (e) =>
    !e || typeof e != `object`
      ? e
      : (Object.keys(e).forEach((t) => {
          typeof e[t] == `object` && e[t] !== null && l(e[t]);
        }),
        Object.freeze(e)),
  u = l({
    opening: {
      topicBoost: 10,
      keywordBoost: 5,
      moodBoost: 6,
      preferredMoods: [
        `joyfully`,
        `cheerfully`,
        `enthusiastically`,
        `brightly`,
        `boldly`,
        `triumphantly`,
      ],
      topics: [
        `faith`,
        `praise`,
        `zion`,
        `missionary work`,
        `gathering of israel`,
      ],
    },
    sacrament: {
      topicBoost: 15,
      keywordBoost: 10,
      moodBoost: 8,
      strictTopics: [
        `atonement`,
        `sacrament`,
        `crucifixion`,
        `redeemer`,
        `savior`,
      ],
      preferredMoods: [
        `reverently`,
        `prayerfully`,
        `thoughtfully`,
        `reflectively`,
        `solemnly`,
      ],
      strictMode: !0,
    },
    intermediate: {
      topicBoost: 12,
      keywordBoost: 6,
      moodBoost: 6,
      preferredMoods: [
        `boldly`,
        `confidently`,
        `triumphantly`,
        `with conviction`,
        `with spirit`,
      ],
      topics: [
        `testimony`,
        `faith`,
        `missionary work`,
        `service`,
        `discipleship`,
        `zion`,
      ],
    },
    closing: {
      topicBoost: 10,
      keywordBoost: 5,
      moodBoost: 6,
      preferredMoods: [`gratefully`, `peacefully`, `joyfully`, `reverently`],
      topics: [`testimony`, `faith`, `gratitude`, `discipleship`, `service`],
    },
  });
async function d(e) {
  let t = await s(),
    n = new Set(),
    r = await a([e?.topic1, e?.topic2, e?.topic3].filter(Boolean)),
    i = { ...e, expandedTopics: r };
  return {
    opening: f(t, i, `opening`, n),
    sacrament: f(t, i, `sacrament`, n),
    intermediate: f(t, i, `intermediate`, n),
    closing: f(t, i, `closing`, n),
  };
}
function f(e, t, n, r) {
  let i = u[n];
  if (!i) return (console.warn(`[SlotRules] Invalid Slot: `, n), null);
  let a = e;
  n === `sacrament` && (a = e.filter((e) => c.has(e.id)));
  let o = [];
  for (let e of a) {
    if (r.has(e.id)) continue;
    let n = ee(e, t, i);
    n !== -1 / 0 && o.push({ hymn: e, score: n });
  }
  if (o.length === 0)
    return (console.warn(`[Engine] No valid hymns for slot: `, n), null);
  o.sort((e, t) => t.score - e.score);
  let s = o.slice(0, 20),
    l = s.length ? s : o,
    d = l[Math.floor(Math.random() * l.length)]?.hymn;
  return d ? (r.add(d.id), d) : null;
}
var p = (e) => (typeof e == `string` ? e.toLowerCase().trim() : ``),
  m = (e, t) => {
    let n = p(t);
    return e.some((e) =>
      typeof e == `string` ? e.includes(n) || n.includes(e) : !1,
    );
  };
function ee(e, t, n) {
  t ||= {};
  let r = 0,
    i = (e.topics || []).map(p),
    a = (e.keywords || []).map(p),
    o = p(e.mood),
    s = (t.expandedTopics || [])
      .filter((e) => typeof e == `string` && e.trim().length > 0)
      .map(p),
    c = p(t.mood);
  for (let e of s)
    (m(i, e) && (r += n.topicBoost), m(a, e) && (r += n.keywordBoost));
  if (Array.isArray(n.topics))
    for (let e of n.topics) m(i, e) && (r += n.topicBoost);
  let l = 0,
    u = n.preferredMoods?.includes(o),
    d = c && (o.includes(c) || c.includes(o));
  return (
    (u || d) && (l += n.moodBoost),
    (r += Math.min(l, n.moodBoost * 1.5)),
    n.strictMode &&
      (n.strictTopics || [])
        .map(p)
        .some((e) => i.includes(e) || a.includes(e)) &&
      (r += n.moodBoost * 2),
    (r += Math.random() * 8),
    r
  );
}
var h = `hymnPlans`;
function g() {
  return JSON.parse(localStorage.getItem(h)) || [];
}
function te(e) {
  let t = g();
  (t.push(e), localStorage.setItem(h, JSON.stringify(t)));
}
function _(e) {
  localStorage.setItem(h, JSON.stringify(e));
}
function v(e) {
  if (!e?.id) {
    console.error(`Plan update failed! (Missing plan ID)`);
    return;
  }
  let t = g(),
    n = t.findIndex((t) => t.id === e.id);
  (n === -1 ? t.push(e) : (t[n] = e), _(t));
}
function ne(e) {
  _(g().filter((t) => t.id !== e));
}
var y = null,
  b = null;
async function x(e) {
  e.innerHTML = `
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
  let t = e.querySelector(`#mood-container`);
  t && (t.innerHTML = await n(`mood`, `Select Mood`));
  let r = e.querySelector(`#generateButton`);
  r &&
    r.addEventListener(`click`, async () => {
      let t = {
        topic1: e.querySelector(`#topic1`)?.value || ``,
        topic2: e.querySelector(`#topic2`)?.value || ``,
        topic3: e.querySelector(`#topic3`)?.value || ``,
        mood: e.querySelector(`#mood`)?.value || ``,
      };
      (console.log(`Generate Payload: `, t), (b = t));
      let n = await d(t);
      (console.log(`CURRENT PLAN:`, n),
        console.log(`LAST INPUT:`, t),
        console.log(`PLAN RESULT: `, n),
        (y = n));
      let r = (e) => e?.title ?? `No match`;
      ((e.querySelector(`#opening`).textContent = r(n.opening)),
        (e.querySelector(`#sacrament`).textContent = r(n.sacrament)),
        (e.querySelector(`#intermediate`).textContent = r(n.intermediate)),
        (e.querySelector(`#closing`).textContent = r(n.closing)));
    });
  let i = e.querySelector(`#saveButton`);
  i &&
    i.addEventListener(`click`, () => {
      if (!y) {
        console.warn(`No plan to save yet.`);
        return;
      }
      let e = {
        id: `plan-${Date.now()}`,
        createdAt: new Date().toISOString(),
        input: b,
        hymns: {
          opening: y.opening,
          sacrament: y.sacrament,
          intermediate: y.intermediate,
          closing: y.closing,
        },
      };
      (console.log(`CURRENT PLAN:`, y),
        console.log(`LAST INPUT:`, b),
        console.log(`PLAN TO SAVE:`, e),
        te(e),
        console.log(`Saved Plan: `, e));
    });
  let a = e.querySelector(`#printButton`);
  a &&
    a.addEventListener(`click`, () => {
      window.print();
    });
}
var S = `AIzaSyDzaaAKxe0qt1xDLQVxIs7CPrsn0IHfbRk`;
async function C(e) {
  try {
    let t = new URL(`https://www.googleapis.com/youtube/v3/search`);
    (t.searchParams.set(`part`, `snippet`),
      t.searchParams.set(`q`, e),
      t.searchParams.set(`type`, `video`),
      t.searchParams.set(`maxResults`, `1`),
      t.searchParams.set(`videoEmbeddable`, `true`),
      t.searchParams.set(`key`, S),
      console.log(`REQUEST URL:`, t.toString()));
    let n = await fetch(t),
      r = await n.json();
    return n.ok
      ? r.items?.length
        ? { videoId: r.items[0].id.videoId }
        : null
      : (console.error(`YouTube API Error:`, r), null);
  } catch (e) {
    return (console.error(`YouTube fetch failed:`, e), null);
  }
}
var w = [],
  T = !1,
  re = 400;
function ie(e, t) {
  (w.push({ hymn: e, onResult: t }), ae());
}
async function ae() {
  if (!T) {
    for (T = !0; w.length > 0; ) {
      let { hymn: e, onResult: t } = w.shift();
      try {
        t(
          (
            await C(
              e.youtube_query ||
                `${e.number} ${e.title} hymn piano accompaniment`,
            )
          )?.videoId || null,
        );
      } catch (e) {
        (console.warn(`YouTube queue error:`, e), t(null));
      }
      await new Promise((e) => setTimeout(e, re));
    }
    T = !1;
  }
}
var E = !1;
function D() {
  let e = M?.querySelector(`.mode-indicator`);
  e &&
    (e.textContent = E
      ? `OFFLINE MODE (JSON ONLY)`
      : `ONLINE MODE (YouTube enabled)`);
}
var O = 0,
  k = 3,
  A = [],
  j = [],
  M = null,
  N = ``,
  P = `all`,
  F = ``,
  I = new Set(),
  L = new Map();
async function oe(e) {
  ((M = e),
    (A = await s()),
    (j = [...A]),
    (e.innerHTML = `
    <section class="library">

      <div class="library-header">
        <h1 class="page-title">Hymns Library</h1>

        <div class="mode-indicator">
          ${E ? `OFFLINE MODE (JSON ONLY)` : `ONLINE MODE (YouTube enabled)`}
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
  `),
    le(e),
    window.addEventListener(`plans:updated`, () => {
      z(M);
    }),
    R(e),
    z(e),
    D());
}
function se(e) {
  R(M);
  let t = M.querySelector(`#useModal`),
    n = t.querySelector(`#modalHymnTitle`),
    r = t.querySelector(`#modalPlan`),
    i = g();
  ((n.textContent = `${e.number}. ${e.title}`),
    (r.innerHTML = `
    <option value="__new__">+ Create New Plan</option>
    ${i
      .map(
        (e) => `
        <option value="${e.id}">
          ${new Date(e.createdAt).toLocaleString()}
        </option>
      `,
      )
      .join(``)}
  `),
    t.classList.remove(`hidden`),
    ce(t, e));
}
function ce(e, t) {
  let n = e.querySelector(`#confirmUse`),
    r = e.querySelector(`#cancelUse`),
    i = e.querySelector(`#modalSlot`),
    a = e.querySelector(`#modalPlan`),
    o = () => e.classList.add(`hidden`);
  ((n.onclick = () => {
    let e = i.value,
      n = a.value,
      r;
    if (n === `__new__`)
      ((r = {
        id: `plan-${Date.now()}`,
        createdAt: new Date().toISOString(),
        input: {},
        hymns: {
          opening: null,
          sacrament: null,
          intermediate: null,
          closing: null,
        },
      }),
        v(r));
    else if (((r = g().find((e) => e.id === n)), !r)) {
      alert(`Selected plan no longer exists.`);
      return;
    }
    ((r.hymns = r.hymns || {}),
      (r.hymns[e] = t.id),
      v(r),
      window.dispatchEvent(
        new CustomEvent(`plans:updated`, { detail: { planId: r.id } }),
      ),
      o());
  }),
    (r.onclick = o));
}
function le(e) {
  let t = e.querySelector(`#searchInput`),
    n = e.querySelector(`#filterType`),
    r = e.querySelector(`#filterValue`),
    i = e.querySelector(`#applyFilter`),
    a = e.querySelector(`#clearFilter`);
  (t.addEventListener(`input`, (t) => {
    ((N = t.target.value.toLowerCase()), z(e));
  }),
    n.addEventListener(`change`, (e) => {
      P = e.target.value;
    }),
    r.addEventListener(`input`, (e) => {
      F = e.target.value.toLowerCase();
    }),
    i.addEventListener(`click`, () => z(e)),
    a.addEventListener(`click`, () => {
      ((N = ``),
        (P = `all`),
        (F = ``),
        (t.value = ``),
        (r.value = ``),
        (n.value = `all`),
        z(e));
    }),
    e.addEventListener(`click`, (e) => {
      let t = e.target.closest(`[data-action='view']`),
        n = e.target.closest(`[data-action='use']`),
        r = e.target.closest(`[data-action='refresh']`);
      (t && V(t.dataset.id), n && fe(n.dataset.id), r && me(r.dataset.id));
    }));
}
function R(e) {
  e.querySelector(`#useModal`) ||
    e.insertAdjacentHTML(
      `beforeend`,
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
async function ue(e, t = !1) {
  if (E) return null;
  let n = L.get(e.id);
  if (n && !t) return n;
  let r = e.youtube_query || `${e.number} ${e.title} hymn piano accompaniment`;
  try {
    let t = (await C(r))?.videoId || null;
    return (L.set(e.id, t), t);
  } catch (e) {
    return (
      console.warn(`YouTube request failed: `, e),
      O++,
      O >= k &&
        ((E = !0),
        D(),
        console.warn(`⚠️ Auto OFFLINE MODE triggered due to failures.`)),
      null
    );
  }
}
async function z(e) {
  let t = e.querySelector(`#hymnGrid`);
  ((j = A.filter(
    (e) =>
      (e.title.toLowerCase().includes(N) || String(e.number).includes(N)) &&
      de(e),
  )),
    (t.innerHTML = j.map(B).join(``)),
    he());
}
function de(e) {
  if (P === `all`) return !0;
  let t = F.toLowerCase();
  return t
    ? P === `topic`
      ? (e.topics || []).some((e) => e.toLowerCase().includes(t))
      : P === `keyword`
        ? (e.keywords || []).some((e) => e.toLowerCase().includes(t))
        : P === `mood`
          ? (e.mood || ``).toLowerCase().includes(t)
          : !0
    : !0;
}
function B(e) {
  let t = I.has(e.id);
  return `
    <div class="hymn-card">

      <div class="hymn-header">
        <h3>${e.number}. ${e.title}</h3>
      </div>

      <div class="video-container" id="video-${e.id}">
        <p class="muted">Loading accompaniment...</p>
      </div>

      <div class="hymn-actions">
        <button data-action="view" data-id="${e.id}">View</button>
        <button data-action="use" data-id="${e.id}">Use</button>

        <button data-action="refresh" data-id="${e.id}">
          Refresh Video
        </button>
      </div>

      ${
        t
          ? `
        <div class="hymn-details">
          <p><strong>Topics:</strong> ${(e.topics || []).join(`, `)}</p>
          <p><strong>Keywords:</strong> ${(e.keywords || []).join(`, `)}</p>
          <p><strong>Mood:</strong> ${e.mood || `-`}</p>
        </div>
      `
          : ``
      }

    </div>
  `;
}
function V(e) {
  (I.has(e) ? I.delete(e) : I.add(e), z(M));
}
function fe(e) {
  let t = A.find((t) => t.id === e);
  t && se(t);
}
function pe(e) {
  let t = document.querySelector(`#video-${e.id}`);
  if (!t) return;
  if (E) {
    t.innerHTML = `<p class="muted">Video disabled (offline mode)</p>`;
    return;
  }
  let n = L.get(e.id);
  if (n != null) {
    H(t, n);
    return;
  }
  if (n === null) {
    t.innerHTML = `<p class="muted">No video available</p>`;
    return;
  }
  ie(e, (n) => {
    (n ? (O = 0) : O++,
      O >= k &&
        ((E = !0), D(), console.warn(`⚠️ Auto OFFLINE MODE triggered.`)),
      L.set(e.id, n),
      H(t, n));
  });
}
function H(e, t) {
  e.innerHTML = t
    ? `<iframe src="https://www.youtube.com/embed/${t}" frameborder="0" allowfullscreen></iframe>`
    : `<p class="muted">No video available</p>`;
}
async function me(e) {
  let t = A.find((t) => t.id === e);
  if (!t) return;
  let n = document.querySelector(`#video-${t.id}`);
  if (!n) return;
  if (E) {
    n.innerHTML = `<p class="muted">Offline mode enabled</p>`;
    return;
  }
  n.innerHTML = `<p class="muted">Searching new video...</p>`;
  let r = await ue(t, !0);
  n.innerHTML = r
    ? `<iframe src="https://www.youtube.com/embed/${r}" frameborder="0" allowfullscreen></iframe>`
    : `<p class="muted">No video found</p>`;
}
function he() {
  let e = new IntersectionObserver(
    (e, t) => {
      e.forEach((e) => {
        if (!e.isIntersecting) return;
        let n = e.target,
          r = n.dataset.hymnId,
          i = A.find((e) => e.id === r);
        i && (pe(i), t.unobserve(n));
      });
    },
    { rootMargin: `200px` },
  );
  document.querySelectorAll(`.video-container`).forEach((t) => {
    ((t.dataset.hymnId = t.id.replace(`video-`, ``)), e.observe(t));
  });
}
var U = null,
  W = [],
  G = new Set(),
  ge = {
    opening: `Opening`,
    sacrament: `Sacrament`,
    intermediate: `Intermediate`,
    closing: `Closing`,
  },
  _e = (e) => ge[e] || e;
function K() {
  (q(), J(U));
}
function q() {
  let e = g();
  ((W = JSON.parse(JSON.stringify(e || []))),
    (W = W.map((e) => ({
      ...e,
      hymns: Object.fromEntries(
        Object.entries(e.hymns || {}).map(([e, t]) => [
          e,
          t && typeof t == `object` ? t.id : (t ?? null),
        ]),
      ),
    }))));
}
function ve(e) {
  ((U = e),
    (e.innerHTML = `
    <section class="plans">
        <h1>Saved Hymn Plans</h1>
        
        <!-- Container where plans will be rendered -->
        <div id="plansContainer"></div>
    </section>`),
    q(),
    J(U));
}
async function J(e) {
  let t = e.querySelector(`#plansContainer`),
    n = await s();
  if (W.length === 0) {
    t.innerHTML = `<p>No saved plans yet.</p>`;
    return;
  }
  ((t.innerHTML = W.map((e) => ye(e, n)).join(``)), xe(e, n));
}
function ye(e, t) {
  let n = G.has(e.id);
  return `
    <div class="plan-card" data-plan="${e.id}">
          <div class="action-bar">
            <!-- Date -->
            <h3>${new Date(e.createdAt).toLocaleString()}</h3>

            <div class="actions">
              <!-- Edit Toggle -->
              <button data-action="edit" data-id="${e.id}" aria-label="Edit Plan">
                <img src="./images/edit.svg" alt="Edit"/>
              </button>

              ${
                n
                  ? `
                <!-- Save Icon -->
                <button data-action="save" data-id="${e.id}" aria-label="Save Plan">
                  <img src="./images/save.svg" alt="Save"/>
                </button>

                <!-- Reset Icon -->
                <button data-action="reset" data-id="${e.id}" aria-label="Reset Changes">
                  <img src="./images/reset.svg" alt="Reset"/>
                </button>`
                  : ``
              }

              <!-- Print Icon -->
              <button data-action="print" data-id="${e.id}" aria-label="Print Plan">
                <img src="./images/print.svg" alt="Print"/>
              </button>

              <!-- Delete Icon --><button data-action="delete" data-id="${e.id}" aria-label="Delete Plan">
                <img src="./images/delete.svg" alt="Delete"/>
              </button>
            </div>
          </div>

          <hr/>
          
          <!--Input Summary-->
          <p><strong>Input:</strong></p>
          <p>Topic 1: ${e.input?.topic1 || `-`}</p>
          <p>Topic 2: ${e.input?.topic2 || `-`}</p>
          <p>Topic 3: ${e.input?.topic3 || `-`}</p>
          <p>Mood: ${e.input?.mood || `-`}</p>
          
          <hr/>
          
          <!-- Hymn Results -->
          ${Y(e, `opening`, t, n)}
          ${Y(e, `sacrament`, t, n)}
          ${Y(e, `intermediate`, t, n)}
          ${Y(e, `closing`, t, n)}
      </div>`;
}
function be(e, t) {
  let n = u[t];
  return n
    ? e.filter((e) => {
        let r = (e.topics || []).map((e) => e.toLowerCase()),
          i = (e.keywords || []).map((e) => e.toLowerCase());
        if (t === `sacrament`)
          return (n.strictTopics || [])
            .map((e) => e.toLowerCase())
            .some(
              (e) =>
                r.some((t) => t.includes(e)) || i.some((t) => t.includes(e)),
            );
        let a = [...r, ...i];
        return (n.topics || []).some((e) => {
          let t = e.toLowerCase();
          return a.some((e) => e.includes(t));
        });
      })
    : e;
}
function Y(e, t, n, r) {
  let i = be(n, t),
    a = String(e.hymns?.[t] ?? ``);
  return `
  <div class="slot">
    <label>${_e(t)}</label>

    <select data-slot="${t}" data-plan="${e.id}" ${r ? `` : `disabled`}>
      ${i
        .map(
          (e) => `
            <option value="${e.id}" ${String(e.id) === a ? `selected` : ``}>
              ${e.title}
            </option>
          `,
        )
        .join(``)}
    </select>
  </div>
`;
}
var X = null;
function xe(e) {
  let t = e.querySelector(`#plansContainer`);
  X !== t &&
    ((X = t),
    t.addEventListener(`click`, (e) => {
      let t = e.target.closest(`button`);
      if (!t) return;
      let n = t.dataset.id;
      switch (t.dataset.action) {
        case `edit`:
          (Z(n), K());
          break;
        case `save`:
          (Se(n), K());
          break;
        case `reset`:
          (Ce(n), K());
          break;
        case `print`:
          we(n);
          break;
        case `delete`:
          (ne(n), K());
          break;
      }
    }),
    t.addEventListener(`change`, (e) => {
      let t = e.target.closest(`select`);
      if (!t) return;
      let n = t.dataset.plan,
        r = t.dataset.slot,
        i = W.find((e) => e.id === n);
      i && ((i.hymns ||= {}), (i.hymns[r] = String(t.value)));
    }));
}
function Z(e) {
  G.has(e) ? G.delete(e) : G.add(e);
}
function Se(e) {
  let t = W.find((t) => t.id === e);
  t && (v(t), G.delete(e), K());
}
function Ce(e) {
  let t = g().find((t) => t.id === e),
    n = W.find((t) => t.id === e);
  !n ||
    !t ||
    ((n.hymns = Object.fromEntries(
      Object.entries(t.hymns || {}).map(([e, t]) => [
        e,
        t && typeof t == `object` ? t.id : (t ?? null),
      ]),
    )),
    G.delete(e),
    K());
}
function we(e) {
  let t = document.querySelector(`[data-plan="${e}"]`);
  t &&
    (document
      .querySelectorAll(`.plan-card`)
      .forEach((e) => e.classList.remove(`print-target`)),
    t.classList.add(`print-target`),
    setTimeout(() => {
      (window.print(), t.classList.remove(`print-target`));
    }, 50));
}
var Q = document.querySelector(`#content`);
if (!Q) throw Error(`Root container #content not found!`);
function $(e = `generator`) {
  ((Q.innerHTML = ``),
    e === `generator`
      ? x(Q)
      : e === `library`
        ? oe(Q)
        : e === `plans`
          ? ve(Q)
          : x(Q));
}
function Te() {
  let e = document.querySelector(`nav`);
  e &&
    e.addEventListener(`click`, (e) => {
      let t = e.target.closest(`a`);
      if (!t) return;
      e.preventDefault();
      let n = t.dataset.page;
      n && $(n);
    });
}
(Te(), $(`generator`));
