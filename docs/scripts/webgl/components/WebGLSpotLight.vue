<script lang="ts">
import { main, ReturnType } from '../12-spotLight';
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
        const canvas = this.$refs.canvas4 as HTMLCanvasElement;
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
        setGloss(v: number) {
            settings && settings.setGloss(v);
        },
    },
};
</script>

<template>
    <div class="panel">
        <div class="control">
            <SlideBar
                label="TranslateX"
                :min="-10"
                :max="10"
                :val="0.63"
                :step="0.01"
                :fraction-num="2"
                @value-change="setTranslateX"
            />
            <SlideBar
                label="TranslateY"
                :min="-10"
                :max="10"
                :val="1.5"
                :step="0.01"
                :fraction-num="2"
                @value-change="setTranslateY"
            />
            <SlideBar
                label="TranslateZ"
                :min="0"
                :max="10"
                :val="1.6"
                :step="0.01"
                :fraction-num="2"
                @value-change="setTranslateZ"
            />
            <SlideBar
                label="Gloss"
                :min="10"
                :max="256"
                :val="64"
                @value-change="setGloss"
            />
        </div>

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
