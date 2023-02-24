<script>
import main from './1-webgl-introduction-2';
export default {
    props: {
        jsPath: String,
    },
    mounted() {
        main();
    },
};
</script>

<template>
    <SourceCodeExample />
</template>

<style scoped>
#canvas {
    width: 100%;
}
</style>
