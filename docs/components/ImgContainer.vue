<template>
    <div class="img-container" :style="{ height: `${height}px` }">
        <div class="img" v-for="src in srcs">
            <img :src="src" :alt="alt" key="src" />
        </div>
    </div>
</template>
<script>
export default {
    props: {
        srcs: {
            type: Array,
        },
        alt: String,
        height: Number,
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
