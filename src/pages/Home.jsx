import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllResponses } from "../utils/storage";

export default function Home() {
  const [stats, setStats] = useState({ total: 0, today: 0 });

  useEffect(() => {
    const all = getAllResponses();
    /* --------Get the current date to calculate today's responses------ */
    const today = new Date().toDateString();
    /*-------- Filter responses submitted on the current date-------*/
    const todayCount = all.filter(
      (r) => new Date(r.createdAt).toDateString() === today,
    ).length;
    setStats({ total: all.length, today: todayCount });
  }, []);

  return (
    <div className="home-page">
      <div className="home-hero">
        <h1>Supportive Supervision Survey</h1>
        <p className="subtitle">Phase 6 — शिक्षा विभाग, उत्तर प्रदेश</p>
        <p className="description">
          विद्यालय का शैक्षणिक अवलोकन करें, प्रश्नावली भरें और परिणाम Dashboard
          में देखें। सारा डेटा आपके browser में सुरक्षित रहता है।
        </p>

        <div className="hero-actions">
          <Link to="/survey" className="btn btn-primary">
            📝 नया सर्वे शुरू करें
          </Link>
          <Link to="/dashboard" className="btn btn-secondary">
            📊 Dashboard देखें
          </Link>
        </div>
      </div>

      <div className="home-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">कुल Responses</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.today}</div>
          <div className="stat-label">आज भरे गए</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">7</div>
          <div className="stat-label">Sections</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">90+</div>
          <div className="stat-label">Questions</div>
        </div>
      </div>

      <div className="home-features">
        <div className="feature">
          <div className="feature-icon">💾</div>
          <h3>Auto Save</h3>
          <p>
            हर input अपने आप सुरक्षित हो जाता है, refresh से डरने की ज़रूरत
            नहीं।
          </p>
        </div>
        <div className="feature">
          <div className="feature-icon">🔀</div>
          <h3>Smart Questions</h3>
          <p>Dependent questions आपके जवाब के अनुसार show/hide होते हैं।</p>
        </div>
        <div className="feature">
          <div className="feature-icon">📊</div>
          <h3>Analytics</h3>
          <p>
            Dashboard में सारे भरे गए surveys को देखें, edit करें और delete
            करें।
          </p>
        </div>
      </div>
    </div>
  );
}
