"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import DotField from "@/components/DotField";
import { LandingPage } from "@/components/landing/LandingPage";

export default function LandingAuthPage() {
  const router = useRouter();

  // View Modes: "landing" (Main 2D Story Landing Page) | "intro" (Cinematic Brand Intro) | "portal" (Auth Portal)
  const [viewMode, setViewMode] = useState<"landing" | "intro" | "portal">("landing");
  const [telemetryText, setTelemetryText] = useState<string>("Phase 1: Aligning CAD Coordinate Grid...");
  const [shardsAssembled, setShardsAssembled] = useState<boolean>(false);
  const [shardsLocked, setShardsLocked] = useState<boolean>(false);
  const [wordmarkActive, setWordmarkActive] = useState<boolean>(false);

  // Flow Step State: "login" (Step 1) | "otp" (Step 2) | "otp-success" | "role" (Step 3) | "verify" (Step 4) | "verify-success"
  const [authStep, setAuthStep] = useState<
    "login" | "otp" | "otp-success" | "role" | "verify" | "verify-success"
  >("login");

  // Step 1 & 2 Contact States
  const [inputValue, setInputValue] = useState<string>("pruthviraj.mali@bis.gov.in");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [otpError, setOtpError] = useState<boolean>(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(30);
  const [canResend, setCanResend] = useState<boolean>(false);

  // Step 3 Role Selection State
  const [selectedRole, setSelectedRole] = useState<"officer" | "supplier" | null>(null);

  // Step 4 Verification Sub-Step (1, 2, 3, 4)
  const [verifySubStep, setVerifySubStep] = useState<number>(1);

  // Officer Verification Form Data
  const [officerData, setOfficerData] = useState({
    fullName: "Pruthviraj Mali",
    mobile: "+91 98765 43210",
    email: "pruthviraj.mali@bis.gov.in",
    designation: "Assistant Director / Procurement Officer",
    employeeId: "BIS-OFF-2026-894",
    ministry: "Department of Consumer Affairs",
    organization: "Bureau of Indian Standards (BIS)",
    division: "Standardization & Procurement Cell",
    govtType: "Central Government",
    emailVerifiedDemo: true,
    mobileVerifiedDemo: true,
    declAccurate: false,
    declAuthorized: false,
    declHackathon: false,
  });

  // Supplier Verification Form Data
  const [supplierData, setSupplierData] = useState({
    businessName: "Bharat Safety & Industrial Equipment Pvt Ltd",
    businessType: "Manufacturer",
    email: "contact@bharatsafety.co.in",
    mobile: "+91 98765 43210",
    address: "Plot 42, Industrial Area Phase II, New Delhi - 110020",
    pan: "ABCDE1234F",
    gstin: "07ABCDE1234F1Z5",
    regNumber: "REG-2024-99812",
    msmeNumber: "UDYAM-DL-03-0012345",
    authPersonName: "Rajesh Sharma",
    designation: "Managing Director",
    declAccurate: false,
    declAuthorized: false,
    declShare: false,
    declHackathon: false,
  });

  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  function clearAllTimers() {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  }

  // Mask contact helper: pruthviraj.mali@bis.gov.in -> p•••••••••i@bis.gov.in
  function maskContact(contact: string): string {
    if (!contact) return "p•••••••••i@bis.gov.in";
    if (contact.includes("@")) {
      const [local, domain] = contact.split("@");
      if (local.length <= 2) return `${local[0]}•@${domain}`;
      return `${local[0]}${"•".repeat(Math.min(9, local.length - 2))}${local[local.length - 1]}@${domain}`;
    }
    if (contact.length >= 10) {
      const clean = contact.trim();
      return `${clean.slice(0, 3)} ${clean[3]}•••• •••${clean.slice(-2)}`;
    }
    return contact;
  }

  function runBrandIntro() {
    clearAllTimers();
    setViewMode("intro");

    setShardsAssembled(false);
    setShardsLocked(false);
    setWordmarkActive(false);
    setTelemetryText("Phase 1: Aligning CAD Coordinate Grid...");

    // Phase 2 (0.45s): Emblem inward convergence
    timersRef.current.push(
      setTimeout(() => {
        setTelemetryText("Phase 2: Emblem Convergence & Assembly...");
        setShardsAssembled(true);
      }, 450)
    );

    // Emblem Lock (1.15s)
    timersRef.current.push(
      setTimeout(() => {
        setShardsLocked(true);
      }, 1150)
    );

    // Phase 3 (1.4s): Wordmark Emergence
    timersRef.current.push(
      setTimeout(() => {
        setTelemetryText("Phase 3: Wordmark & Subtitle Emergence...");
        setWordmarkActive(true);
      }, 1400)
    );

    // Phase 4 (2.3s): Brand Hold
    timersRef.current.push(
      setTimeout(() => {
        setTelemetryText("Phase 4: Authoritative Brand Hold...");
      }, 2300)
    );

    // Phase 5 (3.3s): Transition to Landing Page
    timersRef.current.push(
      setTimeout(() => {
        setViewMode("landing");
      }, 3300)
    );
  }

  useEffect(() => {
    // Keep landing as default view
    return () => clearAllTimers();
  }, []);

  // OTP Countdown Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (authStep === "otp" && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [authStep, remainingSeconds]);

  // Step 1 -> Step 2 submission
  function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setAuthStep("otp");
    setOtpDigits(["", "", "", "", "", ""]);
    setOtpError(false);
    setRemainingSeconds(30);
    setCanResend(false);
    setTimeout(() => {
      otpInputRefs.current[0]?.focus();
    }, 100);
  }

  // OTP digit handling
  function handleOtpChange(index: number, value: string) {
    setOtpError(false);
    const cleanDigit = value.replace(/[^0-9]/g, "");
    const updated = [...otpDigits];
    updated[index] = cleanDigit ? cleanDigit[0] : "";
    setOtpDigits(updated);

    if (cleanDigit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      setOtpError(false);
      if (!otpDigits[index] && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
      } else {
        const updated = [...otpDigits];
        updated[index] = "";
        setOtpDigits(updated);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    setOtpError(false);
    const pastedData = e.clipboardData.getData("text").trim();
    const cleanDigits = pastedData.replace(/\D/g, "").slice(0, 6);

    if (cleanDigits.length > 0) {
      const updated = ["", "", "", "", "", ""];
      cleanDigits.split("").forEach((char, i) => {
        if (i < 6) updated[i] = char;
      });
      setOtpDigits(updated);
      const nextFocus = Math.min(cleanDigits.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
    }
  }

  function handleVerifyOtp(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const enteredOtp = otpDigits.join("");

    if (enteredOtp.length < 6) {
      setOtpError(true);
      return;
    }

    setIsVerifying(true);
    setOtpError(false);

    setTimeout(() => {
      setIsVerifying(false);
      if (enteredOtp === "000000") {
        setOtpError(true);
        otpInputRefs.current[0]?.focus();
      } else {
        setAuthStep("otp-success");
      }
    }, 600);
  }

  function handleResendOtp() {
    setRemainingSeconds(30);
    setCanResend(false);
    setOtpDigits(["", "", "", "", "", ""]);
    setOtpError(false);
    otpInputRefs.current[0]?.focus();
  }

  // Navigate to Dashboard
  function handleCompleteAndGoToDashboard() {
    router.push("/dashboard");
  }

  if (viewMode === "landing") {
    return <LandingPage onOpenAuthPortal={() => setViewMode("portal")} />;
  }

  return (
    <div
      className={`fixed inset-0 w-screen h-screen m-0 p-0 overflow-hidden select-none bg-grid-pattern text-[#161616] font-sans ${
        viewMode === "portal" ? "auth-portal-active" : ""
      }`}
    >
      {/* DotField — fixed inset-0 z-[1]: above CSS bg-grid-pattern, below intro(z-20) and portal(z-10) sections */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <DotField
          dotRadius={2.0}
          dotSpacing={9}
          cursorRadius={320}
          bulgeOnly={true}
          bulgeStrength={45}
          glowRadius={160}
          gradientFrom="rgba(109, 40, 217, 0.52)"
          gradientTo="rgba(91, 33, 182, 0.40)"
          glowColor="rgba(124, 58, 237, 0.15)"
        />
      </div>
      {/* ========================================================================= */}
      {/* 1. FULL-SCREEN CINEMATIC BRAND INTRO VIEW (100vw, 100vh Takeover)       */}
      {/* ========================================================================= */}
      {viewMode === "intro" && (
        <section
          id="full-intro-view"
          className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gov-canvas-grid z-20"
        >
          <div className="flex flex-col items-center justify-center relative">
            <div
              id="intro-shards-stage"
              className={`shards-stage relative flex items-center justify-center ${
                shardsAssembled ? "phase-assembled" : ""
              } ${shardsLocked ? "phase-locked" : ""}`}
            >
              <div className="cad-ring-outer"></div>
              <div className="cad-ring-inner"></div>
              <div className="cad-crosshairs flex items-center justify-center">
                <div className="w-full h-[1px] bg-purple-500/25"></div>
                <div className="absolute h-full w-[1px] bg-purple-500/25"></div>
              </div>

              <div className="shard shard-n"></div>
              <div className="shard shard-ne"></div>
              <div className="shard shard-se"></div>
              <div className="shard shard-s"></div>
              <div className="shard shard-sw"></div>
              <div className="shard shard-nw"></div>

              <img
                id="master-logo-img"
                src="/procure-logo.png"
                alt="Procure Master Emblem"
                className="full-logo-overlay drop-shadow-sm"
              />
            </div>

            <div
              id="intro-wordmark"
              className={`intro-wordmark-container text-center flex flex-col items-center mt-7 ${
                wordmarkActive ? "phase-wordmark-active" : ""
              }`}
            >
              <div className="flex items-center justify-center">
                <h1 className="brand-wordmark-track text-5xl sm:text-6xl font-bold tracking-tight text-[#161616] font-display flex items-center select-none">
                  <span className="brand-char char-1">P</span>
                  <span className="brand-char char-2">r</span>
                  <span className="brand-char char-3">o</span>
                  <span className="brand-char char-4">c</span>
                  <span className="brand-char char-5">u</span>
                  <span className="brand-char char-6">r</span>
                  <span className="brand-char char-7">e</span>
                </h1>
              </div>
              <p className="wordmark-subtext mt-3 text-sm sm:text-base font-medium text-[#525252] tracking-wide max-w-lg text-center font-headline">
                National Procurement & Standards Intelligence Portal
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs font-mono text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-ping"></span>
                <span id="telemetry-text">{telemetryText}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 2. AUTHENTICATION & VERIFICATION ENCLAVE PORTAL VIEW                      */}
      {/* ========================================================================= */}
      <section
        id="login-portal-view"
        className="absolute inset-0 w-full h-full flex flex-col justify-between gov-canvas-grid z-10 overflow-y-auto"
      >
        {/* GovTech Official Header Banner */}
        <header className="w-full px-6 sm:px-10 py-3.5 bg-white/95 backdrop-blur-md border-b border-[#e0e0e0] flex items-center justify-between shadow-xs sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center p-1 border-2 border-purple-600/80 shrink-0 shadow-xs">
              <img
                src="/procure-logo.png"
                alt="Procure"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight leading-none text-[#161616] text-xl font-display">
                Procure
              </span>
              <span className="text-[11px] text-[#525252] hidden sm:block">
                AI Procurement & Standards Verification Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#525252]">
            <button
              onClick={() => setViewMode("landing")}
              className="text-xs font-semibold text-purple-700 hover:underline flex items-center gap-1 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200 cursor-pointer"
            >
              ← Back to Landing Story
            </button>
            <span className="hidden sm:flex items-center gap-1 font-mono">
              <span className="material-symbols-outlined text-sm text-[#0f62fe]">shield</span>
              <span className="hidden md:inline">256-Bit TLS Secured</span>
            </span>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
          <div
            className={`w-full bg-white border border-[#e0e0e0] rounded-2xl card-sheen p-6 sm:p-8 transition-all ${
              authStep === "role" || authStep === "verify" || authStep === "verify-success"
                ? "max-w-2xl"
                : "max-w-[440px]"
            }`}
          >
            {/* Header with Master Logo & Wordmark */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-[#e0e0e0]/70">
              <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center p-1 border-2 border-purple-600/80 shrink-0 shadow-xs">
                <img
                  src="/procure-logo.png"
                  alt="Procure Symbol"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <div>
                <h2 className="font-bold text-lg tracking-tight text-[#161616] font-display">
                  Procure
                </h2>
                <p className="text-xs text-[#525252]">AI Procurement & Standards Portal</p>
              </div>
            </div>

            {/* Modern Process Stepper Bar */}
            <div className="mt-5 mb-6 px-1">
              <div className="relative flex items-center justify-between">
                {/* Background track line */}
                <div className="absolute top-3.5 left-6 right-6 h-0.5 bg-slate-200 z-0" />
                {/* Active progress fill line */}
                <div
                  className="absolute top-3.5 left-6 h-0.5 bg-purple-600 transition-all duration-300 z-0"
                  style={{
                    width:
                      authStep === "login"
                        ? "0%"
                        : authStep === "otp" || authStep === "otp-success"
                        ? "33%"
                        : authStep === "role"
                        ? "66%"
                        : "calc(100% - 3rem)",
                  }}
                />

                {/* Stepper items */}
                {[
                  {
                    key: "login",
                    label: "1. Login",
                    num: 1,
                    isCompleted: authStep !== "login",
                    isActive: authStep === "login",
                  },
                  {
                    key: "otp",
                    label: "2. Security OTP",
                    num: 2,
                    isCompleted: authStep === "role" || authStep === "verify" || authStep === "verify-success",
                    isActive: authStep === "otp" || authStep === "otp-success",
                  },
                  {
                    key: "role",
                    label: "3. Choose Role",
                    num: 3,
                    isCompleted: authStep === "verify" || authStep === "verify-success",
                    isActive: authStep === "role",
                  },
                  {
                    key: "verify",
                    label: "4. Verification",
                    num: 4,
                    isCompleted: authStep === "verify-success",
                    isActive: authStep === "verify",
                  },
                ].map((step) => (
                  <div key={step.key} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                        step.isCompleted
                          ? "bg-[#2a9d8f] text-white shadow-xs"
                          : step.isActive
                          ? "bg-[#7209b7] text-white ring-4 ring-purple-100 shadow-sm scale-110"
                          : "bg-white text-slate-400 border-2 border-slate-200"
                      }`}
                    >
                      {step.isCompleted ? (
                        <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        step.num
                      )}
                    </div>
                    <span
                      className={`mt-1.5 text-[11px] font-semibold tracking-tight transition-colors ${
                        step.isActive
                          ? "text-purple-700"
                          : step.isCompleted
                          ? "text-slate-800"
                          : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ============================================================ */}
            {/* STEP 1: SIGN IN / SIGN UP                                    */}
            {/* ============================================================ */}
            {authStep === "login" && (
              <div className="mt-5 animate-fade-in">
                <h3 className="text-xl font-bold tracking-tight text-[#161616]">Sign In / Sign Up</h3>
                <p className="text-xs text-[#525252] mt-1.5 leading-relaxed">
                  Enter your email ID or phone number to verify your sign in or sign up.
                </p>
                <form className="mt-5 space-y-4" onSubmit={handleSendOtp}>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Email or Mobile Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="e.g. officer@gov.in or mobile number"
                        className="w-full pl-3.5 pr-24 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-[#7209b7] focus:ring-2 focus:ring-purple-100 transition-all"
                      />
                      <span className="absolute right-2.5 top-2.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs text-emerald-600">verified</span>
                        Verified
                      </span>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-[#7209b7] hover:bg-[#560bad] text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-200 cursor-pointer"
                  >
                    <span>Send Verification Code</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </form>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5 text-slate-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7209b7]"></span>
                    Step 1 of 4: Authentication
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-400">
                    <span className="material-symbols-outlined text-xs text-emerald-600">lock</span>
                    Encrypted & Secure
                  </span>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* STEP 2: OTP ENTRY                                            */}
            {/* ============================================================ */}
            {authStep === "otp" && (
              <div className="mt-5 animate-fade-in">
                <div className="mb-4">
                  <h3 className="text-xl font-bold tracking-tight text-[#161616]">Enter OTP</h3>
                  <p className="text-xs text-[#525252] mt-1 leading-relaxed">
                    Enter the 6-digit one-time password sent to your registered government contact.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-5 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-slate-700 truncate pr-2">
                    <span className="material-symbols-outlined text-base text-slate-400">shield_lock</span>
                    <span className="truncate font-semibold text-slate-900">{maskContact(inputValue)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAuthStep("login")}
                    className="text-[#7209b7] hover:text-[#560bad] font-semibold text-xs shrink-0 cursor-pointer"
                  >
                    Change
                  </button>
                </div>

                <form onSubmit={handleVerifyOtp}>
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Enter 6-Digit Verification Code
                    </label>
                    <div className="flex justify-between gap-1.5 sm:gap-2">
                      {otpDigits.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => {
                            otpInputRefs.current[index] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          pattern="[0-9]*"
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          onPaste={handleOtpPaste}
                          className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold text-slate-900 bg-white border rounded-xl outline-none transition-all ${
                            otpError
                              ? "border-red-500 focus:border-red-500"
                              : "border-slate-300 focus:border-[#7209b7] focus:ring-2 focus:ring-purple-100 shadow-2xs"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {otpError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                      <span className="material-symbols-outlined text-red-600 text-base shrink-0 mt-0.5">
                        error
                      </span>
                      <div className="text-xs text-red-700">
                        <span className="font-semibold">Incorrect OTP.</span> Please check the code and try again.
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full py-3 px-4 bg-[#7209b7] hover:bg-[#560bad] text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-200 cursor-pointer disabled:opacity-70"
                  >
                    {isVerifying ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify & Continue</span>
                        <span className="material-symbols-outlined text-base">arrow_forward</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-5 text-center text-xs text-slate-500 space-y-2">
                  <div>
                    Didn&apos;t receive code?{" "}
                    {!canResend ? (
                      <span className="font-medium text-slate-700">
                        Resend code in{" "}
                        <span className="font-semibold text-purple-700">
                          {remainingSeconds}s
                        </span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-purple-700 font-semibold hover:underline cursor-pointer ml-1"
                      >
                        Resend Code
                      </button>
                    )}
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => setAuthStep("login")}
                      className="inline-flex items-center text-slate-500 hover:text-slate-800 font-medium hover:underline cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm mr-1">arrow_back</span>
                      Change email or mobile number
                    </button>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5 text-slate-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7209b7]"></span>
                    Step 2 of 4: Code Verification
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-400">
                    <span className="material-symbols-outlined text-xs text-emerald-600">verified_user</span>
                    2FA Verified
                  </span>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* STEP 2 SUCCESS: OTP VERIFIED                                 */}
            {/* ============================================================ */}
            {authStep === "otp-success" && (
              <div className="mt-4 text-center py-2 animate-fade-in">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-pop shadow-xs">
                  <span className="material-symbols-outlined text-3xl font-bold">check</span>
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">
                  OTP Verified
                </h2>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                  Your identity has been successfully authenticated.
                </p>

                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs text-left mb-6 space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span className="text-slate-500">Verified Contact:</span>
                    <span className="text-slate-900 font-semibold">{maskContact(inputValue)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="text-slate-500">Verification Time:</span>
                    <span className="text-slate-900 font-medium">
                      {new Date().toISOString().slice(0, 10)} 12:50:24 IST
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="text-slate-500">Security Clearance:</span>
                    <span className="text-emerald-700 font-semibold flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block mr-1.5"></span>
                      Authorized Session
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setAuthStep("role")}
                  className="w-full py-3 px-4 bg-[#7209b7] hover:bg-[#560bad] text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-200 cursor-pointer"
                >
                  <span>Continue to Role Selection</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Step 2 of 4 Complete
                  </span>
                  <span className="text-[11px] text-slate-400">Next: Role Selection</span>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* STEP 3: ROLE SELECTION (MATCHES APPROVED STITCH DESIGN)      */}
            {/* ============================================================ */}
            {authStep === "role" && (
              <div className="mt-5 animate-fade-in">
                {/* Heading block */}
                <div className="mb-6">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                    Select Your Role
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Choose how you will use Procure to continue.
                  </p>
                </div>

                {/* Role Selection Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* CARD 1: Government Procurement Officer */}
                  <div
                    onClick={() => setSelectedRole("officer")}
                    onKeyDown={(e) => {
                      if (e.key === " " || e.key === "Enter") setSelectedRole("officer");
                    }}
                    tabIndex={0}
                    role="radio"
                    aria-checked={selectedRole === "officer"}
                    className={`role-card-transition cursor-pointer relative flex flex-col justify-between p-5 rounded-xl border transition-all ${
                      selectedRole === "officer"
                        ? "border-[#7209b7] bg-purple-50/40 ring-2 ring-[#7209b7]/20 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                          Public Sector · GeM · BIS
                        </span>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                            selectedRole === "officer"
                              ? "border-[#7209b7] bg-[#7209b7]"
                              : "border-slate-300"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              selectedRole === "officer" ? "bg-white" : "bg-transparent"
                            }`}
                          ></span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mb-2.5">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
                          <span className="material-symbols-outlined text-xl">account_balance</span>
                        </div>
                        <h2 className="text-sm font-semibold text-slate-900 leading-snug">
                          Government Procurement Officer
                        </h2>
                      </div>
                      <p className="text-xs leading-relaxed text-slate-500">
                        For government departments, PSUs and procurement teams who create
                        procurement requirements, analyze tenders, identify applicable Indian
                        Standards and evaluate suppliers.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-[11px] text-slate-500 font-medium">
                      <span className="text-[#7209b7] font-semibold mr-1.5">•</span> Official
                      gov.in / nic.in authorized
                    </div>
                  </div>

                  {/* CARD 2: Supplier / Business */}
                  <div
                    onClick={() => setSelectedRole("supplier")}
                    onKeyDown={(e) => {
                      if (e.key === " " || e.key === "Enter") setSelectedRole("supplier");
                    }}
                    tabIndex={0}
                    role="radio"
                    aria-checked={selectedRole === "supplier"}
                    className={`role-card-transition cursor-pointer relative flex flex-col justify-between p-5 rounded-xl border transition-all ${
                      selectedRole === "supplier"
                        ? "border-[#2a9d8f] bg-teal-50/40 ring-2 ring-[#2a9d8f]/20 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          Verified Manufacturer & Vendor
                        </span>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                            selectedRole === "supplier"
                              ? "border-[#2a9d8f] bg-[#2a9d8f]"
                              : "border-slate-300"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              selectedRole === "supplier" ? "bg-white" : "bg-transparent"
                            }`}
                          ></span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mb-2.5">
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                          <span className="material-symbols-outlined text-xl">verified</span>
                        </div>
                        <h2 className="text-sm font-semibold text-slate-900 leading-snug">
                          Supplier / Business
                        </h2>
                      </div>
                      <p className="text-xs leading-relaxed text-slate-500">
                        For manufacturers, suppliers and businesses who provide products, submit
                        specifications, share certifications and respond to procurement
                        requirements.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-[11px] text-slate-500 font-medium">
                      <span className="text-[#2a9d8f] font-semibold mr-1.5">•</span> GSTIN /
                      MSME registered entities
                    </div>
                  </div>
                </div>

                {/* Continue Action Button */}
                <div>
                  <button
                    type="button"
                    disabled={!selectedRole}
                    onClick={() => {
                      if (!selectedRole) return;
                      setVerifySubStep(1);
                      setAuthStep("verify");
                    }}
                    className={`w-full py-3 px-6 rounded-lg text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                      selectedRole
                        ? "bg-[#7209b7] hover:bg-[#560bad] cursor-pointer shadow-sm focus:ring-2 focus:ring-purple-200"
                        : "bg-slate-300 cursor-not-allowed shadow-none"
                    }`}
                  >
                    <span>Continue to Verification</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                  <p className="text-xs text-slate-400 text-center mt-3">
                    You can easily toggle or request multi-role access later from your profile.
                  </p>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* STEP 4: ROLE-SPECIFIC 4-STEP VERIFICATION                    */}
            {/* ============================================================ */}
            {authStep === "verify" && selectedRole === "officer" && (
              <div className="mt-5 animate-fade-in">
                {/* Sub-Stepper Navigation Bar */}
                <div className="pb-4 mb-6 border-b border-slate-100">
                  <div className="flex items-center justify-between mb-2.5">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#7209b7]">
                        Stage 4 of 4
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">
                        Officer Verification
                        <span className="ml-2 text-xs font-normal text-slate-500">
                          (Step {verifySubStep} of 4)
                        </span>
                      </h3>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                      {Math.round((verifySubStep / 4) * 100)}% Completed
                    </span>
                  </div>

                  {/* Modern 4-segment progress track */}
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {[
                      { step: 1, name: "Identity" },
                      { step: 2, name: "Department" },
                      { step: 3, name: "Credentials" },
                      { step: 4, name: "Declaration" },
                    ].map((item) => (
                      <div key={item.step} className="flex flex-col gap-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            item.step < verifySubStep
                              ? "bg-[#2a9d8f]"
                              : item.step === verifySubStep
                              ? "bg-[#7209b7]"
                              : "bg-slate-100"
                          }`}
                        />
                        <span
                          className={`text-[11px] font-medium transition-colors ${
                            item.step === verifySubStep
                              ? "text-purple-700 font-bold"
                              : item.step < verifySubStep
                              ? "text-slate-700 font-semibold"
                              : "text-slate-400"
                          }`}
                        >
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* OFFICER STEP 1: Officer Details */}
                {verifySubStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Officer Details</h3>
                      <p className="text-xs text-slate-500">
                        Provide primary identity details for your officer account.
                      </p>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={officerData.fullName}
                          onChange={(e) =>
                            setOfficerData({ ...officerData, fullName: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#0f62fe]"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Official Mobile
                          </label>
                          <input
                            type="text"
                            value={officerData.mobile}
                            onChange={(e) =>
                              setOfficerData({ ...officerData, mobile: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#0f62fe]"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Official Email
                          </label>
                          <input
                            type="text"
                            value={officerData.email}
                            onChange={(e) =>
                              setOfficerData({ ...officerData, email: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#0f62fe]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Designation
                        </label>
                        <input
                          type="text"
                          value={officerData.designation}
                          onChange={(e) =>
                            setOfficerData({ ...officerData, designation: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#0f62fe]"
                        />
                      </div>
                    </div>

                    <div className="pt-3 flex justify-between">
                      <button
                        type="button"
                        onClick={() => setAuthStep("role")}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        Back to Role
                      </button>
                      <button
                        type="button"
                        onClick={() => setVerifySubStep(2)}
                        className="px-5 py-2 bg-[#0f62fe] text-white rounded-lg text-xs font-semibold hover:bg-[#0043ce] cursor-pointer"
                      >
                        Next: Employment Details →
                      </button>
                    </div>
                  </div>
                )}

                {/* OFFICER STEP 2: Employment Details */}
                {verifySubStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Employment Details</h3>
                      <p className="text-xs text-slate-500">
                        Specify official department and organization details.
                      </p>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Service / Employee ID
                          </label>
                          <input
                            type="text"
                            value={officerData.employeeId}
                            onChange={(e) =>
                              setOfficerData({ ...officerData, employeeId: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-[#0f62fe]"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Government Type
                          </label>
                          <select
                            value={officerData.govtType}
                            onChange={(e) =>
                              setOfficerData({ ...officerData, govtType: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#0f62fe]"
                          >
                            <option value="Central Government">Central Government</option>
                            <option value="State Government">State Government</option>
                            <option value="PSU / Public Sector">PSU / Public Sector</option>
                            <option value="Autonomous Body">Autonomous Body</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Ministry / Department
                        </label>
                        <input
                          type="text"
                          value={officerData.ministry}
                          onChange={(e) =>
                            setOfficerData({ ...officerData, ministry: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#0f62fe]"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Organization / Division
                        </label>
                        <input
                          type="text"
                          value={officerData.organization}
                          onChange={(e) =>
                            setOfficerData({ ...officerData, organization: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#0f62fe]"
                        />
                      </div>
                    </div>

                    <div className="pt-3 flex justify-between">
                      <button
                        type="button"
                        onClick={() => setVerifySubStep(1)}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        ← Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setVerifySubStep(3)}
                        className="px-5 py-2 bg-[#0f62fe] text-white rounded-lg text-xs font-semibold hover:bg-[#0043ce] cursor-pointer"
                      >
                        Next: Verify Contact →
                      </button>
                    </div>
                  </div>
                )}

                {/* OFFICER STEP 3: Official Contact Verification */}
                {verifySubStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Official Contact Verification
                      </h3>
                      <p className="text-xs text-slate-500">
                        Simulated prototype verification for official contact parameters.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-emerald-600 text-lg">
                            mark_email_read
                          </span>
                          <div>
                            <p className="font-semibold text-slate-900">Official Email</p>
                            <p className="text-slate-500 font-mono">{officerData.email}</p>
                          </div>
                        </div>
                        <span className="text-emerald-700 font-bold text-[11px] bg-white px-2 py-0.5 rounded border border-emerald-300">
                          Demo Verified ✓
                        </span>
                      </div>

                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-emerald-600 text-lg">
                            phonelink_ring
                          </span>
                          <div>
                            <p className="font-semibold text-slate-900">Official Mobile</p>
                            <p className="text-slate-500 font-mono">{officerData.mobile}</p>
                          </div>
                        </div>
                        <span className="text-emerald-700 font-bold text-[11px] bg-white px-2 py-0.5 rounded border border-emerald-300">
                          Demo Verified ✓
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 flex justify-between">
                      <button
                        type="button"
                        onClick={() => setVerifySubStep(2)}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        ← Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setVerifySubStep(4)}
                        className="px-5 py-2 bg-[#0f62fe] text-white rounded-lg text-xs font-semibold hover:bg-[#0043ce] cursor-pointer"
                      >
                        Next: Declaration →
                      </button>
                    </div>
                  </div>
                )}

                {/* OFFICER STEP 4: Declaration & Authorization */}
                {verifySubStep === 4 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Declaration & Authorization
                      </h3>
                      <p className="text-xs text-slate-500">
                        Review and accept mandatory user declarations before proceeding.
                      </p>
                    </div>

                    <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={officerData.declAccurate}
                          onChange={(e) =>
                            setOfficerData({ ...officerData, declAccurate: e.target.checked })
                          }
                          className="mt-0.5 rounded text-[#0f62fe] focus:ring-[#0f62fe]"
                        />
                        <span className="text-slate-700">
                          I confirm that the officer information provided above is accurate.
                        </span>
                      </label>
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={officerData.declAuthorized}
                          onChange={(e) =>
                            setOfficerData({ ...officerData, declAuthorized: e.target.checked })
                          }
                          className="mt-0.5 rounded text-[#0f62fe] focus:ring-[#0f62fe]"
                        />
                        <span className="text-slate-700">
                          I am authorized to use Procure for official procurement activities.
                        </span>
                      </label>
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={officerData.declHackathon}
                          onChange={(e) =>
                            setOfficerData({ ...officerData, declHackathon: e.target.checked })
                          }
                          className="mt-0.5 rounded text-[#0f62fe] focus:ring-[#0f62fe]"
                        />
                        <span className="text-slate-700">
                          I understand that Procure is a hackathon prototype and standards output
                          must be verified.
                        </span>
                      </label>
                    </div>

                    <div className="pt-3 flex justify-between">
                      <button
                        type="button"
                        onClick={() => setVerifySubStep(3)}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        ← Back
                      </button>
                      <button
                        type="button"
                        disabled={
                          !officerData.declAccurate ||
                          !officerData.declAuthorized ||
                          !officerData.declHackathon
                        }
                        onClick={() => setAuthStep("verify-success")}
                        className="px-5 py-2 bg-[#0f62fe] hover:bg-[#0043ce] text-white rounded-lg text-xs font-semibold disabled:opacity-50 cursor-pointer"
                      >
                        Complete Verification
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SUPPLIER 4-STEP VERIFICATION */}
            {authStep === "verify" && selectedRole === "supplier" && (
              <div className="mt-5 animate-fade-in">
                {/* Sub-Stepper Navigation Bar */}
                <div className="pb-4 mb-6 border-b border-slate-100">
                  <div className="flex items-center justify-between mb-2.5">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#2a9d8f]">
                        Stage 4 of 4
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">
                        Supplier Verification
                        <span className="ml-2 text-xs font-normal text-slate-500">
                          (Step {verifySubStep} of 4)
                        </span>
                      </h3>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                      {Math.round((verifySubStep / 4) * 100)}% Completed
                    </span>
                  </div>

                  {/* Modern 4-segment progress track */}
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {[
                      { step: 1, name: "Identity" },
                      { step: 2, name: "Operations" },
                      { step: 3, name: "Compliance" },
                      { step: 4, name: "Declaration" },
                    ].map((item) => (
                      <div key={item.step} className="flex flex-col gap-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            item.step < verifySubStep
                              ? "bg-[#2a9d8f]"
                              : item.step === verifySubStep
                              ? "bg-[#2a9d8f]"
                              : "bg-slate-100"
                          }`}
                        />
                        <span
                          className={`text-[11px] font-medium transition-colors ${
                            item.step === verifySubStep
                              ? "text-[#2a9d8f] font-bold"
                              : item.step < verifySubStep
                              ? "text-slate-700 font-semibold"
                              : "text-slate-400"
                          }`}
                        >
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SUPPLIER STEP 1: Business Identity */}
                {verifySubStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Business Identity</h3>
                      <p className="text-xs text-slate-500">
                        Enter registered business details for your vendor profile.
                      </p>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Legal Business Name
                        </label>
                        <input
                          type="text"
                          value={supplierData.businessName}
                          onChange={(e) =>
                            setSupplierData({ ...supplierData, businessName: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#0f62fe]"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Business Type
                          </label>
                          <select
                            value={supplierData.businessType}
                            onChange={(e) =>
                              setSupplierData({ ...supplierData, businessType: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#0f62fe]"
                          >
                            <option value="Manufacturer">Manufacturer</option>
                            <option value="Supplier / Vendor">Supplier / Vendor</option>
                            <option value="Distributor">Distributor</option>
                            <option value="MSME Unit">MSME Unit</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Business Email
                          </label>
                          <input
                            type="text"
                            value={supplierData.email}
                            onChange={(e) =>
                              setSupplierData({ ...supplierData, email: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#0f62fe]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Registered Address
                        </label>
                        <input
                          type="text"
                          value={supplierData.address}
                          onChange={(e) =>
                            setSupplierData({ ...supplierData, address: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#0f62fe]"
                        />
                      </div>
                    </div>

                    <div className="pt-3 flex justify-between">
                      <button
                        type="button"
                        onClick={() => setAuthStep("role")}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        Back to Role
                      </button>
                      <button
                        type="button"
                        onClick={() => setVerifySubStep(2)}
                        className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
                      >
                        Next: Identification →
                      </button>
                    </div>
                  </div>
                )}

                {/* SUPPLIER STEP 2: Business Identification */}
                {verifySubStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Business Identification</h3>
                      <p className="text-xs text-slate-500">
                        Provide tax and registration identifiers for certification check.
                      </p>
                    </div>

                    <div className="space-y-3 text-xs font-mono">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1 font-sans">
                            PAN Number
                          </label>
                          <input
                            type="text"
                            value={supplierData.pan}
                            onChange={(e) =>
                              setSupplierData({ ...supplierData, pan: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#0f62fe]"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1 font-sans">
                            GSTIN
                          </label>
                          <input
                            type="text"
                            value={supplierData.gstin}
                            onChange={(e) =>
                              setSupplierData({ ...supplierData, gstin: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#0f62fe]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1 font-sans">
                          MSME Udyam Registration Number
                        </label>
                        <input
                          type="text"
                          value={supplierData.msmeNumber}
                          onChange={(e) =>
                            setSupplierData({ ...supplierData, msmeNumber: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#0f62fe]"
                        />
                      </div>
                    </div>

                    <div className="pt-3 flex justify-between">
                      <button
                        type="button"
                        onClick={() => setVerifySubStep(1)}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        ← Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setVerifySubStep(3)}
                        className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
                      >
                        Next: Authorized Person →
                      </button>
                    </div>
                  </div>
                )}

                {/* SUPPLIER STEP 3: Authorized Person */}
                {verifySubStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Authorized Person</h3>
                      <p className="text-xs text-slate-500">
                        Details of the representative managing the supplier account.
                      </p>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Authorized Representative Name
                        </label>
                        <input
                          type="text"
                          value={supplierData.authPersonName}
                          onChange={(e) =>
                            setSupplierData({ ...supplierData, authPersonName: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#0f62fe]"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Designation
                        </label>
                        <input
                          type="text"
                          value={supplierData.designation}
                          onChange={(e) =>
                            setSupplierData({ ...supplierData, designation: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#0f62fe]"
                        />
                      </div>
                    </div>

                    <div className="pt-3 flex justify-between">
                      <button
                        type="button"
                        onClick={() => setVerifySubStep(2)}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        ← Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setVerifySubStep(4)}
                        className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
                      >
                        Next: Declaration →
                      </button>
                    </div>
                  </div>
                )}

                {/* SUPPLIER STEP 4: Declaration & Consent */}
                {verifySubStep === 4 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Declaration & Consent</h3>
                      <p className="text-xs text-slate-500">
                        Review vendor agreements and consent terms.
                      </p>
                    </div>

                    <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={supplierData.declAccurate}
                          onChange={(e) =>
                            setSupplierData({ ...supplierData, declAccurate: e.target.checked })
                          }
                          className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-slate-700">
                          I confirm that the business information provided is accurate.
                        </span>
                      </label>
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={supplierData.declAuthorized}
                          onChange={(e) =>
                            setSupplierData({ ...supplierData, declAuthorized: e.target.checked })
                          }
                          className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-slate-700">
                          I am authorized to represent this business on Procure.
                        </span>
                      </label>
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={supplierData.declHackathon}
                          onChange={(e) =>
                            setSupplierData({ ...supplierData, declHackathon: e.target.checked })
                          }
                          className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-slate-700">
                          I understand that Procure is a hackathon prototype.
                        </span>
                      </label>
                    </div>

                    <div className="pt-3 flex justify-between">
                      <button
                        type="button"
                        onClick={() => setVerifySubStep(3)}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        ← Back
                      </button>
                      <button
                        type="button"
                        disabled={
                          !supplierData.declAccurate ||
                          !supplierData.declAuthorized ||
                          !supplierData.declHackathon
                        }
                        onClick={() => setAuthStep("verify-success")}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50 cursor-pointer"
                      >
                        Complete Verification
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================ */}
            {/* STEP 4 COMPLETE: VERIFICATION SUCCESS                        */}
            {/* ============================================================ */}
            {authStep === "verify-success" && (
              <div className="mt-4 text-center py-4 animate-fade-in">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-pop shadow-xs">
                  <span className="material-symbols-outlined text-3xl font-bold">check_circle</span>
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-[#161616] mb-1">
                  {selectedRole === "officer"
                    ? "Officer Verification Complete"
                    : "Supplier Verification Complete"}
                </h2>
                <p className="text-xs text-[#525252] mb-6 leading-relaxed">
                  Your Procure account setup and node authorization are complete.
                </p>

                <div className="bg-[#f8f9fa] border border-[#e0e0e0] rounded-lg p-3 text-xs text-left mb-6 space-y-1.5 font-mono">
                  <div className="flex justify-between text-[#525252]">
                    <span>Selected Role:</span>
                    <span className="text-[#161616] font-semibold">
                      {selectedRole === "officer"
                        ? "Government Procurement Officer"
                        : "Supplier / Business"}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#525252]">
                    <span>Authorized Contact:</span>
                    <span className="text-[#161616] font-medium">{maskContact(inputValue)}</span>
                  </div>
                  <div className="flex justify-between text-[#525252]">
                    <span>Verification Status:</span>
                    <span className="text-emerald-700 font-bold flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block mr-1"></span>
                      Demo Authorized Active Node
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCompleteAndGoToDashboard}
                  className="w-full py-3.5 px-6 bg-[#0f62fe] hover:bg-[#0043ce] text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <span>Continue to Procure Dashboard</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              </div>
            )}
          </div>
        </main>

        {/* Sub-footer info */}
        <div className="w-full py-2.5 px-6 text-center text-[11px] text-[#8d8d8d] font-mono border-t border-[#e0e0e0]/70 bg-white/50">
          Ministry of Consumer Affairs, Food & Public Distribution • Bureau of Indian Standards (BIS) Portal
        </div>
      </section>
    </div>
  );
}
