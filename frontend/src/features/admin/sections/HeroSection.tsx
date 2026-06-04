"use client";

import { apiFetch } from "@/lib/api";
import { useAdmin } from "../context/AdminContext";
import { AdminBadge } from "../components/ui/AdminBadge";
import { AdminButton } from "../components/ui/AdminButton";
import { AdminCard } from "../components/ui/AdminCard";
import { AdminInput, AdminTextarea } from "../components/ui/AdminInput";

export function HeroSection() {
  const { hero, setHero, runAction, loadAll, token, isPending } = useAdmin();

  return (
    <AdminCard glow scrollable maxHeight="calc(100vh - 5rem)" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 sticky top-0 bg-[#0a1220]/95 py-2 -mt-2 z-[1]">
        <h2 className="font-semibold text-white">Hero Content</h2>
        <AdminBadge tone="featured">Edit &amp; update landing hero</AdminBadge>
      </div>
      <AdminInput
        placeholder="Availability badge (e.g. Available for new projects)"
        value={hero.availabilityText}
        onChange={(e) => setHero({ ...hero, availabilityText: e.target.value })}
      />
      <AdminInput
        placeholder="Headline line 1 (e.g. Backend that scales.)"
        value={hero.headlineLine1}
        onChange={(e) => setHero({ ...hero, headlineLine1: e.target.value })}
      />
      <AdminInput
        placeholder="Headline line 2 — accent line (e.g. Frontend that delights.)"
        value={hero.headlineLine2}
        onChange={(e) => setHero({ ...hero, headlineLine2: e.target.value })}
      />
      <AdminTextarea
        rows={4}
        placeholder="Intro paragraph under the headline"
        value={hero.introText}
        onChange={(e) => setHero({ ...hero, introText: e.target.value })}
      />
      <div className="grid md:grid-cols-2 gap-3">
        <AdminInput
          placeholder="Primary button label (e.g. View my work)"
          value={hero.primaryCtaLabel}
          onChange={(e) => setHero({ ...hero, primaryCtaLabel: e.target.value })}
        />
        <AdminInput
          placeholder="Primary scroll target section id (e.g. projects)"
          value={hero.primaryCtaTarget}
          onChange={(e) => setHero({ ...hero, primaryCtaTarget: e.target.value })}
        />
        <AdminInput
          placeholder="Secondary button label (e.g. Let's talk)"
          value={hero.secondaryCtaLabel}
          onChange={(e) => setHero({ ...hero, secondaryCtaLabel: e.target.value })}
        />
        <AdminInput
          placeholder="Secondary scroll target section id (e.g. contact)"
          value={hero.secondaryCtaTarget}
          onChange={(e) => setHero({ ...hero, secondaryCtaTarget: e.target.value })}
        />
      </div>
      <AdminInput
        placeholder="Resume PDF path (e.g. /resume.pdf)"
        value={hero.resumeUrl}
        onChange={(e) => setHero({ ...hero, resumeUrl: e.target.value })}
      />
      <AdminTextarea
        rows={4}
        placeholder="Stats — one per line: value|label (e.g. 100k+|Users served)"
        value={hero.statsInput}
        onChange={(e) => setHero({ ...hero, statsInput: e.target.value })}
      />
      <AdminTextarea
        rows={3}
        placeholder="Scrolling tech tags, comma separated (Node.js, React, AWS...)"
        value={hero.techMarqueeInput}
        onChange={(e) => setHero({ ...hero, techMarqueeInput: e.target.value })}
      />
      <AdminButton
        disabled={isPending("hero.save")}
        onClick={() =>
          runAction(
            "hero.save",
            async () => {
              const stats = hero.statsInput
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean)
                .map((line) => {
                  const [value, label] = line.split("|").map((part) => part.trim());
                  return { value: value || "", label: label || "" };
                });
              const techMarquee = hero.techMarqueeInput
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean);
              await apiFetch(
                "/hero",
                {
                  method: "PUT",
                  body: JSON.stringify({
                    availabilityText: hero.availabilityText,
                    headlineLine1: hero.headlineLine1,
                    headlineLine2: hero.headlineLine2,
                    introText: hero.introText,
                    primaryCtaLabel: hero.primaryCtaLabel,
                    primaryCtaTarget: hero.primaryCtaTarget,
                    secondaryCtaLabel: hero.secondaryCtaLabel,
                    secondaryCtaTarget: hero.secondaryCtaTarget,
                    resumeUrl: hero.resumeUrl,
                    stats,
                    techMarquee
                  })
                },
                token
              );
              await loadAll(token);
            },
            "Hero content updated"
          )
        }
      >
        {isPending("hero.save") ? "Saving..." : "Update Hero"}
      </AdminButton>
    </AdminCard>
  );
}
