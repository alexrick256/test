"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/useTranslation";

type Item = { id: string; name: string };

type Props = {
  title: string;
  description: string;
  items: Item[];
  limit: number;
  locked?: boolean;
  lockedMessage?: string;
  apiBase: string; // e.g. "/api/categories" or "/api/pockets"
  addPlaceholder: string;
};

export function ManageList({
  title,
  description,
  items,
  limit,
  locked,
  lockedMessage,
  apiBase,
  addPlaceholder,
}: Props) {
  const router = useRouter();
  const { t } = useTranslation();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const atLimit = items.length >= limit;

  async function handleAdd() {
    const name = newName.trim();
    if (!name) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(apiBase, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("settings.manage.addError"));
      setNewName("");
      setAdding(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("settings.manage.addError"));
    } finally {
      setBusy(false);
    }
  }

  async function handleRename(id: string) {
    const name = editingName.trim();
    if (!name) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`${apiBase}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("settings.manage.renameError"));
      setEditingId(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("settings.manage.renameError"));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`${apiBase}/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("settings.manage.deleteError"));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("settings.manage.deleteError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-semibold text-fg">{title}</h2>
          <p className="mt-1 text-sm text-fg-muted">{description}</p>
        </div>
        {!locked ? (
          <span className="shrink-0 rounded-full bg-surface-alt px-2.5 py-1 text-xs font-medium text-fg-muted">
            {items.length} / {limit}
          </span>
        ) : null}
      </div>

      {locked ? (
        <p className="mt-4 rounded-lg bg-surface-alt px-4 py-3 text-sm text-fg-muted">
          {lockedMessage}{" "}
          <Link href="/pricing" className="font-medium text-accent-600 hover:underline dark:text-accent-400">
            {t("settings.manage.upgrade")}
          </Link>
        </p>
      ) : (
        <>
          {error ? <p className="mt-4 text-sm text-negative">{error}</p> : null}

          <ul className="mt-4 divide-y divide-line">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-2.5">
                {editingId === item.id ? (
                  <input
                    autoFocus
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleRename(item.id)}
                    onBlur={() => handleRename(item.id)}
                    className="input py-1.5"
                  />
                ) : (
                  <button
                    onClick={() => {
                      setEditingId(item.id);
                      setEditingName(item.name);
                    }}
                    className="flex-1 rounded-md px-2 py-1.5 text-left text-sm text-fg hover:bg-surface-alt"
                  >
                    {item.name}
                  </button>
                )}
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={busy}
                  className="rounded-md px-2 py-1.5 text-xs font-medium text-fg-faint hover:bg-negative/10 hover:text-negative"
                >
                  {t("settings.manage.delete")}
                </button>
              </li>
            ))}
            {items.length === 0 ? (
              <li className="py-3 text-sm text-fg-faint">{t("settings.manage.empty")}</li>
            ) : null}
          </ul>

          <div className="mt-3">
            {adding ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  placeholder={addPlaceholder}
                  className="input py-1.5"
                />
                <button onClick={handleAdd} disabled={busy} className="btn-primary py-1.5 text-xs">
                  {t("grid.add")}
                </button>
                <button onClick={() => setAdding(false)} className="btn-ghost py-1.5 text-xs">
                  {t("settings.manage.cancel")}
                </button>
              </div>
            ) : atLimit ? (
              <p className="text-xs text-fg-faint">
                {t("settings.manage.limitReached")}{" "}
                <Link href="/pricing" className="font-medium text-accent-600 hover:underline dark:text-accent-400">
                  {t("settings.manage.upgrade")}
                </Link>
              </p>
            ) : (
              <button
                onClick={() => setAdding(true)}
                className="text-sm font-medium text-fg-muted hover:text-fg"
              >
                {t("settings.manage.add")}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
