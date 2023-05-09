import { Chess } from 'chess.js';
import { ChessBoard } from './components/ChessBoard';

const chess = new Chess();

const board = new ChessBoard(chess);
const reverseArray = function (array) {
    return array.slice().reverse();
};
const pawnEvalWhite = [
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0],
    [1.0, 1.0, 2.0, 3.0, 3.0, 2.0, 1.0, 1.0],
    [0.5, 0.5, 1.0, 2.5, 2.5, 1.0, 0.5, 0.5],
    [0.0, 0.0, 0.0, 2.0, 2.0, 0.0, 0.0, 0.0],
    [0.5, -0.5, -1.0, 0.0, 0.0, -1.0, -0.5, 0.5],
    [0.5, 1.0, 1.0, -2.0, -2.0, 1.0, 1.0, 0.5],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
];
const knightEval = [
    [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
    [-4.0, -2.0, 0.0, 0.0, 0.0, 0.0, -2.0, -4.0],
    [-3.0, 0.0, 1.0, 1.5, 1.5, 1.0, 0.0, -3.0],
    [-3.0, 0.5, 1.5, 2.0, 2.0, 1.5, 0.5, -3.0],
    [-3.0, 0.0, 1.5, 2.0, 2.0, 1.5, 0.0, -3.0],
    [-3.0, 0.5, 1.0, 1.5, 1.5, 1.0, 0.5, -3.0],
    [-4.0, -2.0, 0.0, 0.5, 0.5, 0.0, -2.0, -4.0],
    [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
];
const bishopEvalWhite = [
    [-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
    [-1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0],
    [-1.0, 0.0, 0.5, 1.0, 1.0, 0.5, 0.0, -1.0],
    [-1.0, 0.5, 0.5, 1.0, 1.0, 0.5, 0.5, -1.0],
    [-1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, -1.0],
    [-1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0],
    [-1.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, -1.0],
    [-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
];

const rookEvalWhite = [
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.5, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.5],
    [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
    [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
    [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
    [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
    [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
    [0.0, 0.0, 0.0, 0.5, 0.5, 0.0, 0.0, 0.0],
];
const evalQueen = [
    [-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
    [-1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0],
    [-1.0, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -1.0],
    [-0.5, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -0.5],
    [0.0, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -0.5],
    [-1.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.0, -1.0],
    [-1.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, -1.0],
    [-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
];
const kingEvalWhite = [
    [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [-2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
    [-1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
    [2.0, 2.0, 0.0, 0.0, 0.0, 0.0, 2.0, 2.0],
    [2.0, 3.0, 1.0, 0.0, 0.0, 1.0, 3.0, 2.0],
];

const pawnEvalBlack = reverseArray(pawnEvalWhite);
const bishopEvalBlack = reverseArray(bishopEvalWhite);
const rookEvalBlack = reverseArray(rookEvalWhite);
const kingEvalBlack = reverseArray(kingEvalWhite);
const calculateWeights = () => {
    const board = chess.board();
    let weight = 0;
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const item = board[i][j];
            if (item === null) {
                continue;
            }
            const isWhite = item.color === 'w';
            if (item.type === 'r') {
                weight += isWhite
                    ? 50 + rookEvalWhite[i][j]
                    : -50 + rookEvalBlack[i][j];
            } else if (item.type === 'b') {
                weight += isWhite
                    ? 30 + bishopEvalWhite[i][j]
                    : -30 + bishopEvalBlack[i][j];
            } else if (item.type === 'k') {
                weight += isWhite
                    ? 900 + kingEvalWhite[i][j]
                    : -900 + kingEvalBlack[i][j];
            } else if (item.type === 'n') {
                weight += isWhite
                    ? 30 + knightEval[i][j]
                    : -30 + knightEval[i][j];
            } else if (item.type === 'p') {
                weight += isWhite
                    ? 10 + pawnEvalWhite[i][j]
                    : -10 + pawnEvalBlack[i][j];
            } else if (item.type === 'q') {
                weight += isWhite
                    ? 90 + evalQueen[i][j]
                    : -90 + evalQueen[i][j];
            }
        }
    }
    return weight;
};

const minimax = function (
    depth: number,
    game: Chess,
    alpha: number,
    beta: number,
    isMax: boolean
) {
    if (depth === 0) {
        return -calculateWeights();
    }
    const moves = game.moves();
    if (isMax) {
        let bestMove = -9999;
        for (let i = 0; i < moves.length; i++) {
            game.move(moves[i]);
            bestMove = Math.max(
                bestMove,
                minimax(depth - 1, game, alpha, beta, !isMax)
            );
            game.undo();
            alpha = Math.max(alpha, bestMove);
            if (beta <= alpha) {
                return bestMove;
            }
        }
        return bestMove;
    } else {
        let bestMove = 9999;
        for (let i = 0; i < moves.length; i++) {
            game.move(moves[i]);
            bestMove = Math.min(
                bestMove,
                minimax(depth - 1, game, alpha, beta, !isMax)
            );
            game.undo();
            beta = Math.min(beta, bestMove);
            if (beta <= alpha) {
                return bestMove;
            }
        }
        return bestMove;
    }
};

function wait(time: number): Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
}

const aiGame = {
    move() {
        if (chess.turn() === 'w') {
            return;
        }

        const allMoves = chess.moves();
        let bestMove = null;
        let bestValue = -9999;
        const depth = 3;
        for (let i = 0; i < allMoves.length; i++) {
            const move = allMoves[i];
            chess.move(move);
            const value = minimax(depth - 1, chess, -10000, 10000, false);
            chess.undo();
            if (value > bestValue) {
                bestMove = move;
                bestValue = value;
            }
        }
        if (bestMove) {
            chess.move(bestMove);
            board.updateBoard();
        }
    },
    async autoSimulate() {
        while (!chess.isGameOver()) {
            const allMoves = chess.moves();
            if (allMoves.length) {
                let length = allMoves.length;
                let bestValue = -99999;
                let bestMove = null;
                while (length--) {
                    const move =
                        allMoves[Math.floor(Math.random() * allMoves.length)];
                    chess.move(move);
                    const value = -calculateWeights();
                    chess.undo();
                    if (value > bestValue) {
                        bestValue = value;
                        bestMove = move;
                    }
                }
                if (bestMove) {
                    chess.move(bestMove);
                    board.updateBoard();
                }

                await wait(500);
            }
        }
    },
};

board.on('done', () => {
    // aiGame.move();
});
export { chess, board, aiGame };
