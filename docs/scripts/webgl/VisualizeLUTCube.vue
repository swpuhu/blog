<template>
    <div style="text-align: center">
        <canvas id="lut" ref="lut"></canvas>
    </div>
</template>
<script lang="ts">
import axios from 'axios';
import { withBase } from 'vitepress';
import { readLUTCube, loadImage } from './util';
export default {
    mounted() {
        const canvas = this.$refs.lut as HTMLCanvasElement;
        const loadImgPromise = loadImage(
            withBase('/img/5-imgprocess/lenna.jpeg')
        );
        const lutRequestPromise = axios({
            method: 'GET',
            url: withBase('/LUT/lenna.CUBE'),
            responseType: 'text',
        });
        Promise.all([loadImgPromise, lutRequestPromise]).then(result => {
            const value = result[1];
            const { size, data } = readLUTCube(value.data);
            const width = Math.sqrt(size * size * size);
            const innerSize = Math.sqrt(width);
            canvas.width = width;
            canvas.height = width;
            const imageData = new ImageData(width, width);
            for (let y = 0; y < width; y++) {
                for (let x = 0; x < width; x++) {
                    const i = y * width + x;
                    const z = Math.floor(y / 64) * 8 + Math.floor(x / 64);
                    const Y = Math.floor(z / 8);
                    const X = z - Y * 8;
                    const ix = x - X * 64;
                    const iy = y - Y * 64;
                    const ii = iy * 64 + ix;
                    const iii = (z * 64 * 64 + ii) * 3;
                    imageData.data[i * 4] = data[iii] * 255;
                    imageData.data[i * 4 + 1] = data[iii + 1] * 255;
                    imageData.data[i * 4 + 2] = data[iii + 2] * 255;
                    imageData.data[i * 4 + 3] = 255;
                }
            }

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.putImageData(imageData, 0, 0);
            }
        });
    },
};
</script>
<style scoped>
#lut {
    width: 80%;
    display: inline;
}
</style>
