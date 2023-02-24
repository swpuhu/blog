<script>
export default {
    props: {
        jsPath: String,
    },
    mounted() {
        const canvas = this.$refs.canvas;
        const asp = 16 / 9;
        if (canvas) {
            const clientWidth = canvas.clientWidth;
            const width = clientWidth * window.devicePixelRatio;
            const height = (width / asp) >> 0;
            canvas.width = width;
            canvas.height = height;

            import(this.jsPath);
        }
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
