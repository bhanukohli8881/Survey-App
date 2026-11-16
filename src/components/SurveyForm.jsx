/*-------Main Form-------*/

import React, { useEffect, useState } from "react";

import QuestionRenderer from "./QuestionRenderer";
import { useLocalStorage } from "../hooks/useLocalStorage";
import "./SurveyForm.css";

const STORAGE_KEY = "survey_phase6_answers";
const SECTIONS_CACHE_KEY = "survey_phase6_sections";

export default function SurveyForm() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [answers, setAnswers] = useLocalStorage(STORAGE_KEY, {});

  const [saved, setSaved] = useState(false);

  /* ------ Fetch Survey Questions With API and cache in LocalStorage --- ---*/
  useEffect(() => {
    (async () => {
      try {
        const cached = localStorage.getItem(SECTIONS_CACHE_KEY);
        if (cached) {
          setSections(JSON.parse(cached));
          setLoading(false);
          return;
        }

        const data = await fetchQuestionMaster();
        const active = data.filter((s) => s.GASection_IsActive === "1");
        setSections(active);
        localStorage.setItem(SECTIONS_CACHE_KEY, JSON.stringify(active));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /*--- Conditional visibility ---*/
  const isVisible = (q) => {
    if (!q.GAQuestion_DependsOn || q.GAQuestion_DependsOn === "0") return true;
    const parent = answers[q.GAQuestion_DependsOn];
    const required = q.GA_OptionDepends_OptionId;
    if (parent == null) return false;
    if (Array.isArray(parent)) return parent.includes(required);
    return String(parent) === String(required);
  };

  const handleChange = (qId, val) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
    setSaved(false);
  };

  /* --- Manual Save ---*/
  const handleSave = () => {
    setAnswers(answers);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  /*--- Clear all data --- */
  const handleReset = () => {
    if (window.confirm("क्या आप सारे answers हटाना चाहते हैं?")) {
      setAnswers({});
      setSaved(false);
    }
  };

  /* --- Download as JSON (bonus) ---*/
  const handleDownload = () => {
    const serializable = {};
    Object.entries(answers).forEach(([k, v]) => {
      serializable[k] =
        v instanceof File ? { fileName: v.name, size: v.size } : v;
    });

    const blob = new Blob([JSON.stringify(serializable, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `survey_phase6_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="loader">Loading questionnaire...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="survey-container">
      <h1>Supportive Supervision Survey - Phase 6</h1>

      <div className="toolbar">
        <button type="button" onClick={handleSave} className="toolbar-btn save">
          💾 Save
        </button>
        <button type="button" onClick={handleDownload} className="toolbar-btn">
          ⬇️ Download JSON
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="toolbar-btn reset"
        >
          🗑️ Reset
        </button>
        {saved && (
          <span className="saved-indicator">✓ Saved to LocalStorage</span>
        )}
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        {sections.map((section) => (
          <fieldset key={section.GASection_ID} className="section">
            <legend>{section.GASection_SectionText.trim()}</legend>

            {section.lsttbl_GAQuestionMasterPhase5
              .filter(isVisible)
              .sort(
                (a, b) => Number(a.GA_OrderId || 0) - Number(b.GA_OrderId || 0),
              )
              .map((q) => (
                <QuestionRenderer
                  key={q.GAQuestion_ID}
                  question={q}
                  value={answers[q.GAQuestion_ID]}
                  onChange={(val) => handleChange(q.GAQuestion_ID, val)}
                />
              ))}
          </fieldset>
        ))}
      </form>
    </div>
  );
}
