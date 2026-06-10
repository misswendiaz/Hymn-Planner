(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=null;async function t(){if(e)return e;try{let t=await fetch(`/Hymn-Planner/json/moods.json`);if(!t.ok)throw Error(`Failed to load moods.json (HTTP ${t.status})`);let n=await t.json();if(!n||!Array.isArray(n.moods))throw Error(`Invalid moods.json format: expected { moods: [] }`);return e=Object.freeze([...n.moods]),e}catch(e){throw console.error(`Error loading moods: `,e),e}}async function n(e,n=`Mood`,r=``){let i=await t(),a=(r||``).toLowerCase();return`
    <!-- Mood -->
    <div class="form-group mood-select">

      
      <label for="${e}">${n}</label>
      <select id="${e}" name="${e}" aria-label="${n}">

        <!-- Default Option -->
        <option value="">Any</option>

        ${i.map(e=>{let t=e.toLowerCase();return`<option value="${t}" ${t===a?`selected`:``}>${e}</option>
            `}).join(``)}

      </select>
    </div>
  `}var r=`https://api.datamuse.com/words`;async function i(e){let t=`${r}?ml=${encodeURIComponent(e)}&max=8`;try{return(await(await fetch(t)).json()).map(e=>e.word)}catch(t){return console.warn(`[Datamuse] Failed for:`,e,t),[]}}async function a(e=[]){let t=new Set;for(let n of e){let e=await i(n);t.add(n);for(let n of e)t.add(n.toLowerCase())}return[...t]}var o=null;async function s(){if(o)return o;try{let e=await fetch(`/Hymn-Planner/json/hymns.json`);if(!e.ok)throw Error(`Failed to load hymns.json (HTTP ${e.status})`);let t=await e.json(),n=Array.isArray(t)?t:t?.hymns;if(!Array.isArray(n))throw console.error(`Invalid JSON structure received:`,t),Error(`Invalid hymns.json format: expected array or { hymns: [] }`);return o=Object.freeze([...n]),o}catch(e){throw console.error(`Hymn loading error:`,e),e}}var c=new Set(`H85-169.H85-170.H85-171.H85-172.H85-173.H85-174.H85-175.H85-176.H85-177.H85-178.H85-179.H85-180.H85-181.H85-182.H85-183.H85-184.H85-185.H85-186.H85-187.H85-188.H85-189.H85-190.H85-191.H85-192.H85-193.H85-194.H85-195.H85-196.HHC-1007.HHC-1008.HHC-1009.HHC-1016.HHC-1017`.split(`.`)),l=e=>!e||typeof e!=`object`?e:(Object.keys(e).forEach(t=>{typeof e[t]==`object`&&e[t]!==null&&l(e[t])}),Object.freeze(e)),u=l({opening:{topicBoost:10,keywordBoost:5,moodBoost:6,preferredMoods:[`joyfully`,`cheerfully`,`enthusiastically`,`brightly`,`boldly`,`triumphantly`],topics:[`faith`,`praise`,`zion`,`missionary work`,`gathering of israel`]},sacrament:{topicBoost:15,keywordBoost:10,moodBoost:8,strictTopics:[`atonement`,`sacrament`,`crucifixion`,`redeemer`,`savior`],preferredMoods:[`reverently`,`prayerfully`,`thoughtfully`,`reflectively`,`solemnly`],strictMode:!0},intermediate:{topicBoost:12,keywordBoost:6,moodBoost:6,preferredMoods:[`boldly`,`confidently`,`triumphantly`,`with conviction`,`with spirit`],topics:[`testimony`,`faith`,`missionary work`,`service`,`discipleship`,`zion`]},closing:{topicBoost:10,keywordBoost:5,moodBoost:6,preferredMoods:[`gratefully`,`peacefully`,`joyfully`,`reverently`],topics:[`testimony`,`faith`,`gratitude`,`discipleship`,`service`]}});async function d(e){let t=await s(),n=new Set,r=await a([e?.topic1,e?.topic2,e?.topic3].filter(Boolean)),i={...e,expandedTopics:r};return{opening:f(t,i,`opening`,n),sacrament:f(t,i,`sacrament`,n),intermediate:f(t,i,`intermediate`,n),closing:f(t,i,`closing`,n)}}function f(e,t,n,r){let i=u[n];if(!i)return console.warn(`[SlotRules] Invalid Slot: `,n),null;let a=e;n===`sacrament`&&(a=e.filter(e=>c.has(e.id)));let o=[];for(let e of a){if(r.has(e.id))continue;let n=h(e,t,i);n!==-1/0&&o.push({hymn:e,score:n})}if(o.length===0)return console.warn(`[Engine] No valid hymns for slot: `,n),null;o.sort((e,t)=>t.score-e.score);let s=o.slice(0,20),l=s.length?s:o,d=l[Math.floor(Math.random()*l.length)]?.hymn;return d?(r.add(d.id),d):null}var p=e=>typeof e==`string`?e.toLowerCase().trim():``,m=(e,t)=>{let n=p(t);return e.some(e=>typeof e==`string`?e.includes(n)||n.includes(e):!1)};function h(e,t,n){t||={};let r=0,i=e=>e?Array.isArray(e)?e.map(p):typeof e==`string`?e.split(`,`).map(e=>e.trim()).filter(Boolean).map(p):[]:[],a=i(e.topics),o=i(e.keywords),s=p(e.mood),c=(t.expandedTopics||[]).filter(e=>typeof e==`string`&&e.trim().length>0).map(p),l=p(t.mood);for(let e of c)m(a,e)&&(r+=n.topicBoost),m(o,e)&&(r+=n.keywordBoost);if(Array.isArray(n.topics))for(let e of n.topics)m(a,e)&&(r+=n.topicBoost);let u=0,d=n.preferredMoods?.includes(s),f=l&&(s.includes(l)||l.includes(s));return(d||f)&&(u+=n.moodBoost),r+=Math.min(u,n.moodBoost*1.5),n.strictMode&&(n.strictTopics||[]).map(p).some(e=>a.includes(e)||o.includes(e))&&(r+=n.moodBoost*2),r+=Math.random()*8,r}var g=`hymnPlans`;function _(){return JSON.parse(localStorage.getItem(g))||[]}function v(e){let t=_();t.push(e),localStorage.setItem(g,JSON.stringify(t))}function y(e){localStorage.setItem(g,JSON.stringify(e))}function b(e){if(!e?.id){console.error(`Plan update failed! (Missing plan ID)`);return}let t=_(),n=t.findIndex(t=>t.id===e.id);n===-1?t.push(e):t[n]=e,y(t)}function ee(e){y(_().filter(t=>t.id!==e))}var x=null,S=null,C=!1;async function w(e){e.innerHTML=`
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
  </section>`;let t=e.querySelector(`#mood-container`);t.innerHTML=await n(`mood`,`Select Mood`);let r=e.querySelector(`#generateButton`);r.addEventListener(`click`,async()=>{if(!C){C=!0,r.textContent=`Generating...`;try{let t={topic1:e.querySelector(`#topic1`)?.value?.trim()||``,topic2:e.querySelector(`#topic2`)?.value?.trim()||``,topic3:e.querySelector(`#topic3`)?.value?.trim()||``,mood:e.querySelector(`#mood`)?.value?.trim()||``};S=t;let n=await d(t);console.log(`RAW PLAN:`,n),x={opening:n?.opening??null,sacrament:n?.sacrament??null,intermediate:n?.intermediate??null,closing:n?.closing??null};let r=e=>e?.title??`No match`;e.querySelector(`#opening`).textContent=r(x.opening),e.querySelector(`#sacrament`).textContent=r(x.sacrament),e.querySelector(`#intermediate`).textContent=r(x.intermediate),e.querySelector(`#closing`).textContent=r(x.closing)}catch(e){console.error(`Generation failed:`,e),alert(`Failed to generate hymn plan. Check console.`)}finally{C=!1,r.textContent=`Generate Hymns`}}}),e.querySelector(`#saveButton`).addEventListener(`click`,()=>{if(!x){alert(`No generated plan to save yet.`);return}let e={id:`plan-${Date.now()}`,createdAt:new Date().toISOString(),input:S||{},hymns:{opening:x.opening?.id??null,sacrament:x.sacrament?.id??null,intermediate:x.intermediate?.id??null,closing:x.closing?.id??null}};console.log(`Saving Plan:`,e),v(e)}),e.querySelector(`#printButton`).addEventListener(`click`,()=>{window.print()})}var T=`AIzaSyDzaaAKxe0qt1xDLQVxIs7CPrsn0IHfbRk`;async function E(e){try{let t=new URL(`https://www.googleapis.com/youtube/v3/search`);t.searchParams.set(`part`,`snippet`),t.searchParams.set(`q`,e),t.searchParams.set(`type`,`video`),t.searchParams.set(`maxResults`,`1`),t.searchParams.set(`videoEmbeddable`,`true`),t.searchParams.set(`key`,T),console.log(`REQUEST URL:`,t.toString());let n=await fetch(t),r=await n.json();return n.ok?r.items?.length?{videoId:r.items[0].id.videoId}:null:(console.error(`YouTube API Error:`,r),null)}catch(e){return console.error(`YouTube fetch failed:`,e),null}}var D=null,O=[],k=[],A=``,j=`all`,M=``,N=new Map;async function te(e){D=e,O=await s(),k=[...O],e.innerHTML=`
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
  `,ne(e),window.addEventListener(`click`,e=>{let t=e.target.closest(`[data-action='view']`),n=e.target.closest(`[data-action='use']`),r=e.target.closest(`[data-action='refresh']`);if(t){let e=t.closest(`.hymn-card`);e&&(e.classList.add(`flipped`),setTimeout(()=>{e.classList.remove(`flipped`)},600)),F(t.dataset.id)}n&&ae(n.dataset.id),r&&z(r.dataset.id)}),R(e),P(e)}function ne(e){let t=e.querySelector(`#searchInput`),n=e.querySelector(`#filterType`),r=e.querySelector(`#filterValue`),i=e.querySelector(`#applyFilter`),a=e.querySelector(`#clearFilter`);t.addEventListener(`input`,t=>{A=t.target.value.toLowerCase(),P(e)}),n.addEventListener(`change`,e=>{j=e.target.value}),r.addEventListener(`input`,e=>{M=e.target.value.toLowerCase()}),i.addEventListener(`click`,()=>P(e)),a.addEventListener(`click`,()=>{A=``,j=`all`,M=``,t.value=``,r.value=``,n.value=`all`,P(e)})}async function P(e){let t=e.querySelector(`#hymnGrid`);k=O.filter(e=>(e.title.toLowerCase().includes(A)||String(e.number).includes(A))&&re(e)),t.innerHTML=``;let n=0;function r(){let e=k.slice(n,n+50).map(ie).join(``);t.insertAdjacentHTML(`beforeend`,e),n+=50,n<k.length&&requestAnimationFrame(r)}r(),requestAnimationFrame(()=>{document.querySelectorAll(`.video-container`).forEach(e=>{let t=e.id.replace(`video-`,``),n=O.find(e=>e.id===t);n&&B(n)})})}function re(e){if(j===`all`)return!0;let t=M.trim();return t?j===`topic`?(e.topics||``).toLowerCase().includes(t):j===`keyword`?(e.keywords||``).toLowerCase().includes(t):j===`mood`?(e.mood||``).toLowerCase().includes(t):!0:!0}function ie(e){return`
    <div class="hymn-card" data-id="${e.id}">

      <div class="flip-inner">

        <!-- FRONT SIDE -->
        <div class="flip-front">

          <div class="hymn-header">
            <h3>${e.number}. ${e.title}</h3>
          </div>

          <div class="video-container" id="video-${e.id}">
            <p class="muted">Loading...</p>
          </div>

          <div class="hymn-actions">
            <button data-action="view" data-id="${e.id}">View</button>
            <button data-action="use" data-id="${e.id}">Use</button>
            <button data-action="refresh" data-id="${e.id}">Refresh</button>
          </div>

        </div>

        <!-- BACK SIDE -->
        <div class="flip-back">
          <div class="hymn-details">
            <h3>Quick Info</h3>
            <p><strong>Mood:</strong> ${e.mood||`-`}</p>
            <p><strong>Topics:</strong> ${e.topics||`-`}</p>
          </div>
        </div>

      </div>
    </div>
  `}function ae(e){let t=O.find(t=>t.id===e);t&&I(t)}function F(e){let t=O.find(t=>t.id===e);if(!t)return;let n=D.querySelector(`#viewModal`),r=n.querySelector(`#viewTitle`),i=n.querySelector(`#viewMeta`),a=n.querySelector(`#openExternalLinks`),o=n.querySelector(`#closeView`);r.textContent=`${t.number}. ${t.title}`,i.innerHTML=`
    <div class="view-details">

      <p><strong>Source:</strong> ${t.source||`-`}</p>

      <p><strong>Mood:</strong> ${t.mood||`-`}</p>

      <p><strong>Topics:</strong> ${Array.isArray(t.topics)?t.topics.join(`, `):t.topics||`-`}</p>

      <p><strong>Keywords:</strong> ${Array.isArray(t.keywords)?t.keywords.join(`, `):t.keywords||`-`}</p>

      <p><strong>Scripture References:</strong> ${t.scripture||`-`}</p>

    </div>
  `;let s=t.lyrics_link;a.onclick=()=>{s&&window.open(s,`_blank`)},a.textContent=`View Lyrics & Sheet Music`,o.onclick=()=>{n.classList.add(`hidden`)},n.classList.remove(`hidden`)}function I(e){let t=D.querySelector(`#useModal`),n=t.querySelector(`#modalHymnTitle`),r=t.querySelector(`#modalPlan`),i=_();n.textContent=`${e.number}. ${e.title}`,r.innerHTML=`
    <option value="__new__">+ Create New Plan</option>
    ${i.map(e=>`
        <option value="${e.id}">
          Plan (${new Date(e.createdAt).toLocaleString()})
        </option>
      `).join(``)}
  `,t.classList.remove(`hidden`),L(t,e)}function L(e,t){let n=e.querySelector(`#confirmUse`),r=e.querySelector(`#cancelUse`),i=e.querySelector(`#modalSlot`),a=e.querySelector(`#modalPlan`),o=()=>e.classList.add(`hidden`);n.onclick=()=>{let e=i.value,n=a.value,r;if(n===`__new__`)r={id:`plan-${Date.now()}`,createdAt:new Date().toISOString(),input:{},hymns:{opening:null,sacrament:null,intermediate:null,closing:null}};else if(r=_().find(e=>e.id===n),!r){alert(`Selected plan no longer exists.`);return}r.hymns=r.hymns||{},r.hymns[e]=t.id,b(r),window.dispatchEvent(new CustomEvent(`plans:updated`,{detail:{planId:r.id}})),o()},r.onclick=o}function R(e){e.querySelector(`#useModal`)||e.insertAdjacentHTML(`beforeend`,`
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
      `),e.querySelector(`#viewModal`)||e.insertAdjacentHTML(`beforeend`,`
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
      `)}async function z(e){let t=O.find(t=>t.id===e);if(!t)return;let n=document.querySelector(`#video-${t.id}`);if(n){n.innerHTML=`<p class="muted">Searching new video...</p>`;try{let e=(await E(t.youtube_query||`${t.number} ${t.title} hymn piano accompaniment`))?.videoId||null;if(!e){n.innerHTML=`<p class="muted">No video found</p>`;return}N.set(t.id,e),n.innerHTML=`
      <iframe
        src="https://www.youtube.com/embed/${e}"
        frameborder="0"
        allowfullscreen
        loading="lazy"
      ></iframe>
    `}catch(e){console.warn(`[Refresh Failed]`,e),n.innerHTML=`<p class="muted">Refresh failed</p>`}}}function B(e){let t=document.querySelector(`#video-${e.id}`);if(!t)return;let n=e.youtubeId;if(!n){t.innerHTML=`<p class="muted">No video available</p>`;return}t.innerHTML=`
    <iframe
      src="https://www.youtube.com/embed/${n}"
      frameborder="0"
      allowfullscreen
      loading="lazy"
    ></iframe>
  `}var V=null,H=[],U=new Set,W={opening:`Opening`,sacrament:`Sacrament`,intermediate:`Intermediate`,closing:`Closing`},G=e=>W[e]||e;function K(){q(),J(V)}function q(){let e=_();H=JSON.parse(JSON.stringify(e||[])),H=H.map(e=>({...e,hymns:Object.fromEntries(Object.entries(e.hymns||{}).map(([e,t])=>[e,t&&typeof t==`object`?t.id:t??null]))}))}function oe(e){V=e,e.innerHTML=`
    <section class="plans">
        <h1>Saved Hymn Plans</h1>
        
        <!-- Container where plans will be rendered -->
        <div id="plansContainer"></div>
    </section>`,q(),J(V)}async function J(e){let t=e.querySelector(`#plansContainer`),n=await s();if(H.length===0){t.innerHTML=`<p>No saved plans yet.</p>`;return}t.innerHTML=H.map(e=>se(e,n)).join(``),Z(e,n)}function se(e,t){let n=U.has(e.id);return`
    <div class="plan-card" data-plan="${e.id}">
          <div class="action-bar">
            <!-- Date -->
            <h3>${new Date(e.createdAt).toLocaleString()}</h3>

            <div class="actions">
              <!-- Edit Toggle -->
              <button data-action="edit" data-id="${e.id}" aria-label="Edit Plan">
                <img src="./images/edit.svg" alt="Edit"/>
              </button>

              ${n?`
                <!-- Save Icon -->
                <button data-action="save" data-id="${e.id}" aria-label="Save Plan">
                  <img src="./images/save.svg" alt="Save"/>
                </button>

                <!-- Reset Icon -->
                <button data-action="reset" data-id="${e.id}" aria-label="Reset Changes">
                  <img src="./images/reset.svg" alt="Reset"/>
                </button>`:``}

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
          <p>Topic 1: ${e.input?.topic1||`-`}</p>
          <p>Topic 2: ${e.input?.topic2||`-`}</p>
          <p>Topic 3: ${e.input?.topic3||`-`}</p>
          <p>Mood: ${e.input?.mood||`-`}</p>
          
          <hr/>
          
          <!-- Hymn Results -->
          ${Y(e,`opening`,t,n)}
          ${Y(e,`sacrament`,t,n)}
          ${Y(e,`intermediate`,t,n)}
          ${Y(e,`closing`,t,n)}
      </div>`}function ce(e,t){let n=u[t];return n?e.filter(e=>{let r=String(e.topics||``).split(`,`).map(e=>e.trim().toLowerCase()).filter(Boolean),i=String(e.keywords||``).split(`,`).map(e=>e.trim().toLowerCase()).filter(Boolean);if(t===`sacrament`)return(n.strictTopics||[]).map(e=>e.toLowerCase()).some(e=>r.some(t=>t.includes(e))||i.some(t=>t.includes(e)));let a=[...r,...i];return(n.topics||[]).some(e=>{let t=e.toLowerCase();return a.some(e=>e.includes(t))})}):e}function Y(e,t,n,r){let i=ce(n,t),a=String(e.hymns?.[t]??``);return`
  <div class="slot">
    <label>${G(t)}</label>

    <select data-slot="${t}" data-plan="${e.id}" ${r?``:`disabled`}>
      ${i.map(e=>`
            <option value="${e.id}" ${String(e.id)===a?`selected`:``}>
              ${e.title}
            </option>
          `).join(``)}
    </select>
  </div>
`}var X=null;function Z(e){let t=e.querySelector(`#plansContainer`);X!==t&&(X=t,t.addEventListener(`click`,e=>{let t=e.target.closest(`button`);if(!t)return;let n=t.dataset.id;switch(t.dataset.action){case`edit`:le(n),K();break;case`save`:ue(n),K();break;case`reset`:de(n),K();break;case`print`:fe(n);break;case`delete`:ee(n),K();break}}),t.addEventListener(`change`,e=>{let t=e.target.closest(`select`);if(!t)return;let n=t.dataset.plan,r=t.dataset.slot,i=H.find(e=>e.id===n);i&&(i.hymns||={},i.hymns[r]=String(t.value))}))}function le(e){U.has(e)?U.delete(e):U.add(e)}function ue(e){let t=H.find(t=>t.id===e);t&&(b(t),U.delete(e),K())}function de(e){let t=_().find(t=>t.id===e),n=H.find(t=>t.id===e);!n||!t||(n.hymns=Object.fromEntries(Object.entries(t.hymns||{}).map(([e,t])=>[e,t&&typeof t==`object`?t.id:t??null])),U.delete(e),K())}function fe(e){let t=document.querySelector(`[data-plan="${e}"]`);t&&(document.querySelectorAll(`.plan-card`).forEach(e=>e.classList.remove(`print-target`)),t.classList.add(`print-target`),setTimeout(()=>{window.print(),t.classList.remove(`print-target`)},50))}var Q=document.querySelector(`#content`);if(!Q)throw Error(`Root container #content not found!`);function $(e=`generator`){Q.innerHTML=``,e===`generator`?w(Q):e===`library`?te(Q):e===`plans`?oe(Q):w(Q)}function pe(){let e=document.querySelector(`nav`);e&&e.addEventListener(`click`,e=>{let t=e.target.closest(`a`);if(!t)return;e.preventDefault();let n=t.dataset.page;n&&$(n)})}pe(),$(`generator`);