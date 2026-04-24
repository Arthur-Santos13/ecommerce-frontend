import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { parseApiError } from '@/services'
import type { CategoryResponse, ProductRequest } from '../../types/product.types'
import { categoryService } from '../../services/categoryService'
import { productService } from '../../services/productService'
import '@/app/styles/admin.css'

interface FormState {
    name: string
    description: string
    price: string
    sku: string
    categoryId: string
    quantityInStock: string
}

const EMPTY: FormState = {
    name: '',
    description: '',
    price: '',
    sku: '',
    categoryId: '',
    quantityInStock: '',
}

export default function AdminProductFormPage() {
    const { id } = useParams<{ id: string }>()
    const isEdit = Boolean(id)
    const navigate = useNavigate()

    const [form, setForm] = useState<FormState>(EMPTY)
    const [categories, setCategories] = useState<CategoryResponse[]>([])
    const [errors, setErrors] = useState<Partial<FormState>>({})
    const [saving, setSaving] = useState(false)
    const [apiError, setApiError] = useState<string | null>(null)

    useEffect(() => {
        categoryService.findAll().then(setCategories).catch(() => setCategories([]))
    }, [])

    useEffect(() => {
        if (!id) return
        productService
            .findById(id)
            .then((p) =>
                setForm({
                    name: p.name,
                    description: p.description ?? '',
                    price: String(p.price),
                    sku: p.sku,
                    categoryId: p.category?.id ?? '',
                    quantityInStock: String(p.quantityInStock),
                }),
            )
            .catch((err) => setApiError(parseApiError(err).message))
    }, [id])

    function set(field: keyof FormState) {
        return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            setForm((prev) => ({ ...prev, [field]: e.target.value }))
            setErrors((prev) => ({ ...prev, [field]: undefined }))
        }
    }

    function validate(): boolean {
        const e: Partial<FormState> = {}
        if (!form.name.trim()) e.name = 'Name is required'
        if (!form.sku.trim()) e.sku = 'SKU is required'
        if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
            e.price = 'Enter a valid price'
        if (!form.quantityInStock || isNaN(Number(form.quantityInStock)) || Number(form.quantityInStock) < 0)
            e.quantityInStock = 'Enter a valid quantity'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!validate()) return

        const request: ProductRequest = {
            name: form.name.trim(),
            description: form.description.trim() || undefined,
            price: Number(form.price),
            sku: form.sku.trim(),
            categoryId: form.categoryId || undefined,
            quantityInStock: Number(form.quantityInStock),
        }

        setSaving(true)
        setApiError(null)
        try {
            if (isEdit && id) {
                await productService.update(id, request)
            } else {
                await productService.create(request)
            }
            navigate('/admin/products')
        } catch (err) {
            setApiError(parseApiError(err).message)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="admin-page">
            <div className="admin-page__header">
                <div>
                    <h1 className="admin-page__title">
                        {isEdit ? 'Edit Product' : 'New Product'}
                    </h1>
                    <p className="admin-page__subtitle">
                        {isEdit ? 'Update product details' : 'Add a new product to the catalog'}
                    </p>
                </div>
            </div>

            {apiError && (
                <p style={{ color: 'var(--color-danger)', fontSize: '0.875rem' }}>{apiError}</p>
            )}

            <form className="admin-form" onSubmit={(e) => void handleSubmit(e)} noValidate>
                <div className="admin-form__row">
                    <div className="admin-form__field">
                        <label className="admin-form__label admin-form__label--required" htmlFor="name">
                            Name
                        </label>
                        <input
                            id="name"
                            className={`admin-form__input${errors.name ? ' admin-form__input--error' : ''}`}
                            value={form.name}
                            onChange={set('name')}
                        />
                        {errors.name && <span className="admin-form__error">{errors.name}</span>}
                    </div>
                    <div className="admin-form__field">
                        <label className="admin-form__label admin-form__label--required" htmlFor="sku">
                            SKU
                        </label>
                        <input
                            id="sku"
                            className={`admin-form__input${errors.sku ? ' admin-form__input--error' : ''}`}
                            value={form.sku}
                            onChange={set('sku')}
                        />
                        {errors.sku && <span className="admin-form__error">{errors.sku}</span>}
                    </div>
                </div>

                <div className="admin-form__field">
                    <label className="admin-form__label" htmlFor="description">
                        Description
                    </label>
                    <textarea
                        id="description"
                        className="admin-form__textarea"
                        value={form.description}
                        onChange={set('description')}
                    />
                </div>

                <div className="admin-form__row">
                    <div className="admin-form__field">
                        <label className="admin-form__label admin-form__label--required" htmlFor="price">
                            Price (BRL)
                        </label>
                        <input
                            id="price"
                            type="number"
                            min="0.01"
                            step="0.01"
                            className={`admin-form__input${errors.price ? ' admin-form__input--error' : ''}`}
                            value={form.price}
                            onChange={set('price')}
                        />
                        {errors.price && <span className="admin-form__error">{errors.price}</span>}
                    </div>
                    <div className="admin-form__field">
                        <label className="admin-form__label admin-form__label--required" htmlFor="qty">
                            Stock quantity
                        </label>
                        <input
                            id="qty"
                            type="number"
                            min="0"
                            step="1"
                            className={`admin-form__input${errors.quantityInStock ? ' admin-form__input--error' : ''}`}
                            value={form.quantityInStock}
                            onChange={set('quantityInStock')}
                        />
                        {errors.quantityInStock && (
                            <span className="admin-form__error">{errors.quantityInStock}</span>
                        )}
                    </div>
                </div>

                <div className="admin-form__field">
                    <label className="admin-form__label" htmlFor="category">
                        Category
                    </label>
                    <select
                        id="category"
                        className="admin-form__select"
                        value={form.categoryId}
                        onChange={set('categoryId')}
                    >
                        <option value="">— No category —</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="admin-form__actions">
                    <button
                        type="button"
                        className="btn btn--secondary"
                        onClick={() => navigate('/admin/products')}
                    >
                        Cancel
                    </button>
                    <button type="submit" className="btn btn--primary" disabled={saving}>
                        {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create product'}
                    </button>
                </div>
            </form>
        </div>
    )
}
