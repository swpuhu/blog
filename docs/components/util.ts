export function isMobile(): boolean {
    const userAgent = navigator.userAgent;
    return /(mobile)/i.test(userAgent);
}