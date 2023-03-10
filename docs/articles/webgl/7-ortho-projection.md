# 三维正交投影

## 前言

从本节开始，我们就要进入三维的世界中了，准备好了吗？Let's go!

不过在这之前，我们需要先解决一下在 [仿射变换](./3-affine-transform/)一章中的遗留问题。还记得最后我们实现的 demo 中，三角形在旋转的时候，它的形状也开始逐渐“变形”了吗？

我们现在先来解决这个问题。要解决它，就要理解这个问题是如何产生的。其原因是因为：**我们是直接在归一化的坐标中直接进行的旋转**，也就是是说，无论我们的画布尺寸是多少，画布的最左边和最下边的值都是-1，最上边和最右边的值都是 1。所以，当我们旋转时坐标发生变化，映射到画布上的位置时就发生了变形。那要解决这个问题，我们需要在画布真实尺寸的坐标系下来进行旋转，再将其转换到-1~1 的坐标范围之间。

<ImgContainer :srcs="['/img/7-orthoProjection/coord-remap.png']"/>

也就是说，需要在数学上满足转换：

$$
\begin{split}
&0 \le x \le width \\
\rArr &-1 \le x' \le 1
\end{split}
$$

简单的推导一下 x 变换到 x'的过程

$$
\begin{split}
&0 \le x \le width \\
\rArr \qquad & \frac{0}{width} \le \frac{x}{width} \le \frac{width}{width} \\
\rArr \qquad & 0 \le \frac{x}{width} \le 1 \\
\rArr \qquad & 0 \le \frac{2x}{width} \le 2 \\
\rArr \qquad & -1 \le \frac{2x}{width} - 1 \le 1
\end{split}
$$

所以：

$$
x' = \frac{2x}{width} - 1
$$

对于 y 坐标与 z 坐标，同理的有： $y' = \frac{2y}{height} - 1$，$z' = \frac{2z}{depth} - 1$

我们将其转换成矩阵，可以写为：

$$
\bold {proj} =
\begin{bmatrix}
2 * width & 0 & 0 & -1 \\
0 & 2 * height & 0 & -1 \\
0 & 0 & 2 * depth & -1 \\
0 & 0 & & 1
\end{bmatrix}
$$

上面这个矩阵，我们将其称为**投影矩阵**。让我们稍微的修改一下[仿射变换](./3-affine-transform/)例子中的顶点着色器的代码。

```glsl
attribute vec4 a_position;
uniform mat4 u_translate;
uniform mat4 u_rotate;
uniform mat4 u_scale;
uniform mat4 u_proj;// [!code ++]
void main () {
    // gl_Position =  u_translate * u_rotate * u_scale * a_position; // [!code --]
    gl_Position = u_proj * u_translate * u_rotate * u_scale * a_position; // [!code ++]
}

```

除此之外，我们的顶点数据也需要修改一下，我们的顶点数据的范围不再是 -1~1 了，而是 0~width, 0~height。

最后我们还需要往 `u_proj`中传入我们的投影矩阵。

:::tip
我们可以利用 `gl-matrix` 库中提供的 `mat4.ortho`方法来快速的生成这个矩阵。

:::

```ts
const pointPos = [-0.5, 0.0, 0.5, 0.0, 0.0, 0.5]; // [!code --]
const pointPos = [-0.0, 0.0, 200, 0.0, 100.0, 200]; // [!code ++]

// ......

const uProj = gl.getUniformLocation(program, 'u_proj'); // [!code ++]
const projMat = mat4.create(); // [!code ++]
mat4.ortho(projMat, 0, canvas.width, 0, canvas.height, -1, 100); // [!code ++]
gl.uniformMatrix4fv(uProj, false, projMat); // [!code ++]
```

<WebGLOrthoProjection1/>

在上面的 Demo 中，我们可以看到，当我们旋转时，三角形不再发生“形变”了。

## 正交投影

我们已经完成了在 2D 平面中的变换，在 3 维世界中同样也是类似的，只不过我们多了一个 `z` 坐标。想象我们的三维空间是一个长为`width`，高为 `height`，深为`depth` 的立方体。

<ImgContainer :srcs="['/img/7-orthoProjection/cube.png']"/>

还记得上面我们的 $\bold {proj}$矩阵吗？我们不需要对它进行任何修改。我现在只需要修改我们顶点数据。现在我们准备绘制一个立方体，我们开始修改我们的顶点数据。

```ts
//prettier-ignore
const pointPos = [
    // front-face
    0, 0, 0, width, 0, 0, width, height, 0, width, height, 0, 0, height, 0, 0, 0, 0,
    // back-face
    0, 0, depth, width, 0, depth, width, height, depth, width, height, depth, 0, height, depth, 0, 0, depth,
    // left-face
    0, 0, 0, 0, height, 0, 0, height, depth, 0, height, depth, 0, 0, depth, 0, 0, 0,
    // right-face
    width, 0, 0, width, height, 0, width, height, depth, width, height, depth, width, 0, depth, width, 0, 0,
    // top-face
    0, height, 0, width, height, 0, width, height, depth, width, height, depth, 0, height, depth, 0, height, 0,
    // bottom-face
    0, 0, 0, width, 0, 0, width, 0, depth, width, 0, depth, 0, 0, depth, 0, 0, 0,
];

//prettier-ignore
const colors = [
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
    1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0,
    1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
    0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1,
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
]
```

我们除了修改顶点的位置数据之外，我们为了更好的展示立方体，还额外的为每个顶点提供了颜色信息。往顶点中传入颜色数据的方法与传入位置信息类似。

```ts
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
const a_color = gl.getAttribLocation(program, 'a_color');
// 我们不再采用这种方式进行传值
gl.vertexAttribPointer(
    a_color,
    3,
    gl.FLOAT,
    false,
    Float32Array.BYTES_PER_ELEMENT * 3,
    0
);
gl.enableVertexAttribArray(a_color);
```

:::tip
另外，之前我们使用 `vertexAttribPointer`这个 API 时，其中的第二个参数，原来是 `2`。现在由于我们是 3D 图形，我们每个坐标是 3 维向量，所以我们需要修改为 3。
:::

## 更多细节

绘制 3D 图形与 2D 图形还有很多不同，我们在这里列举 2 个容易被忽略的地方。就是`深度缓冲`和`剔除面`。

我们简单的介绍一下深度缓冲区和剔除面

### 深度缓冲区

深度缓冲区是 WebGL 中用来存储每个像素的深度值（与摄像机的距离）的一种缓冲区。它可以用来判断哪些物体在前面，哪些物体在后面，从而实现隐藏面消除的效果。

要使用深度缓冲区，需要先通过这个 API 启用它`gl.enable(gl.DEPTH_TEST)`

值得注意的是，一般每次绘制的时候我们都需要将之前的深度缓冲区清除。我们使用 `gl.clear(gl.DEPTH_BUFFER_BIT)`。但是我们与此同时还需要清空颜色缓冲区，我们使用位运算符号 '|' 来同时清除它们。`gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)`。

### 剔除面

在 WebGL 中的三角形有正反面的概念，正面三角形的顶点顺序是逆时针方向， 反面三角形是顺时针方向。

<ImgContainer :srcs="['/img/7-orthoProjection/triangle.svg']" :height="200"/>

WebGL 可以只绘制正面或反面三角形。如果你要使用这个特性，需要通过 API `gl.enable(gl.CULL_FACE)`来开启。
WebGL 默认剔除背面的三角形，也就是说三角形的顶点顺序是顺时针的的话，则该三角形不会被绘制。

运用剔除面技术，可以提高 WebGL 的性能。

其余的程序与之前的代码几乎无异。你可以通过 Demo 文末的代码进行对比。
<WebGLOrthoProjection2/>

<QRCode/>

:::code-group

<<< @/scripts/webgl/7-orthoProjection2.ts#snippet [index.ts]

<<< @/scripts/webgl/util.ts [util.ts]

:::
