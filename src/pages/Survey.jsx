import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchQuestionMaster } from "../api/surveyApi";
import QuestionRenderer from "../components/QuestionRenderer";
import {
  getCachedSections,
  cacheSections,
  getDraft,
  saveDraft,
  clearDraft,
  getResponseById,
  saveResponse,
  generateId,
} from "../utils/storage";

export default function Survey() {
  const [sections, setSections] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentStep, setCurrentStep] = useState(0); // 0-indexed
  const [validationMsg, setValidationMsg] = useState("");

  const navigate = useNavigate();
  const { id } = useParams();
  const topRef = useRef(null);

  /* ----------  Load questions With API ---------- */
  useEffect(() => {
    (async () => {
      try {
        let cached = getCachedSections();
        if (!cached) {
          const data = await fetchQuestionMaster();
          cached = data.filter((s) => s.GASection_IsActive === "1");
          cacheSections(cached);
        }
        setSections(cached);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ----------  Edit existing Survey response or Restore draft ---------- */
  useEffect(() => {
    if (id) {
      const existing = getResponseById(id);
      if (existing) {
        setAnswers(existing.answers || {});
        setEditingId(id);
      }
    } else {
      const draft = getDraft();
      if (draft && Object.keys(draft).length > 0) {
        const restore = window.confirm(
          "पिछला अधूरा survey मिला है। क्या उसे continue करना है?",
        );
        if (restore) setAnswers(draft);
        else clearDraft();
      }
    }
  }, [id]);

  /* ----------Implementation of Auto-Save Draft with Debouncing (debounced) ---------- */
  useEffect(() => {
    if (editingId) return;
    const t = setTimeout(() => saveDraft(answers), 600);
    return () => clearTimeout(t);
  }, [answers, editingId]);

  /* ---------- Automatic Scroll to top on step change ---------- */
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setValidationMsg("");
  }, [currentStep]);

  /* ----------  Conditional visibility (Show OR Hide) ---------- */
  const isVisible = (q) => {
    if (!q.GAQuestion_DependsOn || q.GAQuestion_DependsOn === "0") return true;
    const parent = answers[q.GAQuestion_DependsOn];
    const req = q.GA_OptionDepends_OptionId;
    if (parent == null) return false;
    if (Array.isArray(parent)) return parent.includes(req);
    return String(parent) === String(req);
  };

  const handleChange = (qId, val) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
    setSaved(false);
  };

  /* ---------- Questions Filtered and Sort in Current section  ---------- */
  const currentSection = sections[currentStep];
  const visibleQuestions = useMemo(() => {
    if (!currentSection) return [];
    return currentSection.lsttbl_GAQuestionMasterPhase5
      .filter(isVisible)
      .sort((a, b) => Number(a.GA_OrderId || 0) - Number(b.GA_OrderId || 0));
  }, [currentSection, answers]);

  /* ---------- Progress Bar Calculation ---------- */
  const totalSteps = sections.length;
  const progressPercent =
    totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 100;

  /* ---------- Next Step Navigation With Validation ---------- */
  const goNext = () => {
    if (!validateCurrentStep()) return;
    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  const goPrev = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const goToStep = (idx) => {
    // Allow going back freely, forward only if current valid
    if (idx < currentStep) {
      setCurrentStep(idx);
    } else if (idx > currentStep) {
      // Validate all in-between steps
      for (let i = currentStep; i < idx; i++) {
        if (!validateStep(i)) {
          setCurrentStep(i);
          setValidationMsg("कृपया पहले इस section के ज़रूरी प्रश्न भरें।");
          return;
        }
      }
      setCurrentStep(idx);
    }
  };

  /* ---------- Form Validation --------- */
  const validateStep = (stepIdx) => {
    const sec = sections[stepIdx];
    if (!sec) return true;
    const qs = sec.lsttbl_GAQuestionMasterPhase5.filter(isVisible);
    /*-------Optionally add required rules (right now, just allow anything); as an example, here we are keeping the first question in General Information (section 1) — the name of the district — as required.--------------*/
    if (stepIdx === 0) {
      const firstQ = qs.find((q) => q.GAQuestion_ID === "1");
      if (firstQ && !answers[firstQ.GAQuestion_ID]) {
        setValidationMsg("कृपया 'जनपद का नाम' भरें।");
        return false;
      }
    }
    return true;
  };

  const validateCurrentStep = () => validateStep(currentStep);

  /* ---------- Final Save With Survey Validation ---------- */
  const handleSubmit = () => {
    for (let i = 0; i < sections.length; i++) {
      if (!validateStep(i)) {
        setCurrentStep(i);
        setValidationMsg("कृपया इस section के ज़रूरी प्रश्न भरें।");
        return;
      }
    }

    const payload = {
      id: editingId || generateId(),
      createdAt: editingId
        ? getResponseById(editingId)?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      answers,
    };

    saveResponse(payload);
    clearDraft();
    setSaved(true);
    setTimeout(() => navigate("/dashboard"), 700);
  };

  /* ----------  Reset  All Answers---------- */
  const handleReset = () => {
    if (!window.confirm("सारे answers हटा दें?")) return;
    setAnswers({});
    clearDraft();
    setCurrentStep(0);
  };

  /* ---------- Render  With API---------- */
  if (loading) return <div className="loader">Loading questionnaire...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!sections.length)
    return <div className="error">कोई section नहीं मिला।</div>;

  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="survey-page" ref={topRef}>
      {/* Header */}
      <div className="survey-header">
        <div className="survey-header-top">
          <h1>{editingId ? "✏️ Edit Response" : "📝 New Survey"}</h1>
          <button className="btn btn-danger small" onClick={handleReset}>
            🗑️ Reset
          </button>
        </div>

        {/* Progress bar */}
        <div className="progress-wrap">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="progress-text">
            Step {currentStep + 1} / {totalSteps} — {progressPercent.toFixed(0)}
            %
          </div>
        </div>

        {/* Step indicator (clickable chips) */}
        <div className="step-chips">
          {sections.map((sec, idx) => {
            const isActive = idx === currentStep;
            const isDone = idx < currentStep;
            return (
              <button
                key={sec.GASection_ID}
                className={`step-chip ${isActive ? "active" : ""} ${
                  isDone ? "done" : ""
                }`}
                onClick={() => goToStep(idx)}
                type="button"
                title={sec.GASection_SectionText.trim()}
              >
                {isDone ? "✓" : idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Section */}
      <fieldset className="section wizard-section">
        <legend>
          <span className="step-badge">Step {currentStep + 1}</span>
          {currentSection.GASection_SectionText.trim()}
        </legend>

        {visibleQuestions.length === 0 ? (
          <p className="empty-section">इस section में कोई प्रश्न नहीं है।</p>
        ) : (
          visibleQuestions.map((q) => (
            <QuestionRenderer
              key={q.GAQuestion_ID}
              question={q}
              value={answers[q.GAQuestion_ID]}
              onChange={(val) => handleChange(q.GAQuestion_ID, val)}
            />
          ))
        )}
      </fieldset>

      {/* Validation Message */}
      {validationMsg && (
        <div className="validation-msg">⚠️ {validationMsg}</div>
      )}

      {/* Navigation Buttons */}
      <div className="wizard-nav">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={goPrev}
          disabled={isFirstStep}
        >
          ← Previous
        </button>

        <div className="wizard-nav-center">
          {saved && <span className="saved-indicator">✓ Saved!</span>}
        </div>

        {!isLastStep ? (
          <button type="button" className="btn btn-primary" onClick={goNext}>
            Next →
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-success"
            onClick={handleSubmit}
          >
            ✓ Submit Survey
          </button>
        )}
      </div>
    </div>
  );
}
