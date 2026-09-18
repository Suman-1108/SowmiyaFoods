import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Lock, User, Eye, EyeOff, ShieldCheck, ArrowLeft,
  Loader2, Mail, Phone, AlertTriangle, CheckCircle2,
  UserPlus, LogIn,
} from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../api/axiosInstance";

// ─── Helpers ─────────────────────────────────────────────
const isPortalUser = (user) => {
  if (!user) return false;
  const staffRoles = ["admin", "manager", "order_manager", "catalog_specialist", "viewer", "custom"];
  return !!(user.isAdmin || staffRoles.includes(user.role));
};

// ─── AdminLogin Component ─────────────────────────────────
const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/portal/dashboard";

  // ── Tab state
  const [tab, setTab] = useState("signin"); // "signin" | "register"

  // ── Setup status from API
  const [setupStatus, setSetupStatus] = useState(null); // null=loading, {isSetup}
  const [setupLoading, setSetupLoading] = useState(true);

  // ── Sign-in state
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ── 2FA / OTP state
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [serverOtpHint, setServerOtpHint] = useState("");
  const [requireOtpOption, setRequireOtpOption] = useState(true); // Toggle between Password-only & Verification Code
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendingOtp, setResendingOtp] = useState(false);

  // ── Cooldown timer for resending OTP
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // ── Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  // ─── Check admin setup status on mount ───────────────────
  useEffect(() => {
    const checkSetup = async () => {
      try {
        const res = await axiosInstance.get("/auth/admin/setup-status");
        setSetupStatus(res.data);
      } catch {
        setSetupStatus({ isSetup: false, message: "Unable to check setup status." });
      } finally {
        setSetupLoading(false);
      }
    };
    checkSetup();
  }, []);

  // ─── Sign-In handler (Supports Password-Only or Email Verification Code) ──
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      toast.error("Please enter username/email and password");
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.post("/auth/login", {
        name: identifier.trim(),
        password: password.trim(),
        isAdminLogin: true,
        requireOtp: requireOtpOption,
      });

      if (res.data.requiresOtp) {
        setRequiresOtp(true);
        setOtpEmail(res.data.email || identifier);
        setResendCooldown(45);
        if (res.data.otpCode) {
          setServerOtpHint(res.data.otpCode);
          setOtp(res.data.otpCode);
          toast.success(res.data.message || `Verification code: ${res.data.otpCode}`);
        } else {
          setServerOtpHint("");
          toast.success(res.data.message || "Verification code sent to your email");
        }
      } else {
        const { token, user } = res.data;
        if (!isPortalUser(user)) {
          toast.error("Access denied. Administrative privileges required.");
          return;
        }
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        toast.success(`Welcome back, ${user.name || "Admin"}!`);
        navigate(from, { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid credentials or unauthorized.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ─── Resend OTP handler ────────────────────────────────────
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resendingOtp) return;
    setResendingOtp(true);
    try {
      const res = await axiosInstance.post("/auth/resend-login-otp", {
        email: otpEmail,
        identifier: otpEmail,
      });
      if (res.data.otpCode) {
        setServerOtpHint(res.data.otpCode);
        setOtp(res.data.otpCode);
      }
      toast.success(res.data.message || "Fresh verification code sent!");
      setResendCooldown(45);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend verification code");
    } finally {
      setResendingOtp(false);
    }
  };

  // ─── Verify OTP handler ───────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.length !== 6) {
      toast.error("Please enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.post("/auth/verify-login-otp", {
        otp: otp.trim(),
        email: otpEmail,
        identifier: otpEmail,
      });
      const { token, user } = res.data;
      if (!isPortalUser(user)) {
        toast.error("Access denied. Administrative privileges required.");
        return;
      }
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      toast.success(`Welcome back, ${user.name || "Admin"}!`);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid or expired OTP";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ─── Register Admin handler (Up to 4 Admins) ──────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      toast.error("Name, email, and password are required.");
      return;
    }
    if (regPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setRegLoading(true);
    try {
      const res = await axiosInstance.post("/auth/admin/register", {
        name: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim() || undefined,
        password: regPassword,
      });
      const { token, user, slot } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      toast.success(`Welcome, ${user.name}! Admin account created (Admin Slot ${slot || ""} of 4).`);
      
      // Refresh setup status
      try {
        const sRes = await axiosInstance.get("/auth/admin/setup-status");
        setSetupStatus(sRes.data);
      } catch (_) {}

      navigate("/portal/dashboard", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed.";
      toast.error(msg);
    } finally {
      setRegLoading(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-[#1a0a00] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-[#e8703b]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-amber-600/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#e8703b]/4 rounded-full blur-[120px] pointer-events-none" />

      {/* Back link */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 transition backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Store</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg relative z-10 px-4">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#e8703b] via-orange-500 to-amber-400 mx-auto flex items-center justify-center text-white shadow-2xl shadow-orange-500/30 mb-5 border border-orange-400/30 relative">
            <ShieldCheck className="w-10 h-10" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Sowmiya Foods
          </h1>
          <p className="mt-1.5 text-sm text-slate-400 font-medium">Admin & Staff Management Portal</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/70 backdrop-blur-2xl border border-slate-700/60 shadow-2xl shadow-black/40 rounded-3xl overflow-hidden">

          {/* Tab switcher */}
          {!requiresOtp && (
            <div className="flex border-b border-slate-700/60">
              <button
                type="button"
                id="tab-signin"
                onClick={() => setTab("signin")}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all ${
                  tab === "signin"
                    ? "text-white bg-slate-800/60 border-b-2 border-[#e8703b]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                id="tab-register"
                onClick={() => setTab("register")}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all ${
                  tab === "register"
                    ? "text-white bg-slate-800/60 border-b-2 border-[#e8703b]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Register Admin</span>
                {setupStatus && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      (setupStatus.adminCount || 0) >= 4
                        ? "bg-slate-700 text-slate-400"
                        : "bg-[#e8703b]/20 text-orange-400 border border-orange-500/30"
                    }`}
                  >
                    {setupStatus.adminCount ?? 0}/4
                  </span>
                )}
              </button>
            </div>
          )}

          <div className="py-8 px-6 sm:px-10">
            {/* ─── OTP Verification ─────────────────────────────── */}
            {requiresOtp ? (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-6 h-6 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Two-Factor Authentication</h3>
                  <p className="text-xs text-slate-400 mt-1.5">
                    Enter the 6-digit code sent to <span className="text-amber-400 font-semibold">{otpEmail}</span>
                  </p>
                </div>

                {serverOtpHint && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-center space-y-1">
                    <p className="text-xs font-semibold text-amber-300">
                      Security Verification Code
                    </p>
                    <p className="font-mono text-xl font-black text-amber-400 tracking-[0.4em]">
                      {serverOtpHint}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Auto-filled for verification. Click below to confirm.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 text-center">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    autoFocus
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="w-full text-center tracking-[0.6em] font-mono text-2xl py-4 bg-slate-800/90 border border-slate-600 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#e8703b] focus:border-transparent transition placeholder-slate-600"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#e8703b] to-amber-500 hover:from-[#d65f29] hover:to-amber-400 shadow-lg shadow-orange-500/25 transition cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /><span>Verifying Code...</span></>
                  ) : (
                    <><CheckCircle2 className="w-4 h-4" /><span>Verify & Enter Console</span></>
                  )}
                </button>

                {/* Resend OTP & Back button */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    disabled={resendCooldown > 0 || resendingOtp}
                    onClick={handleResendOtp}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {resendingOtp
                      ? "Sending code..."
                      : resendCooldown > 0
                      ? `Resend code in ${resendCooldown}s`
                      : "Resend verification code"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setRequiresOtp(false); setOtp(""); }}
                    className="text-xs text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    ← Back to login
                  </button>
                </div>
              </form>
            ) : tab === "signin" ? (
              /* ─── Sign In Form ──────────────────────────────────── */
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Username or Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      autoFocus
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="sowmiyafoods01@gmail.com"
                      className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e8703b] focus:border-transparent placeholder-slate-600 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 bg-slate-800/80 border border-slate-700 text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e8703b] focus:border-transparent placeholder-slate-600 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-200 transition cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 🛡️ Verification Code Option Toggle */}
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#e8703b]" />
                      <span className="text-xs font-bold text-slate-200">
                        Email Verification Code (2FA)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRequireOtpOption(!requireOtpOption)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                        requireOtpOption
                          ? "bg-[#e8703b]/25 text-orange-300 border-orange-500/40"
                          : "bg-slate-700/50 text-slate-400 border-slate-600"
                      }`}
                    >
                      <span>{requireOtpOption ? "Enabled" : "Disabled"}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {requireOtpOption
                      ? "🔒 High Security: A 6-digit verification code will be sent to your registered email after password check."
                      : "⚡ Direct Sign-in: Sign in immediately with password without requiring an email verification code."}
                  </p>
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    id="btn-admin-signin"
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#e8703b] to-amber-500 hover:from-[#d65f29] hover:to-amber-400 shadow-lg shadow-orange-500/25 transition cursor-pointer disabled:opacity-60"
                  >
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /><span>Authenticating...</span></>
                    ) : requireOtpOption ? (
                      <><Mail className="w-4 h-4" /><span>Verify Password & Send Code</span></>
                    ) : (
                      <><ShieldCheck className="w-4 h-4" /><span>Sign In to Admin Console</span></>
                    )}
                  </button>
                </div>

                <p className="text-center text-[11px] text-slate-500 pt-1">
                  🔒 Protected system. Authorized administrative personnel only.
                </p>
              </form>
            ) : (
              /* ─── Register Admin Form (Up to 4 Admins) ─────────────── */
              <div className="space-y-5">
                {setupLoading ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <Loader2 className="w-8 h-8 text-[#e8703b] animate-spin" />
                    <p className="text-sm text-slate-400">Checking system capacity...</p>
                  </div>
                ) : (
                  <>
                    {/* 4 Admin Slots Status Card */}
                    <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Admin Capacity ({setupStatus?.adminCount ?? 0} of 4 Registered)
                        </span>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            (setupStatus?.adminCount ?? 0) >= 4
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          }`}
                        >
                          {(setupStatus?.adminCount ?? 0) >= 4
                            ? "Slots Full"
                            : `${4 - (setupStatus?.adminCount ?? 0)} Slot${4 - (setupStatus?.adminCount ?? 0) === 1 ? "" : "s"} Free`}
                        </span>
                      </div>

                      {/* 4 Slot Pills */}
                      <div className="grid grid-cols-4 gap-2">
                        {[1, 2, 3, 4].map((slotNumber) => {
                          const isOccupied = slotNumber <= (setupStatus?.adminCount ?? 0);
                          const isNext = slotNumber === (setupStatus?.adminCount ?? 0) + 1;

                          return (
                            <div
                              key={slotNumber}
                              className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border text-center transition ${
                                isOccupied
                                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-400 shadow-xs"
                                  : isNext
                                  ? "bg-orange-500/15 border-[#e8703b] text-orange-300 ring-1 ring-[#e8703b]/40 animate-pulse"
                                  : "bg-slate-900/60 border-slate-700/50 text-slate-500"
                              }`}
                            >
                              <span className="text-[10px] font-bold uppercase tracking-wider">
                                Slot {slotNumber}
                              </span>
                              <span className="text-[11px] font-extrabold mt-0.5">
                                {isOccupied ? "Registered" : isNext ? "Next Open" : "Available"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Check if all 4 slots are occupied */}
                    {(setupStatus?.adminCount ?? 0) >= 4 ? (
                      <div className="flex flex-col items-center text-center gap-4 py-3">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                          <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white mb-1">
                            All 4 Admin Slots Occupied
                          </h3>
                          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                            The maximum limit of <strong className="text-white">4 Administrator accounts</strong> has been reached. Direct public registration is now closed.
                          </p>
                        </div>
                        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-3.5 w-full text-left space-y-1.5">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Need additional staff?
                          </p>
                          <p className="text-xs text-slate-300">
                            Log in with an existing admin account and navigate to{" "}
                            <span className="text-[#e8703b] font-semibold">Team & Roles</span> to invite managers and staff.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setTab("signin")}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#e8703b] hover:bg-[#d65f29] transition cursor-pointer shadow-lg shadow-orange-500/20"
                        >
                          <LogIn className="w-4 h-4" />
                          <span>Sign In to Admin Portal</span>
                        </button>
                      </div>
                    ) : (
                      /* Registration Form for Next Admin Slot */
                      <form onSubmit={handleRegister} className="space-y-4">
                        <div className="flex items-start gap-3 bg-orange-500/10 border border-orange-500/30 rounded-2xl p-3.5">
                          <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-orange-300">
                              Register Admin (Slot {(setupStatus?.adminCount ?? 0) + 1} of 4)
                            </p>
                            <p className="text-xs text-orange-400/80 mt-0.5 leading-relaxed">
                              This account will be created with full administrator privileges across the store and management console.
                            </p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                            Full Name
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                              <User className="w-4 h-4" />
                            </div>
                            <input
                              type="text"
                              required
                              autoFocus
                              value={regName}
                              onChange={(e) => setRegName(e.target.value)}
                              placeholder="e.g. Admin Manager"
                              className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e8703b] focus:border-transparent placeholder-slate-600 transition"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                            Admin Email
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                              <Mail className="w-4 h-4" />
                            </div>
                            <input
                              type="email"
                              required
                              value={regEmail}
                              onChange={(e) => setRegEmail(e.target.value)}
                              placeholder="admin@sowmiyafoods.com"
                              className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e8703b] focus:border-transparent placeholder-slate-600 transition"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                            Mobile Number <span className="text-slate-500 normal-case font-normal">(optional)</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                              <Phone className="w-4 h-4" />
                            </div>
                            <input
                              type="tel"
                              value={regPhone}
                              onChange={(e) => setRegPhone(e.target.value)}
                              placeholder="9876543210"
                              className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e8703b] focus:border-transparent placeholder-slate-600 transition"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                            Password
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                              <Lock className="w-4 h-4" />
                            </div>
                            <input
                              type={showRegPassword ? "text" : "password"}
                              required
                              value={regPassword}
                              onChange={(e) => setRegPassword(e.target.value)}
                              placeholder="Min 6 characters"
                              className="w-full pl-10 pr-10 py-3 bg-slate-800/80 border border-slate-700 text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e8703b] focus:border-transparent placeholder-slate-600 transition"
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegPassword(!showRegPassword)}
                              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-200 transition cursor-pointer"
                            >
                              {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                            Confirm Password
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                              <Lock className="w-4 h-4" />
                            </div>
                            <input
                              type={showRegPassword ? "text" : "password"}
                              required
                              value={regConfirmPassword}
                              onChange={(e) => setRegConfirmPassword(e.target.value)}
                              placeholder="Re-enter password"
                              className={`w-full pl-10 pr-4 py-3 bg-slate-800/80 border text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e8703b] focus:border-transparent placeholder-slate-600 transition ${
                                regConfirmPassword && regConfirmPassword !== regPassword
                                  ? "border-rose-500/70"
                                  : "border-slate-700"
                              }`}
                            />
                          </div>
                          {regConfirmPassword && regConfirmPassword !== regPassword && (
                            <p className="text-xs text-rose-400 mt-1 ml-1">Passwords do not match</p>
                          )}
                        </div>

                        <div className="pt-1">
                          <button
                            type="submit"
                            disabled={regLoading}
                            id="btn-admin-register"
                            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#e8703b] to-amber-500 hover:from-[#d65f29] hover:to-amber-400 shadow-lg shadow-orange-500/25 transition cursor-pointer disabled:opacity-60"
                          >
                            {regLoading ? (
                              <><Loader2 className="w-4 h-4 animate-spin" /><span>Registering Admin...</span></>
                            ) : (
                              <><UserPlus className="w-4 h-4" /><span>Register Admin (Slot {(setupStatus?.adminCount ?? 0) + 1} of 4)</span></>
                            )}
                          </button>
                        </div>
                        <p className="text-center text-[11px] text-slate-500">
                          🛡️ Up to 4 administrator accounts can be registered in total.
                        </p>
                      </form>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-[11px] text-slate-600 mt-5">
          Sowmiya Foods Management Portal · Secure Admin Access
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
