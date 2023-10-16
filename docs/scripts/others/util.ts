export async function fetchAndInstantiate(
    url: string,
    importObject?: any
): Promise<any> {
    const response = await fetch(url);
    const bytes = await response.arrayBuffer();
    const results = await WebAssembly.instantiate(bytes, importObject);
    return results.instance;
}

export function randomFillInArray(
    arr: number[] | Uint8Array,
    len: number
): void {
    for (let i = 0; i < len; i++) {
        const r = Math.random();
        if (r > 0.92) {
            arr[i] = 1;
        }
    }
}
