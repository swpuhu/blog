<script>
import SlideBar from './SlideBar.vue';
export default {
    components: {
        SlideBar,
    },
    data() {
        return {
            translateX: 50,
            translateY: 75,
            rotate: 55,
            scaleX: 1,
            scaleY: 1,
            imgWidth: 150,
        };
    },
    methods: {
        onTranslateXChange(x) {
            this.translateX = x;
        },
        onTranslateYChange(y) {
            this.translateY = y;
        },
        onRotateChange(r) {
            this.rotate = r;
        },
        onScaleXChange(scaleX) {
            this.scaleX = scaleX;
        },
        onScaleYChange(scaleY) {
            this.scaleY = scaleY;
        },
    },
};
</script>
<template>
    <div class="flex">
        <div class="control">
            <SlideBar
                label="TranslateX: "
                :min="-200"
                :max="200"
                :val="translateX"
                @value-change="onTranslateXChange"
            />
            <SlideBar
                label="TranslateY: "
                :min="0"
                :max="200"
                :val="translateY"
                @value-change="onTranslateYChange"
            />

            <SlideBar
                label="Rotate: "
                :min="0"
                :max="360"
                :val="rotate"
                @value-change="onRotateChange"
            />
            <SlideBar
                label="Scale: "
                :min="0.2"
                :max="3"
                :val="scaleX"
                :fraction-num="1"
                @value-change="onScaleXChange"
            />
        </div>
        <div class="display">
            <div class="trs img-container">
                <div class="transform-text">
                    translate({{ translateX }}, {{ translateY }}),rotate({{
                        rotate.toFixed(1)
                    }}), scale({{ scaleX.toFixed(1) }})
                </div>
                <div>
                    <img
                        :width="imgWidth"
                        src="/img/affine-transform/affine-transform.webp"
                        alt=""
                        :style="{
                            transform: `translate(${translateX}px, ${translateY}px) rotate(${rotate}deg) scale(${scaleX}, ${scaleX})`,
                        }"
                    />
                </div>
            </div>
            <div class="srt img-container">
                <div class="transform-text">
                    scale({{ scaleX.toFixed(1) }}), rotate({{
                        rotate.toFixed(1)
                    }}), translate({{ translateX }}, {{ translateY }})
                </div>
                <div>
                    <img
                        :width="imgWidth"
                        src="/img/affine-transform/affine-transform.webp"
                        alt=""
                        :style="{
                            transform: `scale(${scaleX}, ${scaleX}) rotate(${rotate}deg) translate(${translateX}px, ${translateY}px)`,
                        }"
                    />
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
.flex {
    display: flex;
}
.control {
    min-width: 25%;
    flex-shrink: 0;
}

.display {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
}
.img-container {
    position: relative;
    height: 200px;
    border: 2px solid #ccc;
    width: 50%;
    overflow: hidden;
}

.img-container .transform-text {
    font-weight: bold;
    width: 100%;
    z-index: 1;
    position: absolute;
    text-shadow: 2px 0px black;
}
</style>
