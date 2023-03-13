import { Node } from './common/Node';

export type ReturnType = {};

export function main(): ReturnType | null {
    const canvas = document.getElementById('canvas2') as HTMLCanvasElement;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return null;
    }
    ctx.translate(canvas.width / 2, canvas.height / 2);

    const root = new Node('root', [0, 0, 0], 0);
    const sun = new Node('sun', [0, 0, 0]);
    const earthOrbit = new Node('earth-orbit', [150, 0, 0], 90);
    // earthOrbit.rotation = 0;
    // setTimeout(() => {
    //     earthOrbit.rotation = 90;
    //     render();
    // }, 1000);
    const earth = new Node('earth', [0, 0, 0]);
    const moon = new Node('moon', [50, 0, 0]);

    root.addChild(sun);
    sun.addChild(earthOrbit);
    earthOrbit.addChild(earth);
    earthOrbit.addChild(moon);
    const nodes = [sun, earthOrbit, earth, moon];
    const colors = ['#f00', '#000', '#06f', '#ccc'];
    const drawCommands = [
        (x: number, y: number) => {
            ctx.moveTo(x, y);
            ctx.arcTo(x, y, 30, 0, Math.PI * 2);
            ctx.fill();
        },
        (x: number, y: number) => {
            ctx.moveTo(x, y);
            ctx.arcTo(x, y, 50, 0, Math.PI * 2);
            ctx.stroke();
        },
        (x: number, y: number) => {
            ctx.moveTo(x, y);
            ctx.arcTo(x, y, 20, 0, Math.PI * 2);
            ctx.fill();
        },
        (x: number, y: number) => {
            ctx.moveTo(x, y);
            ctx.arcTo(x, y, 10, 0, Math.PI * 2);
            ctx.fill();
        },
    ];

    const render = () => {
        ctx.clearRect(
            -canvas.width / 2,
            -canvas.height / 2,
            canvas.width,
            canvas.height
        );

        for (let i = 0; i < nodes.length; i++) {
            ctx.beginPath();
            ctx.fillStyle = colors[i];
            const node = nodes[i];
            const result = node.getWorldPos();
            // console.log(drawCommands[i]);
            if (node === earthOrbit) {
                ctx.moveTo(result[0] + 50, result[1]);
                ctx.arc(result[0], result[1], 50, 0, Math.PI * 2);
                ctx.stroke();
            } else {
                ctx.moveTo(result[0], result[1]);
                ctx.arc(result[0], result[1], 30 / (i + 1), 0, Math.PI * 2);
                ctx.fill();
            }
        }
    };

    const animate = () => {
        root.rotation += 0.1;
        earthOrbit.rotation += 1;
        render();
        requestAnimationFrame(animate);
    };

    animate();
    return {};
}
