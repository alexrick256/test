"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
      if (!res.ok) throw new Error(data.error ?? "Fehler beim Anlegen.");
      setNewName("");
      setAdding(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Anlegen.");
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
      if (!res.ok) throw new Error(data.error ?? "Fehler beim Umbenennen.");
      setEditingId(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Umbenennen.");
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
      if (!res.ok) throw new Error(data.error ?? "Fehler beim Löschen.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Löschen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-semibold text-ink-950">{title}</h2>
          <p className="mt-1 text-sm text-ink-500">{description}</p>
        </div>
        {!locked ? (
          <span className="shrink-0 rounded-full bg-ink-50 px-2.5 py-1 text-xs font-medium text-ink-500">
            {items.length} / {limit}
          </span>
        ) : null}
      </div>

      {locked ? (
        <p className="mt-4 rounded-lg bg-ink-50 px-4 py-3 text-sm text-ink-500">
          {lockedMessage}{" "}
          <Link href="/pricing" className="font-medium text-accent-600 hover:underline">
            Tarif upgraden
          </Link>
        </p>
      ) : (
        <>
          {error ? <p className="mt-4 text-sm text-negative">{error}</p> : null}

          <ul className="mt-4 divide-y divide-ink-50">
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
                    className="flex-1 rounded-md px-2 py-1.5 text-left text-sm text-ink-800 hover:bg-ink-50"
                  >
                    {item.name}
                  </button>
                )}
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={busy}
                  className="rounded-md px-2 py-1.5 text-xs font-medium text-ink-400 hover:bg-negative/10 hover:text-negative"
                >
                  Löschen
                </button>
              </li>
            ))}
            {items.length === 0 ? (
              <li className="py-3 text-sm text-ink-400">Noch keine Einträge.</li>
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
                  Hinzufügen
                </button>
                <button onClick={() => setAdding(false)} className="btn-ghost py-1.5 text-xs">
                  Abbrechen
                </button>
              </div>
            ) : atLimit ? (
              <p className="text-xs text-ink-400">
                Limit erreicht.{" "}
                <Link href="/pricing" className="font-medium text-accent-600 hover:underline">
                  Tarif upgraden
                </Link>
              </p>
            ) : (
              <button
                onClick={() => setAdding(true)}
                className="text-sm font-medium text-ink-500 hover:text-ink-900"
              >
                + Hinzufügen
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
