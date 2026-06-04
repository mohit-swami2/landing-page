"use client";

import { apiFetch } from "@/lib/api";
import { useAdmin } from "../context/AdminContext";
import { AdminBadge } from "../components/ui/AdminBadge";
import { AdminButton } from "../components/ui/AdminButton";
import { AdminCard } from "../components/ui/AdminCard";
import { AdminInput } from "../components/ui/AdminInput";
import { AdminListToolbar } from "../components/ui/AdminListToolbar";

export function SocialSection() {
  const {
    socials,
    editingSocialId,
    socialForm,
    setSocialForm,
    socialSearch,
    setSocialSearch,
    socialStatusFilter,
    setSocialStatusFilter,
    filteredSocials,
    resetSocialForm,
    startEditSocial,
    runAction,
    loadAll,
    token,
    isPending
  } = useAdmin();

  return (
    <section className="space-y-4">
      <AdminCard glow>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const actionKey = editingSocialId ? `social.update.${editingSocialId}` : "social.create";
            runAction(
              actionKey,
              async () => {
                const body = JSON.stringify(socialForm);
                if (editingSocialId) {
                  await apiFetch(`/social-links/${editingSocialId}`, { method: "PUT", body }, token);
                } else {
                  await apiFetch("/social-links", { method: "POST", body }, token);
                }
                resetSocialForm();
                await loadAll(token);
              },
              editingSocialId ? "Social link updated" : "Social link created"
            );
          }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-white">{editingSocialId ? "Edit Social Link" : "Add Social Link"}</h2>
            {editingSocialId ? (
              <AdminButton type="button" variant="ghost" onClick={resetSocialForm}>
                Cancel edit
              </AdminButton>
            ) : null}
          </div>
          <AdminInput
            placeholder="Platform name (e.g. GitHub, LinkedIn)"
            value={socialForm.platformName}
            onChange={(e) => setSocialForm({ ...socialForm, platformName: e.target.value })}
          />
          <AdminInput
            placeholder="Icon key: github, linkedin, mail, twitter, phone"
            value={socialForm.icon}
            onChange={(e) => setSocialForm({ ...socialForm, icon: e.target.value })}
          />
          <AdminInput
            placeholder="Full URL (https://github.com/... or mailto:you@email.com)"
            value={socialForm.url}
            onChange={(e) => setSocialForm({ ...socialForm, url: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={socialForm.visible}
              onChange={(e) => setSocialForm({ ...socialForm, visible: e.target.checked })}
              className="rounded border-cyan-500/40"
            />
            Visible on public site
          </label>
          <AdminButton type="submit" disabled={isPending(editingSocialId ? `social.update.${editingSocialId}` : "social.create")}>
            {isPending(editingSocialId ? `social.update.${editingSocialId}` : "social.create")
              ? "Saving..."
              : editingSocialId
                ? "Update Social"
                : "Add Social"}
          </AdminButton>
        </form>
      </AdminCard>

      <div className="space-y-3">
        <h3 className="font-semibold text-cyan-100">All Social Links</h3>
        <AdminListToolbar
          search={socialSearch}
          onSearchChange={setSocialSearch}
          searchPlaceholder="Search platform, icon, or URL..."
          status={socialStatusFilter}
          onStatusChange={setSocialStatusFilter}
          statusOptions={[
            { value: "all", label: "All statuses" },
            { value: "visible", label: "Visible only" },
            { value: "hidden", label: "Hidden only" }
          ]}
          count={filteredSocials.length}
          total={socials.length}
        />
        {socials.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center border border-dashed border-cyan-500/20 rounded-xl">
            No social links yet.
          </p>
        ) : filteredSocials.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center border border-dashed border-cyan-500/20 rounded-xl">
            No links match your filters.
          </p>
        ) : (
          <div className="space-y-2 max-h-[calc(100vh-18rem)] overflow-y-auto admin-scrollbar pr-1">
            {filteredSocials.map((s) => (
              <article
                key={s._id}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  editingSocialId === s._id ? "admin-glow-card-strong border-cyan-400/50" : "admin-glow-card"
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-slate-100">{s.platformName}</p>
                    <AdminBadge tone="muted">{s.icon}</AdminBadge>
                    <AdminBadge tone={s.visible !== false ? "success" : "muted"}>
                      {s.visible !== false ? "Visible" : "Hidden"}
                    </AdminBadge>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-1">{s.url}</p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <AdminButton
                    type="button"
                    variant="secondary"
                    className="text-sm"
                    disabled={isPending(`social.toggle.${s._id}`)}
                    onClick={() =>
                      runAction(
                        `social.toggle.${s._id}`,
                        async () => {
                          await apiFetch(
                            `/social-links/${s._id}`,
                            {
                              method: "PUT",
                              body: JSON.stringify({
                                platformName: s.platformName,
                                icon: s.icon,
                                url: s.url,
                                visible: s.visible === false
                              })
                            },
                            token
                          );
                          await loadAll(token);
                        },
                        s.visible !== false ? "Link hidden" : "Link visible"
                      )
                    }
                  >
                    {isPending(`social.toggle.${s._id}`) ? "..." : s.visible !== false ? "Hide" : "Show"}
                  </AdminButton>
                  <AdminButton type="button" variant="secondary" className="text-sm" onClick={() => startEditSocial(s)}>
                    Edit
                  </AdminButton>
                  <AdminButton
                    type="button"
                    variant="danger"
                    className="text-sm"
                    disabled={isPending(`social.delete.${s._id}`)}
                    onClick={() => {
                      if (!window.confirm(`Delete ${s.platformName}?`)) return;
                      runAction(
                        `social.delete.${s._id}`,
                        async () => {
                          await apiFetch(`/social-links/${s._id}`, { method: "DELETE" }, token);
                          if (editingSocialId === s._id) resetSocialForm();
                          await loadAll(token);
                        },
                        "Social link deleted"
                      );
                    }}
                  >
                    Delete
                  </AdminButton>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
