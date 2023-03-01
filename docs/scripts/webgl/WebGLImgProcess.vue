<script lang="ts">
import main, { ReturnType } from './5-webgl-imgprocess';
import SlideBar from '../../components/SlideBar.vue';
let setting: ReturnType | undefined;
export default {
    props: {},
    components: { SlideBar },
    data() {
        return {
            activeIndex: 1,
        };
    },
    methods: {
        setBrightness(x: number) {
            if (setting) {
                setting.setBrightness(x);
            }
        },
        setContrast(x: number) {
            if (setting) {
                setting.setContrast(x);
            }
        },
    },
    mounted() {
        setting = main();
    },
};
</script>

<template>
    <div class="img-process-demo">
        <div class="control">
            <SlideBar
                label="亮度(Brightness)"
                :min="0"
                :max="3"
                :step="0.01"
                :val="1"
                :fraction-num="2"
                @value-change="setBrightness"
            />
            <SlideBar
                label="饱和度(Saturate)"
                :min="0"
                :max="2"
                :step="0.01"
                :val="1"
                :fraction-num="2"
                @value-change="setContrast"
            />
            <SlideBar
                label="x轴偏移量"
                :min="0"
                :max="3"
                :step="0.01"
                :val="0"
                :fraction-num="2"
            />
            <SlideBar
                label="y轴偏移量"
                :min="0"
                :max="3"
                :step="0.01"
                :val="0"
                :fraction-num="2"
            />
        </div>
        <SourceCodeExample />
    </div>
</template>

<style scoped>
#canvas {
    width: 100%;
}

.uv-demo {
    border: 1px solid var(--vp-button-brand-bg);
}
.control {
    padding: 20px;
    font-weight: bold;
}
.button {
    background: var(--vp-button-brand-bg);
    color: var(--vp-button-brand-text);
    padding: 0 20px;
    border-color: var(--vp-button-brand-border);
    line-height: 38px;
    font-size: 14px;
    font-weight: bold;
    border-radius: 20px;
}

.flex {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}
.button-container {
    margin: 10px 0;
}
.button.active,
.button:active {
    background-color: var(--vp-button-brand-active-bg);
}

.button:hover {
    background-color: var(--vp-button-brand-active-bg);
}

.button {
    text-align: center;
    margin: 10px 0;
}
</style>
