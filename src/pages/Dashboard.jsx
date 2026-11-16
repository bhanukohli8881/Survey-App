import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  getAllResponses,
  deleteResponse,
  clearAllResponses,
} from "../utils/storage";

export default function Dashboard() {
  const [responses, setResponses] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const refresh = () => setResponses(getAllResponses());

  useEffect(() => {
    refresh();
  }, []);

  /* -------- Search With Filter and Sort With Date-------- */
  const filtered = useMemo(() => {
    let list = [...responses];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) => {
        const text = JSON.stringify(r.answers || {}).toLowerCase();
        return text.includes(q);
      });
    }

    switch (sortBy) {
      case "oldest":
        list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "newest":
      default:
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return list;
  }, [responses, search, sortBy]);

  /* -------- Delete Actions Performance -------- */
  const handleDelete = (id) => {
    if (!window.confirm("क्या इस response को delete करना है?")) return;
    deleteResponse(id);
    refresh();
  };

  const handleClearAll = () => {
    if (!window.confirm("सारे responses हटा दें? यह वापस नहीं आएगा।")) return;
    clearAllResponses();
    refresh();
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(responses, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `survey_responses_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        if (!Array.isArray(imported)) throw new Error("Invalid file");
        const merged = [...responses];
        imported.forEach((r) => {
          if (!merged.find((m) => m.id === r.id)) merged.push(r);
        });
        localStorage.setItem("survey_phase6_responses", JSON.stringify(merged));
        refresh();
        alert(`${imported.length} responses imported।`);
      } catch {
        alert("File पढ़ने में problem। सही JSON भेजें।");
      }
    };
    reader.readAsText(file);
  };

  /* --------Here Count Total Responses Stats -------- */
  const stats = useMemo(() => {
    const total = responses.length;
    const today = new Date().toDateString();
    const todayCount = responses.filter(
      (r) => new Date(r.createdAt).toDateString() === today,
    ).length;
    const avgQuestions = total
      ? Math.round(
          responses.reduce(
            (sum, r) => sum + Object.keys(r.answers || {}).length,
            0,
          ) / total,
        )
      : 0;
    return { total, todayCount, avgQuestions };
  }, [responses]);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>📊 Dashboard</h1>
        <p>सारे भरे गए surveys की सूची और विश्लेषण</p>
      </div>

      {/* Display Stats Section (Statistics Cards)*/}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Responses</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.todayCount}</div>
          <div className="stat-label">आज भरे गए</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.avgQuestions}</div>
          <div className="stat-label">Avg. Answers / Response</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {responses.length
              ? new Date(
                  Math.max(...responses.map((r) => new Date(r.createdAt))),
                ).toLocaleDateString()
              : "—"}
          </div>
          <div className="stat-label">Latest Entry</div>
        </div>
      </div>

      {/* Create Search Bar And Search User Responses (Toolbar) */}
      <div className="dashboard-toolbar">
        <input
          type="text"
          placeholder="🔍 Search responses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="select-input small"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>

        <Link to="/survey" className="btn btn-primary">
          + New Response
        </Link>

        <button className="btn btn-secondary" onClick={handleExport}>
          ⬇️ Export
        </button>

        <label className="btn btn-secondary file-btn">
          ⬆️ Import
          <input
            type="file"
            accept="application/json"
            onChange={handleImport}
            hidden
          />
        </label>

        {responses.length > 0 && (
          <button className="btn btn-danger" onClick={handleClearAll}>
            🗑️ Clear All
          </button>
        )}
      </div>

      {/*Responses List Display + Empty State Handling */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>कोई response नहीं मिला</h3>
          <p>नया survey भरने के लिए नीचे button दबाएँ।</p>
          <Link to="/survey" className="btn btn-primary">
            + नया Survey भरें
          </Link>
        </div>
      ) : (
        <div className="responses-grid">
          {filtered.map((r) => (
            <ResponseCard
              key={r.id}
              response={r}
              onDelete={() => handleDelete(r.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Card Component for Response Card ---------- */
function ResponseCard({ response, onDelete }) {
  const answerCount = Object.keys(response.answers || {}).length;
  const created = new Date(response.createdAt).toLocaleString();
  const preview = Object.entries(response.answers || {})
    .slice(0, 2)
    .map(([k, v]) => {
      const val = Array.isArray(v)
        ? v.join(", ")
        : typeof v === "object"
          ? "📷 Image"
          : String(v).slice(0, 30);
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
