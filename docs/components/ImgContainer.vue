<template>
    <div
        :class="
            (isMobile() ? 'img-container-m' : 'img-container') +
            (forceFlex ? ' force-flex' : '')
        "
        :style="isMobile() && forceFlex ? {} : { height: `${height}px` }"
    >
        <div class="img" v-for="(src, i) in srcs">
            <img
                :src="getURL(src)"
                :alt="alt"
                key="src"
                @click="showFullScreenImg(getURL(src))"
            />
            <div class="label" v-if="labels[i] !== void 0">
                {{ labels[i] }}
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { withBase } from 'vitepress';
import { FullScreenImage } from './FullScreenImage';
import { isMobile } from './util';
export default {
    props: {
        srcs: {
            type: Array<string>,
        },
        alt: String,
        height: Number,
        labels: {
            type: Array,
            default: [],
        },
        forceFlex: {
            type: Boolean,
            default: false,
        },
    },
    methods: {
        getURL(src: string) {
            return withBase(src);
        },
        isMobile: isMobile,
        showFullScreenImg(src: string) {
            const fullScreenImg = FullScreenImage.getInstance();
            fullScreenImg.show(src);
        },
    },
};
</script>
<style scoped>
.img-container,
.img-container-m.force-flex {
    display: flex;
    justify-content: space-around;
    margin: 10px 0;
    align-items: center;
}

.img-container img {
    height: 100%;
}

.img-container .label,
.img-container-m .label {
    text-align: center;
    font-style: italic;
}

div.img {
    height: 100%;
}
</style>
