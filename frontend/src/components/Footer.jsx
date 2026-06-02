import React from "react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import {
  Music2,
  Facebook,
  Twitter,
  Youtube,
  Instagram
} from "lucide-react";

export default function Footer() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <motion.footer 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 1,
        delay: 0.4,
        ease: "easeOut"
      }}
      className="liquid-glass w-full rounded-3xl p-6 md:p-10 text-slate-700 mt-32 md:mt-64 max-w-7xl mx-auto z-[10] border border-slate-200 shadow-lg"
    >
      <div className="grid grid-cols-12 gap-8 md:gap-12 pb-12 border-b border-slate-200">
        <div className="col-span-12 md:col-span-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-full border border-slate-900/10 flex items-center justify-center bg-white shadow-sm">
              <span className="text-slate-800 font-bold text-[10px] tracking-widest uppercase font-mono">EM</span>
            </div>
            <span className="text-xs font-bold text-slate-800 tracking-[0.25em] uppercase">EASYMART ECOSYSTEM</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed font-light tracking-wide">
            Designing future systems for inventory synchronization, relational transactions, and live database synchronizations.
          </p>
          <div className="text-[9px] text-slate-400 font-semibold uppercase tracking-[0.2em] pt-4">
            Curated by @GotInGeorgiG
          </div>
        </div>

        <div className="col-span-12 md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h4 className="text-[9px] font-bold text-slate-800 uppercase tracking-[0.25em]">Discover</h4>
            <ul className="space-y-2 text-[10px] tracking-wide">
              {["Labs & Workshops", "Deep Dive Series", "Global Circle", "Resource Vault", "Future Roadmap"].map(link => (
                <li key={link} className="hover:text-slate-900 cursor-pointer transition-colors duration-500 font-light">{link}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-[9px] font-bold text-slate-800 uppercase tracking-[0.25em]">The Mission</h4>
            <ul className="space-y-2 text-[10px] tracking-wide">
              {["Origin Story", "The Collective", "Newsroom Hub", "Join the Team"].map(link => (
                <li key={link} className="hover:text-slate-900 cursor-pointer transition-colors duration-500 font-light">{link}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-[9px] font-bold text-slate-800 uppercase tracking-[0.25em]">Concierge</h4>
            <ul className="space-y-2 text-[10px] tracking-wide">
              {["Get in Touch", "Legal Privacy", "User Agreement", "Report Concern"].map(link => (
                <li key={link} className="hover:text-slate-900 cursor-pointer transition-colors duration-500 font-light">{link}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center pt-8 gap-4">
        <span className="text-[9px] text-slate-400 uppercase tracking-[0.15em] font-semibold">
          © 2026 EasyMart Digital Ecosystem. All system registries synced.
        </span>

        <div className="flex items-center gap-6">
          <span className="text-[9px] text-slate-400 uppercase tracking-[0.2em] font-bold">
            Join the Journey:
          </span>
          <div className="flex items-center gap-4 text-slate-400">
            {[
              { icon: Music2, link: "#" },
              { icon: Facebook, link: "#" },
              { icon: Twitter, link: "#" },
              { icon: Youtube, link: "#" },
              { icon: Instagram, link: "#" }
            ].map((item, index) => (
              <a 
                key={index}
                href={item.link} 
                className="hover:text-slate-900 hover:opacity-100 transition-all duration-500"
              >
                <item.icon className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
