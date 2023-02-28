export function isMobile(): boolean {
    if (typeof window !== 'undefined' && window.navigator) {
        const userAgent = window.navigator.userAgent;
        return /(mobile)/i.test(userAgent);
    }
    return false;
}

export function clamp(x: number, min: number, max: number) {
    if (x < min) {
        x = min;
    } else if (x > max) {
        x = max;
    }
    return x;
}