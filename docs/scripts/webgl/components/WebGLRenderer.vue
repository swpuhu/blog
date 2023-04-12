<script lang="ts">
import { main, ReturnType } from '../11-renderer';
let settings: ReturnType | null;
export default {
    props: {
        jsPath: String,
    },
    components: {},
    mounted() {
        const canvas = this.$refs.canvas2 as HTMLCanvasElement;
        const asp = 16 / 9;
        if (canvas) {
            const clientWidth = canvas.clientWidth;
            const width = clientWidth * window.devicePixelRatio;
            const height = (width / asp) >> 0;
            canvas.width = width;
            canvas.height = height;
        }
        settings = main();
    },
    methods: {},
};
</script>

<template>
    <div class="panel">
        <canvas ref="canvas2" id="canvas2"></canvas>
    </div>
</template>

<style scoped>
#canvas2 {
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
