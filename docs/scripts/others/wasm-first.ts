import { withBase } from 'vitepress';
async function fetchAndInstantiate(
    url: string,
    importObject?: any
): Promise<any> {
    const response = await fetch(url);
    const bytes = await response.arrayBuffer();
    const results = await WebAssembly.instantiate(bytes, importObject);
    return results.instance;
}

export async function main(): Promise<(a: number, b: number) => number> {
    const instance = await fetchAndInstantiate(withBase('/wasm/first.wasm'));
    const add2 = instance.exports.add2;
    return add2 as (a: number, b: number) => number;
}
