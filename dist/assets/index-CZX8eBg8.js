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
    let t = await fetch(`/src/public/json/moods.json`);
    if (!t.ok) throw Error(`Failed to load moods.json (HTTP ${t.status})`);
    let n = await t.json();
    if (!n || !Array.isArray(n.moods))
      throw Error(`Invalid moods.json format: expected { moods: [] }`);
    return ((e = Object.freeze([...n.moods])), e);
  } catch (t) {
    return (console.error(`Error loading moods: `, t), (e = []), e);
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
async function r(e) {
  e.innerHTML = `
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
  let t = e.querySelector(`#mood-container`);
  t && (t.innerHTML = await n(`mood`, `Select Mood`));
  let r = e.querySelector(`#generateButton`);
  r &&
    r.addEventListener(`click`, () => {
      let t = {
        topic1: e.querySelector(`#topic1`)?.value || ``,
        topic2: e.querySelector(`#topic2`)?.value || ``,
        topic3: e.querySelector(`#topic3`)?.value || ``,
        mood: e.querySelector(`#mood`)?.value || ``,
      };
      console.log(`Generate Payload: `, t);
    });
}
var i = document.querySelector(`#content`);
if (!i) throw Error(`Root container #content not found!`);
function a(e = `generator`) {
  ((i.innerHTML = ``),
    e === `generator` ? r(i) : e === `library` || e === `plans` || r(i));
}
function o() {
  let e = document.querySelector(`nav`);
  e &&
    e.addEventListener(`click`, (e) => {
      let t = e.target.closest(`a`);
      if (!t) return;
      e.preventDefault();
      let n = t.dataset.page;
      n && a(n);
    });
}
(o(), a(`generator`));
