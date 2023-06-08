<script lang="ts">
import { main } from '../renderer/test';
import SlideBar from '../../../components/SlideBar.vue';
export default {
    props: {
        jsPath: String,
    },
    components: {
        SlideBar,
    },
    mounted() {
        const canvas = this.$refs.canvas4 as HTMLCanvasElement;
        const canvas5 = this.$refs.canvas5 as HTMLCanvasElement;
        const asp = 16 / 9;
        if (canvas) {
            const clientWidth = canvas.clientWidth;
            const width = clientWidth * window.devicePixelRatio;
            const height = (width / asp) >> 0;
            canvas.width = width;
            canvas.height = height;
        }
        main();

        if (canvas5) {
            const ctx = canvas5.getContext('2d');
            const svg = document.getElementById(
                'svg'
            ) as unknown as SVGImageElement;
            const image = new Image();

            image.src = '/img/WebGL_Logo.png';
            image.onload = () => {
                console.log('load');
                if (!ctx) {
                    return;
                }
                ctx.filter = 'drop-shadow(0 0 5px 2px black)';
                // ctx.filter = 'blur(4px)';
                ctx.font = '48px serif';
                ctx.fillText('Hello World', 0, 50);
                // ctx.drawImage(image, 0, 0);
            };
        }
    },
    methods: {},
};
</script>

<template>
    <div class="panel">
        <canvas ref="canvas4" id="canvas4"></canvas>
    </div>
</template>

<style scoped>
#canvas4 {
    width: 100%;
}
.panel {
    position: relative;
}

.control {
    position: absolute;
    right: 0;
    width: 35%;
    background-color: rgba(0, 0, 0, 0.3);
    padding: 15px;
    border-radius: 10px;
}
</style>
