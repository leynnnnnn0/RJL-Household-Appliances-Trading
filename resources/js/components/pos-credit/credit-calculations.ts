export type ItemType = 'furniture' | 'gadgets' | 'appliances';

export interface InterestConfig {
    multiplier: number;
    fixedCharge: number;
}

export type InterestConfigMap = Record<
    ItemType,
    Record<number, InterestConfig>
>;

export interface CreditProduct {
    srp: number;
    item_type: ItemType;
    isFree: boolean;
}

export interface PaymentBreakdown {
    lcp: number;
    pnv: number;
    finalPNV: number;
    monthlyPayment: number;
    totalAmount: number;
    totalInterest: number;
    downPaymentAmount: number;
    multiplier: number;
    fixedCharge: number;
}

export const ITEM_TYPES: ItemType[] = ['furniture', 'gadgets', 'appliances'];
export const PAYMENT_TERMS = [3, 6, 9, 12] as const;
export const DEFAULT_LCP_MARKUP_RATE = 1.1;
export const DEFAULT_LCP_ADDITIONAL_CHARGE = 300;
export const NO_DOWN_PAYMENT_MULTIPLIER = 1.33;
export const NO_DOWN_PAYMENT_FIXED_CHARGE = 600;

export const DEFAULT_INTEREST_CONFIGS: InterestConfigMap = {
    furniture: {
        3: { multiplier: 1.12, fixedCharge: 0 },
        6: { multiplier: 1.18, fixedCharge: 300 },
        9: { multiplier: 1.21, fixedCharge: 450 },
        12: { multiplier: 1.27, fixedCharge: 600 },
    },
    gadgets: {
        3: { multiplier: 1.1, fixedCharge: 0 },
        6: { multiplier: 1.27, fixedCharge: 300 },
        9: { multiplier: 1.3, fixedCharge: 450 },
        12: { multiplier: 1.33, fixedCharge: 600 },
    },
    appliances: {
        3: { multiplier: 1.12, fixedCharge: 0 },
        6: { multiplier: 1.18, fixedCharge: 300 },
        9: { multiplier: 1.21, fixedCharge: 450 },
        12: { multiplier: 1.27, fixedCharge: 600 },
    },
};

export function cloneDefaultInterestConfigs(): InterestConfigMap {
    return structuredClone(DEFAULT_INTEREST_CONFIGS);
}

export function formatCurrency(amount: number): string {
    return amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;

    return `${(bytes / 1048576).toFixed(1)} MB`;
}

export function calculateLCP(
    srp: number,
    markupRate = DEFAULT_LCP_MARKUP_RATE,
    additionalCharge = DEFAULT_LCP_ADDITIONAL_CHARGE,
): number {
    return srp * markupRate + additionalCharge;
}

export function getDefaultDownPaymentPercent(itemType?: string): number {
    if (itemType === 'furniture' || itemType === 'appliances') {
        return 0.15;
    }

    return 0.2;
}

export function getInterestConfig(
    interestConfigs: InterestConfigMap,
    itemType: string | undefined,
    months: number,
): InterestConfig {
    const type = ITEM_TYPES.includes(itemType as ItemType)
        ? (itemType as ItemType)
        : 'furniture';

    return (
        interestConfigs[type]?.[months] ?? { multiplier: 1.12, fixedCharge: 0 }
    );
}

export function paidProductTotal(products: CreditProduct[]): number {
    return products
        .filter((item) => !item.isFree)
        .reduce((sum, item) => sum + Number.parseFloat(item.srp.toString()), 0);
}

export function calculatePaymentBreakdown({
    products,
    totalLCP,
    downPayment,
    selectedTerm,
    noDownPayment,
    noInterestRate,
    interestConfigs,
}: {
    products: CreditProduct[];
    totalLCP: number;
    downPayment: number;
    selectedTerm: number;
    noDownPayment: boolean;
    noInterestRate: boolean;
    interestConfigs: InterestConfigMap;
}): PaymentBreakdown | null {
    const paidProducts = products.filter((item) => !item.isFree);
    if (paidProducts.length === 0) return null;

    const lcp = totalLCP;
    const downPaymentAmount = noDownPayment ? 0 : downPayment;
    const pnv = lcp - downPaymentAmount;
    const { multiplier, fixedCharge } = getInterestConfig(
        interestConfigs,
        paidProducts[0].item_type,
        selectedTerm,
    );

    let finalPNV: number;

    if (noInterestRate) {
        finalPNV = pnv;
    } else if (noDownPayment) {
        finalPNV =
            lcp * NO_DOWN_PAYMENT_MULTIPLIER + NO_DOWN_PAYMENT_FIXED_CHARGE;
    } else {
        finalPNV = pnv * multiplier + fixedCharge;
    }

    const monthlyPayment = finalPNV / selectedTerm;

    return {
        lcp,
        pnv,
        finalPNV,
        monthlyPayment,
        totalAmount: downPaymentAmount + finalPNV,
        totalInterest: finalPNV - pnv,
        downPaymentAmount,
        multiplier,
        fixedCharge,
    };
}
