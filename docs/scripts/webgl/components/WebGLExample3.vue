<script lang="ts">
import { main, ReturnType } from '../3-webgl-affine-transform';
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
            settings && settings.setRotation(rad);
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
                :min="-1"
                :max="1"
                :step="0.01"
                :val="0"
                :fraction-num="2"
                @value-change="setTranslateX"
            />
            <SlideBar
                label="TranslateY"
                :min="-1"
                :max="1"
                :step="0.01"
                :val="0"
                :fraction-num="2"
                @value-change="setTranslateY"
            />
            <SlideBar
                label="Rotation"
                :min="0"
                :max="360"
                :step="1"
                :val="0"
                :fraction-num="0"
                @value-change="setRotation"
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

        <SourceCodeExample />
    </div>
</template>

<style scoped>
#canvas {
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
