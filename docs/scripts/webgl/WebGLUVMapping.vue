<script>
import main from './4-webgl-texture.js';
import SlideBar from '../../components/SlideBar.vue';
import { render } from 'vue';
export default {
    props: {},
    components: { SlideBar },
    data() {
        return {
            activeIndex: 1,
        };
    },
    methods: {
        clickButton(index) {
            this.activeIndex = index;
            if (this.setting) {
                this.setting.setTexParameteri(this.activeIndex);
            }
        },
        setUVTransformX(v) {
            if (this.setting) {
                this.setting.setUVTransformX(v);
            }
        },
        setUVTransformY(v) {
            if (this.setting) {
                this.setting.setUVTransformY(v);
            }
        },
        setUVTransformZ(v) {
            if (this.setting) {
                this.setting.setUVTransformZ(v);
            }
        },
        setUVTransformW(v) {
            if (this.setting) {
                this.setting.setUVTransformW(v);
            }
        },
    },
    mounted() {
        this.setting = main();
        if (this.setting) {
            this.setting.setTexParameteri(this.activeIndex);
        }
    },
};
</script>

<template>
    <div class="uv-demo">
        <div class="button-container flex">
            <div class="label">纹理采样方式：</div>
            <button
                :class="`button ${activeIndex === 0 ? 'active' : ''}`"
                @click="clickButton(0)"
            >
                CLAMP_TO_EDGE
            </button>
            <button
                :class="`button ${activeIndex === 1 ? 'active' : ''}`"
                @click="clickButton(1)"
            >
                REPEAT
            </button>
            <div
                :class="`button ${activeIndex === 2 ? 'active' : ''}`"
                @click="clickButton(2)"
            >
                MIRRORED_REPEAT
            </div>
        </div>
        <div class="control">
            <SlideBar
                label="x轴重复数量"
                :min="1"
                :max="3"
                :step="0.01"
                :val="1"
                :fraction-num="2"
                @value-change="setUVTransformX"
            />
            <SlideBar
                label="y轴重复数量"
                :min="1"
                :max="3"
                :step="0.01"
                :val="1"
                :fraction-num="2"
                @value-change="setUVTransformY"
            />
            <SlideBar
                label="x轴偏移量"
                :min="0"
                :max="3"
                :step="0.01"
                :val="0"
                :fraction-num="2"
                @value-change="setUVTransformZ"
            />
            <SlideBar
                label="y轴偏移量"
                :min="0"
                :max="3"
                :step="0.01"
                :val="0"
                :fraction-num="2"
                @value-change="setUVTransformW"
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
</style>
