"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getProductById,
  updateProduct,
  generateDescription,
  getAllCategories,
  type Category,
} from "@/lib/api";
import ImageUpload from "@/features/admin/components/ImageUpload";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    getAllCategories().then((res) => setCategories(res.data));
    getProductById(id).then((p) => {
      setName(p.name);
      setSlug(p.slug);
      setDescription(p.description ?? "");
      setImageUrl(p.imageUrl ?? "");
      setCategoryId(p.categoryId);
      setLoading(false);
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

  const handleGenerateDescription = async () => {
    setGenerating(true);
    setError(null);
    try {
      const result = await generateDescription(id);
      setDescription(result.description);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate description");
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateProduct(id, {
        name,
        slug,
        description: description || null,
        imageUrl: imageUrl || null,
        categoryId,
      });
      router.push("/admin/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update product");
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
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/admin/products" className="text-sm text-text-muted hover:text-accent-primary">
          ← Back to products
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-text-primary">Edit Product</h1>
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

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-sm font-medium text-text-secondary">Description</label>
            <button
              type="button"
              onClick={handleGenerateDescription}
              disabled={generating}
              className="flex items-center gap-1.5 rounded-lg bg-accent-tertiary/10 px-3 py-1 text-xs font-medium text-accent-primary transition-colors hover:bg-accent-tertiary/20 disabled:opacity-50"
            >
              {generating ? (
                <div className="h-3 w-3 animate-spin rounded-full border border-accent-primary border-t-transparent" />
              ) : (
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              )}
              {generating ? "Generating..." : "Generate AI Description"}
            </button>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">Category</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required className="w-full">
            <option value="">Select category...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">Image</label>
          <ImageUpload value={imageUrl} onChange={setImageUrl} />
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
            href="/admin/products"
            className="rounded-lg border border-border/50 px-6 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-tertiary"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
