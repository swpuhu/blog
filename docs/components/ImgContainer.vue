<template>
    <div class="img-container" :style="{ height: `${height}px` }">
        <div class="img" v-for="(src, i) in srcs">
            <img :src="getURL(src)" :alt="alt" key="src" />
            <div class="label" v-if="labels[i] !== void 0">
                {{ labels[i] }}
            </div>
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
        labels: {
            type: Array,
            default: [],
        },
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
    margin: 10px 0;
}
.img-container img {
    height: 100%;
}

.img-container .label {
    text-align: center;
    font-style: italic;
}
</style>
