const RESPONSES_KEY = "survey_phase6_responses";
const SECTIONS_CACHE_KEY = "survey_phase6_sections";
const DRAFT_KEY = "survey_phase6_draft";

/* ---------- Responses (submitted surveys) ---------- */

export function getAllResponses() {
  try {
    const raw = localStorage.getItem(RESPONSES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveResponse(response) {
  const all = getAllResponses();
  const idx = all.findIndex((r) => r.id === response.id);
  if (idx >= 0) all[idx] = response;
  else all.push(response);
  localStorage.setItem(RESPONSES_KEY, JSON.stringify(all));
  return response;
}

export function getResponseById(id) {
  return getAllResponses().find((r) => r.id === id) || null;
}

export function deleteResponse(id) {
  const all = getAllResponses().filter((r) => r.id !== id);
  localStorage.setItem(RESPONSES_KEY, JSON.stringify(all));
}

export function clearAllResponses() {
  localStorage.removeItem(RESPONSES_KEY);
}

/* ---------- Draft (in-progress survey) ---------- */

export function getDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveDraft(draft) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

/* ---------- Sections Cache ---------- */

export function getCachedSections() {
  try {
    const raw = localStorage.getItem(SECTIONS_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function cacheSections(sections) {
  localStorage.setItem(SECTIONS_CACHE_KEY, JSON.stringify(sections));
}

/* ---------- ID generator ---------- */

export function generateId() {
  return `resp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
