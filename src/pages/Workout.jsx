import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import ThemeToggle from "../components/ThemeToggle";
import "../styles/Workout.css";

const WORKOUT_TYPES = [
  { name: "Running", icon: "🏃", met: 9.8 },
  { name: "Brisk Walking", icon: "🚶", met: 4.5 },
  { name: "Cycling", icon: "🚴", met: 7.5 },
  { name: "Yoga", icon: "🧘", met: 3.0 },
  { name: "Weight Training", icon: "🏋️", met: 6.0 },
  { name: "Swimming", icon: "🏊", met: 8.0 },
  { name: "Cricket", icon: "🏏", met: 5.0 },
  { name: "Badminton", icon: "🏸", met: 5.5 },
  { name: "Football", icon: "⚽", met: 7.0 },
  { name: "Skipping", icon: "🪢", met: 10.0 },
  { name: "Dance", icon: "💃", met: 5.5 },
  { name: "Stretching", icon: "🤸", met: 2.5 },
];

const INTENSITY_MULTIPLIER = { Low: 0.8, Medium: 1.0, High: 1.3 };

const Workout = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("log"); // log | history | summary | suggestions
  const [workouts, setWorkouts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userWeight, setUserWeight] = useState(70);

  const [form, setForm] = useState({
    workoutType: "",
    duration: "",
    caloriesBurned: "",
    intensity: "Medium",
    notes: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [suggestForm, setSuggestForm] = useState({
    fitnessLevel: "Beginner",
    availableTime: 30,
    diseases: "",
  });

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token) { navigate("/"); return; }
    fetchHistory();
    fetchSummary();
    // Get user weight for calorie calc
    API.get("/user/profile", { headers }).then(res => {
      if (res.data.weight) setUserWeight(res.data.weight);
    }).catch(() => {});
  }, []);

  // Auto-calculate calories when type/duration/intensity changes
  useEffect(() => {
    if (form.workoutType && form.duration && form.intensity) {
      const wt = WORKOUT_TYPES.find(w => w.name === form.workoutType);
      if (wt) {
        const met = wt.met * INTENSITY_MULTIPLIER[form.intensity];
        const cal = Math.round((met * userWeight * parseFloat(form.duration)) / 60);
        setForm(prev => ({ ...prev, caloriesBurned: cal }));
      }
    }
  }, [form.workoutType, form.duration, form.intensity, userWeight]);

  const fetchHistory = async () => {
    try {
      const res = await API.get("/workout/history", { headers });
      setWorkouts(res.data.workouts || []);
    } catch (e) { console.error(e); }
  };

  const fetchSummary = async () => {
    try {
      const res = await API.get("/workout/weekly-summary", { headers });
      setSummary(res.data.summary);
    } catch (e) { console.error(e); }
  };

  const handleLog = async (e) => {
    e.preventDefault();
    if (!form.workoutType) { setError("Please select a workout type"); return; }
    setLoading(true); setError(""); setSuccess("");
    try {
      await API.post("/workout/log", {
        ...form,
        duration: parseInt(form.duration),
        caloriesBurned: parseInt(form.caloriesBurned),
      }, { headers });
      setSuccess("Workout logged successfully! 💪");
      setForm({ workoutType: "", duration: "", caloriesBurned: "", intensity: "Medium", notes: "", date: new Date().toISOString().split("T")[0] });
      fetchHistory();
      fetchSummary();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to log workout");
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/workout/${id}`, { headers });
      fetchHistory();
      fetchSummary();
    } catch (e) { console.error(e); }
  };

  const handleGetSuggestions = async () => {
    setSuggestLoading(true); setError("");
    try {
      const res = await API.post("/workout/suggestions", suggestForm, { headers });
      setSuggestions(res.data.suggestions);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to get suggestions");
    } finally { setSuggestLoading(false); }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const getIntensityColor = (intensity) => {
    if (intensity === "Low") return "#22c55e";
    if (intensity === "Medium") return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="workout-container">
      {/* Header */}
      <header className="workout-header">
        <div className="workout-header-content">
          <h1 className="workout-logo" onClick={() => navigate("/dashboard")}>💪 SwasthAI</h1>
          <div className="workout-header-actions">
            <button className="workout-back-btn" onClick={() => navigate("/dashboard")}>← Dashboard</button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="workout-hero">
        <h2 className="workout-hero-title">🏋️ Workout Tracker</h2>
        <p className="workout-hero-subtitle">Log workouts, track progress, and get AI-powered fitness plans</p>
      </div>

      {/* Tabs */}
      <div className="workout-tabs-wrapper">
        <div className="workout-tabs">
          {[
            { id: "log", label: "Log Workout", icon: "➕" },
            { id: "history", label: "History", icon: "📋" },
            { id: "summary", label: "Weekly Summary", icon: "📊" },
            { id: "suggestions", label: "AI Plan", icon: "🤖" },
          ].map(tab => (
            <button
              key={tab.id}
              className={`workout-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="workout-main">
        {/* Alerts */}
        {error && <div className="workout-alert workout-alert-error">⚠️ {error}</div>}
        {success && <div className="workout-alert workout-alert-success">✅ {success}</div>}

        {/* ===== LOG TAB ===== */}
        {activeTab === "log" && (
          <div className="workout-card">
            <h3 className="workout-card-title">Log Today's Workout</h3>
            <form onSubmit={handleLog} className="workout-form">

              {/* Workout Type Grid */}
              <div className="workout-field">
                <label>Select Workout Type *</label>
                <div className="workout-type-grid">
                  {WORKOUT_TYPES.map(wt => (
                    <button
                      key={wt.name}
                      type="button"
                      className={`workout-type-btn ${form.workoutType === wt.name ? "active" : ""}`}
                      onClick={() => setForm(prev => ({ ...prev, workoutType: wt.name }))}
                    >
                      <span className="workout-type-icon">{wt.icon}</span>
                      <span className="workout-type-name">{wt.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="workout-form-row">
                {/* Duration */}
                <div className="workout-field">
                  <label>Duration (minutes) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 30"
                    value={form.duration}
                    onChange={e => setForm(prev => ({ ...prev, duration: e.target.value }))}
                    min="1" max="300" required
                  />
                </div>

                {/* Intensity */}
                <div className="workout-field">
                  <label>Intensity</label>
                  <div className="workout-intensity-group">
                    {["Low", "Medium", "High"].map(level => (
                      <button
                        key={level}
                        type="button"
                        className={`workout-intensity-btn ${form.intensity === level ? "active" : ""}`}
                        style={form.intensity === level ? { background: getIntensityColor(level), borderColor: getIntensityColor(level) } : {}}
                        onClick={() => setForm(prev => ({ ...prev, intensity: level }))}
                      >
                        {level === "Low" ? "🟢" : level === "Medium" ? "🟡" : "🔴"} {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="workout-form-row">
                {/* Calories */}
                <div className="workout-field">
                  <label>Calories Burned (auto-calculated)</label>
                  <div className="workout-calorie-display">
                    <span className="workout-calorie-icon">🔥</span>
                    <input
                      type="number"
                      placeholder="Auto-calculated"
                      value={form.caloriesBurned}
                      onChange={e => setForm(prev => ({ ...prev, caloriesBurned: e.target.value }))}
                      min="0"
                    />
                    <span className="workout-calorie-unit">kcal</span>
                  </div>
                </div>

                {/* Date */}
                <div className="workout-field">
                  <label>Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="workout-field">
                <label>Notes (optional)</label>
                <textarea
                  placeholder="How did it feel? Any achievements?"
                  value={form.notes}
                  onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows="2"
                />
              </div>

              <button type="submit" className="workout-submit-btn" disabled={loading}>
                {loading ? <><span className="spinner"></span> Logging...</> : "💪 Log Workout"}
              </button>
            </form>
          </div>
        )}

        {/* ===== HISTORY TAB ===== */}
        {activeTab === "history" && (
          <div className="workout-card">
            <h3 className="workout-card-title">Workout History</h3>
            {workouts.length === 0 ? (
              <div className="workout-empty">
                <span className="workout-empty-icon">🏃</span>
                <p>No workouts logged yet. Start your fitness journey!</p>
                <button className="workout-empty-btn" onClick={() => setActiveTab("log")}>Log First Workout</button>
              </div>
            ) : (
              <div className="workout-history-list">
                {workouts.map(w => (
                  <div key={w._id} className="workout-history-item">
                    <div className="workout-history-icon">
                      {WORKOUT_TYPES.find(t => t.name === w.workoutType)?.icon || "🏋️"}
                    </div>
                    <div className="workout-history-info">
                      <div className="workout-history-name">{w.workoutType}</div>
                      <div className="workout-history-meta">
                        <span>⏱ {w.duration} min</span>
                        <span>🔥 {w.caloriesBurned} kcal</span>
                        <span
                          className="workout-history-intensity"
                          style={{ color: getIntensityColor(w.intensity) }}
                        >
                          ● {w.intensity}
                        </span>
                      </div>
                      {w.notes && <div className="workout-history-notes">"{w.notes}"</div>}
                    </div>
                    <div className="workout-history-right">
                      <span className="workout-history-date">{formatDate(w.date)}</span>
                      <button
                        className="workout-delete-btn"
                        onClick={() => handleDelete(w._id)}
                        title="Delete"
                      >🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== SUMMARY TAB ===== */}
        {activeTab === "summary" && summary && (
          <div className="workout-summary">
            {/* Stats Row */}
            <div className="workout-stats-grid">
              <div className="workout-stat-card">
                <span className="workout-stat-icon">🏋️</span>
                <span className="workout-stat-value">{summary.totalWorkouts}</span>
                <span className="workout-stat-label">Workouts</span>
              </div>
              <div className="workout-stat-card">
                <span className="workout-stat-icon">⏱</span>
                <span className="workout-stat-value">{summary.totalDuration}</span>
                <span className="workout-stat-label">Minutes</span>
              </div>
              <div className="workout-stat-card">
                <span className="workout-stat-icon">🔥</span>
                <span className="workout-stat-value">{summary.totalCalories}</span>
                <span className="workout-stat-label">Calories</span>
              </div>
              <div className="workout-stat-card accent">
                <span className="workout-stat-icon">🔥</span>
                <span className="workout-stat-value">{summary.streak}</span>
                <span className="workout-stat-label">Day Streak</span>
              </div>
            </div>

            {/* Daily Breakdown */}
            {summary.dailyBreakdown?.length > 0 && (
              <div className="workout-card">
                <h3 className="workout-card-title">📅 This Week</h3>
                <div className="workout-daily-list">
                  {summary.dailyBreakdown.map((day, i) => (
                    <div key={i} className="workout-daily-item">
                      <div className="workout-daily-date">
                        {new Date(day.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                      </div>
                      <div className="workout-daily-bar-wrap">
                        <div
                          className="workout-daily-bar"
                          style={{ width: `${Math.min((day.duration / 90) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="workout-daily-stats">
                        <span>⏱ {day.duration}m</span>
                        <span>🔥 {day.calories}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Workout Types */}
            {summary.workoutTypes && Object.keys(summary.workoutTypes).length > 0 && (
              <div className="workout-card">
                <h3 className="workout-card-title">🏆 Favourite Workouts</h3>
                <div className="workout-type-stats">
                  {Object.entries(summary.workoutTypes)
                    .sort((a, b) => b[1] - a[1])
                    .map(([type, count]) => (
                      <div key={type} className="workout-type-stat-item">
                        <span>{WORKOUT_TYPES.find(t => t.name === type)?.icon || "🏋️"} {type}</span>
                        <div className="workout-type-stat-bar-wrap">
                          <div
                            className="workout-type-stat-bar"
                            style={{ width: `${(count / summary.totalWorkouts) * 100}%` }}
                          />
                        </div>
                        <span className="workout-type-stat-count">{count}x</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {summary.totalWorkouts === 0 && (
              <div className="workout-empty">
                <span className="workout-empty-icon">📊</span>
                <p>No workouts this week. Start logging to see your summary!</p>
              </div>
            )}
          </div>
        )}

        {/* ===== AI SUGGESTIONS TAB ===== */}
        {activeTab === "suggestions" && (
          <div>
            {/* Config Form */}
            {!suggestions && (
              <div className="workout-card">
                <h3 className="workout-card-title">🤖 Get AI Workout Plan</h3>
                <p className="workout-card-subtitle">Tell us about yourself and get a personalized 7-day workout plan</p>

                <div className="workout-suggest-form">
                  <div className="workout-field">
                    <label>Fitness Level</label>
                    <div className="workout-intensity-group">
                      {["Beginner", "Intermediate", "Advanced"].map(level => (
                        <button
                          key={level}
                          type="button"
                          className={`workout-intensity-btn ${suggestForm.fitnessLevel === level ? "active" : ""}`}
                          onClick={() => setSuggestForm(prev => ({ ...prev, fitnessLevel: level }))}
                        >
                          {level === "Beginner" ? "🌱" : level === "Intermediate" ? "💪" : "🔥"} {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="workout-field">
                    <label>Available Time per Day: <strong>{suggestForm.availableTime} minutes</strong></label>
                    <input
                      type="range"
                      min="15" max="120" step="15"
                      value={suggestForm.availableTime}
                      onChange={e => setSuggestForm(prev => ({ ...prev, availableTime: parseInt(e.target.value) }))}
                      className="workout-range"
                    />
                    <div className="workout-range-labels">
                      <span>15 min</span><span>60 min</span><span>120 min</span>
                    </div>
                  </div>

                  <div className="workout-field">
                    <label>Medical Conditions (optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Knee pain, Back issues, Diabetes"
                      value={suggestForm.diseases}
                      onChange={e => setSuggestForm(prev => ({ ...prev, diseases: e.target.value }))}
                    />
                  </div>

                  <button
                    className="workout-submit-btn"
                    onClick={handleGetSuggestions}
                    disabled={suggestLoading}
                  >
                    {suggestLoading ? <><span className="spinner"></span> Generating Plan...</> : "🤖 Generate My Plan"}
                  </button>
                </div>
              </div>
            )}

            {/* AI Plan Display */}
            {suggestions && (
              <div className="workout-suggestions">
                {/* Weekly Goals */}
                {suggestions.weeklyGoals && (
                  <div className="workout-stats-grid">
                    <div className="workout-stat-card">
                      <span className="workout-stat-icon">🎯</span>
                      <span className="workout-stat-value">{suggestions.weeklyGoals.totalWorkouts}</span>
                      <span className="workout-stat-label">Workouts/Week</span>
                    </div>
                    <div className="workout-stat-card">
                      <span className="workout-stat-icon">⏱</span>
                      <span className="workout-stat-value">{suggestions.weeklyGoals.totalDuration}</span>
                      <span className="workout-stat-label">Min/Week</span>
                    </div>
                    <div className="workout-stat-card accent">
                      <span className="workout-stat-icon">🔥</span>
                      <span className="workout-stat-value">{suggestions.weeklyGoals.totalCalories}</span>
                      <span className="workout-stat-label">Cal/Week</span>
                    </div>
                  </div>
                )}

                {/* 7-Day Plan */}
                <div className="workout-card">
                  <h3 className="workout-card-title">📅 Your 7-Day Plan</h3>
                  <div className="workout-week-plan">
                    {suggestions.weeklyPlan?.map((day, i) => (
                      <div key={i} className={`workout-day-card ${day.isRestDay ? "rest-day" : ""}`}>
                        <div className="workout-day-header">
                          <span className="workout-day-name">{day.day}</span>
                          {day.isRestDay && <span className="workout-rest-badge">Rest</span>}
                          {!day.isRestDay && (
                            <span className="workout-day-stats">
                              ⏱ {day.totalDuration}m · 🔥 {day.totalCalories}
                            </span>
                          )}
                        </div>
                        <div className="workout-day-exercises">
                          {day.workouts?.map((ex, j) => (
                            <div key={j} className="workout-exercise-item">
                              <div className="workout-exercise-name">
                                {WORKOUT_TYPES.find(t => t.name === ex.name)?.icon || "🏋️"} {ex.name}
                              </div>
                              <div className="workout-exercise-meta">
                                <span>⏱ {ex.duration}m</span>
                                <span>🔥 {ex.caloriesBurned}</span>
                                <span
                                  className="workout-exercise-intensity"
                                  style={{ color: getIntensityColor(ex.intensity) }}
                                >● {ex.intensity}</span>
                              </div>
                              {ex.description && (
                                <div className="workout-exercise-desc">{ex.description}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Warmup & Cooldown */}
                {(suggestions.warmupRoutine || suggestions.cooldownRoutine) && (
                  <div className="workout-routines-grid">
                    {suggestions.warmupRoutine && (
                      <div className="workout-routine-card warmup">
                        <h4>🌅 Warmup Routine</h4>
                        <p>{suggestions.warmupRoutine}</p>
                      </div>
                    )}
                    {suggestions.cooldownRoutine && (
                      <div className="workout-routine-card cooldown">
                        <h4>🌙 Cooldown Routine</h4>
                        <p>{suggestions.cooldownRoutine}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Tips */}
                {suggestions.tips?.length > 0 && (
                  <div className="workout-card">
                    <h3 className="workout-card-title">💡 Pro Tips</h3>
                    <div className="workout-tips-list">
                      {suggestions.tips.map((tip, i) => (
                        <div key={i} className="workout-tip-item">
                          <span className="workout-tip-num">{i + 1}</span>
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  className="workout-regenerate-btn"
                  onClick={() => setSuggestions(null)}
                >🔄 Generate New Plan</button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Workout;
