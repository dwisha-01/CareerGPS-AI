import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiAward,
  FiBookOpen,
  FiCheck,
  FiBriefcase,
  FiAlertCircle,
  FiLoader,
  FiActivity,
} from "react-icons/fi";
import { updateAnalysisProgress } from "../services/analysisService";

export default function Analysis() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("analysis");
    if (stored) {
      try {
        setAnalysis(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse analysis from localStorage", e);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050816] text-slate-300 flex flex-col items-center justify-center gap-4">
        <FiLoader className="text-4xl text-purple-500 animate-spin" />
        <p className="text-sm font-medium text-slate-400">Loading your AI career blueprint...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-[#050816] text-slate-300 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-950 border border-white/5 flex items-center justify-center mb-6 shadow-xl text-slate-500">
          <FiAlertCircle className="text-3xl" />
        </div>
        <h2 className="text-white text-2xl font-bold mb-2">No Active Analysis Found</h2>
        <p className="text-slate-400 text-sm max-w-sm mb-8">
          Please complete a career assessment or upload your resume first to view this page.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-lg shadow-purple-500/20 cursor-pointer flex items-center gap-2"
        >
          <FiArrowLeft />
          Go to Dashboard
        </button>
      </div>
    );
  }

  // Schema parsing
  const score = analysis.readinessScore !== undefined ? analysis.readinessScore : (analysis.roleMatch || 0);
  const targetRole = analysis.targetRole || "Target Career";
  const targetCompany = analysis.targetCompany && analysis.targetCompany !== "N/A" ? analysis.targetCompany : "";
  const gaps = analysis.skillGaps || [];
  const roadmap = analysis.roadmap || [];
  const projects = analysis.projects || [];
  const completedActivities = analysis.completedActivities || [];

  // Calculate totals and checklist statistics
  const totalActivities = roadmap.reduce((sum, step) => sum + (step.activities?.length || 0), 0);
  const completedCount = completedActivities.length;
  const progressPercent = totalActivities > 0 ? Math.round((completedCount / totalActivities) * 100) : 0;

  // Toggle checklist function
  const handleToggleActivity = async (activityName) => {
    let updated;
    if (completedActivities.includes(activityName)) {
      updated = completedActivities.filter((act) => act !== activityName);
    } else {
      updated = [...completedActivities, activityName];
    }

    const updatedAnalysis = { ...analysis, completedActivities: updated };
    setAnalysis(updatedAnalysis);
    localStorage.setItem("analysis", JSON.stringify(updatedAnalysis));

    // Async sync with database
    try {
      setUpdating(true);
      await updateAnalysisProgress(analysis._id, updated);
      // Dispatch storage/custom event so other components (e.g. Dashboard) stay synced
      window.dispatchEvent(new Event("analysisUpdated"));
    } catch (err) {
      console.error("Failed to save activity progress to backend:", err);
    } finally {
      setUpdating(false);
    }
  };

  // Readiness Score circle parameters
  const radius = 45;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="min-h-screen bg-[#050816] text-slate-300 p-6 md:p-10 font-sans">
      {/* Background Blobs */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Outer wrapper max width */}
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* Navigation & Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
          <div>
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-wider mb-3 cursor-pointer group"
            >
              <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </button>
            <h1 className="text-white text-3xl font-extrabold tracking-tight">
              AI Career Blueprint
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Customized strategy for <span className="text-purple-400 font-semibold">{targetRole}</span>
              {targetCompany && <> at <span className="text-cyan-400 font-semibold">{targetCompany}</span></>}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {updating && (
              <span className="text-slate-500 text-[10px] uppercase font-bold flex items-center gap-1.5 animate-pulse">
                <FiLoader className="animate-spin text-xs" /> Saving...
              </span>
            )}
            <span className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-500/10 border border-purple-500/20 text-purple-400">
              Active Assessment
            </span>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* LEFT PANEL: Readiness, Gaps & Projects */}
          <div className="space-y-8 lg:col-span-1">
            
            {/* Readiness Circle Widget */}
            <div className="glass-panel rounded-3xl p-6 text-center flex flex-col items-center">
              <span className="text-[10px] text-purple-400 uppercase tracking-widest font-bold mb-4">Readiness Level</span>
              
              <div className="relative w-36 h-36 flex items-center justify-center mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    className="stroke-slate-950 fill-transparent"
                    strokeWidth={strokeWidth}
                  />
                  <motion.circle
                    cx="72"
                    cy="72"
                    r={radius}
                    className="stroke-purple-500 fill-transparent"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    strokeLinecap="round"
                    style={{
                      stroke: "url(#readinessGradient)"
                    }}
                  />
                  <defs>
                    <linearGradient id="readinessGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-extrabold text-white">{score}%</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">ATS Score</span>
                </div>
              </div>

              <p className="text-slate-400 text-xs px-2 leading-relaxed">
                Your profile skills and credentials are {score}% aligned to standards for a {targetRole} candidate.
              </p>
            </div>

            {/* Target Skill Gaps */}
            <div className="glass-panel rounded-3xl p-6">
              <h3 className="text-white text-sm font-extrabold flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
                <FiAward className="text-pink-400 text-base" />
                Target Skill Gaps
              </h3>
              {gaps.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {gaps.map((gap, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/20 shadow-sm"
                    >
                      {gap}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic py-2">No specific skill gaps found. You have excellent alignment!</p>
              )}
            </div>

            {/* Suggested Projects */}
            <div className="glass-panel rounded-3xl p-6 space-y-4">
              <div>
                <h3 className="text-white text-sm font-extrabold flex items-center gap-2 border-b border-white/5 pb-2">
                  <FiBookOpen className="text-cyan-400 text-base" />
                  Recommended Projects
                </h3>
                <p className="text-slate-500 text-[10px] mt-1 leading-relaxed">
                  Implement these tailored project ideas to showcase key skills on your resume and close skill gaps.
                </p>
              </div>

              {projects.length > 0 ? (
                <div className="space-y-4">
                  {projects.map((project, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-950/40 border border-white/5 hover:border-purple-500/30 transition-all duration-300 group"
                    >
                      <h4 className="text-white text-xs font-extrabold mb-1.5 flex items-center gap-1.5">
                        <FiBriefcase className="text-purple-400 text-xs shrink-0" />
                        {project.name}
                      </h4>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        {project.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No project recommendations available.</p>
              )}
            </div>

          </div>

          {/* RIGHT PANEL: Interactive Roadmap Timeline */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Progress status card */}
            <div className="glass-panel rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-white text-base font-extrabold flex items-center gap-2">
                  <FiActivity className="text-purple-400" />
                  Preparation Progress
                </h3>
                <p className="text-slate-400 text-xs mt-1">
                  Track and tick off your milestone activities to prepare for interviews.
                </p>
              </div>

              <div className="w-full md:w-64 space-y-1.5 shrink-0">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-semibold uppercase tracking-wider">Completed</span>
                  <span className="text-white font-bold">{completedCount} / {totalActivities} ({progressPercent}%)</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full rounded-full"
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </div>

            {/* Roadmap Steps */}
            <div className="space-y-6">
              {roadmap.length > 0 ? (
                roadmap.map((step, stepIdx) => (
                  <div key={stepIdx} className="relative pl-8 border-l border-white/5 last:border-l-0 pb-6 group">
                    {/* Circle icon marker */}
                    <div className="absolute -left-[13px] top-0.5 w-6 h-6 rounded-full bg-[#050816] border-2 border-purple-500 flex items-center justify-center text-purple-400 text-[10px] font-bold shadow-lg shadow-purple-500/10 group-hover:border-cyan-400 group-hover:text-cyan-400 transition-colors">
                      {stepIdx + 1}
                    </div>

                    <div className="glass-panel rounded-3xl p-6 group-hover:border-purple-500/20 transition-all duration-300">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3 mb-4">
                        <div>
                          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">{step.period || `Milestone ${stepIdx + 1}`}</span>
                          <h4 className="text-white text-base font-bold mt-0.5">{step.focus || "Skill Focus"}</h4>
                        </div>
                      </div>

                      {/* Activities Checklist */}
                      <div className="space-y-2.5">
                        {step.activities && step.activities.length > 0 ? (
                          step.activities.map((activity, actIdx) => {
                            const isCompleted = completedActivities.includes(activity);
                            return (
                              <div
                                key={actIdx}
                                onClick={() => handleToggleActivity(activity)}
                                className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer border transition-all duration-200 select-none ${
                                  isCompleted
                                    ? "bg-purple-950/10 border-purple-500/20 text-slate-400"
                                    : "bg-slate-950/20 border-white/5 hover:border-white/10 hover:bg-slate-950/40 text-slate-300"
                                }`}
                              >
                                <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                                  isCompleted
                                    ? "bg-purple-500 border-purple-400 text-white"
                                    : "border-slate-700 bg-slate-900 group-hover:border-slate-500"
                                }`}>
                                  {isCompleted && <FiCheck className="text-xs stroke-[4]" />}
                                </div>
                                <span className={`text-xs leading-relaxed font-medium ${isCompleted ? "line-through text-slate-500" : ""}`}>
                                  {activity}
                                </span>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-xs text-slate-500 italic">No checklist activities defined for this step.</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="glass-panel rounded-3xl p-8 text-center text-slate-500 italic text-xs">
                  No preparation roadmap steps generated.
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Footer */}
        <footer className="pt-12 text-center text-slate-600 text-[10px] uppercase tracking-widest font-bold">
          Powered by CareerGPS AI • Gemini - 2.5 - Flash Insights
        </footer>

      </div>
    </div>
  );
}