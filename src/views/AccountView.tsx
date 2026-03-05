import React, { useState } from "react";

const platforms = [
  { name: "Amazon Seller Central", status: "LIVE", color: "text-sw-green bg-sw-green-dim" },
  { name: "Blinkit Brand Portal", status: "LIVE", color: "text-sw-green bg-sw-green-dim" },
  { name: "Flipkart Seller Hub", status: "LIVE", color: "text-sw-green bg-sw-green-dim" },
  { name: "Zepto Brand Portal", status: "SYNCING", color: "text-sw-amber bg-sw-amber-dim" },
  { name: "Meesho · Myntra", status: "connect", color: "" },
];

const AccountView: React.FC = () => {
  const [connecting, setConnecting] = useState<string | null>(null);

  return (
    <div className="max-w-[800px] mx-auto pt-10 pb-20 space-y-6">
      <h2 className="font-display font-bold text-xl text-foreground opacity-0 animate-fade-slide-in">Account Settings</h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface-1 border border-subtle rounded-2xl p-6 opacity-0 animate-fade-slide-in" style={{ animationDelay: "0.05s" }}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-sw-purple flex items-center justify-center">
              <span className="font-mono text-lg text-primary-foreground font-medium">AM</span>
            </div>
            <div>
              <p className="text-foreground font-display font-bold">Anand Mehta</p>
              <p className="text-xs text-muted-foreground">E-commerce Head · MuscleMax India</p>
            </div>
          </div>
          <table className="w-full text-xs">
            <tbody>
              <tr><td className="py-2 text-muted-foreground">Plan</td><td className="py-2 text-right"><span className="text-sw-green font-mono">Pro · ₹24,999/mo</span></td></tr>
              <tr><td className="py-2 text-muted-foreground">SKUs Tracked</td><td className="py-2 text-right font-mono text-foreground">48 / 100</td></tr>
              <tr><td className="py-2 text-muted-foreground">Team Members</td><td className="py-2 text-right text-foreground">6 users</td></tr>
              <tr><td className="py-2 text-muted-foreground">Data Refresh</td><td className="py-2 text-right"><span className="text-sw-green">Every 15 min</span></td></tr>
            </tbody>
          </table>
        </div>

        <div className="bg-surface-1 border border-subtle rounded-2xl p-6 opacity-0 animate-fade-slide-in" style={{ animationDelay: "0.1s" }}>
          <h3 className="font-display font-semibold text-sm text-foreground mb-4">Connected Platforms</h3>
          <div className="space-y-3">
            {platforms.map((p) => (
              <div key={p.name} className="flex items-center justify-between py-2 border-b border-subtle last:border-0">
                <span className="text-xs text-foreground">{p.name}</span>
                {p.status === "connect" ? (
                  <button
                    onClick={() => setConnecting(p.name)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all ${
                      connecting === p.name
                        ? "bg-sw-green-dim text-sw-green"
                        : "border border-primary/30 text-primary hover:bg-primary/10"
                    }`}
                  >
                    {connecting === p.name ? "✓ Connecting..." : "Connect"}
                  </button>
                ) : (
                  <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${p.color}`}>{p.status}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountView;
