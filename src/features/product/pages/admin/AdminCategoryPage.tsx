import { useCallback, useEffect, useState } from 'react'
import { parseApiError } from '@/services'
import { ErrorState } from '@/shared'
import type { CategoryRequest, CategoryResponse } from '../../types/product.types'
import { categoryService } from '../../services/categoryService'
import '@/app/styles/admin.css'

interface FormState {
    name: string
    description: string
}

const EMPTY: FormState = { name: '', description: '' }

export default function AdminCategoryPage() {
    const [categories, setCategories] = useState<CategoryResponse[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [form, setForm] = useState<FormState>(EMPTY)
    const [formErrors, setFormErrors] = useState<Partial<FormState>>({})
    const [editingId, setEditingId] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [confirmId, setConfirmId] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const fetchCategories = useCallback(() => {
        setLoading(true)
        setError(null)
        categoryService
            .findAll()
            .then(setCategories)
            .catch((err) => setError(parseApiError(err).message))
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        fetchCategories()
    }, [fetchCategories])

    function openCreate() {
        setEditingId(null)
        setForm(EMPTY)
        setFormErrors({})
    }

    function openEdit(c: CategoryResponse) {
        setEditingId(c.id)
        setForm({ name: c.name, description: c.description ?? '' })
        setFormErrors({})
    }

    function set(field: keyof FormState) {
        return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setForm((prev) => ({ ...prev, [field]: e.target.value }))
            setFormErrors((prev) => ({ ...prev, [field]: undefined }))
        }
    }

    function validate(): boolean {
        const e: Partial<FormState> = {}
        if (!form.name.trim()) e.name = 'Name is required'
        setFormErrors(e)
        return Object.keys(e).length === 0
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault()
        if (!validate()) return

        const request: CategoryRequest = {
            name: form.name.trim(),
            description: form.description.trim() || undefined,
        }

        setSaving(true)
        setError(null)
        try {
            if (editingId) {
                const updated = await categoryService.update(editingId, request)
                setCategories((prev) => prev.map((c) => (c.id === editingId ? updated : c)))
            } else {
                const created = await categoryService.create(request)
                setCategories((prev) => [...prev, created])
            }
            setForm(EMPTY)
            setEditingId(null)
        } catch (err) {
            setError(parseApiError(err).message)
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete(id: string) {
        setDeletingId(id)
        try {
            await categoryService.delete(id)
            setCategories((prev) => prev.filter((c) => c.id !== id))
        } catch (err) {
            setError(parseApiError(err).message)
        } finally {
            setDeletingId(null)
            setConfirmId(null)
        }
    }

    return (
        <div className="admin-page">
            <div className="admin-page__header">
                <div>
                    <h1 className="admin-page__title">Categories</h1>
                    <p className="admin-page__subtitle">{categories.length} total</p>
                </div>
                <button className="btn btn--primary" onClick={openCreate}>
                    + New Category
                </button>
            </div>

            {error && <ErrorState message={error} onRetry={fetchCategories} />}

            {/* Inline form */}
            {(editingId !== undefined) && (
                <form className="admin-form" onSubmit={(e) => void handleSave(e)} noValidate>
                    <h2 className="admin-page__title" style={{ fontSize: '1rem' }}>
                        {editingId ? 'Edit Category' : 'New Category'}
                    </h2>
                    <div className="admin-form__field">
                        <label className="admin-form__label admin-form__label--required" htmlFor="cat-name">
                            Name
                        </label>
                        <input
                            id="cat-name"
                            className={`admin-form__input${formErrors.name ? ' admin-form__input--error' : ''}`}
                            value={form.name}
                            onChange={set('name')}
                        />
                        {formErrors.name && <span className="admin-form__error">{formErrors.name}</span>}
                    </div>
                    <div className="admin-form__field">
                        <label className="admin-form__label" htmlFor="cat-desc">
                            Description
                        </label>
                        <textarea
                            id="cat-desc"
                            className="admin-form__textarea"
                            value={form.description}
                            onChange={set('description')}
                        />
                    </div>
                    <div className="admin-form__actions">
                        <button
                            type="button"
                            className="btn btn--secondary"
                            onClick={() => { setEditingId(undefined as unknown as null); setForm(EMPTY) }}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn btn--primary" disabled={saving}>
                            {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create'}
                        </button>
                    </div>
                </form>
            )}

            {loading && !categories.length && <p className="admin-empty">Loading categories…</p>}

            {!loading && !error && categories.length === 0 && (
                <p className="admin-empty">No categories yet.</p>
            )}

            {categories.length > 0 && (
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Description</th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((c) => (
                                <tr key={c.id}>
                                    <td>{c.name}</td>
                                    <td>{c.description ?? '—'}</td>
                                    <td>
                                        <div className="admin-table__actions">
                                            <button
                                                className="btn btn--secondary btn--sm"
                                                onClick={() => openEdit(c)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn--danger btn--sm"
                                                onClick={() => setConfirmId(c.id)}
                                                disabled={deletingId === c.id}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Confirm delete modal */}
            {confirmId && (
                <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
                    <div className="admin-modal">
                        <h2 className="admin-modal__title">Delete category?</h2>
                        <p className="admin-modal__body">
                            Products in this category will become uncategorized.
                        </p>
                        <div className="admin-modal__actions">
                            <button className="btn btn--secondary" onClick={() => setConfirmId(null)}>
                                Cancel
                            </button>
                            <button
                                className="btn btn--danger"
                                disabled={deletingId === confirmId}
                                onClick={() => void handleDelete(confirmId)}
                            >
                                {deletingId === confirmId ? 'Deleting…' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
