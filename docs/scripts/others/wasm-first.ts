import { fetchAndInstantiate } from './util';
import { withBase } from 'vitepress';

export async function main(): Promise<any> {
    const instance = await fetchAndInstantiate(withBase('/wasm/util.wasm'));
    const table = new WebAssembly.Table({
        initial: 2,
        element: 'anyfunc',
    });

    const i2 = await fetchAndInstantiate(withBase('/wasm/table.wasm'), {
        js: {
            table: table,
        },
        env: {
            log: console.log,
        },
    });
    const func = i2.exports.test;
    (window as any).add = instance.exports.add;
    (window as any).sub = instance.exports.sub;
    (window as any).mul = instance.exports.mul;
    (window as any).table = table;
    (window as any).func = func;

    // func(2, 6);
    // console.log(i2);
    return;
}
