"use client";

import { apiFetch } from "@/lib/api";
import { useAdmin } from "../context/AdminContext";
import { AdminBadge } from "../components/ui/AdminBadge";
import { AdminButton } from "../components/ui/AdminButton";
import { AdminCard } from "../components/ui/AdminCard";
import { AdminInput, AdminTextarea } from "../components/ui/AdminInput";

export function AboutSection() {
  const { about, setAbout, runAction, loadAll, token, isPending } = useAdmin();

  return (
    <AdminCard glow className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold text-white">About Section</h2>
        <AdminBadge tone="success">
          {[about.title, about.bio, about.profileDetails].filter(Boolean).length}/3 fields filled
        </AdminBadge>
      </div>
      <AdminInput
        placeholder="Section title (e.g. About Me)"
        value={about.title}
        onChange={(e) => setAbout({ ...about, title: e.target.value })}
      />
      <AdminTextarea
        rows={4}
        placeholder="Short bio paragraph for the portfolio"
        value={about.bio}
        onChange={(e) => setAbout({ ...about, bio: e.target.value })}
      />
      <AdminTextarea
        rows={4}
        placeholder="Additional profile details (optional)"
        value={about.profileDetails}
        onChange={(e) => setAbout({ ...about, profileDetails: e.target.value })}
      />
      <AdminButton
        disabled={isPending("about.save")}
        onClick={() =>
          runAction(
            "about.save",
            async () => {
              await apiFetch("/about", { method: "PUT", body: JSON.stringify(about) }, token);
              await loadAll(token);
            },
            "About updated"
          )
        }
      >
        {isPending("about.save") ? "Saving..." : "Update About"}
      </AdminButton>
    </AdminCard>
  );
}
