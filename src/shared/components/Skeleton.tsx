interface SkeletonProps {
    width?: string
    height?: string
    borderRadius?: string
    className?: string
}

export function Skeleton({
    width = '100%',
    height = '1rem',
    borderRadius = '4px',
    className = '',
}: SkeletonProps) {
    return (
        <div
            className={`skeleton${className ? ` ${className}` : ''}`}
            style={{ width, height, borderRadius }}
            aria-hidden="true"
        />
    )
}
