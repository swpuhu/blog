<script lang="ts">
import { main } from './wasm-first';
export default {
    mounted() {
        main().then(add2 => {
            //@ts-nocheck
        });
    },
};
</script>

<template></template>

<style scoped>
.flex {
    display: flex;
    margin: 10px 0;
}

.flex input {
    border: 1px solid #ccc;
}
</style>
