function checkStatus(
    source: number[],
    x: number,
    y: number,
    width: number,
    height: number
): 0 | 1 {
    if (x < 0 || x >= width || y < 0 || y >= height) {
        return 0;
    }

    return source[y * width + x] as 0 | 1;
}

export function simulate(
    source: number[],
    dst: number[],
    width: number,
    height: number
) {
    const num = width * height;
    for (let i = 0; i < num; i++) {
        const y = Math.floor(i / width);
        const x = i - y * width;

        let count = 0;
        count += checkStatus(source, x - 1, y, width, height);
        count += checkStatus(source, x - 1, y - 1, width, height);
        count += checkStatus(source, x, y - 1, width, height);
        count += checkStatus(source, x + 1, y - 1, width, height);
        count += checkStatus(source, x + 1, y, width, height);
        count += checkStatus(source, x + 1, y + 1, width, height);
        count += checkStatus(source, x, y + 1, width, height);
        count += checkStatus(source, x - 1, y + 1, width, height);

        dst[i] = source[i];

        if (source[i] === 1) {
            if (count < 2) {
                dst[i] = 0;
            } else if (count === 2 || count === 3) {
                dst[i] = source[i];
            } else if (count > 3) {
                dst[i] = 0;
            }
        } else {
            if (count >= 3) {
                dst[i] = 1;
            }
        }
    }
}

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
export function init(): void {
    canvas = document.getElementById('canvas') as HTMLCanvasElement;
    ctx = canvas.getContext('2d');
    if (ctx) {
        console.log('init success');
    }
}

export function renderLoop(
    arr: number[] | Uint8Array,
    width: number,
    height: number
): void {
    if (!ctx || !canvas) {
        return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const step = Math.floor(canvas.width / width);
    ctx.beginPath();
    for (let i = 0; i < arr.length; i++) {
        const y = Math.floor(i / width);
        const x = i - y * width;
        if (arr[i] === 1) {
            const tx = x * step;
            const ty = y * step;

            ctx.rect(tx, ty, step, step);
        }
    }
    ctx.fill();
}
