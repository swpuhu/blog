<script lang="ts">
import { withBase } from 'vitepress';
import { compute8ssedt, loadImage } from './util';
export default {
    props: {},
    mounted() {
        const canvas = this.$refs.test as HTMLCanvasElement;
        if (!canvas) {
            return;
        }
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return;
        }

        loadImage(withBase('/img/binImage.jpg')).then(img => {
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
            );

            const result = compute8ssedt(imageData);
            console.log(result.length, result);
        });
    },
};
</script>

<template>
    <canvas ref="test" id="test"></canvas>
</template>

<style scoped>
#test {
    width: 100%;
}
</style>
