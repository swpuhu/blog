<script lang="ts">
import main, { ReturnType } from '../6-webgl-imgprocess2';
import SlideBar from '../../../components/SlideBar.vue';
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
        setIterations(x: number) {
            if (setting) {
                setting.setIterations(x);
            }
        },
        setDownSample(x: number) {
            if (setting) {
                setting.setDownSample(x);
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
                label="迭代次数"
                :min="1"
                :max="50"
                :val="1"
                :fraction-num="0"
                @value-change="setIterations"
            />
            <SlideBar
                label="降采样倍数"
                :min="1"
                :max="16"
                :val="1"
                @value-change="setDownSample"
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
