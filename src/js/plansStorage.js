const STORAGE_KEY = "hymnPlans";

// Gets all saved hymn plans from localStorage
export function getSavedPlans() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

// Saves a new plan to localStorage
export function savePlan(plan) {
  const plans = getSavedPlans();

  plans.push(plan);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

// Overwrites all saved plans
export function saveAllPlans(plans) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

// Update an existing plan
export function updatePlan(updatedPlan) {
  if (!updatedPlan?.id) {
    console.error("Plan update failed! (Missing plan ID)");
    return;
  }
  const plans = getSavedPlans();

  const index = plans.findIndex((p) => p.id === updatedPlan.id);
  if (index === -1) {
    console.warn("Plan not found for update: ", updatedPlan.id);
    return;
  }

  plans[index] = updatedPlan;
  saveAllPlans(plans);
}

// Delete a plan
export function deletePlan(id) {
  const plans = getSavedPlans().filter((p) => p.id !== id);
  saveAllPlans(plans);
}
