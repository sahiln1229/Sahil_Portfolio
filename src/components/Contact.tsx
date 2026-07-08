"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Github, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error ?? "Something went wrong.");
      }

      setIsSubmitted(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      alert("Message Sent!");
    } catch (error) {
      console.log(error);
      alert("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 relative overflow-hidden flex items-center justify-center">
      <motion.div
        className="max-w-4xl mx-auto px-6 w-full"
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
            Let&apos;s discuss layout ideas or potential projects to build together.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Contact Information */}
          <div className="md:col-span-2 space-y-8 flex flex-col justify-center">
            <h3 className="text-2xl font-bold text-white">Let&apos;s Connect</h3>
            <p className="text-gray-400 text-base leading-relaxed">
              If you have any questions, feel free to drop a message or reach out on socials.
            </p>
            
            <div className="space-y-5">
              <a
                href="mailto:sahilnarkar.dev@gmail.com"
                className="flex items-center gap-5 p-5 rounded-2xl border border-white/5 bg-gradient-to-br from-white/3 to-transparent backdrop-blur-md group hover:border-white/10"
              >
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                  <Mail size={22} />
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-0.5">Email Me</p>
                  <p className="text-gray-100 text-base font-medium group-hover:text-blue-400 transition-colors">
                    sahilnarkar.dev@gmail.com
                  </p>
                </div>
              </a>

              <a
                href="https://github.com/sahiln1229"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-5 p-5 rounded-2xl border border-white/5 bg-gradient-to-br from-white/3 to-transparent backdrop-blur-md group hover:border-white/10"
              >
                <div className="p-3 rounded-xl bg-slate-500/10 text-gray-400 group-hover:scale-110 transition-transform">
                  <Github size={22} />
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-0.5">GitHub Profile</p>
                  <p className="text-gray-100 text-base font-medium group-hover:text-white transition-colors">
                    github.com/sahiln1229
                  </p>
                </div>
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-3">
            <form onSubmit={handleSubmit} className="p-8 md:p-10 rounded-3xl border border-gray-100 dark:border-white/5 bg-white/80 dark:bg-[#080B16]/60 backdrop-blur-md shadow-lg dark:shadow-2xl space-y-5 relative group">
              <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl -z-10" />

              <div>
                <label className="block text-gray-400 text-sm font-semibold mb-2 pl-1">Name</label>
                <Input
                  required
                  placeholder="John Doe"
                  className="bg-white/5 border-white/5 h-12 text-base text-white placeholder:text-gray-600 focus-visible:ring-blue-500/30 rounded-xl"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-semibold mb-2 pl-1">Email</label>
                <Input
                  required
                  placeholder="john@example.com"
                  className="bg-white/5 border-white/5 h-12 text-base text-white placeholder:text-gray-600 focus-visible:ring-blue-500/30 rounded-xl"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-semibold mb-2 pl-1">Subject</label>
                <Input
                  required
                  placeholder="Project inquiry"
                  className="bg-white/5 border-white/5 h-12 text-base text-white placeholder:text-gray-600 focus-visible:ring-blue-500/30 rounded-xl"
                  type="text"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-semibold mb-2 pl-1">Message</label>
                <Textarea
                  required
                  placeholder="Tell me about your project..."
                  rows={4}
                  className="bg-white/5 border-white/5 text-base text-white placeholder:text-gray-600 focus-visible:ring-blue-500/30 rounded-xl p-4"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || isSubmitted}
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-2 group transition-all duration-300 text-base"
              >
                {isSubmitting ? (
                  <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : isSubmitted ? (
                  "Message Sent!"
                ) : (
                  <>
                    Send Message
                    <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
