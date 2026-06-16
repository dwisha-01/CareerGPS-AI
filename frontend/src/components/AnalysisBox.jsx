import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiAward, FiAlertCircle, FiArrowRight, FiBookOpen } from "react-icons/fi";

export default function AnalysisBox({ onNavigateToAnalysis }) {
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    const fetchLatest = () => {
      const stored = localStorage.getItem("analysis");
      if (stored) {
        try {
          setAnalysis(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse analysis", e);
        }
      }
    };
    fetchLatest();

    // Listen for custom event if analysis is updated elsewhere
    window.addEventListener("analysisUpdated", fetchLatest);
    return () => window.removeEventListener("analysisUpdated", fetchLatest);
  }, []);

  if (!analysis) {
    return (
      <div className="glass-panel rounded-2xl p-6 text-center py-10">
        <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center mx-auto mb-4 border border-white/5">
          <FiAlertCircle className="text-xl text-slate-500" />
        </div>
        <h3 className="text-white font-semibold text-base mb-1">No AI Analysis Found</h3>
        <p className="text-slate-400 text-xs max-w-xs mx-auto mb-6">
          Generate a tailored roadmap with skill gaps and projects by starting a career assessment.
        </p>
        <button
          onClick={() => onNavigateToAnalysis && onNavigateToAnalysis()}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-lg shadow-purple-500/20 cursor-pointer"
        >
          Start Assessment
        </button>
      </div>
    );
  }

  // Handle schema fallbacks:
  // readinessScore vs roleMatch
  const score = analysis.readinessScore !== undefined ? analysis.readinessScore : (analysis.roleMatch || 0);
  const targetRole = analysis.targetRole || "Target Career";
  const gaps = analysis.skillGaps || [];
  const projectsCount = analysis.projects?.length || 0;

  // Circle circumference for gauge
  const radius = 30;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-5 mb-5">
        <div>
          <span className="text-[10px] text-purple-400 uppercase tracking-wider font-bold">Latest Assessment</span>
          <h2 className="text-white text-xl font-bold tracking-tight mt-0.5">{targetRole}</h2>
        </div>

        {/* Circular Progress Gauge */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="32"
                cy="32"
                r={radius}
                className="stroke-slate-900 fill-transparent"
                strokeWidth={strokeWidth}
              />
              {/* Highlight circle */}
              <motion.circle
                cx="32"
                cy="32"
                r={radius}
                className="stroke-purple-500 fill-transparent"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-sm font-bold text-white">{score}%</span>
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Readiness Score</div>
            <div className="text-[10px] text-slate-500">Based on profile match</div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Skill Gaps */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <FiAward className="text-cyan-400" />
            <span>Target Skill Gaps ({gaps.length})</span>
          </div>
          {gaps.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {gaps.slice(0, 6).map((gap, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-red-500/10 text-red-300 border border-red-500/20"
                >
                  {gap}
                </span>
              ))}
              {gaps.length > 6 && (
                <span className="px-2 py-0.5 text-[10px] font-medium text-slate-500">
                  +{gaps.length - 6} more
                </span>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No skill gaps identified! You are fully aligned.</p>
          )}
        </div>

        {/* Recommendations */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <FiBookOpen className="text-purple-400" />
            <span>AI Project Recommendations</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {projectsCount > 0
              ? `We suggested ${projectsCount} hands-on projects tailored to build your missing skills and boost ATS match.`
              : "Review suggested milestones and courses to level up your resume."}
          </p>
        </div>
      </div>

      {/* Action button */}
      <button
        onClick={() => onNavigateToAnalysis && onNavigateToAnalysis()}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/5 hover:border-purple-500/30 text-white font-semibold text-xs transition-all cursor-pointer group"
      >
        <span>View Detailed Interactive Roadmap</span>
        <FiArrowRight className="text-slate-400 group-hover:text-purple-400 transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  );
}