<script lang="ts">
import { main, ReturnType } from './10-camera2';
import SlideBar from '../../components/SlideBar.vue';
let settings: ReturnType | null;
export default {
    props: {
        jsPath: String,
    },
    components: {
        SlideBar,
    },
    mounted() {
        const canvas = this.$refs.canvas3 as HTMLCanvasElement;
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
        setTranslateZ(z: number) {
            settings && settings.setTranslateZ(z);
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
                :max="200"
                :val="77"
                @value-change="setTranslateX"
            />
            <SlideBar
                label="TranslateY"
                :min="-200"
                :max="200"
                :val="77"
                @value-change="setTranslateY"
            />
            <SlideBar
                label="TranslateZ"
                :min="0"
                :max="1000"
                :val="128"
                @value-change="setTranslateZ"
            />
        </div>

        <canvas ref="canvas3" id="canvas3"></canvas>
    </div>
</template>

<style scoped>
#canvas3 {
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
