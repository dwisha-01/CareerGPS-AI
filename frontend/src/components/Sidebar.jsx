import { motion } from "framer-motion";
import { FiLayout, FiUser, FiCompass, FiClock, FiLogOut, FiFileText, FiEdit3 } from "react-icons/fi";

export default function Sidebar({ activeTab, setActiveTab, username, profileCompletion, onLogout }) {
  const menuItems = [
    { id: "overview", label: "Dashboard", icon: FiLayout },
    { id: "profile", label: "Profile & Skills", icon: FiUser },
    { id: "assessment", label: "AI Roadmap", icon: FiCompass },
    { id: "resume", label: "Resume Analysis", icon: FiFileText },
    { id: "editor", label: "AI Bullet Editor", icon: FiEdit3 },
    { id: "history", label: "History", icon: FiClock },
  ];

  return (
    <aside className="w-64 bg-slate-950/80 backdrop-blur-xl border-r border-white/5 p-6 flex flex-col justify-between h-screen sticky top-0">
      <div className="flex flex-col gap-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-purple-500/30">
            G
          </div>
          <div>
            <h2 className="text-white font-bold text-lg leading-tight tracking-tight">
              Career<span className="text-cyan-400">GPS</span>
            </h2>
            <span className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider block -mt-0.5">
              AI Copilot
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 text-left cursor-pointer w-full group ${
                  isActive ? "text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavBackground"
                    className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-cyan-500/10 border-l-2 border-purple-500 rounded-xl"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className={`text-lg transition-transform duration-300 group-hover:scale-110 relative z-10 ${
                  isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-cyan-400"
                }`} />
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Profile Summary & Logout */}
      <div className="flex flex-col gap-5 border-t border-white/5 pt-6">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium truncate max-w-[120px]">
              {username || "Guest User"}
            </span>
            <span className="text-purple-400 font-semibold">{profileCompletion}%</span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${profileCompletion}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full rounded-full"
            />
          </div>
          <span className="text-[10px] text-slate-500">Profile Completion</span>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all cursor-pointer text-left w-full"
        >
          <FiLogOut className="text-base" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}