{
  /**API FETCH (for Question) */
}

const API_URL = "/api/SupportiveSupervisionPhase6?mode=GetQuestionMasterPhase6";

export async function fetchQuestionMaster() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}
