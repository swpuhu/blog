import { Chess } from 'chess.js';
import './ChessBoard.css';
import { Square } from 'chess.js';
import { EventEmitter } from 'eventemitter3';

export class ChessBoard extends EventEmitter {
    private boardItems: HTMLElement[] = [];
    public container: HTMLElement = null!;
    private chessItems: HTMLElement[] = [];
    private probablyMoves: string[] = [];
    private currentSelectChessItem: HTMLElement | null = null;
    constructor(private chess: Chess) {
        super();
        const container = document.createElement('div');
        container.classList.add('chessboard');
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const row = 8 - i;
                const col = j + 'a'.charCodeAt(0);
                const square = String.fromCharCode(col) + row;
                const item = document.createElement('div');
                item.setAttribute('square', square);
                item.classList.add('boardItem');
                container.appendChild(item);
                if (i % 2 === 0) {
                    item.classList.add(j % 2 === 0 ? 'white' : 'black');
                } else {
                    item.classList.add(j % 2 === 1 ? 'white' : 'black');
                }
                this.boardItems.push(item);
                this.bindEvent(item);
            }
        }
        this.container = container;
    }

    private getChessItemBySquare(square: string): HTMLElement | null {
        for (let i = 0; i < this.chessItems.length; i++) {
            const chessSquare = this.chessItems[i].getAttribute('square');
            if (chessSquare === square) {
                return this.chessItems[i];
            }
        }

        return null;
    }

    private bindEvent(boardItem: HTMLElement): void {
        boardItem.addEventListener('click', () => {
            const square = boardItem.getAttribute('square') || '';
            const chessItem = this.getChessItemBySquare(square);
            if (this.probablyMoves.length && this.currentSelectChessItem) {
                const move = this.probablyMoves.find(
                    item => item.indexOf(square) >= 0
                );
                if (move) {
                    this.chess.move(move);
                    this.delightAllBoardItems();
                    this.updateBoard();
                    this.probablyMoves.length = 0;
                    this.currentSelectChessItem = null;
                    this.emit('done');
                    return;
                }
            }
            if (!chessItem) {
                return;
            }
            const currentTurn = this.chess.turn();
            const chessItemColor = chessItem.getAttribute('color') || '';
            if (chessItemColor !== currentTurn) {
                return;
            }
            if (chessItem === this.currentSelectChessItem) {
                this.delightAllChessItems();
                this.delightAllBoardItems();
                this.currentSelectChessItem = null;
                return;
            }
            this.currentSelectChessItem = chessItem;
            this.delightAllChessItems();
            this.highlightChessItem(this.currentSelectChessItem);
            const allMoves = this.chess.moves({ square: square as Square });
            this.probablyMoves = allMoves;
            this.delightAllBoardItems();
            this.highLightSquare(allMoves);
        });
    }

    private highlightChessItem(chessItem: HTMLElement) {
        chessItem.classList.add('active');
    }

    private delightAllChessItems(): void {
        this.chessItems.forEach(item => item.classList.remove('active'));
    }

    private delightAllBoardItems(): void {
        this.boardItems.forEach(item => item.classList.remove('active'));
    }

    private highLightSquare(squares: string[]) {
        for (let i = 0; i < squares.length; i++) {
            const square = /[abcdefgh]\d/.exec(squares[i])![0];
            const col = square[0].charCodeAt(0) - 'a'.charCodeAt(0);
            const row = 8 - +square[1];
            const index = row * 8 + col;
            const boardItem = this.boardItems[index];

            boardItem.classList.add('active');
        }
    }

    private getChessItem(type: string, color: string): HTMLElement {
        if (color === 'w') {
            type = type.toUpperCase();
        }
        const item = document.createElement('div');
        item.classList.add('chessItem', color);
        item.textContent = type;
        return item;
    }

    private getPos(pos: string): [number, number] {
        const col = pos[0].charCodeAt(0) - 'a'.charCodeAt(0);
        const row = 8 - +pos[1];

        const boardItem = this.boardItems[row * 8 + col];
        const left = boardItem.offsetLeft;
        const top = boardItem.offsetTop;
        return [left, top];
    }

    public updateBoard(): void {
        this.chessItems.forEach(item => item.remove());
        this.chessItems.length = 0;
        const board = this.chess.board();
        console.log(this.chess.ascii());
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (board[i][j] === null) {
                    continue;
                }
                const chessItem = this.getChessItem(
                    board[i][j]!.type,
                    board[i][j]!.color
                );
                this.container.appendChild(chessItem);
                this.chessItems.push(chessItem);
                chessItem.setAttribute('square', board[i][j]!.square);
                chessItem.setAttribute('type', board[i][j]!.type);
                chessItem.setAttribute('color', board[i][j]!.color);

                const pos = this.getPos(board[i][j]!.square);
                chessItem.style.left = pos[0] + 'px';
                chessItem.style.top = pos[1] + 'px';
            }
        }
    }
}
