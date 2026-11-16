import React from "react";
import { Link } from "react-router-dom";

export default function ResponseCard({ response, onDelete }) {
  const answerCount = Object.keys(response.answers || {}).length;
  const created = new Date(response.createdAt).toLocaleString();

  /* --------Generate Short Preview  First Two Questions Of Survey Response-------- */
  const preview = Object.entries(response.answers || {})
    .slice(0, 2)
    .map(([k, v]) => {
      let val;
      if (Array.isArray(v)) {
        val = v.join(", ");
      } else if (v && typeof v === "object" && v.dataUrl) {
        val = "📷 Image";
      } else if (v && typeof v === "object") {
        val = JSON.stringify(v).slice(0, 30);
      } else {
        val = String(v).slice(0, 30);
      }
      return `Q${k}: ${val}`;
    })
    .join(" • ");

  return (
    <div className="response-card">
      <div className="response-card-header">
        <span className="response-id">#{response.id.slice(-6)}</span>
        <span className="response-date">{created}</span>
      </div>

      <div className="response-body">
        <p className="response-preview">{preview || "(खाली)"}</p>
        <p className="response-count">✓ {answerCount} answers</p>
      </div>

      <div className="response-actions">
        <Link to={`/survey/${response.id}`} className="btn btn-secondary small">
          ✏️ Edit
        </Link>
        <button className="btn btn-danger small" onClick={onDelete}>
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}
