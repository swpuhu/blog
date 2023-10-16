<script lang="ts">
import { withBase } from 'vitepress';
import { renderLoop, init, simulate } from './conwayGame';
import { fetchAndInstantiate, randomFillInArray } from './util';

export default {
    mounted() {
        const USE_WASM = true;
        init();
        const importObj = {
            env: {
                log: console.log,
            },
        };
        const width = 200;
        const height = 200;
        if (USE_WASM) {
            fetchAndInstantiate(withBase('/wasm/conway3.wasm')).then(
                instance => {
                    const mem: WebAssembly.Memory = instance.exports.memory;
                    mem.grow(20);
                    const buffer = mem.buffer;
                    const u8View = new Uint8Array(buffer);
                    // u8View[3] = 1;
                    // u8View[4] = 1;
                    // u8View[5] = 1;
                    randomFillInArray(u8View, width * height);
                    const simulate = instance.exports.simulate;

                    const size = width * height;
                    let dst = Math.ceil(size / 8) * 8;
                    let src = 0;
                    (window as any).dst = dst;
                    (window as any).u8 = u8View;
                    simulate(0, dst, width, height);
                    console.log(u8View);
                    const result = u8View.subarray(dst, dst + size);
                    renderLoop(result, width, height);

                    const anim = () => {
                        // console.log(arr, dst);
                        const result = u8View.subarray(dst, dst + size);
                        renderLoop(result, width, height);

                        console.time('simulate wasm');
                        simulate(src, dst, width, height);
                        console.timeEnd('simulate wasm');
                        [src, dst] = [dst, src];
                        setTimeout(anim, 50);
                    };
                    anim();
                }
            );
        }

        const canvas = document.getElementById('canvas') as HTMLCanvasElement;

        if (canvas) {
            let arr = new Array(width * height).fill(0);
            let dst = new Array(width * height).fill(0);
            randomFillInArray(arr, width * height);

            // arr[1025] = 1;
            // arr[1026] = 1;
            // arr[1027] = 1;
            // arr[2078] = 1;
            // arr[2079] = 1;
            // arr[2080] = 1;

            // for (let i = 0; i < arr.length; i++) {
            //     const r = Math.random();
            //     if (r > 0.92) {
            //         arr[i] = 1;
            //     }
            // }

            simulate(arr, dst, width, height);
            console.log(dst);
            // renderLoop(arr, width, height);

            const anim = () => {
                // console.log(arr, dst);
                renderLoop(dst, width, height);
                console.time('simulate js');
                simulate(arr, dst, width, height);
                console.timeEnd('simulate js');
                [arr, dst] = [dst, arr];
                setTimeout(anim, 50);
            };
            if (!USE_WASM) {
                anim();
            }
        }
    },
};
</script>

<template>
    <canvas id="canvas" width="500" height="500"></canvas>
</template>

<style scoped>
.flex {
    display: flex;
    margin: 10px 0;
}

.flex input {
    border: 1px solid #ccc;
}
</style>
