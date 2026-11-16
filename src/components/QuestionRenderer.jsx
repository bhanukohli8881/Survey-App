import React from "react";

const ANSWER_TYPE = {
  MULTI_SELECT: "1",
  TEXT: "2",
  SINGLE_SELECT: "3",
  DROPDOWN: "4",
  IMAGE: "5",
};

export default function QuestionRenderer({ question, value, onChange }) {
  const type = question.GAQuestion_AnswerType;
  const options = question.lsttbl_GAQuestion_OptionMasterPhase5 || [];

  const Label = (
    <label className="q-label">
      {question.GAQuestion_Description.trim()}
      {question.IsPmShri === "1" && <span className="badge">PM Shri</span>}
      {question.GAQuestion_HelpText && (
        <small className="help-text">{question.GAQuestion_HelpText}</small>
      )}
    </label>
  );

  const Wrapper = (children) => (
    <div className="question-block">{children}</div>
  );

  switch (type) {
    /* ----  Multi Select (Checkboxes) ----*/
    case ANSWER_TYPE.MULTI_SELECT: {
      const arr = Array.isArray(value) ? value : [];
      return Wrapper(
        <>
          {Label}
          <div className="options-group">
            {options.map((opt) => (
              <label key={opt.GAOption_ID} className="option-item">
                <input
                  type="checkbox"
                  checked={arr.includes(opt.GAOption_ID)}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...arr, opt.GAOption_ID]
                      : arr.filter((id) => id !== opt.GAOption_ID);
                    onChange(next);
                  }}
                />
                <span>{opt.GAOption_OptionText.trim()}</span>
              </label>
            ))}
          </div>
        </>,
      );
    }

    /* ----  Text / Number ----*/
    case ANSWER_TYPE.TEXT: {
      const isNumber = /संख्या|number|कोड|प्रतिशत|%|मोबाइल/i.test(
        question.GAQuestion_Description,
      );
      return Wrapper(
        <>
          {Label}
          <input
            type={isNumber ? "number" : "text"}
            className="text-input"
            value={value || ""}
            placeholder="अपना उत्तर लिखें..."
            onChange={(e) => onChange(e.target.value)}
          />
        </>,
      );
    }

    /*----  Single Select (Radio) ----*/
    case ANSWER_TYPE.SINGLE_SELECT: {
      return Wrapper(
        <>
          {Label}
          <div className="options-group">
            {options.map((opt) => (
              <label key={opt.GAOption_ID} className="option-item">
                <input
                  type="radio"
                  name={`q_${question.GAQuestion_ID}`}
                  value={opt.GAOption_ID}
                  checked={String(value) === String(opt.GAOption_ID)}
                  onChange={() => onChange(opt.GAOption_ID)}
                />
                <span>{opt.GAOption_OptionText.trim()}</span>
              </label>
            ))}
          </div>
        </>,
      );
    }

    /*----  Dropdown ----*/
    case ANSWER_TYPE.DROPDOWN: {
      return Wrapper(
        <>
          {Label}
          <select
            className="select-input"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">-- चुनें --</option>
            {options.map((opt) => (
              <option key={opt.GAOption_ID} value={opt.GAOption_ID}>
                {opt.GAOption_OptionText.trim()}
              </option>
            ))}
          </select>
        </>,
      );
    }

    /* ---- Image Upload ----*/
    case ANSWER_TYPE.IMAGE: {
      return Wrapper(
        <>
          {Label}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="file-input"
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;

              const reader = new FileReader();
              reader.onload = () => {
                onChange({
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  dataUrl: reader.result,
                });
              };
              reader.readAsDataURL(file);
            }}
          />
          {value && value.dataUrl && (
            <div className="preview">
              <img src={value.dataUrl} alt={value.name} />
              <small>
                {value.name} ({(value.size / 1024).toFixed(1)} KB)
              </small>
            </div>
          )}
        </>,
      );
    }

    default:
      return Wrapper(
        <>
          {Label}
          <input
            type="text"
            className="text-input"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </>,
      );
  }
}
