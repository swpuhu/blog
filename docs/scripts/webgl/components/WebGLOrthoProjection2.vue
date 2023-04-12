<script lang="ts">
import { main, ReturnType } from '../7-orthoProjection2';
import SlideBar from '../../../components/SlideBar.vue';
let settings: ReturnType | null;
export default {
    props: {
        jsPath: String,
    },
    components: {
        SlideBar,
    },
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
    methods: {
        setTranslateX(x: number) {
            settings && settings.setTranslateX(x);
        },
        setTranslateY(y: number) {
            settings && settings.setTranslateY(y);
        },
        setRotation(deg: number) {
            const rad = (deg / 180) * Math.PI;
            settings && settings.setRotationZ(rad);
        },
        setRotationY(deg: number) {
            const rad = (deg / 180) * Math.PI;
            settings && settings.setRotationY(rad);
        },
        setRotationX(deg: number) {
            const rad = (deg / 180) * Math.PI;
            settings && settings.setRotationX(rad);
        },
        setScale(s: number) {
            settings && settings.setScale(s);
        },
    },
};
</script>

<template>
    <div class="panel">
        <div class="control">
            <SlideBar
                label="TranslateX"
                :min="-200"
                :max="500"
                :val="260"
                @value-change="setTranslateX"
            />
            <SlideBar
                label="TranslateY"
                :min="-200"
                :max="500"
                :val="100"
                @value-change="setTranslateY"
            />
            <SlideBar
                label="RotationZ"
                :min="0"
                :max="360"
                :step="1"
                :val="15"
                :fraction-num="0"
                @value-change="setRotation"
            />
            <SlideBar
                label="RotationY"
                :min="0"
                :max="360"
                :step="1"
                :val="53"
                :fraction-num="0"
                @value-change="setRotationY"
            />
            <SlideBar
                label="RotationX"
                :min="0"
                :max="360"
                :step="1"
                :val="30"
                :fraction-num="0"
                @value-change="setRotationX"
            />
            <SlideBar
                label="Scale"
                :min="1"
                :max="3"
                :step="0.01"
                :val="1"
                :fraction-num="2"
                @value-change="setScale"
            />
        </div>

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
