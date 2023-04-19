import { Chess } from 'chess.js';
import { ChessBoard } from './components/ChessBoard';

const chess = new Chess();

const board = new ChessBoard(chess);

const aiGame = {
    move() {
        if (chess.turn() === 'w') {
            return;
        }

        const allMoves = chess.moves();
        const move = allMoves[Math.floor(Math.random() * allMoves.length)];
        chess.move(move);
        board.updateBoard();
    },
};

board.on('done', () => {
    aiGame.move();
});
export { chess, board, aiGame };
