<script lang="ts">
import opentype, { Font, Glyph } from 'opentype.js';
import { withBase } from 'vitepress';
export default {
    props: {},
    mounted() {
        const canvas: HTMLCanvasElement = this.$refs.canvas;
        const asp = 16 / 9;
        if (canvas) {
            const clientWidth = canvas.clientWidth;
            const width = clientWidth * window.devicePixelRatio;
            const height = (width / asp) >> 0;
            canvas.width = width;
            canvas.height = height;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const fontDir = withBase('/fonts/simhei.ttf');
        ctx.translate(100, 100);
        ctx.moveTo(0, 0);
        ctx.lineTo(1000, 0);
        ctx.stroke();
        opentype.load(
            fontDir,
            (err, font: Font) => {
                console.log(font);
                const paths = font.getPaths('A BCg洪');
                const width = font.getAdvanceWidth('A BCg洪');
                console.log(width);

                console.log(paths);

                for (let i = 0; i < paths.length; i++) {
                    const path = paths[i];

                    ctx.beginPath();
                    for (let j = 0; j < path.commands.length; j++) {
                        const c = path.commands[j];
                        if (c.type === 'M') {
                            ctx.moveTo(c.x, c.y);
                        } else if (c.type === 'L') {
                            ctx.lineTo(c.x, c.y);
                        } else if (c.type === 'Z') {
                            ctx.closePath();
                        } else if (c.type === 'Q') {
                            ctx.quadraticCurveTo(c.x1, c.y1, c.x, c.y);
                        }
                    }
                    ctx.fill();
                    ctx.stroke();
                }

                // ctx.moveTo(0, 0);
                // ctx.lineTo(100, 100);
                // ctx.stroke();
            },
            null
        );
    },
};
</script>

<template>
    <canvas ref="canvas" id="canvas"></canvas>
</template>

<style scoped>
#canvas {
    width: 100%;
}
</style>
