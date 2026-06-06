import { initGeneratorPage } from "./generator.js";
import { initPlansPage } from "./plans.js";

// Container for rendering pages/contents
const root = document.querySelector("#content");

// Safety check to prevent runtime errors if #content is missing
if (!root) {
  throw new Error("Root container #content not found!");
}

// Control which page/content is diplayed
function router(page = "generator") {
  // Clear current view
  root.innerHTML = "";

  if (page === "generator") {
    // Generator Page
    initGeneratorPage(root);
  } else if (page === "library") {
    // Library Page
    // initLibraryPage(root);
  } else if (page === "plans") {
    // Plans Page
    initPlansPage(root);
  } else {
    // Redirect to Generator page when the page provided is invalid
    initGeneratorPage(root);
  }
}

// Handles navigation clicks
function setUpNavigation() {
  const nav = document.querySelector("nav");

  // Prevents errors if nav does not exist
  if (!nav) return;

  nav.addEventListener("click", (e) => {
    const link = e.target.closest("a");

    // Makes sure responses are only for clicked nav links
    if (!link) return;

    // Prevents page reload
    e.preventDefault();

    // Extract target page from data-page attribute
    const page = link.dataset.page;

    // Ignore links without valide routing info
    if (!page) return;

    // Route to selected page
    router(page);
  });
}

// Initializes page/content
setUpNavigation();
router("generator");
