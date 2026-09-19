import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Mail, Lock, User, ArrowLeft, RotateCcw, ShieldCheck, CheckCircle2 } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import loginImage from "../assets/sideimg.jpg";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Mode: "otp" (  style) | "password" (Admin / Legacy)
  const [mode, setMode] = useState("otp");

  // In OTP mode: "phone" | "email"
  const [authType, setAuthType] = useState("phone");

  // In OTP mode: "input" (step 1) | "otp" (step 2)
  const [step, setStep] = useState("input");

  // Flow source: "direct" (phone/email OTP) | "password" (password-verified OTP)
  const [otpSource, setOtpSource] = useState("direct");

  // Form Inputs
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);

  // Password Mode Inputs
  const [passwordUser, setPasswordUser] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Status & Timers
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [serverOtpHint, setServerOtpHint] = useState("");

  const otpInputRefs = useRef([]);

  // Timer countdown for Resend OTP
  useEffect(() => {
    let interval = null;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, timer]);

  // Handle phone input changes (10 digits only)
  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(val);
    setErrorMessage("");
  };

  // Handle email input changes
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setErrorMessage("");
  };

  // Validate Step 1 Input
  const isInputValid = () => {
    if (authType === "phone") {
      return phone.length === 10;
    } else {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    }
  };

  // 1️⃣ Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage("");

    const identifier = authType === "phone" ? phone.trim() : email.trim();
    if (!identifier) {
      setErrorMessage(
        authType === "phone"
          ? "Please enter a 10-digit mobile number"
          : "Please enter a valid email address"
      );
      return;
    }

    if (authType === "phone" && phone.length !== 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number");
      return;
    }

    if (authType === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const res = await axiosInstance.post("/auth/send-otp", {
        identifier,
        type: authType,
      });

      setStep("otp");
      setTimer(30);
      setCanResend(false);

      if (res.data.otpCode) {
        const digits = res.data.otpCode.toString().split("").slice(0, 6);
        setOtpDigits(digits);
        setServerOtpHint(res.data.otpCode);
        toast.success(res.data.message || `Verification code: ${res.data.otpCode}`);
      } else {
        setOtpDigits(["", "", "", "", "", ""]);
        setServerOtpHint("");
        toast.success(res.data.message || "OTP sent successfully!");
      }

      // Focus first OTP input
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Failed to send OTP. Please try again.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;

    if (otpSource === "password") {
      setIsLoading(true);
      try {
        const res = await axiosInstance.post("/auth/send-otp", {
          identifier: email,
          type: "email",
        });
        setTimer(30);
        setCanResend(false);

        if (res.data.otpCode) {
          const digits = res.data.otpCode.toString().split("").slice(0, 6);
          setOtpDigits(digits);
          setServerOtpHint(res.data.otpCode);
          toast.success(res.data.message || `Verification code: ${res.data.otpCode}`);
        } else {
          setOtpDigits(["", "", "", "", "", ""]);
          setServerOtpHint("");
          toast.success(res.data.message || "OTP resent successfully to your email!");
        }
      } catch (err) {
        console.error(err);
        const msg = err.response?.data?.message || "Failed to resend OTP.";
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    } else {
      await handleRequestOtp();
    }
  };

  // 2️⃣ Step 2: Handle OTP input changes
  const handleOtpDigitChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);
    setErrorMessage("");

    // Auto-advance to next input
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace and navigation in OTP inputs
  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasteData) return;

    const newDigits = [...otpDigits];
    pasteData.split("").forEach((char, i) => {
      if (i < 6) newDigits[i] = char;
    });
    setOtpDigits(newDigits);

    const nextIndex = Math.min(pasteData.length, 5);
    otpInputRefs.current[nextIndex]?.focus();
  };

  // 3️⃣ Step 3: Verify OTP & Complete Login
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage("");

    const fullOtp = otpDigits.join("");
    if (fullOtp.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit OTP");
      return;
    }

    const identifier = authType === "phone" ? phone.trim() : email.trim();
    setIsLoading(true);

    try {
      const res = await axiosInstance.post("/auth/verify-otp", {
        identifier,
        otp: fullOtp,
        name: fullName.trim() || undefined,
      });

      const { user, token, message } = res.data;
      login(user, token);
      toast.success(message || "Login successful!");

      if (user.isAdmin) {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Invalid OTP code. Please check and try again.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // 4️⃣ Password Login (Verifies credentials -> triggers OTP to email)
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await axiosInstance.post("/auth/login", {
        name: passwordUser.trim(),
        password: password.trim(),
      });

      // 🔐 If backend requires 2FA OTP verification:
      if (res.data.requiresOtp) {
        const targetEmail = res.data.email || res.data.identifier || passwordUser.trim();
        setAuthType("email");
        setEmail(targetEmail);
        setOtpSource("password");
        setMode("otp");
        setStep("otp");
        setTimer(30);
        setCanResend(false);
        if (res.data.otpCode) {
          const digits = res.data.otpCode.toString().split("").slice(0, 6);
          setOtpDigits(digits);
          toast.success(res.data.message || `Verification code: ${res.data.otpCode}`);
        } else {
          setOtpDigits(["", "", "", "", "", ""]);
          toast.success(res.data.message || "OTP sent to your email!");
        }

        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 100);
        return;
      }

      // If user directly logged in without OTP (e.g. phone-only user)
      const { user, token, message } = res.data;
      login(user, token);
      toast.success(message || "Login successful!");

      if (user.isAdmin) {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Invalid username or password";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 py-10 px-4 sm:px-6 relative overflow-hidden">
        {/* Decorative Wheat Background SVGs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 opacity-10">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {[...Array(3)].map((_, i) => (
                <g key={i} transform={`translate(${20 + i * 25}, 80) rotate(${-30 + i * 15})`}>
                  <ellipse cx="0" cy="-20" rx="4" ry="12" fill="#D4A574" />
                  <ellipse cx="0" cy="0" rx="5" ry="15" fill="#C9A86C" />
                  <ellipse cx="0" cy="20" rx="5" ry="15" fill="#C9A86C" />
                  <ellipse cx="0" cy="40" rx="4" ry="12" fill="#D4A574" />
                </g>
              ))}
            </svg>
          </div>
          <div className="absolute bottom-10 right-10 w-32 h-32 opacity-10 rotate-180">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {[...Array(3)].map((_, i) => (
                <g key={i} transform={`translate(${20 + i * 25}, 80) rotate(${-30 + i * 15})`}>
                  <ellipse cx="0" cy="-20" rx="4" ry="12" fill="#D4A574" />
                  <ellipse cx="0" cy="0" rx="5" ry="15" fill="#C9A86C" />
                  <ellipse cx="0" cy="20" rx="5" ry="15" fill="#C9A86C" />
                  <ellipse cx="0" cy="40" rx="4" ry="12" fill="#D4A574" />
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Main Card Container */}
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl grid grid-cols-1 md:grid-cols-[42%_58%] overflow-hidden border border-amber-100 relative z-10 min-h-[540px]">

          {/* ============================================================== */}
          {/* 🌟 LEFT SIDE: Brand Image + Amber/Orange Dark Gradient Overlay */}
          {/* ============================================================== */}
          <div className="hidden md:block relative h-full min-h-[540px]">
            <img
              src={loginImage}
              alt="Sowmiya Foods Delicacies"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-amber-950/90 via-amber-900/50 to-transparent flex flex-col justify-between p-8 text-white">
              <div>
                <span className="inline-block px-3 py-1 bg-amber-500/30 backdrop-blur-md rounded-full text-xs font-semibold tracking-wider uppercase border border-amber-400/30 mb-3">
                  Sowmiya Foods
                </span>
                <h3 className="text-3xl font-bold mb-2">Welcome Back!</h3>
                <p className="text-amber-100/90 text-sm leading-relaxed">
                  Log in to access your orders, track deliveries, view your wishlist, and experience authentic South Indian flavors.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-4 text-xs text-amber-200/90 font-medium border-t border-white/10">
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>100% Secure & Verified Access</span>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* 🌟 RIGHT SIDE: Form Layout                                    */}
          {/* ============================================================== */}
          <div className="p-8 sm:p-10 flex flex-col justify-between bg-white">
            <div>
              {mode === "otp" ? (
                <>
                  {step === "input" ? (
                    <>
                      {/*   Header */}
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        Log in for the best experience
                      </h2>
                      <p className="text-sm text-gray-500 mb-6">
                        {authType === "phone"
                          ? "Enter your phone number to continue"
                          : "Enter your Email-ID to continue"}
                      </p>

                      {errorMessage && (
                        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                          {errorMessage}
                        </div>
                      )}

                      <form onSubmit={handleRequestOtp} className="space-y-4">
                        {/* Phone Number Input in   Style */}
                        {authType === "phone" ? (
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                              Phone Number
                            </label>
                            <div className="flex items-center border-2 border-gray-300 focus-within:border-amber-500 rounded-xl overflow-hidden transition-all duration-200 bg-white">
                              <div className="bg-gray-50 px-3.5 py-3.5 border-r border-gray-200 text-sm font-semibold text-gray-700 flex items-center gap-1 select-none">
                                <span>+91</span>
                                <span className="text-xs text-gray-400">▾</span>
                              </div>
                              <input
                                type="tel"
                                autoFocus
                                value={phone}
                                onChange={handlePhoneChange}
                                placeholder="Enter 10-digit mobile number"
                                maxLength={10}
                                className="w-full px-4 py-3.5 text-base text-gray-900 focus:outline-none placeholder:text-gray-400 font-medium tracking-wide"
                              />
                            </div>
                            <div className="flex justify-end mt-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setAuthType("email");
                                  setErrorMessage("");
                                }}
                                className="text-xs font-semibold text-amber-600 hover:text-amber-700 hover:underline cursor-pointer"
                              >
                                Use Email-ID
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Email Input in   Style */
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                              Email Address
                            </label>
                            <div className="flex items-center border-2 border-gray-300 focus-within:border-amber-500 rounded-xl overflow-hidden transition-all duration-200 bg-white">
                              <div className="bg-gray-50 px-3.5 py-3.5 border-r border-gray-200 text-gray-500 flex items-center justify-center">
                                <Mail className="w-5 h-5 text-gray-500" />
                              </div>
                              <input
                                type="email"
                                autoFocus
                                value={email}
                                onChange={handleEmailChange}
                                placeholder="Enter your email address"
                                className="w-full px-4 py-3.5 text-base text-gray-900 focus:outline-none placeholder:text-gray-400 font-medium"
                              />
                            </div>
                            <div className="flex justify-end mt-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setAuthType("phone");
                                  setErrorMessage("");
                                }}
                                className="text-xs font-semibold text-amber-600 hover:text-amber-700 hover:underline cursor-pointer"
                              >
                                Use Phone Number
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Terms Notice (  Style) */}
                        <p className="text-xs text-gray-500 leading-relaxed pt-1">
                          By continuing, you confirm that you are above 18 years of age, and you agree to Sowmiya Foods{" "}
                          <Link to="/terms-and-conditions" className="text-amber-600 font-semibold hover:underline">
                            Terms of Use
                          </Link>{" "}
                          and{" "}
                          <Link to="/privacy-policy" className="text-amber-600 font-semibold hover:underline">
                            Privacy Policy
                          </Link>
                          .
                        </p>

                        {/* Continue Button */}
                        <button
                          type="submit"
                          disabled={!isInputValid() || isLoading}
                          className={`w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-4 ${isInputValid() && !isLoading
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg active:scale-[0.99]"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                        >
                          {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            "Continue"
                          )}
                        </button>
                      </form>
                    </>
                  ) : (
                    /* ============================================================== */
                    /* 🔐 Step 2: OTP Verification Screen */
                    /* ============================================================== */
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-bold text-gray-900">
                          Verify with OTP
                        </h2>
                        <button
                          type="button"
                          onClick={() => {
                            if (otpSource === "password") {
                              setMode("password");
                              setStep("input");
                            } else {
                              setStep("input");
                            }
                            setErrorMessage("");
                          }}
                          className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 hover:underline cursor-pointer"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Change</span>
                        </button>
                      </div>

                      <p className="text-sm text-gray-500 mb-4">
                        Sent to{" "}
                        <strong className="text-gray-800 font-semibold">
                          {authType === "phone" ? `+91 ${phone}` : email}
                        </strong>
                      </p>

                      {serverOtpHint && (
                        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-center space-y-1">
                          <p className="text-xs font-semibold text-amber-700">
                            Security Verification Code
                          </p>
                          <p className="font-mono text-xl font-black text-amber-600 tracking-[0.4em]">
                            {serverOtpHint}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            Auto-filled for quick verification. Click continue below.
                          </p>
                        </div>
                      )}


                      {errorMessage && (
                        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                          {errorMessage}
                        </div>
                      )}

                      <form onSubmit={handleVerifyOtp} className="space-y-5">
                        {/* 6-Digit OTP Inputs */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2.5">
                            Enter 6-Digit OTP
                          </label>
                          <div className="flex justify-between gap-2 sm:gap-2.5" onPaste={handleOtpPaste}>
                            {otpDigits.map((digit, idx) => (
                              <input
                                key={idx}
                                ref={(el) => (otpInputRefs.current[idx] = el)}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold text-gray-900 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-150"
                              />
                            ))}
                          </div>
                        </div>

                        {/* Optional Name for first-time login */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Your Name (Optional)
                          </label>
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter your name"
                            className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        {/* Verify & Login Button */}
                        <button
                          type="submit"
                          disabled={otpDigits.join("").length !== 6 || isLoading}
                          className={`w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${otpDigits.join("").length === 6 && !isLoading
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg active:scale-[0.99]"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                        >
                          {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            "Verify & Login"
                          )}
                        </button>

                        {/* Resend OTP Counter */}
                        <div className="text-center pt-1">
                          {canResend ? (
                            <button
                              type="button"
                              onClick={handleResendOtp}
                              className="text-sm font-semibold text-amber-600 hover:text-amber-700 hover:underline flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Resend OTP</span>
                            </button>
                          ) : (
                            <p className="text-xs text-gray-500">
                              Resend OTP in{" "}
                              <span className="font-semibold text-gray-800">
                                00:{timer < 10 ? `0${timer}` : timer}
                              </span>
                            </p>
                          )}
                        </div>
                      </form>
                    </>
                  )}
                </>
              ) : (
                /* ============================================================== */
                /* 🔑 Password Login Mode (Admin & Legacy Users)                  */
                /* ============================================================== */
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    Log in with Password
                  </h2>
                  <p className="text-sm text-gray-500 mb-6">
                    Enter your Username, Email, or Mobile Number
                  </p>

                  {errorMessage && (
                    <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                      {errorMessage}
                    </div>
                  )}

                  <form onSubmit={handlePasswordLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                        Username / Email / Mobile
                      </label>
                      <div className="flex items-center border-2 border-gray-300 focus-within:border-amber-500 rounded-xl overflow-hidden">
                        <div className="bg-gray-50 px-3.5 py-3 border-r border-gray-200 text-gray-500">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <input
                          type="text"
                          autoFocus
                          value={passwordUser}
                          onChange={(e) => {
                            setPasswordUser(e.target.value);
                            setErrorMessage("");
                          }}
                          placeholder="admin, mobile, or email"
                          className="w-full px-4 py-3 text-base text-gray-900 focus:outline-none placeholder:text-gray-400"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                        Password
                      </label>
                      <div className="relative flex items-center border-2 border-gray-300 focus-within:border-amber-500 rounded-xl overflow-hidden">
                        <div className="bg-gray-50 px-3.5 py-3 border-r border-gray-200 text-gray-500">
                          <Lock className="w-5 h-5 text-gray-600" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setErrorMessage("");
                          }}
                          placeholder="Enter your password"
                          className="w-full px-4 py-3 text-base text-gray-900 focus:outline-none placeholder:text-gray-400 pr-12"
                          required
                        />
                        <span
                          className="absolute right-4 cursor-pointer text-gray-400 hover:text-gray-700"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        "Login"
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* Bottom Switcher: OTP vs Password Login */}
            <div className="pt-6 border-t border-gray-100 text-center space-y-2.5 mt-6">
              {mode === "otp" ? (
                <button
                  type="button"
                  onClick={() => {
                    setMode("password");
                    setErrorMessage("");
                  }}
                  className="w-full py-2.5 bg-white border border-gray-300 hover:bg-amber-50/50 hover:border-amber-300 text-amber-800 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Existing User? Log in with Password
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMode("otp");
                    setStep("input");
                    setErrorMessage("");
                  }}
                  className="w-full py-2.5 bg-white border border-gray-300 hover:bg-amber-50/50 hover:border-amber-300 text-amber-800 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Log in with OTP instead
                </button>
              )}

              <p className="text-xs text-gray-500 pt-1">
                New to Sowmiya Foods?{" "}
                <Link
                  to="/signup"
                  className="text-amber-600 font-semibold hover:text-amber-700 hover:underline"
                >
                  Create an account
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Login;