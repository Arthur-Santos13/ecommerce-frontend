import { type FormEvent, useEffect, useState } from 'react'
import type { CategoryResponse, ProductFilter } from '../types/product.types'

interface Props {
    filter: ProductFilter
    categories: CategoryResponse[]
    onApply: (filter: ProductFilter) => void
    onReset: () => void
}

export default function ProductFilters({ filter, categories, onApply, onReset }: Props) {
    const [local, setLocal] = useState(filter)

    useEffect(() => {
        setLocal(filter)
    }, [filter])

    function handleSubmit(e: FormEvent) {
        e.preventDefault()
        onApply({ ...local, page: 0 })
    }

    return (
        <form className="product-filters" onSubmit={handleSubmit} onReset={() => onReset()}>
            <input
                className="product-filters__input product-filters__input--name"
                type="text"
                value={local.name ?? ''}
                onChange={(e) => setLocal((p) => ({ ...p, name: e.target.value || undefined }))}
                placeholder="Search products…"
                aria-label="Search by name"
            />

            <select
                className="product-filters__select product-filters__select--category"
                value={local.categoryId ?? ''}
                onChange={(e) =>
                    setLocal((p) => ({ ...p, categoryId: e.target.value || undefined }))
                }
                aria-label="Category"
            >
                <option value="">All categories</option>
                {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                        {c.name}
                    </option>
                ))}
            </select>

            <input
                className="product-filters__input product-filters__input--price"
                type="number"
                min={0}
                step={0.01}
                value={local.minPrice ?? ''}
                onChange={(e) =>
                    setLocal((p) => ({
                        ...p,
                        minPrice: e.target.value ? Number(e.target.value) : undefined,
                    }))
                }
                placeholder="Min $"
                aria-label="Min price"
            />

            <input
                className="product-filters__input product-filters__input--price"
                type="number"
                min={0}
                step={0.01}
                value={local.maxPrice ?? ''}
                onChange={(e) =>
                    setLocal((p) => ({
                        ...p,
                        maxPrice: e.target.value ? Number(e.target.value) : undefined,
                    }))
                }
                placeholder="Max $"
                aria-label="Max price"
            />

            <label className="product-filters__checkbox">
                <input
                    type="checkbox"
                    checked={local.inStock ?? false}
                    onChange={(e) =>
                        setLocal((p) => ({ ...p, inStock: e.target.checked || undefined }))
                    }
                />
                In stock
            </label>

            <div className="product-filters__actions">
                <button type="submit" className="product-filters__btn product-filters__btn--primary">
                    Apply
                </button>
                <button
                    type="reset"
                    className="product-filters__btn product-filters__btn--secondary"
                >
                    Reset
                </button>
            </div>
        </form>
    )
}
