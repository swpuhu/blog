<template>
    <div class="img-container" :style="{ height: `${height}px` }">
        <div class="img" v-for="src in srcs">
            <img :src="getURL(src)" :alt="alt" key="src" />
        </div>
    </div>
</template>
<script>
import { withBase } from 'vitepress';
export default {
    props: {
        srcs: {
            type: Array,
        },
        alt: String,
        height: Number,
    },
    methods: {
        getURL(src) {
            return withBase(src);
        },
    },
};
</script>
<style scoped>
.img-container {
    display: flex;
    justify-content: space-around;
}
.img-container img {
    height: 100%;
}
</style>
