import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiLayout,
  FiUser,
  FiCompass,
  FiClock,
  FiPlus,
  FiX,
  FiCheck,
  FiChevronRight,
  FiBookOpen,
  FiActivity,
  FiBriefcase,
  FiAlertCircle,
  FiLoader,
  FiMapPin,
  FiFileText,
  FiEdit3,
  FiCheckCircle,
} from "react-icons/fi";

import Sidebar from "../components/Sidebar";
import Card from "../components/Card";
import AnalysisBox from "../components/AnalysisBox";
import { getProfile, updateProfile } from "../services/authService";
import { generateAnalysis, getAnalysisHistory, analyzeResumeFile, rewriteResumeBullet } from "../services/analysisService";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    college: "",
    year: "",
    branch: "",
    skills: [],
    interests: [],
  });

  // Skills & Interests tag editors temp inputs
  const [skillInput, setSkillInput] = useState("");
  const [interestInput, setInterestInput] = useState("");

  // Assessment inputs
  const [targetRole, setTargetRole] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [assessing, setAssessing] = useState(false);
  const [assessmentError, setAssessmentError] = useState("");

  // Resume analysis inputs & states
  const [resumeFile, setResumeFile] = useState(null);
  const [analyzingResume, setAnalyzingResume] = useState(false);
  const [resumeError, setResumeError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  // Wording sandbox states
  const [bulletPoint, setBulletPoint] = useState("");
  const [optimizedBullets, setOptimizedBullets] = useState([]);
  const [optimizingBullet, setOptimizingBullet] = useState(false);
  const [bulletError, setBulletError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Profile save status
  const [saveSuccess, setSaveSuccess] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  // History list
  const [history, setHistory] = useState([]);
  const [selectedHistoricalAnalysis, setSelectedHistoricalAnalysis] = useState(null);

  const navigate = useNavigate();

  // Load profile and history
  const loadData = async () => {
    try {
      setLoading(true);
      const profileData = await getProfile();
      if (profileData && profileData.user) {
        setProfile({
          username: profileData.user.username || "",
          email: profileData.user.email || "",
          college: profileData.user.college || "",
          year: profileData.user.year || "",
          branch: profileData.user.branch || "",
          skills: profileData.user.skills || [],
          interests: profileData.user.interests || [],
        });
      }

      // Fetch history
      const historyData = await getAnalysisHistory();
      setHistory(historyData || []);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
      // If unauthorized, go back to login
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("analysis");
    navigate("/");
  };

  // Calculate completion score
  const calculateCompletion = () => {
    let score = 20; // 20% for having account (username/email)
    if (profile.college) score += 15;
    if (profile.branch) score += 15;
    if (profile.year) score += 10;
    if (profile.skills && profile.skills.length > 0) score += 20;
    if (profile.interests && profile.interests.length > 0) score += 20;
    return score;
  };

  const profileCompletion = calculateCompletion();

  // Save profile edits
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveSuccess("");
    setSaveError("");
    setSaving(true);

    try {
      const res = await updateProfile({
        college: profile.college,
        year: profile.year,
        branch: profile.branch,
        skills: profile.skills,
        interests: profile.interests,
      });

      if (res && res.user) {
        setProfile((prev) => ({
          ...prev,
          college: res.user.college || "",
          year: res.user.year || "",
          branch: res.user.branch || "",
          skills: res.user.skills || [],
          interests: res.user.interests || [],
        }));
      }

      setSaveSuccess("Profile updated successfully!");
      setTimeout(() => setSaveSuccess(""), 3000);
    } catch (err) {
      setSaveError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Tag editors key handlers
  const handleAddSkill = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      e.preventDefault();
      const trimmed = skillInput.trim();
      if (trimmed && !profile.skills.includes(trimmed)) {
        setProfile((prev) => ({
          ...prev,
          skills: [...prev.skills, trimmed],
        }));
        setSkillInput("");
      }
    }
  };

  const handleRemoveSkill = (skill) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const handleAddInterest = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      e.preventDefault();
      const trimmed = interestInput.trim();
      if (trimmed && !profile.interests.includes(trimmed)) {
        setProfile((prev) => ({
          ...prev,
          interests: [...prev.interests, trimmed],
        }));
        setInterestInput("");
      }
    }
  };

  const handleRemoveInterest = (interest) => {
    setProfile((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== interest),
    }));
  };

  // Run AI Career Assessment
  const handleAssessment = async (e) => {
    e.preventDefault();
    if (!targetRole.trim()) return;

    setAssessmentError("");
    setAssessing(true);

    try {
      const res = await generateAnalysis(targetRole.trim());
      if (res && res.analysis) {
        localStorage.setItem("analysis", JSON.stringify(res.analysis));
        
        // Dispatch custom event to notify AnalysisBox
        window.dispatchEvent(new Event("analysisUpdated"));

        // Refresh history list
        const historyData = await getAnalysisHistory();
        setHistory(historyData || []);

        // Move to Overview to display the newly generated analysis
        setActiveTab("overview");
        setTargetRole("");
      }
    } catch (err) {
      setAssessmentError(
        err.response?.data?.message ||
        "Assessment generation failed. Make sure your profile has skills filled out!"
      );
    } finally {
      setAssessing(false);
    }
  };

  // Run AI Resume Review
  const handleResumeAssessment = async (e) => {
    e.preventDefault();
    if (!resumeFile || !targetRole.trim()) return;

    setResumeError("");
    setAnalyzingResume(true);

    try {
      const res = await analyzeResumeFile(resumeFile, targetRole.trim(), targetCompany.trim());
      if (res && res.analysis) {
        localStorage.setItem("analysis", JSON.stringify(res.analysis));
        
        // Dispatch custom event to notify AnalysisBox
        window.dispatchEvent(new Event("analysisUpdated"));

        // Refresh history list
        const historyData = await getAnalysisHistory();
        setHistory(historyData || []);

        // Clear forms & Navigate to visual roadmap details view
        setResumeFile(null);
        setTargetRole("");
        setTargetCompany("");
        navigate("/analysis");
      }
    } catch (err) {
      setResumeError(
        err.response?.data?.message ||
        "Resume audit failed. Make sure your file is a readable PDF or TXT!"
      );
    } finally {
      setAnalyzingResume(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf" || file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".pdf")) {
        setResumeFile(file);
      } else {
        setResumeError("Only PDF and TXT files are supported!");
      }
    }
  };

  // Run AI Bullet Wording Optimization
  const handleRewriteBullet = async (e) => {
    e.preventDefault();
    if (!bulletPoint.trim()) return;

    setBulletError("");
    setOptimizedBullets([]);
    setOptimizingBullet(true);

    try {
      // Use profile target role if targetRole input is empty
      const role = targetRole.trim() || profile.branch || "Software Engineer";
      const res = await rewriteResumeBullet(bulletPoint.trim(), role, targetCompany.trim());
      
      if (res && res.variations) {
        setOptimizedBullets(res.variations);
      }
    } catch (err) {
      setBulletError(
        err.response?.data?.message ||
        "Failed to optimize wording. Please try again later."
      );
    } finally {
      setOptimizingBullet(false);
    }
  };

  // Clipboard copy handler
  const handleCopyBullet = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  // Load historical analysis as active
  const handleSelectHistory = (item) => {
    setSelectedHistoricalAnalysis(item);
    localStorage.setItem("analysis", JSON.stringify(item));
    window.dispatchEvent(new Event("analysisUpdated"));
    setActiveTab("overview");
  };

  return (
    <div className="flex min-h-screen bg-[#050816] text-slate-300">
      {/* Sidebar Component */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        username={profile.username}
        profileCompletion={profileCompletion}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen p-6 md:p-10 overflow-y-auto max-w-5xl mx-auto w-full">
        {/* Top Header */}
        <header className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-white text-3xl font-extrabold tracking-tight">
              Hello, <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">{profile.username || "Explorer"}</span>
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Today is {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="flex gap-2">
            <span className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              AI Online
            </span>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <FiLoader className="text-4xl text-purple-500 animate-spin" />
            <p className="text-sm text-slate-400">Loading your profile dashboard...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Stats grid */}
                <div className="grid md:grid-cols-3 gap-6">
                  <Card title="Quick Actions" className="md:col-span-2">
                    <p className="text-slate-400 text-xs mb-5">
                      Boost your AI accuracy by detailing your profile, running role audits, or uploading resume blueprints.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <button
                        onClick={() => setActiveTab("profile")}
                        className="p-4 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-white/5 hover:border-purple-500/40 text-left transition-all group cursor-pointer"
                      >
                        <FiUser className="text-purple-400 text-lg mb-2" />
                        <div className="text-white text-xs font-bold flex items-center gap-1">
                          Edit Profile <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </button>

                      <button
                        onClick={() => setActiveTab("assessment")}
                        className="p-4 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-white/5 hover:border-cyan-500/40 text-left transition-all group cursor-pointer"
                      >
                        <FiCompass className="text-cyan-400 text-lg mb-2" />
                        <div className="text-white text-xs font-bold flex items-center gap-1">
                          AI Roadmap <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </button>

                      <button
                        onClick={() => setActiveTab("resume")}
                        className="p-4 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-white/5 hover:border-pink-500/40 text-left transition-all group cursor-pointer"
                      >
                        <FiFileText className="text-pink-400 text-lg mb-2" />
                        <div className="text-white text-xs font-bold flex items-center gap-1">
                          Resume Audit <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </button>

                      <button
                        onClick={() => setActiveTab("editor")}
                        className="p-4 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-white/5 hover:border-amber-500/40 text-left transition-all group cursor-pointer"
                      >
                        <FiEdit3 className="text-amber-400 text-lg mb-2" />
                        <div className="text-white text-xs font-bold flex items-center gap-1">
                          Bullet Optimizer <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </button>
                    </div>
                  </Card>

                  <Card title="Profile State" className="flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">Completion Score</span>
                        <span className="text-base font-bold text-white">{profileCompletion}%</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full rounded-full transition-all duration-1000"
                          style={{ width: `${profileCompletion}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Complete your college, branch, skills, and interests to enable Gemini to find highly aligned roadmaps.
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Analysis Box Widget */}
                <div>
                  <AnalysisBox onNavigateToAnalysis={() => setActiveTab("assessment")} />
                </div>
              </motion.div>
            )}

            {/* PROFILE & SKILLS TAB */}
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <Card title="Edit Career Profile">
                  {saveSuccess && (
                    <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3 text-green-300 text-xs font-medium">
                      <FiCheck className="text-lg shrink-0" />
                      <span>{saveSuccess}</span>
                    </div>
                  )}

                  {saveError && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-300 text-xs font-medium">
                      <FiAlertCircle className="text-lg shrink-0" />
                      <span>{saveError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    {/* Basic info grid */}
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">College Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Stanford University"
                          value={profile.college}
                          onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                          className="w-full bg-slate-900/60 border border-white/5 focus:border-purple-500/60 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-xs outline-none transition-all font-medium"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Branch / Major</label>
                        <input
                          type="text"
                          placeholder="e.g. Computer Science"
                          value={profile.branch}
                          onChange={(e) => setProfile({ ...profile, branch: e.target.value })}
                          className="w-full bg-slate-900/60 border border-white/5 focus:border-purple-500/60 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-xs outline-none transition-all font-medium"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Year of Study</label>
                        <select
                          value={profile.year}
                          onChange={(e) => setProfile({ ...profile, year: e.target.value })}
                          className="w-full bg-slate-900/60 border border-white/5 focus:border-purple-500/60 rounded-xl px-4 py-3 text-white text-xs outline-none transition-all font-medium cursor-pointer"
                        >
                          <option value="">Select Year</option>
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
                          <option value="Graduated">Graduated</option>
                        </select>
                      </div>
                    </div>

                    {/* Skill tag editor */}
                    <div className="space-y-3">
                      <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">My Skills</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add skill (e.g. React, Node.js)"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={handleAddSkill}
                          className="flex-1 bg-slate-900/60 border border-white/5 focus:border-purple-500/60 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-xs outline-none transition-all font-medium"
                        />
                        <button
                          type="button"
                          onClick={handleAddSkill}
                          className="px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center transition-all cursor-pointer"
                        >
                          <FiPlus className="text-base" />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {profile.skills.length > 0 ? (
                          profile.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1.5 text-xs font-medium rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1.5"
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => handleRemoveSkill(skill)}
                                className="text-purple-400 hover:text-red-400 transition-colors"
                              >
                                <FiX />
                              </button>
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500 italic">No skills added yet. Add skills to get accurate ATS feedback!</span>
                        )}
                      </div>
                    </div>

                    {/* Interest tag editor */}
                    <div className="space-y-3">
                      <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Areas of Interest</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add interest (e.g. Web3, ML/AI, UX Design)"
                          value={interestInput}
                          onChange={(e) => setInterestInput(e.target.value)}
                          onKeyDown={handleAddInterest}
                          className="flex-1 bg-slate-900/60 border border-white/5 focus:border-purple-500/60 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-xs outline-none transition-all font-medium"
                        />
                        <button
                          type="button"
                          onClick={handleAddInterest}
                          className="px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center transition-all cursor-pointer"
                        >
                          <FiPlus className="text-base" />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {profile.interests.length > 0 ? (
                          profile.interests.map((interest, index) => (
                            <span
                              key={index}
                              className="px-3 py-1.5 text-xs font-medium rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center gap-1.5"
                            >
                              {interest}
                              <button
                                type="button"
                                onClick={() => handleRemoveInterest(interest)}
                                className="text-cyan-400 hover:text-red-400 transition-colors"
                              >
                                <FiX />
                              </button>
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500 italic">No interests added yet.</span>
                        )}
                      </div>
                    </div>

                    {/* Save Button */}
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
                    >
                      {saving ? (
                        <>
                          <FiLoader className="animate-spin text-base" />
                          <span>Saving Profile...</span>
                        </>
                      ) : (
                        <span>Save Profile & Update Completion</span>
                      )}
                    </button>
                  </form>
                </Card>
              </motion.div>
            )}

            {/* AI ASSESSMENT TAB */}
            {activeTab === "assessment" && (
              <motion.div
                key="assessment"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <Card title="Start AI Career Assessment">
                  <p className="text-slate-400 text-xs mb-6">
                    Enter your desired career role below. Our AI will analyze your college, branch, study year, and your registered skills to construct a detailed roadmap, identify missing skills, and suggest targeted projects.
                  </p>

                  {assessmentError && (
                    <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-300 text-xs font-medium">
                      <FiAlertCircle className="text-lg shrink-0 mt-0.5" />
                      <span>{assessmentError}</span>
                    </div>
                  )}

                  <form onSubmit={handleAssessment} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Target Career Role</label>
                      <input
                        type="text"
                        placeholder="e.g. Backend Developer, Machine Learning Engineer, Product Designer"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        required
                        disabled={assessing}
                        className="w-full bg-slate-900/60 border border-white/5 focus:border-purple-500/60 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 text-xs outline-none transition-all font-medium"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={assessing}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:shadow-lg hover:shadow-purple-500/20 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      {assessing ? (
                        <>
                          <FiLoader className="animate-spin text-base" />
                          <span>Gemini AI is generating your detailed roadmap...</span>
                        </>
                      ) : (
                        <>
                          <FiCompass className="text-base" />
                          <span>Generate Career Blueprint</span>
                        </>
                      )}
                    </button>
                  </form>
                </Card>

                {assessing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="h-16 bg-slate-950/40 animate-pulse rounded-xl border border-white/5"></div>
                    <div className="h-32 bg-slate-950/40 animate-pulse rounded-xl border border-white/5"></div>
                    <div className="h-20 bg-slate-950/40 animate-pulse rounded-xl border border-white/5"></div>
                  </motion.div>
                )}

                {!assessing && (
                  <div className="text-center py-6">
                    <button
                      onClick={() => navigate("/analysis")}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold text-xs underline underline-offset-4 decoration-cyan-400/30 cursor-pointer"
                    >
                      View Fullscreen Analysis View
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* RESUME ANALYSIS TAB */}
            {activeTab === "resume" && (
              <motion.div
                key="resume"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <Card title="AI Resume Reviewer & Optimizer">
                  <p className="text-slate-400 text-xs mb-6">
                    Upload your resume file and input your target career details. Gemini AI will match your resume content, profile tags, and target company parameters to extract alignment gaps, roadmap milestones, and specific resume wording enhancements.
                  </p>

                  {resumeError && (
                    <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-300 text-xs font-medium">
                      <FiAlertCircle className="text-lg shrink-0 mt-0.5" />
                      <span>{resumeError}</span>
                    </div>
                  )}

                  <form onSubmit={handleResumeAssessment} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Target Career Role</label>
                        <input
                          type="text"
                          placeholder="e.g. Backend Developer, Data Scientist"
                          value={targetRole}
                          onChange={(e) => setTargetRole(e.target.value)}
                          required
                          disabled={analyzingResume}
                          className="w-full bg-slate-900/60 border border-white/5 focus:border-purple-500/60 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 text-xs outline-none transition-all font-medium"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Target Company (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. Google, Stripe, McKinsey"
                          value={targetCompany}
                          onChange={(e) => setTargetCompany(e.target.value)}
                          disabled={analyzingResume}
                          className="w-full bg-slate-900/60 border border-white/5 focus:border-purple-500/60 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 text-xs outline-none transition-all font-medium"
                        />
                      </div>
                    </div>

                    {/* Drag and Drop Zone */}
                    <div className="space-y-2">
                      <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Upload Resume (PDF or TXT)</label>
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 min-h-[180px] ${
                          dragOver
                            ? "border-purple-500 bg-purple-500/5"
                            : resumeFile
                            ? "border-green-500/40 bg-green-500/5"
                            : "border-white/5 hover:border-white/20 bg-slate-900/40"
                        }`}
                        onClick={() => !analyzingResume && document.getElementById("resume-upload").click()}
                      >
                        <input
                          type="file"
                          id="resume-upload"
                          accept=".pdf,.txt"
                          onChange={handleFileChange}
                          className="hidden"
                          disabled={analyzingResume}
                        />

                        {resumeFile ? (
                          <>
                            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
                              <FiCheck className="text-2xl" />
                            </div>
                            <div>
                              <p className="text-white text-xs font-bold truncate max-w-[280px]">{resumeFile.name}</p>
                              <p className="text-slate-500 text-[10px] mt-0.5">{(resumeFile.size / 1024).toFixed(1)} KB</p>
                            </div>
                            <span className="text-[10px] text-slate-500 underline mt-1">Change File</span>
                          </>
                        ) : (
                          <>
                            <div className="w-12 h-12 rounded-full bg-slate-950 flex items-center justify-center text-slate-500 border border-white/5">
                              <FiFileText className="text-xl" />
                            </div>
                            <div>
                              <p className="text-white text-xs font-bold">Drag & drop your resume file here</p>
                              <p className="text-slate-500 text-[10px] mt-1">Accepts PDF or TXT up to 5MB</p>
                            </div>
                            <span className="px-4 py-2 rounded-xl bg-purple-600/10 text-purple-400 border border-purple-500/20 text-xs font-bold mt-2">
                              Browse Files
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={analyzingResume || !resumeFile || !targetRole.trim()}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:shadow-lg hover:shadow-purple-500/20 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {analyzingResume ? (
                        <>
                          <FiLoader className="animate-spin text-base" />
                          <span>Gemini AI is auditing your resume matching criteria...</span>
                        </>
                      ) : (
                        <>
                          <FiCompass className="text-base" />
                          <span>Verify Alignment & Review Resume</span>
                        </>
                      )}
                    </button>
                  </form>
                </Card>

                {analyzingResume && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="h-16 bg-slate-950/40 animate-pulse rounded-xl border border-white/5"></div>
                    <div className="h-32 bg-slate-950/40 animate-pulse rounded-xl border border-white/5"></div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* AI BULLET EDITOR TAB */}
            {activeTab === "editor" && (
              <motion.div
                key="editor"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <Card title="AI Resume Wording Editor (Google XYZ Sandbox)">
                  <p className="text-slate-400 text-xs mb-6">
                    Paste a bullet point from your resume. Gemini AI will rewrite it into 3 high-impact variations using the Google XYZ formula: **"Accomplished [X] as measured by [Y], by doing [Z]"** (Action-Measure-Result).
                  </p>

                  {bulletError && (
                    <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-300 text-xs font-medium animate-fadeIn">
                      <FiAlertCircle className="text-lg shrink-0 mt-0.5" />
                      <span>{bulletError}</span>
                    </div>
                  )}

                  <form onSubmit={handleRewriteBullet} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Target Role Context</label>
                        <input
                          type="text"
                          placeholder="e.g. Software Engineer (defaults to major)"
                          value={targetRole}
                          onChange={(e) => setTargetRole(e.target.value)}
                          disabled={optimizingBullet}
                          className="w-full bg-slate-900/60 border border-white/5 focus:border-purple-500/60 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 text-xs outline-none transition-all font-medium"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Target Company Context (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. Google, Stripe"
                          value={targetCompany}
                          onChange={(e) => setTargetCompany(e.target.value)}
                          disabled={optimizingBullet}
                          className="w-full bg-slate-900/60 border border-white/5 focus:border-purple-500/60 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 text-xs outline-none transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Current Resume Bullet Point</label>
                      <textarea
                        rows="3"
                        placeholder="e.g. I was responsible for writing backend node.js code and fixing database query bugs."
                        value={bulletPoint}
                        onChange={(e) => setBulletPoint(e.target.value)}
                        required
                        disabled={optimizingBullet}
                        className="w-full bg-slate-900/60 border border-white/5 focus:border-purple-500/60 rounded-2xl px-4 py-3.5 text-white placeholder-slate-600 text-xs outline-none transition-all font-medium resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={optimizingBullet || !bulletPoint.trim()}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:shadow-lg hover:shadow-purple-500/20 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-40"
                    >
                      {optimizingBullet ? (
                        <>
                          <FiLoader className="animate-spin text-base" />
                          <span>Applying Google XYZ formula...</span>
                        </>
                      ) : (
                        <>
                          <FiEdit3 className="text-base" />
                          <span>Optimize Wording</span>
                        </>
                      )}
                    </button>
                  </form>
                </Card>

                {optimizingBullet && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-3"
                  >
                    <div className="h-12 bg-slate-950/40 animate-pulse rounded-xl border border-white/5"></div>
                    <div className="h-12 bg-slate-950/40 animate-pulse rounded-xl border border-white/5"></div>
                    <div className="h-12 bg-slate-950/40 animate-pulse rounded-xl border border-white/5"></div>
                  </motion.div>
                )}

                {/* Rewritten results */}
                {!optimizingBullet && optimizedBullets.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <h3 className="text-white text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                      <FiCheckCircle className="text-green-400" />
                      Rewritten Variations
                    </h3>
                    
                    <div className="space-y-3">
                      {optimizedBullets.map((bullet, idx) => (
                        <div
                          key={idx}
                          className="glass-panel rounded-xl p-4 flex justify-between items-center gap-4 hover:border-purple-500/30 transition-colors"
                        >
                          <div className="text-xs text-white leading-relaxed font-medium">
                            <span className="text-[10px] uppercase font-bold text-purple-400 block mb-1">
                              Option {idx + 1}
                            </span>
                            {bullet}
                          </div>
                          
                          <button
                            onClick={() => handleCopyBullet(bullet, idx)}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
                          >
                            {copiedIndex === idx ? "Copied!" : "Copy"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* HISTORY TAB */}
            {activeTab === "history" && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <Card title="Assessment History">
                  {history.length > 0 ? (
                    <div className="space-y-3">
                      {history.map((item) => (
                        <div
                          key={item._id}
                          onClick={() => handleSelectHistory(item)}
                          className="p-4 rounded-xl bg-slate-900/40 hover:bg-slate-900 border border-white/5 hover:border-purple-500/30 flex justify-between items-center cursor-pointer transition-all group"
                        >
                          <div>
                            <h4 className="text-white text-sm font-bold group-hover:text-cyan-400 transition-colors">
                              {item.targetRole} {item.targetCompany ? `• ${item.targetCompany}` : ""}
                            </h4>
                            <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-3">
                              <span>Score: <b className="text-purple-400">{item.readinessScore}%</b></span>
                              <span>•</span>
                              <span>Date: {new Date(item.createdAt).toLocaleDateString()}</span>
                            </p>
                          </div>
                          <FiChevronRight className="text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-slate-500 text-xs">No assessment reports found in database.</p>
                      <button
                        onClick={() => setActiveTab("assessment")}
                        className="mt-4 text-xs font-semibold text-purple-400 hover:text-purple-300 underline cursor-pointer"
                      >
                        Start Your First Assessment
                      </button>
                    </div>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}