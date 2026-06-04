"use client";

import { apiFetch } from "@/lib/api";
import { useAdmin } from "../context/AdminContext";
import { AdminBadge } from "../components/ui/AdminBadge";
import { AdminButton } from "../components/ui/AdminButton";
import { AdminListToolbar } from "../components/ui/AdminListToolbar";

export function QueriesSection() {
  const {
    queries,
    querySearch,
    setQuerySearch,
    queryStatusFilter,
    setQueryStatusFilter,
    filteredQueries,
    expandedQueryId,
    setExpandedQueryId,
    runAction,
    loadAll,
    token,
    isPending
  } = useAdmin();

  return (
    <section className="space-y-4">
      <h2 className="font-semibold text-cyan-100">Contact Queries</h2>
      <AdminListToolbar
        search={querySearch}
        onSearchChange={setQuerySearch}
        searchPlaceholder="Search name, email, or message..."
        status={queryStatusFilter}
        onStatusChange={setQueryStatusFilter}
        statusOptions={[
          { value: "all", label: "All statuses" },
          { value: "unseen", label: "Unseen only" },
          { value: "seen", label: "Seen only" }
        ]}
        count={filteredQueries.length}
        total={queries.length}
      />
      {queries.length === 0 ? (
        <p className="text-sm text-slate-400 py-8 text-center border border-dashed border-cyan-500/20 rounded-xl">
          No contact queries yet.
        </p>
      ) : filteredQueries.length === 0 ? (
        <p className="text-sm text-slate-400 py-8 text-center border border-dashed border-cyan-500/20 rounded-xl">
          No queries match your filters.
        </p>
      ) : (
        <div className="space-y-3 max-h-[calc(100vh-12rem)] overflow-y-auto admin-scrollbar pr-1">
          {filteredQueries.map((q) => (
            <article
              key={q._id}
              className={`p-4 rounded-2xl border transition ${
                expandedQueryId === q._id ? "admin-glow-card-strong border-cyan-400/50" : "admin-glow-card hover:border-cyan-400/30"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-slate-100">{q.name}</p>
                    <AdminBadge tone={q.status === "seen" ? "success" : "warning"}>
                      {q.status === "seen" ? "Seen" : "Unseen"}
                    </AdminBadge>
                  </div>
                  <p className="text-sm text-slate-400">{q.email}</p>
                  {q.createdAt ? (
                    <p className="text-xs text-slate-500 mt-1">{new Date(q.createdAt).toLocaleString()}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <AdminButton
                    type="button"
                    variant="ghost"
                    className="text-sm"
                    onClick={() => setExpandedQueryId(expandedQueryId === q._id ? null : q._id)}
                  >
                    {expandedQueryId === q._id ? "Collapse" : "View"}
                  </AdminButton>
                  <AdminButton
                    variant={q.status === "seen" ? "ghost" : "success"}
                    className="text-sm"
                    disabled={isPending(`query.status.${q._id}`)}
                    onClick={() =>
                      runAction(
                        `query.status.${q._id}`,
                        async () => {
                          await apiFetch(
                            `/queries/${q._id}/status`,
                            {
                              method: "PATCH",
                              body: JSON.stringify({ status: q.status === "seen" ? "unseen" : "seen" })
                            },
                            token
                          );
                          await loadAll(token);
                        },
                        "Status updated"
                      )
                    }
                  >
                    {isPending(`query.status.${q._id}`)
                      ? "Updating..."
                      : q.status === "seen"
                        ? "Mark unread"
                        : "Mark read"}
                  </AdminButton>
                  <AdminButton
                    variant="danger"
                    className="text-sm"
                    disabled={isPending(`query.delete.${q._id}`)}
                    onClick={() => {
                      if (!window.confirm(`Delete query from ${q.name}?`)) return;
                      runAction(
                        `query.delete.${q._id}`,
                        async () => {
                          await apiFetch(`/queries/${q._id}`, { method: "DELETE" }, token);
                          if (expandedQueryId === q._id) setExpandedQueryId(null);
                          await loadAll(token);
                        },
                        "Query deleted"
                      );
                    }}
                  >
                    Delete
                  </AdminButton>
                </div>
              </div>
              <p className={`text-sm text-slate-300 mt-3 ${expandedQueryId === q._id ? "" : "line-clamp-2"}`}>{q.message}</p>
              {expandedQueryId === q._id ? (
                <div className="mt-3 pt-3 border-t border-cyan-500/15 text-xs text-slate-500">
                  Full message shown above. Use status actions to manage this inquiry.
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
