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
            <h2 className="product-filters__title">Filters</h2>

            <div className="product-filters__group">
                <label className="product-filters__label" htmlFor="filter-name">
                    Name
                </label>
                <input
                    id="filter-name"
                    className="product-filters__input"
                    type="text"
                    value={local.name ?? ''}
                    onChange={(e) => setLocal((p) => ({ ...p, name: e.target.value || undefined }))}
                    placeholder="Search products…"
                />
            </div>

            <div className="product-filters__group">
                <label className="product-filters__label" htmlFor="filter-category">
                    Category
                </label>
                <select
                    id="filter-category"
                    className="product-filters__select"
                    value={local.categoryId ?? ''}
                    onChange={(e) =>
                        setLocal((p) => ({ ...p, categoryId: e.target.value || undefined }))
                    }
                >
                    <option value="">All categories</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="product-filters__group product-filters__group--row">
                <div className="product-filters__col">
                    <label className="product-filters__label" htmlFor="filter-min">
                        Min price
                    </label>
                    <input
                        id="filter-min"
                        className="product-filters__input product-filters__input--sm"
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
                        placeholder="0.00"
                    />
                </div>
                <div className="product-filters__col">
                    <label className="product-filters__label" htmlFor="filter-max">
                        Max price
                    </label>
                    <input
                        id="filter-max"
                        className="product-filters__input product-filters__input--sm"
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
                        placeholder="9999.99"
                    />
                </div>
            </div>

            <label className="product-filters__checkbox">
                <input
                    type="checkbox"
                    checked={local.inStock ?? false}
                    onChange={(e) =>
                        setLocal((p) => ({ ...p, inStock: e.target.checked || undefined }))
                    }
                />
                In stock only
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
