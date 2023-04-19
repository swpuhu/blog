<script lang="ts">
import { chess, board, aiGame } from '../chessAI';

globalThis.aiGame = aiGame;
globalThis.chess = chess;
globalThis.board = board;
export default {
    props: {
        jsPath: String,
    },
    components: {},
    mounted() {
        const root = this.$refs.root as HTMLElement;
        console.log(root);
        if (root) {
            console.log(board.container);
            root.appendChild(board.container);
            board.updateBoard();
        }
    },
    methods: {},
};
</script>

<template>
    <div ref="root"></div>
</template>

<style scoped></style>
