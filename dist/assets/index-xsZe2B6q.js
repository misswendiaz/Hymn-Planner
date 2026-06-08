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
  `}var r=`https://api.datamuse.com/words`;async function i(e){let t=`${r}?ml=${encodeURIComponent(e)}&max=8`;try{return(await(await fetch(t)).json()).map(e=>e.word)}catch(t){return console.warn(`[Datamuse] Failed for:`,e,t),[]}}async function a(e=[]){let t=new Set;for(let n of e){let e=await i(n);t.add(n);for(let n of e)t.add(n.toLowerCase())}return[...t]}var o=null;async function s(){if(o)return o;try{let e=await fetch(`/Hymn-Planner/json/hymns.json`);if(!e.ok)throw Error(`Failed to load hymns.json (HTTP ${e.status})`);let t=await e.json();if(!t||!Array.isArray(t.hymns))throw Error(`Invalid hymns.json format: expected { hymns: [] }`);return o=Object.freeze([...t.hymns]),o}catch(e){throw console.error(`Hymn loading error: `,e),e}}var c=new Set(`H85-169.H85-170.H85-171.H85-172.H85-173.H85-174.H85-175.H85-176.H85-177.H85-178.H85-179.H85-180.H85-181.H85-182.H85-183.H85-184.H85-185.H85-186.H85-187.H85-188.H85-189.H85-190.H85-191.H85-192.H85-193.H85-194.H85-195.H85-196.HHC-1007.HHC-1008.HHC-1009.HHC-1016.HHC-1017`.split(`.`)),l=e=>!e||typeof e!=`object`?e:(Object.keys(e).forEach(t=>{typeof e[t]==`object`&&e[t]!==null&&l(e[t])}),Object.freeze(e)),u=l({opening:{topicBoost:10,keywordBoost:5,moodBoost:6,preferredMoods:[`joyfully`,`cheerfully`,`enthusiastically`,`brightly`,`boldly`,`triumphantly`],topics:[`faith`,`praise`,`zion`,`missionary work`,`gathering of israel`]},sacrament:{topicBoost:15,keywordBoost:10,moodBoost:8,strictTopics:[`atonement`,`sacrament`,`crucifixion`,`redeemer`,`savior`],preferredMoods:[`reverently`,`prayerfully`,`thoughtfully`,`reflectively`,`solemnly`],strictMode:!0},intermediate:{topicBoost:12,keywordBoost:6,moodBoost:6,preferredMoods:[`boldly`,`confidently`,`triumphantly`,`with conviction`,`with spirit`],topics:[`testimony`,`faith`,`missionary work`,`service`,`discipleship`,`zion`]},closing:{topicBoost:10,keywordBoost:5,moodBoost:6,preferredMoods:[`gratefully`,`peacefully`,`joyfully`,`reverently`],topics:[`testimony`,`faith`,`gratitude`,`discipleship`,`service`]}});async function d(e){let t=await s(),n=new Set,r=await a([e?.topic1,e?.topic2,e?.topic3].filter(Boolean)),i={...e,expandedTopics:r};return{opening:f(t,i,`opening`,n),sacrament:f(t,i,`sacrament`,n),intermediate:f(t,i,`intermediate`,n),closing:f(t,i,`closing`,n)}}function f(e,t,n,r){let i=u[n];if(!i)return console.warn(`[SlotRules] Invalid Slot: `,n),null;let a=e;n===`sacrament`&&(a=e.filter(e=>c.has(e.id)));let o=[];for(let e of a){if(r.has(e.id))continue;let n=h(e,t,i);n!==-1/0&&o.push({hymn:e,score:n})}if(o.length===0)return console.warn(`[Engine] No valid hymns for slot: `,n),null;o.sort((e,t)=>t.score-e.score);let s=o.slice(0,20),l=s.length?s:o,d=l[Math.floor(Math.random()*l.length)]?.hymn;return d?(r.add(d.id),d):null}var p=e=>typeof e==`string`?e.toLowerCase().trim():``,m=(e,t)=>{let n=p(t);return e.some(e=>typeof e==`string`?e.includes(n)||n.includes(e):!1)};function h(e,t,n){t||={};let r=0,i=(e.topics||[]).map(p),a=(e.keywords||[]).map(p),o=p(e.mood),s=(t.expandedTopics||[]).filter(e=>typeof e==`string`&&e.trim().length>0).map(p),c=p(t.mood);for(let e of s)m(i,e)&&(r+=n.topicBoost),m(a,e)&&(r+=n.keywordBoost);if(Array.isArray(n.topics))for(let e of n.topics)m(i,e)&&(r+=n.topicBoost);let l=0,u=n.preferredMoods?.includes(o),d=c&&(o.includes(c)||c.includes(o));return(u||d)&&(l+=n.moodBoost),r+=Math.min(l,n.moodBoost*1.5),n.strictMode&&(n.strictTopics||[]).map(p).some(e=>i.includes(e)||a.includes(e))&&(r+=n.moodBoost*2),r+=Math.random()*8,r}var g=`hymnPlans`;function _(){return JSON.parse(localStorage.getItem(g))||[]}function v(e){let t=_();t.push(e),localStorage.setItem(g,JSON.stringify(t))}function y(e){localStorage.setItem(g,JSON.stringify(e))}function b(e){if(!e?.id){console.error(`Plan update failed! (Missing plan ID)`);return}let t=_(),n=t.findIndex(t=>t.id===e.id);if(n===-1){console.warn(`Plan not found for update: `,e.id);return}t[n]=e,y(t)}function x(e){y(_().filter(t=>t.id!==e))}var S=null,C=null;async function w(e){e.innerHTML=`
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

  </section>`;let t=e.querySelector(`#mood-container`);t&&(t.innerHTML=await n(`mood`,`Select Mood`));let r=e.querySelector(`#generateButton`);r&&r.addEventListener(`click`,async()=>{let t={topic1:e.querySelector(`#topic1`)?.value||``,topic2:e.querySelector(`#topic2`)?.value||``,topic3:e.querySelector(`#topic3`)?.value||``,mood:e.querySelector(`#mood`)?.value||``};console.log(`Generate Payload: `,t),C=t;let n=await d(t);console.log(`CURRENT PLAN:`,n),console.log(`LAST INPUT:`,t),console.log(`PLAN RESULT: `,n),S=n;let r=e=>e?.title??`No match`;e.querySelector(`#opening`).textContent=r(n.opening),e.querySelector(`#sacrament`).textContent=r(n.sacrament),e.querySelector(`#intermediate`).textContent=r(n.intermediate),e.querySelector(`#closing`).textContent=r(n.closing)});let i=e.querySelector(`#saveButton`);i&&i.addEventListener(`click`,()=>{if(!S){console.warn(`No plan to save yet.`);return}let e={id:`plan-${Date.now()}`,createdAt:new Date().toISOString(),input:C,hymns:{opening:S.opening,sacrament:S.sacrament,intermediate:S.intermediate,closing:S.closing}};console.log(`CURRENT PLAN:`,S),console.log(`LAST INPUT:`,C),console.log(`PLAN TO SAVE:`,e),v(e),console.log(`Saved Plan: `,e)});let a=e.querySelector(`#printButton`);a&&a.addEventListener(`click`,()=>{window.print()})}var T=null,E=[],D=new Set,O=!1,k=!1,A={opening:`Opening`,sacrament:`Sacrament`,intermediate:`Intermediate`,closing:`Closing`},j=e=>A[e]||e;function M(e){T=e,e.innerHTML=`
    <section class="plans">
        <h1>Saved Hymn Plans</h1>
        
        <!-- Container where plans will be rendered -->
        <div id="plansContainer"></div>
    </section>`,N(T)}async function N(e){let t=e.querySelector(`#plansContainer`),n=await s();if(!O){let e=_();E=structuredClone(Array.isArray(e)?e:[]),E=E.map(e=>({...e,hymns:Object.fromEntries(Object.entries(e.hymns||{}).map(([e,t])=>[e,t&&typeof t==`object`?t.id:t??null]))})),O=!0}if(E.length===0){t.innerHTML=`<p>No saved plans yet.</p>`;return}t.innerHTML=E.map(e=>r(e,n)).join(``),o(e,n);function r(e,t){let n=D.has(e.id);return`
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
            ${a(e,`opening`,t,n)}
            ${a(e,`sacrament`,t,n)}
            ${a(e,`intermediate`,t,n)}
            ${a(e,`closing`,t,n)}
        </div>`}function i(e,t){let n=u[t];return n?e.filter(e=>{let r=(e.topics||[]).map(e=>e.toLowerCase()),i=(e.keywords||[]).map(e=>e.toLowerCase());if(t===`sacrament`)return(n.strictTopics||[]).map(e=>e.toLowerCase()).some(e=>r.some(t=>t.includes(e))||i.some(t=>t.includes(e)));let a=[...r,...i];return(n.topics||[]).some(e=>{let t=e.toLowerCase();return a.some(e=>e.includes(t))})}):e}function a(e,t,n,r){let a=i(n,t),o=String(e.hymns?.[t]??``);return`
    <div class="slot">
      <label>${j(t)}</label>

      <select data-slot="${t}" data-plan="${e.id}" ${r?``:`disabled`}>
        ${a.map(e=>`
              <option value="${e.id}" ${String(e.id)===o?`selected`:``}>
                ${e.title}
              </option>
            `).join(``)}
      </select>
    </div>
  `}function o(e){if(k)return;k=!0;let t=e.querySelector(`#plansContainer`);t.addEventListener(`click`,e=>{let t=e.target.closest(`button`);if(!t)return;let n=t.dataset.id;switch(t.dataset.action){case`edit`:c(n),N(T);break;case`save`:l(n),N(T);break;case`reset`:d(n),N(T);break;case`print`:f(n);break;case`delete`:x(n),E=E.filter(e=>e.id!==n),D.delete(n),N(T);break}}),t.addEventListener(`change`,e=>{let t=e.target.closest(`select`);if(!t)return;let n=t.dataset.plan,r=t.dataset.slot,i=E.find(e=>e.id===n);i&&(i.hymns||={},i.hymns[r]=t.value)})}function c(e){D.has(e)?D.delete(e):D.add(e)}function l(e){let t=E.find(t=>t.id===e);t&&(b(t),D.delete(e),N(T))}function d(e){let t=_().find(t=>t.id===e),n=E.find(t=>t.id===e);!n||!t||(n.hymns=Object.fromEntries(Object.entries(t.hymns||{}).map(([e,t])=>[e,t&&typeof t==`object`?t.id:t??null])),D.delete(e))}function f(e){let t=document.querySelector(`[data-plan="${e}"]`);t&&(document.querySelectorAll(`.plan-card`).forEach(e=>e.classList.remove(`print-target`)),t.classList.add(`print-target`),setTimeout(()=>{window.print(),t.classList.remove(`print-target`)},50))}}var P=document.querySelector(`#content`);if(!P)throw Error(`Root container #content not found!`);function F(e=`generator`){P.innerHTML=``,e===`generator`?w(P):e===`library`||(e===`plans`?M(P):w(P))}function I(){let e=document.querySelector(`nav`);e&&e.addEventListener(`click`,e=>{let t=e.target.closest(`a`);if(!t)return;e.preventDefault();let n=t.dataset.page;n&&F(n)})}I(),F(`generator`);