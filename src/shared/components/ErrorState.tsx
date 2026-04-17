interface ErrorStateProps {
    message: string
    onRetry?: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
    return (
        <div className="error-state" role="alert">
            <p className="error-state__message">{message}</p>
            {onRetry && (
                <button className="error-state__retry" onClick={onRetry}>
                    Try again
                </button>
            )}
        </div>
    )
}
