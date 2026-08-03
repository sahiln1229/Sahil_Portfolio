"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Github, Linkedin, MapPin, Globe, Send, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Turnstile } from "@marsidev/react-turnstile";

interface ValidationErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");

  // Validation states
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Cloudflare Turnstile key
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Client-side Validation Helper
  const validateField = (field: string, value: string): string => {
    if (field === "name") {
      if (!value.trim()) return "Full Name is required.";
      if (value.trim().length < 3) return "Name must be at least 3 characters.";
    }
    if (field === "email") {
      if (!value.trim()) return "Email address is required.";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return "Please enter a valid email address.";
    }
    if (field === "subject") {
      if (!value.trim()) return "Subject is required.";
      if (value.trim().length < 5) return "Subject must be at least 5 characters.";
    }
    if (field === "message") {
      if (!value.trim()) return "Message is required.";
      if (value.trim().length < 20) return "Message must be at least 20 characters.";
    }
    return "";
  };

  const handleBlur = (field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errorMsg = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: errorMsg }));
  };

  const handleChange = (field: string, value: string) => {
    // Update raw value
    if (field === "name") setName(value);
    if (field === "email") setEmail(value);
    if (field === "subject") setSubject(value);
    if (field === "message") setMessage(value);

    // If field has been touched, validate on the fly
    if (touched[field]) {
      const errorMsg = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: errorMsg }));
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = { name: true, email: true, subject: true, message: true };
    setTouched(allTouched);

    // Validate all fields
    const nameErr = validateField("name", name);
    const emailErr = validateField("email", email);
    const subjectErr = validateField("subject", subject);
    const messageErr = validateField("message", message);

    const validationErrors = {
      name: nameErr || undefined,
      email: emailErr || undefined,
      subject: subjectErr || undefined,
      message: messageErr || undefined,
    };

    setErrors(validationErrors);

    // Check if any errors exist
    if (nameErr || emailErr || subjectErr || messageErr) {
      showToast("❌ Please fix validation errors in the form.", "error");
      return;
    }

    // Verify Turnstile Token if Site Key is set
    if (siteKey && !turnstileToken) {
      showToast("❌ Spam check is required. Please verify.", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiBaseUrl}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
          turnstileToken,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? "Failed to send message.");
      }

      showToast("✅ Message sent successfully.", "success");
      setIsSubmitted(true);

      // Reset form fields
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setTurnstileToken("");
      setTouched({});
      setErrors({});

      // Auto-hide success state after 4 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 4000);

    } catch (error: any) {
      console.error("Submission error:", error);
      showToast(`❌ ${error.message || "Failed to send message. Please try again."}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // SVGs for checkmark draw animation
  const checkmarkVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay: 0.2, type: "spring", stiffness: 100, damping: 15 },
        opacity: { delay: 0.2, duration: 0.1 }
      }
    }
  } as const;

  return (
    <section id="contact" className="py-24 relative overflow-hidden flex items-center justify-center">
      {/* Background radial highlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(37,99,235,0.1),transparent_50%)] pointer-events-none" />

      <motion.div
        className="max-w-6xl mx-auto px-6 w-full relative z-10"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col items-start text-left mb-16">
          <h2 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 mb-4 tracking-tight">
            Get In Touch
          </h2>
          <p className="text-gray-400 max-w-2xl text-base md:text-lg">
            Let&apos;s discuss ideas, layouts, or potential projects to build together. I am always open to new opportunities!
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8 items-stretch">
          {/* Contact Information Column */}
          <div className="md:col-span-2 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white tracking-tight">Let&apos;s Connect</h3>
              <p className="text-gray-400 text-base leading-relaxed">
                If you have any questions, feel free to drop a message through the contact form or reach out via my direct links.
              </p>
            </div>
            
            <div className="space-y-4 py-4">
              {/* Email Card */}
              <a
                href="mailto:sahilnarkar.dev@gmail.com"
                className="flex items-center gap-5 p-5 rounded-2xl border border-white/5 bg-gradient-to-br from-white/3 to-transparent backdrop-blur-md group hover:border-blue-500/30 transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.1)]"
              >
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform duration-300">
                  <Mail size={22} />
                </div>
                <div className="min-w-0">
                  <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-0.5">Email Me</p>
                  <p className="text-gray-100 text-base font-medium truncate group-hover:text-blue-400 transition-colors">
                    sahilnarkar.dev@gmail.com
                  </p>
                </div>
              </a>

              {/* Location Card */}
              <div className="flex items-center gap-5 p-5 rounded-2xl border border-white/5 bg-gradient-to-br from-white/3 to-transparent backdrop-blur-md group hover:border-slate-500/20 transition-all duration-300">
                <div className="p-3 rounded-xl bg-red-500/10 text-red-400">
                  <MapPin size={22} />
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-0.5">Location</p>
                  <p className="text-gray-100 text-base font-medium">
                    Mumbai, Maharashtra, India
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              {/* GitHub Link */}
              <a
                href="https://github.com/sahiln1229"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="flex-1 flex justify-center items-center p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 text-gray-300 hover:text-white transition-all duration-300"
              >
                <Github size={20} />
              </a>

              {/* LinkedIn Link */}
              <a
                href="https://www.linkedin.com/in/sahil-narkar-4a842b277"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="flex-1 flex justify-center items-center p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-blue-600/10 hover:border-blue-500/30 text-gray-300 hover:text-blue-400 transition-all duration-300"
              >
                <Linkedin size={20} />
              </a>

              {/* Portfolio Link */}
              <a
                href="https://sahilnarkar.dev"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Portfolio"
                className="flex-1 flex justify-center items-center p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-emerald-600/10 hover:border-emerald-500/30 text-gray-300 hover:text-emerald-400 transition-all duration-300"
              >
                <Globe size={20} />
              </a>
            </div>
          </div>

          {/* Contact Form Column */}
          <div className="md:col-span-3 relative flex items-stretch">
            <div className="w-full p-8 md:p-10 rounded-3xl border border-gray-100 dark:border-white/5 bg-white/80 dark:bg-[#080B16]/60 backdrop-blur-md shadow-lg dark:shadow-2xl flex flex-col justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500 blur-3xl -z-10" />

              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  <motion.form
                    key="contact-form"
                    onSubmit={handleSubmit}
                    className="space-y-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Name Input */}
                    <div className="relative w-full group/field">
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        onBlur={(e) => handleBlur("name", e.target.value)}
                        placeholder=" "
                        disabled={isSubmitting}
                        className={`peer w-full bg-white/5 border rounded-xl px-4 pt-6 pb-2 text-white placeholder-transparent focus:outline-none focus:ring-3 transition-all duration-300 h-14 ${
                          errors.name
                            ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/10"
                            : "border-white/10 focus:border-blue-500 focus:ring-blue-500/10"
                        }`}
                      />
                      <label
                        htmlFor="name"
                        className="absolute left-4 top-4 text-gray-400 pointer-events-none transition-all duration-300 origin-left transform -translate-y-3.5 scale-75 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3.5 peer-focus:scale-75 peer-focus:text-blue-400"
                      >
                        Full Name
                      </label>
                      <AnimatePresence>
                        {errors.name && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-red-400 text-xs mt-1.5 pl-1 flex items-center gap-1 font-medium"
                          >
                            <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
                            {errors.name}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Email Input */}
                    <div className="relative w-full group/field">
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        onBlur={(e) => handleBlur("email", e.target.value)}
                        placeholder=" "
                        disabled={isSubmitting}
                        className={`peer w-full bg-white/5 border rounded-xl px-4 pt-6 pb-2 text-white placeholder-transparent focus:outline-none focus:ring-3 transition-all duration-300 h-14 ${
                          errors.email
                            ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/10"
                            : "border-white/10 focus:border-blue-500 focus:ring-blue-500/10"
                        }`}
                      />
                      <label
                        htmlFor="email"
                        className="absolute left-4 top-4 text-gray-400 pointer-events-none transition-all duration-300 origin-left transform -translate-y-3.5 scale-75 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3.5 peer-focus:scale-75 peer-focus:text-blue-400"
                      >
                        Email Address
                      </label>
                      <AnimatePresence>
                        {errors.email && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-red-400 text-xs mt-1.5 pl-1 flex items-center gap-1 font-medium"
                          >
                            <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
                            {errors.email}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Subject Input */}
                    <div className="relative w-full group/field">
                      <input
                        type="text"
                        id="subject"
                        value={subject}
                        onChange={(e) => handleChange("subject", e.target.value)}
                        onBlur={(e) => handleBlur("subject", e.target.value)}
                        placeholder=" "
                        disabled={isSubmitting}
                        className={`peer w-full bg-white/5 border rounded-xl px-4 pt-6 pb-2 text-white placeholder-transparent focus:outline-none focus:ring-3 transition-all duration-300 h-14 ${
                          errors.subject
                            ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/10"
                            : "border-white/10 focus:border-blue-500 focus:ring-blue-500/10"
                        }`}
                      />
                      <label
                        htmlFor="subject"
                        className="absolute left-4 top-4 text-gray-400 pointer-events-none transition-all duration-300 origin-left transform -translate-y-3.5 scale-75 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3.5 peer-focus:scale-75 peer-focus:text-blue-400"
                      >
                        Subject
                      </label>
                      <AnimatePresence>
                        {errors.subject && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-red-400 text-xs mt-1.5 pl-1 flex items-center gap-1 font-medium"
                          >
                            <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
                            {errors.subject}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Message Textarea */}
                    <div className="relative w-full group/field">
                      <textarea
                        id="message"
                        value={message}
                        onChange={(e) => handleChange("message", e.target.value)}
                        onBlur={(e) => handleBlur("message", e.target.value)}
                        placeholder=" "
                        rows={4}
                        disabled={isSubmitting}
                        className={`peer w-full bg-white/5 border rounded-xl px-4 pt-6 pb-3 text-white placeholder-transparent focus:outline-none focus:ring-3 transition-all duration-300 min-h-36 ${
                          errors.message
                            ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/10"
                            : "border-white/10 focus:border-blue-500 focus:ring-blue-500/10"
                        }`}
                      />
                      <label
                        htmlFor="message"
                        className="absolute left-4 top-4 text-gray-400 pointer-events-none transition-all duration-300 origin-left transform -translate-y-3.5 scale-75 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3.5 peer-focus:scale-75 peer-focus:text-blue-400"
                      >
                        Tell me about your project...
                      </label>
                      <AnimatePresence>
                        {errors.message && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-red-400 text-xs mt-1.5 pl-1 flex items-center gap-1 font-medium"
                          >
                            <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
                            {errors.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Turnstile Widget */}
                    {siteKey && (
                      <div className="flex justify-center border border-white/5 p-3 rounded-2xl bg-white/3">
                        <Turnstile
                          siteKey={siteKey}
                          onSuccess={(token) => setTurnstileToken(token)}
                          onError={() => {
                            showToast("Spam check failed. Please reload page.", "error");
                            setTurnstileToken("");
                          }}
                          onExpire={() => setTurnstileToken("")}
                        />
                      </div>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-14 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-2 group transition-all duration-300 text-base shadow-[0_4px_20px_rgba(37,99,235,0.3)] hover:shadow-[0_4px_25px_rgba(37,99,235,0.5)] active:scale-98"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                          Sending Message...
                        </>
                      ) : (
                        <>
                          Send Message
                          <Send size={18} className="group-hover:translate-x-1.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                        </>
                      )}
                    </Button>
                  </motion.form>
                ) : (
                  // Success State & Animation
                  <motion.div
                    key="success-state"
                    className="flex flex-col items-center justify-center py-12 text-center"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="mb-6 relative flex items-center justify-center w-24 h-24">
                      {/* Growing circles background */}
                      <motion.div 
                        className="absolute inset-0 bg-green-500/20 rounded-full"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      />
                      {/* Drawing checkmark SVG */}
                      <svg width="80" height="80" viewBox="0 0 100 100" className="text-green-500 z-10 relative">
                        <motion.circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="6"
                          fill="transparent"
                          variants={checkmarkVariants}
                          initial="hidden"
                          animate="visible"
                        />
                        <motion.path
                          d="M30 50 L45 65 L70 35"
                          stroke="currentColor"
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="transparent"
                          variants={checkmarkVariants}
                          initial="hidden"
                          animate="visible"
                        />
                      </svg>
                    </div>
                    <motion.h4 
                      className="text-2xl font-bold text-white mb-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
                    >
                      Message Sent Successfully!
                    </motion.h4>
                    <motion.p 
                      className="text-gray-400 max-w-sm"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: 0.6 } }}
                    >
                      Thank you for contacting me. I have sent a confirmation email to you and will respond shortly.
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Global Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`fixed bottom-6 right-6 z-50 flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl max-w-sm w-[90%] md:w-auto ${
              toast.type === "success"
                ? "bg-slate-900/90 border-green-500/30 text-white shadow-green-500/5"
                : "bg-slate-900/90 border-red-500/30 text-white shadow-red-500/5"
            }`}
          >
            <div className="flex items-center gap-3 text-sm md:text-base">
              {toast.type === "success" ? (
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500/10 text-green-400">
                  <Check size={14} strokeWidth={3} />
                </div>
              ) : (
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500/10 text-red-400 font-bold">
                  ❌
                </div>
              )}
              <span className="font-medium text-gray-100">{toast.message}</span>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-gray-400 hover:text-white transition-colors duration-200"
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
