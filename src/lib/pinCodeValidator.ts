/**
 * Indian PIN Code Validation and Location Lookup
 * Validates PIN codes and provides city/state information
 */

export interface PinCodeData {
    pincode: string;
    city: string;
    state: string;
    district?: string;
    country: string;
}

/**
 * Validates Indian PIN code format (6 digits, first digit cannot be 0)
 */
export function isValidPinCode(pincode: string): boolean {
    const pinRegex = /^[1-9][0-9]{5}$/;
    return pinRegex.test(pincode);
}

/**
 * Fetches location data for a given PIN code using India Post API
 */
export async function fetchPinCodeData(pincode: string): Promise<PinCodeData | null> {
    if (!isValidPinCode(pincode)) {
        return null;
    }

    try {
        // Using India Post API (free, no auth required)
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await response.json();

        if (data && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
            const postOffice = data[0].PostOffice[0];
            return {
                pincode,
                city: postOffice.District || postOffice.Block || postOffice.Name,
                state: postOffice.State,
                district: postOffice.District,
                country: postOffice.Country || 'India',
            };
        }

        return null;
    } catch (error) {
        console.error('PIN code lookup error:', error);
        return null;
    }
}

/**
 * Debounce function for PIN code input
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

/**
 * Format PIN code (removes non-digits, limits to 6 characters)
 */
export function formatPinCode(value: string): string {
    return value.replace(/\D/g, '').slice(0, 6);
}
