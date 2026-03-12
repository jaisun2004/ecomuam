import React from "react";
import { motion } from "framer-motion";
import PanelCard from "@/components/sw/PanelCard";
import { MapPin, CheckCircle2 } from "lucide-react";
import type { ViewProps } from "@/pages/Index";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const offlineIdeas = [
  {
    channel: "Gym Partnerships",
    type: "In-Gym Sampling + Posters",
    cities: ["Delhi NCR", "Mumbai", "Bangalore", "Hyderabad"],
    rationale: "78% of energy drink buyers are gym-goers. Sampling at gym chains converts at 12%. Focus on Gold's Gym, Cult.fit, Anytime Fitness.",
  },
  {
    channel: "Metro / Transit Ads",
    type: "Delhi Metro + Mumbai Local",
    cities: ["Delhi NCR", "Mumbai"],
    rationale: "Transit ads drive measurable search lift within 48 hours. Commuter demographic matches perfectly. Target morning rush hours.",
  },
  {
    channel: "College Campus Events",
    type: "Sampling + Gaming Events",
    cities: ["Delhi NCR", "Bangalore", "Pune", "Hyderabad"],
    rationale: "College students are the fastest growing energy drink segment. Gaming events and exam season drive high trial rates.",
  },
  {
    channel: "Podcast Sponsorships",
    type: "Fitness & Gaming Podcasts",
    cities: ["Digital — Pan-India"],
    rationale: "Podcast listeners have 2.4x higher purchase intent. Limited competition in energy drink podcast sponsorship in India.",
  },
];

const cityOpportunities = [
  { city: "Delhi NCR", onlineShare: "34%", potential: "HIGH", ideas: ["Gym partnerships at 200+ gyms", "Metro ads on Blue Line", "DU campus activations"] },
  { city: "Mumbai", onlineShare: "28%", potential: "HIGH", ideas: ["Local train wraps", "Gym sampling at CrossFit boxes", "Marine Drive event sponsorship"] },
  { city: "Bangalore", onlineShare: "22%", potential: "MEDIUM", ideas: ["Tech park vending machines", "Gym partnerships", "Gaming café sampling"] },
  { city: "Hyderabad", onlineShare: "15%", potential: "MEDIUM", ideas: ["Gym partnerships", "College campus events", "HITEC City transit ads"] },
  { city: "Pune", onlineShare: "12%", potential: "MEDIUM", ideas: ["College fest sponsorships", "FC Road cafe partnerships"] },
];

const OfflineAdsView: React.FC<ViewProps> = () => {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 pb-20">
      {/* Why Offline */}
      <motion.div variants={fadeUp}>
        <div className="p-5 rounded-2xl bg-gradient-to-r from-sw-green/10 to-primary/10 border border-sw-green/20">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 size={20} className="text-sw-green" />
            <h3 className="font-display font-bold text-foreground">Online Ads — All Systems Healthy</h3>
          </div>
          <p className="text-xs text-muted-foreground">All online KPIs within target range. Consider offline advertising to drive incremental awareness and trial that online can't capture.</p>
        </div>
      </motion.div>

      {/* Channel Ideas */}
      <motion.div variants={fadeUp}>
        <PanelCard title="Offline Channel Ideas" badge="Strategic suggestions" badgeColor="primary" delay={0}>
          <div className="grid grid-cols-2 gap-4">
            {offlineIdeas.map((ch) => (
              <div key={ch.channel} className="p-4 rounded-xl bg-surface-2 border border-subtle">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground font-medium">{ch.channel}</span>
                  <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary">{ch.type}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mb-3">{ch.rationale}</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {ch.cities.map(c => (
                    <span key={c} className="text-[9px] px-1.5 py-0.5 rounded bg-surface-3 text-muted-foreground flex items-center gap-0.5">
                      <MapPin size={8} />{c}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </PanelCard>
      </motion.div>

      {/* City Opportunities */}
      <motion.div variants={fadeUp}>
        <PanelCard title="City-wise Opportunities" badge="Location intelligence" badgeColor="amber" delay={0}>
          <div className="space-y-3">
            {cityOpportunities.map((c) => (
              <div key={c.city} className="p-4 rounded-xl bg-surface-2 border border-subtle">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground font-medium flex items-center gap-1.5">
                    <MapPin size={14} className="text-primary" />
                    {c.city}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">Online share: <span className="font-mono text-foreground">{c.onlineShare}</span></span>
                    <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${
                      c.potential === "HIGH" ? "bg-sw-green-dim text-sw-green" : "bg-sw-amber-dim text-sw-amber"
                    }`}>{c.potential}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {c.ideas.map((idea) => (
                    <span key={idea} className="text-[10px] px-2 py-1 rounded-lg bg-surface-3 text-muted-foreground">{idea}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </PanelCard>
      </motion.div>
    </motion.div>
  );
};

export default OfflineAdsView;
