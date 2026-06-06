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
  `}var r=null;async function i(){if(r)return r;try{let e=await fetch(`/Hymn-Planner/json/hymns.json`);if(!e.ok)throw Error(`Failed to load hymns.json (HTTP ${e.status})`);let t=await e.json();if(!t||!Array.isArray(t.hymns))throw Error(`Invalid hymns.json format: expected { hymns: [] }`);return r=Object.freeze([...t.hymns]),r}catch(e){throw console.error(`Hymn loading error: `,e),e}}var a=e=>!e||typeof e!=`object`?e:(Object.keys(e).forEach(t=>{typeof e[t]==`object`&&e[t]!==null&&a(e[t])}),Object.freeze(e)),o=a({opening:{topicBoost:10,keywordBoost:5,moodBoost:6,preferredMoods:[`joyfully`,`cheerfully`,`enthusiastically`,`brightly`,`boldly`,`triumphantly`],topics:[`faith`,`praise`,`zion`,`missionary work`,`gathering of israel`]},sacrament:{topicBoost:15,keywordBoost:10,moodBoost:8,strictTopics:[`atonement`,`sacrament`,`crucifixion`,`redeemer`,`savior`],preferredMoods:[`reverently`,`prayerfully`,`thoughtfully`,`reflectively`,`solemnly`],strictMode:!0},intermediate:{topicBoost:12,keywordBoost:6,moodBoost:6,preferredMoods:[`boldly`,`confidently`,`triumphantly`,`with conviction`,`with spirit`],topics:[`testimony`,`faith`,`missionary work`,`service`,`discipleship`,`zion`]},closing:{topicBoost:10,keywordBoost:5,moodBoost:6,preferredMoods:[`gratefully`,`peacefully`,`joyfully`,`reverently`],topics:[`testimony`,`faith`,`gratitude`,`discipleship`,`service`]}});async function s(e){let t=await i(),n=new Set;return{opening:c(t,e,`opening`,n),sacrament:c(t,e,`sacrament`,n),intermediate:c(t,e,`intermediate`,n),closing:c(t,e,`closing`,n)}}function c(e,t,n,r){let i=o[n];if(!i)return console.warn(`[SlotRules] Invalid Slot: `,n),null;let a=[];for(let n of e){if(r.has(n.id))continue;let e=d(n,t,i);e!==-1/0&&a.push({hymn:n,score:e})}if(a.length===0)return console.warn(`[Engine] No valid hymns for slot: `,n),null;a.sort((e,t)=>t.score-e.score);let s=a.slice(0,20),c=s.length?s:a,l=c[Math.floor(Math.random()*c.length)]?.hymn;return l?(r.add(l.id),l):null}var l=e=>typeof e==`string`?e.toLowerCase().trim():``,u=(e,t)=>{let n=l(t);return e.some(e=>typeof e==`string`?e.includes(n)||n.includes(e):!1)};function d(e,t,n){t||={};let r=0,i=(e.topics||[]).map(l),a=(e.keywords||[]).map(l),o=l(e.mood),s=[t.topic1,t.topic2,t.topic3].filter(e=>typeof e==`string`&&e.trim().length>0).map(l),c=l(t.mood);for(let e of s)u(i,e)&&(r+=n.topicBoost),u(a,e)&&(r+=n.keywordBoost);if(Array.isArray(n.topics))for(let e of n.topics)u(i,e)&&(r+=n.topicBoost);let d=0,f=n.preferredMoods?.includes(o),p=c&&(o.includes(c)||c.includes(o));return(f||p)&&(d+=n.moodBoost),r+=Math.min(d,n.moodBoost*1.5),n.strictMode&&!(n.strictTopics||[]).map(l).some(e=>i.some(t=>t.includes(e))||a.some(t=>t.includes(e)))?-1/0:(r+=Math.random()*8,r)}var f=`hymnPlans`;function p(){return JSON.parse(localStorage.getItem(f))||[]}function m(e){let t=p();t.push(e),localStorage.setItem(f,JSON.stringify(t))}function h(e){localStorage.setItem(f,JSON.stringify(e))}function g(e){if(!e?.id){console.error(`Plan update failed! (Missing plan ID)`);return}let t=p(),n=t.findIndex(t=>t.id===e.id);if(n===-1){console.warn(`Plan not found for update: `,e.id);return}t[n]=e,h(t)}function _(e){h(p().filter(t=>t.id!==e))}var v=null,y=null;async function b(e){e.innerHTML=`
  <section class="generator">
    <h1>Hymns Generator</h1>

    <!-- INPUT PANEL -->
    <!-- Topics -->
    <div class="topics">
      <label for="topic1">Topic 1</label>
      <input id="topic1" placeholder="Topic 1">
      
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

  </section>`;let t=e.querySelector(`#mood-container`);t&&(t.innerHTML=await n(`mood`,`Select Mood`));let r=e.querySelector(`#generateButton`);r&&r.addEventListener(`click`,async()=>{let t={topic1:e.querySelector(`#topic1`)?.value||``,topic2:e.querySelector(`#topic2`)?.value||``,topic3:e.querySelector(`#topic3`)?.value||``,mood:e.querySelector(`#mood`)?.value||``};console.log(`Generate Payload: `,t),y=t;let n=await s(t);console.log(`PLAN RESULT: `,n),v=n;let r=e=>e?.title??`No match`;e.querySelector(`#opening`).textContent=r(n.opening),e.querySelector(`#sacrament`).textContent=r(n.sacrament),e.querySelector(`#intermediate`).textContent=r(n.intermediate),e.querySelector(`#closing`).textContent=r(n.closing)});let i=e.querySelector(`#saveButton`);i&&i.addEventListener(`click`,()=>{if(!v){console.warn(`No plan to save yet.`);return}let e={id:`plan-${Date.now()}`,createdAt:new Date().toISOString(),input:y,hymns:{opening:v.opening,sacrament:v.sacrament,intermediate:v.intermediate,closing:v.closing}};m(e),console.log(`Saved Plan: `,e)});let a=e.querySelector(`#printButton`);a&&a.addEventListener(`click`,()=>{window.print()})}var x=null,S=[],C=new Set,w=!1,T=!1,E={opening:`Opening`,sacrament:`Sacrament`,intermediate:`Intermediate`,closing:`Closing`},D=e=>E[e]||e;function O(e){x=e,e.innerHTML=`
    <section class="plans">
        <h1>Saved Hymn Plans</h1>
        
        <!-- Container where plans will be rendered -->
        <div id="plansContainer"></div>
    </section>`,k(x)}async function k(e){let t=e.querySelector(`#plansContainer`),n=await i();if(!w){let e=p();S=structuredClone(Array.isArray(e)?e:[]),S=S.map(e=>({...e,hymns:Object.fromEntries(Object.entries(e.hymns||{}).map(([e,t])=>[e,t&&typeof t==`object`?t.id:t??null]))})),w=!0}if(S.length===0){t.innerHTML=`<p>No saved plans yet.</p>`;return}t.innerHTML=S.map(e=>r(e,n)).join(``),c(e,n);function r(e,t){let n=C.has(e.id);return`
      <div class="plan-card" data-plan="${e.id}">
            <div class="action-bar">
              <!-- Date -->
              <h3>${new Date(e.createdAt).toLocaleString()}</h3>

              <div class="actions">
                <!-- Edit Toggle -->
                <button data-action="edit" data-id="${e.id}">✏️ ${n?`Editing`:`Edit`}</button>

                <!-- Save Icon -->
                ${n?`
                  <button data-action="save" data-id="${e.id}">💾 Save</button>`:``}

                <!-- Reset Icon -->
                ${n?`
                  <button data-action="reset" data-id="${e.id}">🔄 Reset</button>`:``}

                <!-- Print Icon -->
                <button data-action="print" data-id="${e.id}">🖨 Print</button>

                <!-- Delete Icon --><button data-action="delete" data-id="${e.id}">🗑 Delete</button>
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
            ${s(e,`opening`,t,n)}
            ${s(e,`sacrament`,t,n)}
            ${s(e,`intermediate`,t,n)}
            ${s(e,`closing`,t,n)}
        </div>`}function a(e,t){let n=o[t];return n?e.filter(e=>{let r=(e.topics||[]).map(e=>e.toLowerCase()),i=(e.keywords||[]).map(e=>e.toLowerCase());if(t===`sacrament`)return(n.strictTopics||[]).map(e=>e.toLowerCase()).some(e=>r.some(t=>t.includes(e))||i.some(t=>t.includes(e)));let a=[...r,...i];return(n.topics||[]).some(e=>{let t=e.toLowerCase();return a.some(e=>e.includes(t))})}):e}function s(e,t,n,r){let i=a(n,t),o=String(e.hymns?.[t]??``);return`
    <div class="slot">
      <label>${D(t)}</label>

      <select data-slot="${t}" data-plan="${e.id}" ${r?``:`disabled`}>
        ${i.map(e=>`
              <option value="${e.id}" ${String(e.id)===o?`selected`:``}>
                ${e.title}
              </option>
            `).join(``)}
      </select>
    </div>
  `}function c(e){if(T)return;T=!0;let t=e.querySelector(`#plansContainer`);t.addEventListener(`click`,e=>{let t=e.target.closest(`button`);if(!t)return;let n=t.dataset.id;switch(t.dataset.action){case`edit`:l(n),k(x);break;case`save`:u(n),k(x);break;case`reset`:d(n),k(x);break;case`print`:f(n);break;case`delete`:_(n),S=S.filter(e=>e.id!==n),C.delete(n),k(x);break}}),t.addEventListener(`change`,e=>{let t=e.target.closest(`select`);if(!t)return;let n=t.dataset.plan,r=t.dataset.slot,i=S.find(e=>e.id===n);i&&(i.hymns||={},i.hymns[r]=t.value)})}function l(e){C.has(e)?C.delete(e):C.add(e)}function u(e){let t=S.find(t=>t.id===e);t&&(g(t),C.delete(e),k(x))}function d(e){let t=p().find(t=>t.id===e),n=S.find(t=>t.id===e);!n||!t||(n.hymns=Object.fromEntries(Object.entries(t.hymns||{}).map(([e,t])=>[e,t&&typeof t==`object`?t.id:t??null])),C.delete(e))}function f(e){let t=document.querySelector(`[data-plan="${e}"]`);t&&(document.querySelectorAll(`.plan-card`).forEach(e=>e.classList.remove(`print-target`)),t.classList.add(`print-target`),setTimeout(()=>{window.print(),t.classList.remove(`print-target`)},50))}}var A=`modulepreload`,j=function(e){return`/Hymn-Planner/`+e},M={};(function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}r=o(t.map(t=>{if(t=j(t,n),t in M)return;M[t]=!0;let r=t.endsWith(`.css`),i=r?`[rel="stylesheet"]`:``;if(n)for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}else if(document.querySelector(`link[href="${t}"]${i}`))return;let o=document.createElement(`link`);if(o.rel=r?`stylesheet`:A,r||(o.as=`script`),o.crossOrigin=``,o.href=t,a&&o.setAttribute(`nonce`,a),document.head.appendChild(o),r)return new Promise((e,n)=>{o.addEventListener(`load`,e),o.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})})(()=>import(O),[]);var N=document.querySelector(`#content`);if(!N)throw Error(`Root container #content not found!`);function P(e=`generator`){N.innerHTML=``,e===`generator`?b(N):e===`library`||(e===`plans`?O(N):b(N))}function F(){let e=document.querySelector(`nav`);e&&e.addEventListener(`click`,e=>{let t=e.target.closest(`a`);if(!t)return;e.preventDefault();let n=t.dataset.page;n&&P(n)})}F(),P(`generator`);