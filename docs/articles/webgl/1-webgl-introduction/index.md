# WebGL 核心原理概述

## 前言

本文主要对 WebGL 的核心概念进行一个概述，主要会涉及以下几个方面：

1. GPU vs CPU
2. Canvas2D 与 WebGL 绘图的区别
3. 渲染管线
4. 着色器概述
5. GPU 与 CPU 的数据交换

本文不会涉及到具体的代码。

## CPU vs GPU

CPU 和 GPU 都属于处理单元，但是结构不同。形象点来说，CPU 就像个大的工业管道，等待处理的任务只能依次的通过这跟管道，所以 CPU 处理这些任务的速度完全取决于处理单个任务的时间。

<ImgContainer :srcs="['/img/1-webgl-introduction/tube.png']" />

CPU 管道虽然只能让任务一个一个依次执行，但是 CPU 处理单个任务的能力十分的强大，这样的特性让 CPU 处理一些大型任务时是足够了。但是处理图像却显得力不从心了，因为通常处理图像的逻辑并不是很复杂，另一方面，一幅图像是由成千上万的像素点组成，我们每次处理一个像素都是一个任务，让这么多的小任务依次通过我们的 CPU 管道，有点大马拉小车的味道了，此时，就需要我们的 GPU 登场了。

<ImgContainer :srcs="['/img/1-webgl-introduction/2.png']" />

GPU 是由大量的小型处理单元构成的，它可能远远没有 CPU 那么强大，但胜在数量众多，可以保证每个单元处理一个简单的任务。GPU 能够保证同时处理所有的像素点。如果要进行一个比喻的话，GPU 处理的过程类似于我们祖宗发明的“活字印刷术”，将所有的字一次性排好，然后直接印在纸上，“印”这个动作就是 GPU 进行的过程。

## Canvas2D vs WebGL

### Canvas2D

接触过 canvas 绘图的同学一定对以下的绘图方式不会感到陌生

```js
const ctx = canvas.getContext('2d');
function ctxDraw() {
    ctx.fillStyle = '#f60';
    ctx.fillRect(
        (width - rectWidth) / 2,
        (height - rectHeight) / 2,
        rectWidth,
        rectHeight
    );
}
```

我们先修改了填充颜色，然后调用 fillRect 来绘制了一个矩形。这是命令式、过程式的。

### WebGL

我们又如何使用 WebGL 绘制一个矩形呢，我们看以下示例代码

```js
function glDraw() {
    const vertexShader = `
        precision mediump float;
        attribute vec4 a_position;
        void main () {
            gl_Position =  a_position;
        }
    `;

    const fragmentShader = `
        precision mediump float;
        void main () {
            gl_FragColor = vec4(1.0, 0.5, 0.0, 1.0);
        }
    `;
    let a_positionLocation;
    let program = util.initWebGL(gl, vertexShader, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    let points = new Float32Array([
        -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);
    a_positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(a_positionLocation);
    gl.vertexAttribPointer(a_positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}
```

绘制一个矩形，使用 WebGL 就需要编写这么多的代码，这还不包括一些工具方法的代码。那么，WebGL 到底是采用了一种什么样的方式来绘制图形的呢？

我们可以想象 WebGL 就是一个巨大的电路，我们可以自定义这个电路中一些电线的走向，或者是给这个电路中添加一些元器件等等，然后我们只需要按下启动开关，这个电路就能够自己运作。

<ImgContainer :srcs="['/img/1-webgl-introduction/3.png']" />

## 渲染管线

我们现在就来探索这个电路到底是怎么样运作的吧，这里我们将这个电路的这一整套的运作流程成为称为“渲染管线”

<ImgContainer :srcs="['/img/1-webgl-introduction/4.png']" />

如上图所示，渲染管线主要分为以下几步：

1. 顶点着色器处理顶点
2. 图元装配
3. 光栅化
4. 片元着色器着色
5. 测试 & 混合

我们现在依次对每个步骤进行详细的说明

### 顶点着色器处理顶点

这里，我们说明一下“着色器”的意思是什么，你可以简单的把“着色器”这三个字理解为一段程序而已。只是它的名字略微不同罢了。

在顶点着色器中，我们会对传入 GPU 中的顶点信息进行处理（比如，我们绘制上面的矩形时，我们通过 `bufferData`这个方法往 WebGL 中传入了顶点数据），我们可能需要进行一些裁剪空间变换、平移、缩放、旋转等操作。这些操作都是对顶点进行的，它直接改变了顶点的位置。

### 图元装配

通过顶点着色器的处理，我们得到了我们想要的顶点位置，假设我们现在得到了矩形的 4 个点的位置（实际上我们传入了 6 个点）。现在这一步，我们需要告诉 GPU 如何将这几个点以什么样的形式将这 6 个点组合起来（哪几个点为一组），这里我们选择每 3 个为一组，每一组表示一个三角形。将顶点装配成基本图形的过程就称为图元装配（WebGL 能够装配的基本图形只有：点、线、三角形）

<ImgContainer :srcs="['/img/1-webgl-introduction/5.png']" />
### 光栅化

上一步中，我们告诉了 GPU 如何去组装我们的顶点。目前为止，我们依然还是只有 6 个顶点的信息和装配的方式，但是我们如何使用这 6 个点和装配的方式将矩形表示在屏幕上呢？这就是光栅化的过程。一种简单的光栅化的方式就是：

遍历所有的像素为止，依次判断她们是否落入了我们刚刚组装的图形内，如果在图形内，则对该像素进行下一步操作（着色）。

除了判断是否在图形内的操作，还会对非顶点的位置进行插值处理，赋予每个像素其他的信息，因为一个像素不仅仅只有颜色信息，所以我们称其为“片元”。

### 片元着色器着色

在光栅化的过程中，我们判断了哪些片元落在了我们的图形内，我们现在只需要对这些片元进行着色处理即可。最简单的着色方式就是直接设置一个颜色就可以了。 当然，片元着色器也可以很复杂，比如光照、材质等基本都是在片元着色器中进行完成的。

### 测试 & 混合

这里简单的讲一下深度测试，除了深度测试还有模版测试等。深度测试就是说，因为在 WebGL 中可以绘制多个物体，这些物体之间是有层级关系的，通过深度测试后，有的物体被遮挡的部分则不会被显示出来。

混合就是透明度值的混合，我们可以设置不同的混合方法以达到不同的效果。

在上述过程中，**顶点着色器处理顶点**和**片元着色器着色**这两个过程一般都是**可编程的**，也就是我们所说的 shader 程序。接下来，我们大概介绍一下 shader

## 着色器（Shader）概述

着色器是一种计算程序，主要用于进行图形处理。

### 顶点着色器（Vertex Shader）

在顶点着色器中，主要是对顶点及其中包含的一些数据进行处理。着色器中包含了一些内置的变量，比 gl_Position

```GLSL
// 这里的a_position是可以在js运行运行时中获取到的变量，通过它可以往WebGL中传递数据
attribute vec4 a_position;
uniform mat4 u_matrix;
void main () {
	// gl_Position是GLSL内置的变量
	// 将a_position的值赋给gl_Position，gl_Position的值会进入图形渲染管线的下一阶段
    // u_matrix 与 a_position相乘，这里是矩阵与向量相乘，结果仍然为一个向量
	gl_Position = u_matrix * a_position;
}
```

### 片元着色器(Fragment Shader)

片元着色器的主要功能就是着色，我们可以通过一系列的程序处理给每个片元指定不同的颜色。如下程序所示：

```GLSL
precision mediump float;
void main () {
	gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
}
```

这段代码可以这样理解：

```js
for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
        // 双重循环里面的部分就相当于片元着色器中的内容
        data[y * width * 4 + x + 0] = 255;
        data[y * width * 4 + x + 1] = 255;
        data[y * width * 4 + x + 2] = 0;
        data[y * width * 4 + x + 3] = 255;
    }
}
```

我们需要着重理解，片元着色器对于每个片元都是同时执行的，片元之间不存在相互依赖的关系。

#### 存储限定符

在上面的程序中，你可能注意到了 attribute, uniform 等关键字，它们被称为存储限定符。

-   attribute: 只能出现在顶点着色器中，表示每个顶点的数据。在光栅化过程中会对 attribute 变量进行插值处理。可以从外部往 WebGL 内部中传递数据
-   uniform: 可以出现在顶点着色器和片元着色器中，表示统一的值，每个顶点/片元使用的这个值都是一样的。
-   varying: 可以出现在顶点着色器和片元着色器中，表示变化的值，在光栅化阶段，GPU 将 attribute 变量插值处理后的结果赋给了 varying 变量，它是链接顶点着色器和片元着色器变量之间的桥梁。

## 数据传递

那我们如何在 js 运行时中往 WebGL 中传递数据呢？我们主要分为几个部分：

1. 传递 attribute 变量的数据（一般是顶点信息）
2. 传递一般的 uniform 变量数据（整数、浮点数、向量、矩阵）（一般是一些辅助信息，比如时间信息，某段程序需要根据时间的变化来计算最后的值）
3. 传递纹理

### 传递 Attribute 变量

传递 attribute 变量的数据需要使用 `WebGLBuffer`这个 WebGL 内置的数据结构。

步骤：

1. 创建 WebGLBuffer
2. 绑定 Buffer 到 ARRAY_BUFFER（gl.bindBuffer()）
3. 传入数据

<ImgContainer :srcs="['/img/1-webgl-introduction/6.png']" />

这里 ARRAY_BUFFER 充当了一个桥梁的作用，我们其实是将数据传到了 ARRAY_BUFFER，ARRAY_BUFFER 在上一步已经与我们创建好的 WebGLBuffer 绑定在了一起了。所以数据直接写入了 WebGLBuffer。

<ImgContainer :srcs="['/img/1-webgl-introduction/7.png']" />

### 传递 Uniform 变量

传递 uniform 类型的变量的步骤就比较简单了。步骤如下：

1. 通过 API 获取 uniform 变量在 WebGL 程序中的地址(gl.getUniformLocation)
2. 再通过 API 这个地址中填充数据即可（gl.uniform1f， gl.uniform1i, gl.uniform2f......）

### 传递纹理

首先，我们需要搞懂纹理是什么，简单的讲，纹理就是一张图片。在 Web 世界中，纹理可以是 `<img/> <video/> <canvas/>`标签，也可以是 ImageBitmap 和 TypedArray 对象。

传递纹理与传递 attribute 变量类似，这里我们不使用 WebGLBuffer，而是使用 WebGLTexture 对象，并且需要对 WebGLTexture 对象设置相应的参数。

步骤：

1. 创建纹理对象（WebGLTexture）(gl.createTexture())
2. 绑定纹理对象(gl.bindTexture)
3. 设置纹理参数
4. 传入纹理（gl.texImage2D）

<ImgContainer :srcs="['/img/1-webgl-introduction/8.png']" />

这里我们也可以发现，gl.TEXTURE_2D 同样充当了桥梁的作用，我们直接操作的都是 gl.TEXTURE_2D，只不过我们已经提前将纹理对象与 TEXTURE_2D 绑定在一起了，相当于间接的操作了 WebGLTexture 对象了。

下图简要的描述了 js 是如何往 WebGL 中传递数据的。
<ImgContainer :srcs="['/img/1-webgl-introduction/9.png']" />

还记得我们之前将 WebGL 比喻成一个巨大的电路图吗？往 WebGL 中填充数据就是在给这个电路增加电气元件（WebGLTexture, WebGLBuffer），我们往其中填充数据，改变 WebGLBuffer/ARRAY_BUFFER, WebGLTexture/TEXTURE_2D 之间的绑定关系，其实就是在修改电路中电线的连接方式。当这一切就绪时，gl.drawArrays 这个 API 就仿佛是一个开关，调用这个函数整个电路就会自动运行起来。

## 总结

本文讲述了 WebGL 中一些比较重要的概念。我们首先介绍了 CPU 与 GPU 处理数据之间的差异，CPU 是依次执行任务的，是有前后顺序的。GPU 处理数据是并行的，能够同时处理大量的任务，但是每个处理核心的运算能力不强。

然后介绍了 Canvas2D 与 WebGL 之间绘图的差异，Canvas2D 绘图是命令式的，WebGL 绘图是一种“链接式”的过程，你可以想象 WebGL 是一张巨大的电路，我们提前布置好电路与其中的电气元件，一旦按下开关，这个电路就会自动执行。

后续介绍的渲染管线和着色器的知识你可能会感觉到陌生，不过没关系，随着你学习的深入你会发现一切都是那么的自然。后续也会推出实战篇的文章。敬请期待。

<QRCode/>
