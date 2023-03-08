# 图像处理技术进阶

<ImgContainer :srcs="['/img/6-imgprocess2/cover.png']"/>

本文紧接着[图像处理技术](./5-imgprocess)一文，如果你还没有读过，我建议你从那儿开始读起。

在上篇文章中，我们学会了如何使用一个 Shader 来处理一幅图像。今天我们要解决的问题是：

如何在一幅图像中应用多个效果呢？比如：我想对图片进行一次调色，然后再对其进行模糊的操作。当然，这一切你可以都写在同一个 Shader 中。但是这也会带来很多的问题：

1. 不够灵活，把所有的效果都写在一个 Shader 中会让我们的组合变得非常的不灵活。
2. 有的效果在一个 shader 中根本就难以实现，比如：模糊效果

一种灵活的方式是：

利用多个 shader，一个 shader 代表了一种图像处理效果，我们可以利用多个 shader 来反复的处理图像。具体的流程可以参考下图：

<ImgContainer :srcs="['/img/6-imgprocess2/img-process.png']"/>

## 帧缓冲技术 / Framebuffer

在上图中，我们可以看到我们使用了一种中间纹理来将每一步的处理结果暂存起来。首先，我们介绍一下什么是帧缓冲技术。

### 什么是帧缓冲技术？

WebGL 中的帧缓冲技术是一种允许你渲染到纹理或渲染缓冲中的技术。

1. 它可以用来实现一些高级的图形效果，如后处理、阴影、反射等
2. 不过，“帧缓冲”这个名字事实上是一个糟糕的名字，一个帧缓冲对象（`Framebuffer Object`）是一个包含了多个附件（attachments）的对象，其中每个附件都可以是一个纹理(`Texture`)或一个渲染缓冲（`RenderBuffer`)。

### 如何创建帧缓冲对象

我们可以通过以下的步骤来创建一个帧缓冲对象，并为其绑定一个纹理。

1. 创建一个帧缓冲对象(`gl.createFramebuffer`)
2. 绑定一个帧缓冲对象(`gl.bindFramebuffer``)
3. 创建一个纹理(`util.createTexture` 此 API 在我们之前编写的 `util.ts` 文件中)，
4. 使用 `gl.texImage2D` 为这个纹理传入数据，注意观察这个 API 有两种形式，我们现在使用第二种形式，我们可以直接使用`ArrayBuffer` 直接传入图像数据，这里我们传入`null`，并制定图像的宽高。
5. 为帧缓冲对象添加附件(`gl.framebufferTexture2D`)
6. 检查帧缓冲对象是否完整 (`gl.checkFramebufferStatus`)

详细的代码如下：
<<< @/scripts/webgl/util.ts#createFramebuffer [util.ts]

### 如何使用我们的帧缓冲对象？

一旦帧缓冲对象完成了创建，使用它是非常简单的。我们可以使用 `gl.bindFramebuffer(gl.FRAMBUFFER, 刚刚创建的framebuffer)`。完成帧缓冲对象的绑定后，我们再进行绘制(drawArrays, drawElements)时，我们的绘制结果就会绘制到帧缓冲对象所绑定的纹理上。

但是，一旦这样做了后，我们无法在屏幕上查看到我们的绘制结果。所以，为了保证我们的绘制结果正确，我们可以先不绑定到帧缓冲区，我们直接绘制到屏幕上查看渲染结果是否正确。

那如果我们不想要使用帧缓冲对象又该怎么办呢？我们还是调用这个 API，`gl.bindFramebuffer(gl.FRAMEBUFFER, null)` 这样，我们的渲染结果就会直接绘制到我们的屏幕上面。

## 实战——使用帧缓冲实现模糊效果

在这之前，我们需要简单的了解一下什么是模糊效果。模糊效果有很多种，有**高斯模糊**、 **均值模糊**, **中值模糊**等。他们具有一个共同点，就是需要进行**卷积**运算。但是，什么是**卷积**？

### 什么是卷积

在图像处理中，卷积操作指的就是使用一个卷积核 (kernel) 对一张图像中的每个像素进行操作。卷积核通常是一个四方形网格结构（例如 2x2 3x3 的方形区域），该区域内每个方格都有一个权重值。如下图：
<ImgContainer :srcs="['/img/6-imgprocess2/convolutionKernel.png']"/>

当对图像中的某个像素进行卷积时，我们会把卷积核的中心放置于该像素上，如下图所示，再一次计算核中的每个元素和其覆盖的图像像素值的乘积并求和，得到的结果就是该位置的新像素值。如下图所示，蓝色方块表示进行卷积操作的像素，则该点的新的像素值应该为：

$$
10 * 1 + 250 * 1 + 55 * 1 + 200 * 1 + 98 * 1 + 126 * 1 + 100 * 1 + 200 * 1 + 1 * 1
$$

<ImgContainer :srcs="['/img/6-imgprocess2/convolutionKernel2.png']"/>

这样的计算过程虽然简单，但是可以实现很多图像处理效果，除了模糊之外还可以实现边缘检测等效果。如果我们想要实现均值模糊，我们可以使用一个 3x3 的卷积核，核内的每个元素的值均为 1/9。卷积核越大，均值模糊的效果则越好，但是性能会下降。

### 均值模糊

那么现在我们就来实现一个简单的**均值模糊**效果，我们依然基于[图像处理技术](./5-imgprocess)中的代码进行修改。

我们只需要修改我们的片元着色器：

```glsl
#define HALF_KERNEL_SIZE 1
precision highp float;
uniform sampler2D u_tex;
varying vec2 v_uv;
uniform vec4 u_uv_transform;
uniform vec2 u_resolution;

void main () {
    vec2 uv = v_uv * u_uv_transform.xy + u_uv_transform.zw;
    vec4 col = vec4(0.0);
    for (int i = -HALF_KERNEL_SIZE; i <= HALF_KERNEL_SIZE; i++) {
        for (int j = -HALF_KERNEL_SIZE; j <= HALF_KERNEL_SIZE; j++) {
            vec2 offset = vec2(float(i), float(j)) / u_resolution;
            col += texture2D(u_tex, uv + offset);
        }
    }
    col /= (float(HALF_KERNEL_SIZE) * 2. + 1.) * (float(HALF_KERNEL_SIZE) * 2. + 1.);
    gl_FragColor = col;
}
```

以上就是一个简单的均值模糊的片元着色器的代码。我们可以看一下卷积核的大小分别为 3、7、13 时的效果：

<ImgContainer :srcs="['/img/6-imgprocess2/blur3.png']" :labels="['原图 vs 3x3卷积核']"/>
<ImgContainer :srcs="['/img/6-imgprocess2/blur7.png']" :labels="['原图 vs 7x7卷积核']"/>
<ImgContainer :srcs="['/img/6-imgprocess2/blur13.png']" :labels="['原图 vs 13x13卷积核']"/>

我们可以发现，当卷积核的大小在 7x7 大小时，我们才能看到一些模糊的效果。但是卷积核越大，其 GPU 的处理速度越慢。这是因为纹理采样在 GPU 中是一种很慢的操作！！！我们需要尽可能的减少在 GPU 中进行采样的次数。

一种常见的方案是：始终使用 3x3 的卷积核，但是进行多次迭代。简单的说就是先将图像进行一次均值模糊处理，将图像处理的结果存于一张中间纹理中（还记得上面我们将的帧缓冲区吗？）。然后将这张中间纹理作为输入，又进行一次均值模糊的处理！如此迭代多次后，我们可以得到一个不错的效果。

### 基于多次迭代实现均值模糊

接下来，我们基于上面的方案进行实现。

首先，由于我们需要进行多次的迭代，所以我们需要几个帧缓冲区？现在思考一下，我们到底需要几个帧缓冲区？我们迭代几次就需要几个帧缓冲区吗？事实上，这的确也没错。不过这有点点浪费我们的资源。

实际上，我们只需要 2 个帧缓冲区就可以完成。流程如下：
:::tip
原图像 --> 帧缓冲 1 --> 帧缓冲 2 --> 帧缓冲区 1 --> 帧缓冲 2 --> ...... --> 输出到屏幕
:::
类似于打乒乓球一样，我们不断的利用这两个帧缓冲反复的处理这张图片即可。

首先我们需要创建两组 `framebuffer` 与 `texture`

```ts
const [framebuffer1, renderTexture1] = createFramebufferAndTexture(
    gl,
    canvas.width * devicePixelRatio,
    canvas.height * devicePixelRatio
);
const [framebuffer2, renderTexture2] = createFramebufferAndTexture(
    gl,
    canvas.width * devicePixelRatio,
    canvas.height * devicePixelRatio
);
```

接着，利用`for`循环不断的对这幅图片进行卷积核为 3x3 的均值模糊。

```ts
const iterations = 30;
for (let i = 0; i < iterations; i++) {
    if (i % 2 === 0) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer1);
    } else {
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer2);
    }
    render();
    gl.bindTexture(
        gl.TEXTURE_2D,
        i % 2 === 0 ? renderTexture1 : renderTexture2
    );
}
// 最后一次输出到屏幕上
gl.bindFramebuffer(gl.FRAMEBUFFER, null);
render();
```

最终的渲染结果如下：
<ImgContainer :srcs="['/img/6-imgprocess2/iterBlur1-tuya.png', '/img/6-imgprocess2/iterBlur5-tuya.png', '/img/6-imgprocess2/iterBlur30-tuya.png']" :labels="['迭代1次', '迭代5次', '迭代30次']"/>

### 更进一步优化

在理解了上述代码后，我们还可以更进一步优化代码。我们将利用缩放对图像进行降采样，从而减少需要处理的像素个数以提高性能。我们在创建 `framebuffer` 时，就将其附加的纹理 `texture`的尺寸缩小。

```ts
const downSample = 1;
const renderTextureWidth = canvas.width / downSample;
const renderTextureHeight = canvas.height / downSample;
const [framebuffer1, renderTexture1] = createFramebufferAndTexture(
    gl,
    renderTextureWidth,
    renderTextureHeight
);
const [framebuffer2, renderTexture2] = createFramebufferAndTexture(
    gl,
    renderTextureWidth,
    renderTextureHeight
);
```

其中有一个细节需要注意，由于我们的画布尺寸与 `framebuffer` 所附加的纹理尺寸不一致了，所以在绘制到 `framebuffer`上时，我们需要使用 `gl.viewport`这个 API 重新指定 `viewport`。

```ts
const iterations = 30;
for (let i = 0; i < iterations; i++) {
    if (i % 2 === 0) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer1);
    } else {
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer2);
    }
    gl.viewport(
        0,
        0,
        (canvas.width * devicePixelRatio) / downSample,
        (canvas.height * devicePixelRatio) / downSample
    );
    render();
    gl.bindTexture(
        gl.TEXTURE_2D,
        i % 2 === 0 ? renderTexture1 : renderTexture2
    );
}
gl.viewport(0, 0, canvas.width, canvas.height);
gl.bindFramebuffer(gl.FRAMEBUFFER, null);
render();
```

最终的效果如下，我们与上面同样是 3x3 卷积核、迭代 30 次的图像作对比。只不过我们最终修改的模糊版本是对其降采样 2 次的结果。

<ImgContainer :srcs="['/img/6-imgprocess2/iterBlur30-tuya.png', '/img/6-imgprocess2/final.png']" :labels="['迭代30次未降采样', '迭代30次, 降采样2次']"/>

不过值得注意的是，如果降采样的倍率过大的话，图像会出现非常明显的马赛克块的效果。

## Demo

本文的最终 Demo 如下，完整代码见文末

<WebGLImgProcess2/>

<QRCode/>

:::code-group

<<< @/scripts/webgl/6-webgl-imgprocess2.ts#snippet [index.ts]

<<< @/scripts/webgl/util.ts [util.ts]

:::
