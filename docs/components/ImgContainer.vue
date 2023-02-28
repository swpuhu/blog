<template>
    <div
        :class="
            (isMobile() ? 'img-container-m' : 'img-container') +
            (forceFlex ? ' force-flex' : '')
        "
        :style="isMobile() && forceFlex ? {} : { height: `${height}px` }"
    >
        <div class="img" v-for="(src, i) in srcs">
            <img :src="getURL(src)" :alt="alt" key="src" />
            <div class="label" v-if="labels[i] !== void 0">
                {{ labels[i] }}
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { withBase } from 'vitepress';
import { isMobile } from './util';
export default {
    props: {
        srcs: {
            type: Array,
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
        getURL(src) {
            return withBase(src);
        },
        isMobile: isMobile,
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
</style>
