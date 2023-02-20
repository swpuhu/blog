<style>

    .flex {
        display: flex;
        justify-content: space-between;
    }
</style>

# Contour Tracing —— 一种提取图片轮廓的算法

![](/marching_squares.png)

## 需求背景

期望在某种编辑环境下对图片进行描边的操作。（类似于 Photoshop 中的描边操作）

而 Contour Tracing 则就是一种可以快速的提取二值图像轮廓的算法。我们可以认为 PNG 图像就是一种特殊的二值图像，假设透明度为 0 的像素是黑色，透明度不为 0 的像素为白色。

## 算法思想

该算法的主要思想为：

1. 先找到一个起始点，对于 PNG 图像来说，我们一般从图片的左上角开始，从左到右，从上到下进行扫描，找到一个透明度不为 0 的像素作为起始点。
2. 计算当前像素附近 2x2 的区域，可以得到 2x2 区域中哪些格子的透明度为 0，哪些不为 0。根据当前 2x2 格子中不同像素的分布来决定下一步往哪个方向移动（此处约定我们前进的方向为逆时针方向）。对于 2x2 区域中像素的分布情况一共有 16 种。(如下图所示)

<div class="flex" style="height: 300px">
<img src="/2-contourTracing/1.png"/>
<img src="/2-contourTracing/2.png"/>
</div>

如上图所示，`Case 0` 表示的情况是：当前像素所在 2x2 区域中的像素都是不透明的值（为白色）。

同理，对于 `Case 1` 来说，左下角的像素值为透明元素（黑色），其余三个像素为白色。

以 `Case 1` 为例（右上图），由于我们的行进方向约定为逆时针，那么当处于此种情况时，我们只能够往下移动。试想，如果我们向右移动的话，那么下一步我们所有的像素都是不透明的像素了。我们无法基于所有像素都是不透明的值决定下一步往哪个方向走。

类似的，对于其余情况的话，给出下面的参考图。但是对于下图中的蓝色线条圈出的部分，对应向上和向下则存在歧义，所以向上和向右走也是存在一定问题的。

<div class="flex" style="height: 260px">
<img src="/2-contourTracing/3.png"/>
<img src="/2-contourTracing/4.png"/>
</div>

## 具体实现

下面给出具体的代码实现，我们使用位运算来表示 2x2 区域中像素的分布情况。
比如左上角的格子是不透明的像素，则最终的值为 1.
左上角与右上角的格子是不透明的像素，最终值为： 1 | 2 = 3，以此类推。末位附代码及可视化效果。

<div class="flex" style="height: 300px">
<img src="/2-contourTracing/5.png"/>
<img src="/2-contourTracing/6.gif"/>
</div>

```js
class MarchingSquares {
    static NONE = 0;
    static UP = 1;
    static LEFT = 2;
    static DOWN = 3;
    static RIGHT = 4;
    /**
     * @param data {ImageData}
     * @param width {number}
     * @param height {number}
     * @param loop {boolean}
     *
     */
    constructor(data, loop) {
        this.data = data;
        this.width = data.width;
        this.height = data.height;
        this.loop = loop;
        this.nextStep = MarchingSquares.NONE;
        this.prevStep = MarchingSquares.NONE;
        this.state = 0;

        const p = this.getFirstNoneTransparentPixelTopDown();
        const path = this.walkPerimeter(p.x, p.y);
        console.log(path);
    }

    /**
     *
     * @return {{x: number, y: number}}
     */
    getFirstNoneTransparentPixelTopDown() {
        const data = this.data.data;
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const index = (y * this.width + x) * 4;
                if (data[index + 3] > 0) {
                    return {
                        x,
                        y,
                    };
                }
            }
        }
    }

    /**
     * @param x {number}
     * @param y {number}
     */
    walkPerimeter(x, y) {
        x = clamp(x, 0, this.width);
        y = clamp(y, 0, this.height);
        const originX = x;
        const originY = y;
        const result = [
            {
                x,
                y,
            },
        ];
        do {
            this.step(x, y, this.data.data);
            // ctx.beginPath();
            // ctx.arc(x, y, 10, 0, Math.PI * 2);
            // ctx.fill();
            switch (this.nextStep) {
                case MarchingSquares.UP:
                    y--;
                    break;
                case MarchingSquares.LEFT:
                    x--;
                    break;
                case MarchingSquares.DOWN:
                    y++;
                    break;
                case MarchingSquares.RIGHT:
                    x++;
                    break;
            }
            if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                result.push({ x, y });
            }
        } while (x !== originX || y !== originY);

        return result;
    }

    /**
     * @param x {number}
     * @param y {number}
     * @param data {Uint8ClampedArray}
     */
    step(x, y, data) {
        const width = this.width;
        const rowOffset = 4 * width;
        const upLeftIndex = (y - 1) * rowOffset + 4 * (x - 1);
        const isInLeft = x > 0;
        const isInRight = x < width;
        const isInDown = y < this.height;
        const isInUp = y > 0;

        const upLeft = isInUp && isInLeft && data[upLeftIndex + 3] > 0;
        const upRight = isInUp && isInRight && data[upLeftIndex + 7] > 0;
        const downLeft =
            isInDown && isInLeft && data[upLeftIndex + rowOffset + 3] > 0;
        const downRight =
            isInDown && isInRight && data[upLeftIndex + rowOffset + 7] > 0;
        this.prevStep = this.nextStep;
        this.state = 0;
        if (upLeft) {
            this.state |= 1;
        }
        if (upRight) {
            this.state |= 2;
        }
        if (downLeft) {
            this.state |= 4;
        }
        if (downRight) {
            this.state |= 8;
        }

        switch (this.state) {
            case 1:
                this.nextStep = MarchingSquares.UP;
                break;
            case 2:
            case 3:
                this.nextStep = MarchingSquares.RIGHT;
                break;
            case 4:
                this.nextStep = MarchingSquares.LEFT;
                break;
            case 5:
                this.nextStep = MarchingSquares.UP;
                break;
            case 6:
                this.nextStep =
                    this.prevStep === MarchingSquares.UP
                        ? MarchingSquares.LEFT
                        : MarchingSquares.RIGHT;
                break;
            case 7:
                this.nextStep = MarchingSquares.RIGHT;
                break;
            case 8:
                this.nextStep = MarchingSquares.DOWN;
                break;
            case 9:
                this.nextStep =
                    this.prevStep === MarchingSquares.RIGHT
                        ? MarchingSquares.UP
                        : MarchingSquares.DOWN;
                break;
            case 10:
            case 11:
                this.nextStep = MarchingSquares.DOWN;
                break;
            case 12:
                this.nextStep = MarchingSquares.LEFT;
                break;
            case 13:
                this.nextStep = MarchingSquares.UP;
                break;
            case 14:
                this.nextStep = MarchingSquares.LEFT;
                break;
            default:
                this.nextStep = MarchingSquares.NONE;
        }
    }
}
```
