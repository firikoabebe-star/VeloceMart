"use client";

import { useEffect, useState } from "react";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  type Address,
} from "@/lib/api";

const EMPTY_FORM = {
  label: "",
  firstName: "",
  lastName: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  phone: "",
  isDefault: false,
};

type FormData = typeof EMPTY_FORM;

function toFormData(a: Address): FormData {
  return {
    label: a.label,
    firstName: a.firstName,
    lastName: a.lastName,
    line1: a.line1,
    line2: a.line2 ?? "",
    city: a.city,
    state: a.state ?? "",
    postalCode: a.postalCode,
    country: a.country,
    phone: a.phone ?? "",
    isDefault: a.isDefault,
  };
}

function inputClass(hasError?: boolean) {
  return `mt-1 block w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-all duration-200 ${
    hasError
      ? "border-error/60 ring-2 ring-error/10 focus:border-error"
      : "border-border focus:border-accent-primary focus:ring-3 focus:ring-accent-primary/50"
  } bg-surface text-text-primary placeholder:text-text-muted`;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const fetchAddresses = () => {
    getAddresses()
      .then(setAddresses)
      .catch(() => setError("Failed to load addresses"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    setFieldErrors({});
    setModalOpen(true);
  };

  const openEdit = (addr: Address) => {
    setEditingId(addr.id);
    setForm(toFormData(addr));
    setError(null);
    setFieldErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    setFieldErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.label.trim()) errors.label = "Label is required";
    if (!form.firstName.trim()) errors.firstName = "First name is required";
    if (!form.lastName.trim()) errors.lastName = "Last name is required";
    if (!form.line1.trim()) errors.line1 = "Address line 1 is required";
    if (!form.city.trim()) errors.city = "City is required";
    if (!form.postalCode.trim()) errors.postalCode = "Postal code is required";
    if (!form.country.trim()) errors.country = "Country is required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        label: form.label,
        firstName: form.firstName,
        lastName: form.lastName,
        line1: form.line1,
        line2: form.line2 || null,
        city: form.city,
        state: form.state || null,
        postalCode: form.postalCode,
        country: form.country,
        phone: form.phone || null,
        isDefault: form.isDefault,
      };
      if (editingId) {
        await updateAddress(editingId, payload);
        setSuccess("Address updated successfully");
      } else {
        await createAddress(payload);
        setSuccess("Address created successfully");
      }
      closeModal();
      fetchAddresses();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteAddress(deleteId);
      setAddresses((prev) => prev.filter((a) => a.id !== deleteId));
      setDeleteId(null);
      setSuccess("Address deleted successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("Failed to delete address");
      setDeleteId(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddress(id);
      fetchAddresses();
    } catch {
      setError("Failed to set default address");
    }
  };

  const setField = (field: keyof FormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Shipping Addresses
          </h1>
          <p className="mt-1 text-text-secondary">
            Manage your saved shipping addresses.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-accent-primary px-4 py-2.5 text-sm font-medium text-on-accent transition-all duration-200 hover:bg-accent-primary/90 hover:shadow-glow-accent active:scale-[0.98]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Address
        </button>
      </div>

      {/* Notifications */}
      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-success/20 bg-success/10 px-4 py-3 text-sm text-success animate-slide-down">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {success}
        </div>
      )}
      {error && !modalOpen && (
        <div className="flex items-center gap-2 rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border/50 bg-surface p-6"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="h-5 w-16 animate-pulse rounded bg-surface-tertiary" />
                <div className="h-5 w-14 animate-pulse rounded-full bg-surface-tertiary" />
              </div>
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div
                    key={j}
                    className="h-3 animate-pulse rounded bg-surface-tertiary"
                    style={{ width: `${65 + j * 8}%` }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : addresses.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-tertiary">
            <svg className="h-7 w-7 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text-primary">
            No saved addresses
          </h3>
          <p className="mt-1 max-w-sm text-sm text-text-secondary">
            Add a shipping address to speed up your checkout process.
          </p>
          <button
            onClick={openAdd}
            className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-accent-primary px-5 py-2.5 text-sm font-medium text-on-accent transition-all duration-200 hover:bg-accent-primary/90 hover:shadow-glow-accent"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Address
          </button>
        </div>
      ) : (
        /* Address grid */
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((addr, idx) => (
            <div
              key={addr.id}
              className="group relative rounded-xl border border-border/50 bg-surface p-6 transition-all duration-200 hover:shadow-elevation-2 hover:border-accent-primary/50"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              {/* Header */}
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-tertiary text-accent-primary transition-transform duration-200 group-hover:scale-110">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-text-primary">
                      {addr.label}
                    </span>
                    {addr.isDefault && (
                      <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                        <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        Default
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Address body */}
              <div className="space-y-0.5 text-sm text-text-secondary">
                <p className="font-medium text-text-primary">
                  {addr.firstName} {addr.lastName}
                </p>
                <p>{addr.line1}</p>
                {addr.line2 && <p>{addr.line2}</p>}
                <p>
                  {addr.city}
                  {addr.state ? `, ${addr.state}` : ""} {addr.postalCode}
                </p>
                <p>{addr.country}</p>
                {addr.phone && (
                  <p className="flex items-center gap-1.5 pt-1 text-xs text-text-muted">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                    {addr.phone}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="mt-5 flex items-center gap-2 border-t border-border/30 pt-4">
                <button
                  onClick={() => openEdit(addr)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 px-3 py-1.5 text-xs font-medium text-text-secondary transition-all duration-200 hover:bg-surface-tertiary hover:text-text-primary"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.172.274l-2.044.33.33-2.044a4.5 4.5 0 01.274-1.172l10.5-10.5a1.875 1.875 0 012.652 0z" />
                  </svg>
                  Edit
                </button>
                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 px-3 py-1.5 text-xs font-medium text-text-secondary transition-all duration-200 hover:bg-surface-tertiary hover:text-text-primary"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                    </svg>
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => setDeleteId(addr.id)}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-error/70 transition-all duration-200 hover:bg-error/10 hover:text-error"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal (Add / Edit) ────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 pt-12 sm:pt-24">
          <div className="mx-4 mb-8 w-full max-w-lg animate-slide-up rounded-xl border border-border/50 bg-surface p-6 shadow-elevation-3">
            {/* Modal header */}
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-primary text-on-accent">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-text-primary">
                  {editingId ? "Edit Address" : "Add Address"}
                </h2>
                <p className="text-xs text-text-muted">
                  {editingId ? "Update your saved address details." : "Add a new shipping address."}
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-5 flex items-center gap-2 rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Label */}
              <div>
                <label className="text-sm font-medium text-text-primary">
                  Label
                </label>
                <input
                  type="text"
                  value={form.label}
                  onChange={(e) => setField("label", e.target.value)}
                  className={inputClass(!!fieldErrors.label)}
                  placeholder="e.g. Home, Work"
                />
                {fieldErrors.label && (
                  <p className="mt-1 text-xs text-error">{fieldErrors.label}</p>
                )}
              </div>

              {/* Name rows */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-text-primary">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => setField("firstName", e.target.value)}
                    className={inputClass(!!fieldErrors.firstName)}
                    placeholder="John"
                  />
                  {fieldErrors.firstName && (
                    <p className="mt-1 text-xs text-error">{fieldErrors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-text-primary">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => setField("lastName", e.target.value)}
                    className={inputClass(!!fieldErrors.lastName)}
                    placeholder="Doe"
                  />
                  {fieldErrors.lastName && (
                    <p className="mt-1 text-xs text-error">{fieldErrors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Address lines */}
              <div>
                <label className="text-sm font-medium text-text-primary">
                  Address Line 1
                </label>
                <input
                  type="text"
                  value={form.line1}
                  onChange={(e) => setField("line1", e.target.value)}
                  className={inputClass(!!fieldErrors.line1)}
                  placeholder="123 Main St"
                />
                {fieldErrors.line1 && (
                  <p className="mt-1 text-xs text-error">{fieldErrors.line1}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-text-primary">
                  Address Line 2 <span className="font-normal text-text-muted">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.line2}
                  onChange={(e) => setField("line2", e.target.value)}
                  className={inputClass()}
                  placeholder="Apt, Suite, etc."
                />
              </div>

              {/* City / State */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-text-primary">
                    City
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setField("city", e.target.value)}
                    className={inputClass(!!fieldErrors.city)}
                    placeholder="New York"
                  />
                  {fieldErrors.city && (
                    <p className="mt-1 text-xs text-error">{fieldErrors.city}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-text-primary">
                    State <span className="font-normal text-text-muted">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => setField("state", e.target.value)}
                    className={inputClass()}
                    placeholder="NY"
                  />
                </div>
              </div>

              {/* Postal / Country */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-text-primary">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={form.postalCode}
                    onChange={(e) => setField("postalCode", e.target.value)}
                    className={inputClass(!!fieldErrors.postalCode)}
                    placeholder="10001"
                  />
                  {fieldErrors.postalCode && (
                    <p className="mt-1 text-xs text-error">{fieldErrors.postalCode}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-text-primary">
                    Country
                  </label>
                  <input
                    type="text"
                    value={form.country}
                    onChange={(e) => setField("country", e.target.value)}
                    className={inputClass(!!fieldErrors.country)}
                    placeholder="United States"
                  />
                  {fieldErrors.country && (
                    <p className="mt-1 text-xs text-error">{fieldErrors.country}</p>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="text-sm font-medium text-text-primary">
                  Phone <span className="font-normal text-text-muted">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  className={inputClass()}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              {/* Default checkbox */}
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/50 px-4 py-3 transition-colors hover:bg-surface-tertiary/50">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) => setField("isDefault", e.target.checked)}
                  className="h-4 w-4 rounded border-border text-accent-strong focus:ring-accent-primary/50"
                />
                <div>
                  <span className="text-sm font-medium text-text-primary">
                    Set as default address
                  </span>
                  <p className="text-xs text-text-muted">
                    This address will be pre-selected at checkout.
                  </p>
                </div>
              </label>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 border-t border-border/30 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-border/50 px-5 py-2.5 text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-surface-tertiary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-accent-primary px-5 py-2.5 text-sm font-medium text-on-accent transition-all duration-200 hover:bg-accent-primary/90 hover:shadow-glow-accent disabled:opacity-50 active:scale-[0.98]"
                >
                  {saving ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Saving...
                    </>
                  ) : editingId ? (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      Save Changes
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Add Address
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ──────────────────────────────── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm animate-slide-up rounded-xl border border-border/50 bg-surface p-6 shadow-elevation-3">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-error/10">
              <svg className="h-6 w-6 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary">
              Delete Address
            </h3>
            <p className="mt-1 text-sm text-text-secondary">
              Are you sure you want to delete this address? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-lg border border-border/50 px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-tertiary"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 rounded-lg bg-error px-4 py-2 text-sm font-medium text-on-accent transition-all duration-200 hover:bg-error/90 active:scale-[0.98]"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
