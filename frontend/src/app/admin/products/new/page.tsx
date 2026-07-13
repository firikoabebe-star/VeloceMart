"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createProduct,
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

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    getAllCategories().then((res) => setCategories(res.data));
  }, []);

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
    setLoading(true);
    setError(null);
    try {
      const product = await createProduct({
        name,
        slug,
        description: description || null,
        imageUrl: imageUrl || null,
        categoryId,
      });
      router.push(`/admin/products/${product.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/admin/products" className="text-sm text-text-muted hover:text-accent-primary">
          ← Back to products
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-text-primary">Add Product</h1>
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
          <label className="mb-1 block text-sm font-medium text-text-secondary">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full"
          />
          <p className="mt-3 text-xs text-text-muted">
            Save the product first to unlock AI description generation.
          </p>
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
            disabled={loading}
            className="rounded-lg bg-accent-primary px-6 py-2 text-sm font-semibold text-background transition-all hover:bg-accent-primary/90 hover:shadow-glow-accent disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Product"}
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
