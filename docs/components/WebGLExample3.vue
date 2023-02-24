<script>
import SlideBar from './SlideBar.vue';
export default {
    components: {
        SlideBar,
    },
    data() {
        return {
            translateX: 20,
            translateY: 0,
            rotate: 0,
            scaleX: 1,
            scaleY: 1,
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
                :min="100"
                :max="400"
                :val="200"
                @value-change="onTranslateXChange"
            />
            <SlideBar
                label="TranslateY: "
                :min="0"
                :max="200"
                :val="5"
                @value-change="onTranslateYChange"
            />

            <SlideBar
                label="Rotate: "
                :min="0"
                :max="360"
                :val="10"
                @value-change="onRotateChange"
            />
        </div>
        <div class="display">
            <div class="trs img-container">
                <img
                    width="200"
                    src="/img/affine-transform/affine-transform.webp"
                    alt=""
                    :style="{
                        transform: `translate(${translateX}px, ${translateY}px) rotate(${rotate}deg) scale(${scaleX}, ${scaleY})`,
                    }"
                />
            </div>
            <div class="tsr img-container">
                <img
                    width="200"
                    src="/img/affine-transform/affine-transform.webp"
                    alt=""
                    :style="{
                        transform: `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY}) rotate(${rotate}deg)`,
                    }"
                />
            </div>
            <div class="srt img-container">
                <img
                    width="200"
                    src="/img/affine-transform/affine-transform.webp"
                    alt=""
                    :style="{
                        transform: `scale(${scaleX}, ${scaleY}) rotate(${rotate}deg) translate(${translateX}px, ${translateY}px)`,
                    }"
                />
            </div>
        </div>
    </div>
</template>
<style scoped>
.flex {
    display: flex;
}
.control {
    min-width: 30%;
    flex-shrink: 0;
}

.display {
    flex: 1;
}
.img-container {
    height: 250px;
    border: 2px solid #ccc;
    width: 100%;
    overflow: hidden;
}
</style>
