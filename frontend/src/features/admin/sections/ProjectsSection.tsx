"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAdmin } from "../context/AdminContext";
import { AdminBadge } from "../components/ui/AdminBadge";
import { AdminButton } from "../components/ui/AdminButton";
import { AdminCard } from "../components/ui/AdminCard";
import { AdminInput, AdminTextarea } from "../components/ui/AdminInput";
import { AdminListToolbar } from "../components/ui/AdminListToolbar";
import { projectImageSrc } from "../utils";
import type { ProjectRecord } from "../types";

export function ProjectsSection() {
  const {
    projects,
    editingProjectId,
    projectForm,
    setProjectForm,
    projectSearch,
    setProjectSearch,
    projectStatusFilter,
    setProjectStatusFilter,
    filteredProjects,
    resetProjectForm,
    startEditProject,
    buildProjectFormData,
    runAction,
    loadAll,
    token,
    isPending,
    toggleProjectVisibility,
    toast
  } = useAdmin();

  return (
    <div className="space-y-6">
      <AdminCard glow>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const actionKey = editingProjectId ? `project.update.${editingProjectId}` : "project.create";
            runAction(
              actionKey,
              async () => {
                const fd = buildProjectFormData();
                if (editingProjectId) {
                  await apiFetch(`/projects/${editingProjectId}`, { method: "PUT", body: fd }, token);
                } else {
                  await apiFetch("/projects", { method: "POST", body: fd }, token);
                }
                resetProjectForm();
                await loadAll(token);
              },
              editingProjectId ? "Project updated" : "Project created"
            );
          }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-lg text-white">{editingProjectId ? "Edit Project" : "Create Project"}</h2>
            {editingProjectId ? (
              <AdminButton type="button" variant="ghost" onClick={resetProjectForm}>
                Cancel edit
              </AdminButton>
            ) : null}
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <AdminInput
              placeholder="Project name (e.g. Birlingo)"
              value={projectForm.name}
              onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
            />
            <AdminInput
              placeholder="URL slug (e.g. birlingo-edtech)"
              value={projectForm.slug}
              onChange={(e) => setProjectForm({ ...projectForm, slug: e.target.value })}
            />
          </div>
          <AdminInput
            placeholder="Short description shown on project card"
            value={projectForm.shortDescription}
            onChange={(e) => setProjectForm({ ...projectForm, shortDescription: e.target.value })}
          />
          <AdminInput
            placeholder="Live demo URL (https://...)"
            value={projectForm.liveLink}
            onChange={(e) => setProjectForm({ ...projectForm, liveLink: e.target.value })}
          />
          <AdminInput
            placeholder="Tech stack — Node.js, React, MongoDB"
            value={projectForm.techStack}
            onChange={(e) => setProjectForm({ ...projectForm, techStack: e.target.value })}
          />
          <AdminTextarea
            rows={6}
            placeholder="Full project description (HTML supported)"
            value={projectForm.detailedDescription}
            onChange={(e) => setProjectForm({ ...projectForm, detailedDescription: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={projectForm.visible}
              onChange={(e) => setProjectForm({ ...projectForm, visible: e.target.checked })}
              className="rounded border-cyan-500/40"
            />
            Visible on public portfolio
          </label>
          {projectForm.existingImageKeys.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Current images</p>
              <div className="flex flex-wrap gap-2">
                {projectForm.existingImageKeys.map((key) => {
                  const editProject = projects.find((p) => p._id === editingProjectId);
                  const keyIndex = editProject?.imageKeys?.indexOf(key) ?? -1;
                  const preview = keyIndex >= 0 && editProject?.images?.[keyIndex] ? editProject.images[keyIndex] : "";
                  const src = preview ? projectImageSrc(preview) : "";
                  return (
                    <div key={key} className="relative group">
                      <img src={src} alt="" className="w-20 h-20 object-cover rounded-xl border border-cyan-500/25" />
                      <button
                        type="button"
                        onClick={() =>
                          setProjectForm({
                            ...projectForm,
                            existingImageKeys: projectForm.existingImageKeys.filter((k) => k !== key)
                          })
                        }
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white text-xs leading-none opacity-0 group-hover:opacity-100"
                        title="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
          <AdminInput
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setProjectForm({ ...projectForm, imageFiles: Array.from(e.target.files || []) })}
            className="file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-cyan-500 file:to-blue-600 file:text-white file:text-sm"
          />
          {projectForm.imageFiles.length > 0 ? (
            <p className="text-xs text-slate-400">{projectForm.imageFiles.length} new file(s) selected</p>
          ) : null}
          <AdminButton
            type="submit"
            disabled={isPending(editingProjectId ? `project.update.${editingProjectId}` : "project.create")}
          >
            {isPending(editingProjectId ? `project.update.${editingProjectId}` : "project.create")
              ? "Saving..."
              : editingProjectId
                ? "Update Project"
                : "Create Project"}
          </AdminButton>
        </form>
      </AdminCard>

      <div className="space-y-3">
        <h3 className="font-semibold text-cyan-100">All Projects</h3>
        <AdminListToolbar
          search={projectSearch}
          onSearchChange={setProjectSearch}
          searchPlaceholder="Search by name, slug, or tech..."
          status={projectStatusFilter}
          onStatusChange={setProjectStatusFilter}
          statusOptions={[
            { value: "all", label: "All statuses" },
            { value: "public", label: "Public only" },
            { value: "hidden", label: "Hidden only" }
          ]}
          count={filteredProjects.length}
          total={projects.length}
        />
        {projects.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center border border-dashed border-cyan-500/20 rounded-xl">
            No projects yet. Create your first project above.
          </p>
        ) : filteredProjects.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center border border-dashed border-cyan-500/20 rounded-xl">
            No projects match your filters.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[calc(100vh-12rem)] overflow-y-auto admin-scrollbar pr-1">
            {filteredProjects.map((p) => (
              <ProjectListItem
                key={p._id}
                project={p}
                editingProjectId={editingProjectId}
                isPending={isPending}
                runAction={runAction}
                loadAll={loadAll}
                token={token}
                toggleProjectVisibility={toggleProjectVisibility}
                startEditProject={startEditProject}
                resetProjectForm={resetProjectForm}
                toast={toast}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectListItem({
  project: p,
  editingProjectId,
  isPending,
  runAction,
  loadAll,
  token,
  toggleProjectVisibility,
  startEditProject,
  resetProjectForm,
  toast
}: {
  project: ProjectRecord;
  editingProjectId: string | null;
  isPending: (key: string) => boolean;
  runAction: (key: string, action: () => Promise<void>, successText: string) => Promise<void>;
  loadAll: (authToken: string) => Promise<void>;
  token: string;
  toggleProjectVisibility: (project: ProjectRecord) => Promise<void>;
  startEditProject: (project: ProjectRecord) => void;
  resetProjectForm: () => void;
  toast: (type: "success" | "error", text: string) => void;
}) {
  const images = Array.isArray(p.images) ? p.images.filter(Boolean) : [];
  const [imgIndex, setImgIndex] = useState(0);
  const safeIndex = images.length ? imgIndex % images.length : 0;
  const showPrev = () => setImgIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const showNext = () => setImgIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <article
      className={`rounded-2xl border overflow-hidden transition flex flex-col ${
        editingProjectId === p._id
          ? "border-cyan-400/60 admin-glow-card-strong"
          : "admin-glow-card hover:border-cyan-400/30"
      }`}
    >
      <div className="flex flex-col gap-0">
        <div className="relative h-44 w-full shrink-0 bg-[#0a1220] group/carousel overflow-hidden">
          {images.length > 0 ? (
            <>
              <img
                key={safeIndex}
                src={projectImageSrc(images[safeIndex])}
                alt={`${p.name} screenshot ${safeIndex + 1}`}
                className="w-full h-full object-cover"
              />
              {images.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={showPrev}
                    aria-label="Previous image"
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center rounded-full bg-slate-950/70 text-white border border-cyan-400/30 opacity-0 group-hover/carousel:opacity-100 hover:bg-slate-900 transition"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={showNext}
                    aria-label="Next image"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center rounded-full bg-slate-950/70 text-white border border-cyan-400/30 opacity-0 group-hover/carousel:opacity-100 hover:bg-slate-900 transition"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <span className="absolute top-2 right-2 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-950/70 text-cyan-100 border border-cyan-400/25">
                    {safeIndex + 1}/{images.length}
                  </span>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        aria-label={`Go to image ${idx + 1}`}
                        onClick={() => setImgIndex(idx)}
                        className={`h-1.5 rounded-full transition-all ${
                          idx === safeIndex ? "w-5 bg-cyan-400" : "w-1.5 bg-slate-500 hover:bg-slate-300"
                        }`}
                      />
                    ))}
                  </div>
                </>
              ) : null}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">No image</div>
          )}
        </div>
        <div className="flex-1 p-4 flex flex-col gap-2 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-slate-100">{p.name}</h4>
              <p className="text-xs text-slate-500 font-mono">/{p.slug}</p>
            </div>
            <div className="flex flex-wrap gap-1.5 justify-end">
              {p.slug === "birlingo" || p.featured ? <AdminBadge tone="featured">Featured</AdminBadge> : null}
              <AdminBadge tone={p.visible !== false ? "success" : "muted"}>{p.visible !== false ? "Public" : "Hidden"}</AdminBadge>
            </div>
          </div>
          <p className="text-sm text-slate-400 line-clamp-2">{p.shortDescription}</p>
          {Array.isArray(p.techStack) && p.techStack.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {p.techStack.slice(0, 5).map((tech) => (
                <AdminBadge key={tech}>{tech}</AdminBadge>
              ))}
              {p.techStack.length > 5 ? <span className="text-xs text-slate-500">+{p.techStack.length - 5}</span> : null}
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2 mt-auto pt-2">
            <AdminButton
              type="button"
              variant="secondary"
              className="text-sm"
              disabled={isPending(`project.status.${p._id}`)}
              onClick={() =>
                runAction(
                  `project.status.${p._id}`,
                  async () => {
                    await toggleProjectVisibility(p);
                    await loadAll(token);
                  },
                  p.visible !== false ? "Project hidden" : "Project published"
                )
              }
            >
              {isPending(`project.status.${p._id}`) ? "Updating..." : p.visible !== false ? "Hide" : "Publish"}
            </AdminButton>
            <AdminButton
              type="button"
              variant="secondary"
              className="text-sm"
              onClick={() => startEditProject(p)}
              disabled={isPending(`project.update.${p._id}`)}
            >
              Edit
            </AdminButton>
            <AdminButton
              type="button"
              variant="danger"
              className="text-sm"
              disabled={isPending(`project.delete.${p._id}`)}
              onClick={() => {
                if (p.slug === "birlingo" || p.featured) {
                  toast("error", "Birlingo is the featured project and cannot be deleted.");
                  return;
                }
                if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
                runAction(
                  `project.delete.${p._id}`,
                  async () => {
                    await apiFetch(`/projects/${p._id}`, { method: "DELETE" }, token);
                    if (editingProjectId === p._id) resetProjectForm();
                    await loadAll(token);
                  },
                  "Project deleted"
                );
              }}
            >
              {isPending(`project.delete.${p._id}`) ? "Deleting..." : "Delete"}
            </AdminButton>
          </div>
        </div>
      </div>
    </article>
  );
}
