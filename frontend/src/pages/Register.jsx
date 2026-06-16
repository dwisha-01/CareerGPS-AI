import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiMail, FiLock, FiAlertCircle, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { registerUser } from "../services/authService";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await registerUser({
        username,
        email,
        password,
      });

      setSuccess("Account registered successfully! Redirecting to login...");
      
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Registration failed. Please try again with valid info."
      );
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050816] overflow-hidden flex items-center justify-center px-4">
      {/* Background Blobs */}
      <motion.div
        animate={{
          x: [0, 60, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-10 left-10 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl"
      />

      <motion.div
        animate={{
          x: [0, -60, 0],
          y: [0, -40, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl"
      />

      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/3 left-1/3 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl"
      />

      {/* Grid Mesh Background overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Register Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-md p-8 rounded-3xl bg-slate-950/40 backdrop-blur-2xl border border-white/5 shadow-2xl shadow-black/80 z-10"
      >
        {/* Glow Header Border */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

        {/* Badge */}
        <div className="flex justify-center mb-6">
          <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 uppercase tracking-widest">
            Start Your Career Journey
          </span>
        </div>

        {/* Logo */}
        <h1 className="text-4xl font-extrabold text-center tracking-tight text-white mb-2">
          Career<span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">GPS</span> AI
        </h1>

        <p className="text-slate-400 text-center text-sm font-medium mb-8">
          Create your account and unlock personalized AI career roadmaps.
        </p>

        {/* Alert Boxes */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
            >
              <FiAlertCircle className="text-red-400 text-lg shrink-0 mt-0.5" />
              <p className="text-red-200 text-xs font-medium leading-relaxed">{error}</p>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-5 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-start gap-3"
            >
              <FiCheckCircle className="text-green-400 text-lg shrink-0 mt-0.5" />
              <p className="text-green-200 text-xs font-medium leading-relaxed">{success}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
              <FiUser />
            </span>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
              className="w-full bg-slate-900/40 border border-white/5 focus:border-cyan-500/60 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-slate-500 text-sm outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all font-medium"
            />
          </div>

          <div className="relative group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
              <FiMail />
            </span>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full bg-slate-900/40 border border-white/5 focus:border-cyan-500/60 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-slate-500 text-sm outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all font-medium"
            />
          </div>

          <div className="relative group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
              <FiLock />
            </span>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full bg-slate-900/40 border border-white/5 focus:border-cyan-500/60 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-slate-500 text-sm outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all font-medium"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-cyan-500 to-blue-600 hover:from-purple-500 hover:to-blue-500 hover:shadow-lg hover:shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 group relative overflow-hidden"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Creating Account...</span>
              </span>
            ) : (
              <>
                <span>Create Account</span>
                <FiArrowRight className="text-base group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <p className="text-center text-slate-400 text-xs font-semibold mt-8 border-t border-white/5 pt-5">
          Already have an account?{" "}
          <Link
            to="/"
            className="text-cyan-400 hover:text-cyan-300 font-bold underline underline-offset-4 decoration-cyan-500/30 transition-colors ml-1"
          >
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default Register;