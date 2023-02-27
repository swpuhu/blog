# UV 坐标与贴图

## 介绍

贴图技术是 3D 渲染中常用的几种技术，它可以将复杂的物体表面细节使用一张图片进行表示，从而省去了复杂的细节建模工作。要学习贴图技术，我们必须要了解 UV 坐标系统。今天我们就来介绍一下 UV 坐标与贴图。

## UV 贴图的基础知识

### 什么是 UV 坐标

UV 坐标是一种二维坐标系统，用于在三维物体表面上标记出纹理坐标，以便将纹理图像应用于该物体。UV 坐标的名称中的 U 和 V 是由计算机图形学领域中的第一种纹理映射方式而来。这种方式通过在物体表面上定义一个二维网格，并在每个网格中放置一个纹理坐标来实现纹理贴图。

在三维模型中，每个三角形面都有一组对应的 UV 坐标，用于指示该面上每个顶点的纹理坐标。UV 坐标系统是由两个浮点数值表示的，分别表示在纹理图像中的水平位置和垂直位置。它们的值通常在 0 到 1 之间，因为纹理图像的大小是通常是正方形，尺寸通常是 2 的整数次幂。

在渲染时，UV 坐标用于从纹理图像中获取像素颜色，并将其应用于物体表面。通过将纹理映射到物体表面，可以为物体表面增加更多的细节和变化，从而使渲染的场景更加真实和自然。

总之，UV 坐标是用于在三维物体表面上标记纹理坐标的二维坐标系统，它是实现纹理映射和贴图的关键因素。

### UV 贴图的基本原理

UV 贴图是一种将二维纹理映射到三维物体表面的技术。它使用 UV 坐标系统将每个顶点的纹理坐标映射到纹理图像上的相应位置，以便将纹理应用于物体表面。

UV 坐标是用来指示纹理图像上每个像素位置的二维坐标。在三维模型中，每个面都有一组对应的 UV 坐标，用于指示该面上每个顶点的纹理坐标。这些纹理坐标可以用来从纹理图像中采样像素颜色，并将其应用到模型表面，从而模拟真实世界中物体表面的外观。

当进行 UV 贴图时，首先需要加载纹理图像，并将其传递到图形处理器（GPU）中。然后，将纹理坐标数据传递到顶点着色器中，并通过插值技术将其传递到片段着色器中。在片段着色器中，将纹理坐标用于从纹理图像中获取颜色值，并将其应用于相应的片段。

UV 贴图可以帮助增强三维物体的真实感，使其看起来更加逼真和细节丰富。它在游戏开发、虚拟现实、建筑可视化和工业设计等领域都有广泛的应用。

对于一张图片来说，图片的 x 轴坐标就是所谓的 U 坐标，图片的 y 坐标就是所谓的 V 坐标。如下图所示：
<ImgContainer :srcs="['/img/4-texture/uv-mapping.png']"/>

## 在 WebGL 中使用 UV 贴图

那我们如何在 WebGL 中使用 UV 贴图技术呢？我们主要分为以下散步

1. 加载纹理到 GPU 中
2. 将纹理坐标传递给顶点着色器
3. 在片段着色器中进行采样

现在我们就一步一步的看是如何做的。

### 加载纹理到 GPU 中

首先我们需要在 WebGL 中创建一个纹理对象。我们可以使用其提供的 API

```js
const texture = gl.createTexture();
```

不过除了创建纹理对象以外，我们还需要设置纹理对象在 GPU 中进行采样时对应的不同行为。有以下 4 种情况：

1. 当贴图的范围比贴图本身大

    这意味着我们的贴图会被拉伸，图片被拉伸后，我们应该怎么去对被拉伸的部分进行采样呢？WebGL 提供了两种选项。一种是对临近的两个点进行线性插值。另一种是直接找到离当前点最近的纹理坐标进行采样。

2. 当贴图的范围比贴图本身小

    与第一种情况类似，图片被缩小后，图片的部分纹理坐标在采样时会被略过。这可能会造成一些走样的不良影响。不过此处我们先不讨论这种情况。我们可以设置成与情况 1 相同的值。

3. 当采样坐标超出了 0~1 的范围。我们有几种选择。

    - 我们将采样坐标全部限制在 0 ~ 1 的范围内。
    - 超出 0 ~ 1 的部分对其取模，比如 uv 坐标为(1.1, 1.2)则实际采样的是 (0.1, 0.2) 位置的纹理
    - 超出 0 ~ 1 的部分取模后再镜像，比如 uv 坐标为(1.1, 1.2)则实际采样的是 (0.9, 0.8)位置的纹理

下图为我们展示这三种情况。

<ImgContainer :srcs="['/img/4-texture/clampEdge.png', '/img/4-texture/repeat.png', '/img/4-texture/mirror-repeat.png']" :labels="['clamp to edge', 'repeat', 'mirror-repeat']" />

所以针对着几种情况，我们需要告诉 WebGL 应该如何对其进行采样，我们可以使用其提供的 API：

```js
/**
 *
 * @param {WebGLRenderingContext} gl
 */
export function createTexture(gl) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // gl.REPEAT gl.MIRRORED_REPEAT
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); // gl.REPEAT gl.MIRRORED_REPEAT
}
```

接下来我们需要真正的往纹理中写入图片的数据。在 `WebGL`中提供了这个 API：

```js
gl.texImage2D(target, level, internalformat, format, type, source);
```

该 API 相关的内容内容可以参考此链接 [MDN——WebGLRenderingContext.texImage2D](https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/texImage2D)

### 将纹理坐标传递给顶点着色器

完成纹理的创建并且往其中填充了纹理数据后，我们还需要将纹理坐标传入到顶点着色器中。我们需要修改我们的顶点着色器如下：

```js
// 顶点着色器
const vertexShader = `
    attribute vec4 a_position;
    attribute vec2 a_uv; // [!code ++]
    varying vec2 v_uv; // [!code ++]
    void main () {
        v_uv = a_uv; // [!code ++]
        gl_Position =  a_position;
    }
`;
// 片元着色器
const fragmentShader = `
    // 设置浮点数精度
    precision mediump float;
    uniform sampler2D u_tex; // [!code ++]
    varying vec2 v_uv; // [!code ++]
    void main () {
        gl_FragColor = vec4(1.0, 0.5, 1.0, 1.0); // [!code --]
        gl_FragColor = texture2D(u_tex, v_uv); // [!code ++]
    }
`;
```

我们先看顶点着色器，我们又声明了一个名为 `a_uv`的变量，该变量用于接受传入的 uv 坐标值。 还有一个名为 `v_uv`的变量，但是其存储限定符不是 `attribute` 而是 `varying`，使用`varying` 修饰的存储限定符表示该变量会在 GPU 的光栅化阶段被进行插值（该知识点我们在后续的“再探渲染管线” 中再进一步介绍）。

这里我们可以简单的可以为通过 `varying` 这个关键字可以把顶点着色器中的变量传入到片元着色器中。那么，我们在片元着色器中又该去如何的接受这个从顶点着色器中传来值呢？

很简单，我们只需要在片元着色器中声明一个名称和顶点着色器中的变量名字一样的变量就好了。

片元着色器中，还有一个 `uniform sampler2D` 的变量 `u_tex` 这是一个纹理对象，它对应了我们在 `WebGL` 代码中创建的纹理。 在下面的 `main` 函数中使用内置函数 `texture2D` 就可以对其进行采样。

现在，我们需要重新的组织顶点数据。在之前的[你的第一个 WebGL 程序](./1-webgl-introduction/)中，我们绘制了一个三角形，那么现在我们要绘制一张图片，从直觉上我们应该绘制一个矩形，然后将这张图片作为纹理贴在上面。所以，我们现在需要绘制两个三角形！所以，我们的数据变为了：

```js
const pointPos = [-0.5, 0.0, 0.5, 0.0, 0.0, 0.5]; // [!code --]
const pointPos = [-1, -1, 1, -1, 1, 1, 1, 1, -1, 1, -1, -1]; // [!code ++]
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointPos), gl.STATIC_DRAW);
```

我们到现在为止只是准备了顶点的位置信息，我们还需要为其准备纹理坐标。类似的，我们同样需要创建一个 `WebGLBuffer` 来保存数据并往 Shader 中传递。

```js
const uvs = [0, 0, 2, 0, 2, 2, 2, 2, 0, 2, 0, 0]; // [!code ++]
const uvBuffer = gl.createBuffer(); // [!code ++]
gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer); // [!code ++]
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW); // [!code ++]
```

往 Shader 中传递数据的过程还是与[你的第一个 WebGL 程序](./1-webgl-introduction/)中类似，只不过这里有一点不同，在传递数据之前我们要先重新绑定一下 `WebGLBuffer`到 `gl.ARRAY_BUFFER`，因为这里我们的 `WebGLBuffer` 不只一个。

```js
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
const a_position = gl.getAttribLocation(program, 'a_position');
const a_uv = gl.getAttribLocation(program, 'a_uv');
gl.vertexAttribPointer(
    a_position,
    2,
    gl.FLOAT,
    false,
    Float32Array.BYTES_PER_ELEMENT * 2,
    0
);
gl.enableVertexAttribArray(a_position);

gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
gl.vertexAttribPointer(
    a_uv,
    2,
    gl.FLOAT,
    false,
    Float32Array.BYTES_PER_ELEMENT * 2,
    0
);
gl.enableVertexAttribArray(a_uv);
```

到此，我们往顶点着色器中传入纹理坐标的工作就已经全部完成！

### 在片段着色器中进行采样

现在，我们剩下的工作就比较轻松了。如上文中已经解释过，我们在片元着色器中，使用内置函数 `texture2D` 就可以完成对纹理的采样。

不过我们会发现一些小问题，就是为什么我们最终得到的图像是反的！
<ImgContainer :srcs="['/img/4-texture/flip.png']"/>
这是因为图片数据中的 y 轴与 WebGL uv 系统中的 y 轴坐标刚好相反的原因！我们可以增加这样一段代码：

```js
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
```

这样`WebGL`在解码图片数据的时候就会将纹理数据在竖直方向上进行翻转了！

## 常见的贴图效果

在 shader 中，有一些常用的操作纹理的方式，比如，我们想让纹理不断地重复和偏移，除了上面我们提到的可以通过修改纹理的采样方式之外，我们还可以在 Shader 中做到这一点。

我们修改我们的 shader 代码如下：

```js
// 片元着色器
const fragmentShader = `
        // 设置浮点数精度
        precision mediump float;
        uniform sampler2D u_tex;
        varying vec2 v_uv;
        uniform vec4 u_uv_transform; // [!code ++]
        void main () {
            vec2 uv = v_uv * u_uv_transform.xy + u_uv_transform.zw; // [!code ++]
            gl_FragColor = texture2D(u_tex, uv);
        }
    `;
```

通过上面的程序，我们就可以在 shader 中很好的控制贴图在一个 0~1 范围内的 uv 坐标进行不断地重复和偏移。详情请参照下面的 demo 交互。

## 实例代码

下面是完整的代码和 demo 例子。

:::code-group

<<< @/scripts/webgl/4-webgl-texture.js#snippet [affine-transform.js]

<<< @/scripts/webgl/1-util.js [util.js]

:::

<WebGLUVMapping/>

<QRCode/>
