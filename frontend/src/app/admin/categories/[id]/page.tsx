"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateCategory, type Category } from "@/lib/api";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);

  useEffect(() => {
    import("@/lib/axios").then(({ default: api }) => {
      api.get(`/categories/${id}`).then(({ data }) => {
        const cat = data as Category;
        setName(cat.name);
        setSlug(cat.slug);
        setLoading(false);
      });
    });
  }, [id]);

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setName(v);
      if (!slugManual) setSlug(slugify(v));
    },
    [slugManual],
  );

  const handleSlugChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugManual(true);
    setSlug(slugify(e.target.value));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateCategory(id, { name, slug });
      router.push("/admin/categories");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update category");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link href="/admin/categories" className="text-sm text-text-muted hover:text-accent-primary">
          ← Back to categories
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-text-primary">Edit Category</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-border/50 bg-surface p-6">
        {error && (
          <div className="rounded-lg bg-error/10 p-3 text-sm text-error">{error}</div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">Name</label>
          <input type="text" value={name} onChange={handleNameChange} required className="w-full" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">Slug</label>
          <input type="text" value={slug} onChange={handleSlugChange} required className="w-full" />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-accent-primary px-6 py-2 text-sm font-semibold text-background transition-all hover:bg-accent-primary/90 hover:shadow-glow-accent disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <Link
            href="/admin/categories"
            className="rounded-lg border border-border/50 px-6 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-tertiary"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
