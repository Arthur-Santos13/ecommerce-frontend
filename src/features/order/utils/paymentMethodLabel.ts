import type { PaymentMethod } from '../types/order.types'

const LABELS: Record<PaymentMethod, string> = {
    CREDIT_CARD: 'Credit card',
    DEBIT_CARD: 'Debit card',
    PIX: 'PIX',
    BANK_SLIP: 'Bank slip (boleto)',
}

export function paymentMethodLabel(method?: PaymentMethod): string {
    if (!method) return 'Credit card (default)'
    return LABELS[method]
}
