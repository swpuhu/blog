# 图像处理技术

<ImgContainer :srcs="['/img/5-imgprocess/lenna-process.png']"/>

## 介绍

今天，让我们进行一个有趣的话题——图像处理。图像处理是一个庞大的话题。我们今天将通过一些有趣的小例子带你进入图像处理的世界。

WebGL 中的图像处理通常是通过片段着色器（fragment shader）来实现的。片段着色器是一种运行在 GPU 上的程序，它对每个像素（或片段）执行操作，比如计算颜色和透明度等。在 WebGL 中，开发人员可以使用片段着色器来实现各种各样的图像处理算法和效果，例如：

1. 图像滤镜：WebGL 中的片段着色器可以实现各种图像滤镜效果，比如高斯模糊、锐化、边缘检测、浮雕等。这些效果可以增强图像的细节和对比度，使图像更加清晰和有吸引力。

2. 色彩调整：WebGL 中的片段着色器也可以用于调整图像的色彩和对比度等属性。例如，可以使用色调映射（color mapping）来调整图像的颜色分布，使其更加饱和或柔和。

3. 图像特效：WebGL 中的片段着色器还可以实现各种图像特效，比如水墨画效果、卡通化效果、风格化效果等。这些特效可以使图像看起来更加有趣和独特。

总之，WebGL 中的图像处理功能非常强大和灵活，可以让开发人员在浏览器中实现各种各样的图像效果和特效。使用 WebGL 的图像处理功能可以大大提高 Web 应用程序的用户体验，并为用户带来更多的视觉冲击力。

## 图像处理技术

### WebGL 中的图像处理工具和 API

在 WebGL 中实现图像处理主要是基于 shader 实现的，我们需要将一张图片作为纹理传入到我们的 GPU 中（详见[UV 贴图技术](./4-texture.html))，再利用 shader 编程来对图像的每个像素进行处理。

## WebGL 图像处理的示例

接下来，我们就简单的实现两个简单的图像处理程序。我们会在[UV 贴图技术](./4-texture.html)的最终代码基础上不断地修改以达成我们的目的。

1. 调整图像的亮度、对比度、色相
2. 支持颜色查找表（LUT）以调整图像色彩

### 调整图像的亮度、饱和度、色相

在 CSS 中，我们可以利用 `filter` 属性来很容易的调节图像的亮度、对比度、色相。它们分别对应着：

-   brightness
-   saturate
-   hue-rotate

现在，我们要在 shader 中实现这一特性。我们主要需要修改我们片元着色器中的代码。

我们需要一个 `uniform` 变量来接受我们从 CPU 中传入的亮度、对比度及色相的值。这里我们使用一个 `vec3` 一次性接受，而不使用 3 个 `float`类型的变量，这样有利于提高我们的数据传输效率。

```glsl
precision mediump float;
uniform sampler2D u_tex;
varying vec2 v_uv;
uniform vec4 u_uv_transform;
uniform vec3 u_bright_sat_hue; //[!code ++]
void main () {
    vec2 uv = v_uv * u_uv_transform.xy + u_uv_transform.zw;
    float brightness = u_bright_sat_hue.x; //[!code ++]
    float sat = u_bright_sat_hue.y; //[!code ++]
    float hue = u_bright_sat_hue.z; //[!code ++]
    //gl_FragColor = texture2D(u_tex, uv); //[!code --]
    vec4 col = texture2D(u_tex, uv); //[!code ++]
    gl_FragColor = col; //[!code ++]
}
```

-   #### 亮度

    亮度的实现比较简单，在 CSS 的标准的中是这样定义亮度的：

    > Applies a linear multiplier to input image, making it appear more or less bright. A value of 0% will create an image that is completely black. A value of 100% leaves the input unchanged. Other values are linear multipliers on the effect. Values of amount over 100% are allowed, providing brighter results. The markup equivalent of this function is given below.\
    > Negative values are not allowed.\
    > Default value when omitted is 1.\
    > The initial value for interpolation is 1.

简单的说就是给原始图像的像素值乘上一个值，这个值为 1 时，输出的颜色保持不变，当这个值为 0 时，画面应该完全是黑色的。那么我们很容易可以写出：`col.rgb *= brightness;` 这样就简单的实现了亮度调节的功能。

-   #### 饱和度
    类似的，我们可以参照 CSS 的标准，其中是这样描述的：

> Adjusts the contrast of the input. A value of 0% will create an image that is completely gray. A value of 100% leaves the input unchanged. Values of amount over 100% are allowed, providing results with more contrast. The markup equivalent of this function is given below.\
> Negative values are not allowed.\
> Default value when omitted is 1.\
> The initial value for interpolation is 1.

应用一个值来调整画面的对比度，当这个值是 0 的时候，整个画面完全为灰色，这个值为 1 时，画面不发生变化，这个值为可以超过 1，但是不能为负数。一种通常的做法是指定一个灰度值（一般为 0.5），在指定一个最终的颜色（一般为画面原始颜色），然后使用对比度作为线性插值的因子，在这两个值之间进行线性插值。用公式表示为：

$$
SatCol = (1 - satFactor) * Gray + satFactor * FinalCol
$$

在 Shader 中，我们可以使用一个内置函数 `mix` 来代替线性插值的过程

```glsl
vec3 gray = vec3(0.5); // [!code ++]
col.rgb = mix(gray, col.rgb, sat); // [!code ++]
```

-   #### 色相旋转

首先我们要了解什么叫色相。色相（Hue）是指颜色的属性之一，通常描述为红、橙、黄、绿、青、蓝、紫等颜色。色相是色彩的基本属性之一，它代表了颜色的种类和类别。

在颜色环中，色相是环的角度度量。颜色环是一个圆形的色彩系统，其中所有颜色都围绕圆周排列。红色位于圆的顶部，然后按顺时针顺序排列，直到再次到达红色。(如下图色环)
<ImgContainer :srcs="['/img/5-imgprocess/hue.jpeg']" :height="200" :forceFlex="true"/>

色相的改变会导致颜色从一种到另一种的变化。例如，将颜色从红色向右移动一定角度，将产生一种新的颜色，例如橙色或黄色。颜色的饱和度和明度可以改变，但如果色相不同，则它们仍将是不同的颜色。

了解了什么是色相，那么色相旋转又是怎么一回事呢？

一个像素的颜色除了可以使用 RGB 表示以外，我们还可以将颜色分成：HSB/HSL 的表示方式，其中：

-   H: 表示 Hue, 即“色相”
-   S: 表示 Saturate, 即饱和度
-   B: 表示 Brightness， 即亮度

所以色相旋转的含义就是指我们只改变一个颜色的色相值，而保持其他颜色值不变。

这个又要如何实现呢？首先直觉上，我们会很容易想到将 RGB 格式的颜色值转换为 HSB 表示的颜色值，然后根据旋转的角度来改变 H 值，最后再将其转换回去就好了。这里有一种很简便的方法， 我们可以利用某个很“玄学”的矩阵直接打到这一效果。矩阵如下：

$$
\begin{split}
&\begin{bmatrix}
0.213 & 0.715 & 0.072 \\
0.213 & 0.715 & 0.072 \\
0.213 & 0.715 & 0.072
\end{bmatrix} + \\
\cos \theta *
&\begin{bmatrix}
0.787 & -0.715 & -0.072 \\
-0.213 & 0.285 & -0.072 \\
-0.213 & -0.715 & 0.928
\end{bmatrix} + \\
\sin \theta *
&\begin{bmatrix}
-0.213 & -0.715 & 0.928 \\
0.143 & 0.140 & -0.283 \\
-0.787 & 0.715 & 0.072
\end{bmatrix} \\
\end{split}
$$

在 Shader 中，我们可以声明一个函数来获取这个矩阵

```glsl
mat3 getHueMat(float theta) {
    mat3 m1 = mat3( 0.213, .715, .072,
                    0.213, .715, .072,
                    0.213, .715, .072);
    mat3 m2 = mat3( 0.787, -0.715, 0.072,
                    -0.213, 0.285, -0.072,
                    -0.213, -0.715, 0.928);
    mat3 m3 = mat3( -0.213, -0.715, 0.928,
                    0.143, 0.140, -0.283,
                    -0.787, 0.715, 0.072);

    return m1 + cos(theta) * m2 + sin(theta) * m3;
}
```

在 `main`函数中，调用上面的函数与 RGB 值相乘即可。

```glsl
col.rgb *= getHueMat(hue);
```

到此为止，我们完整的片元着色器的代码如下：

```glsl
precision mediump float;
uniform sampler2D u_tex;
varying vec2 v_uv;
uniform vec4 u_uv_transform;
uniform vec3 u_bright_sat_hue;
uniform vec2 u_resolution;

mat3 getHueMat(float theta) {
    mat3 m1 = mat3(0.213, .715, .072, 0.213, .715, .072, 0.213, .715, .072);
    mat3 m2 = mat3(0.787, -0.715, 0.072, -0.213, 0.285, -0.072, -0.213, -0.715, 0.928);
    mat3 m3 = mat3(-0.213, -0.715, 0.928, 0.143, 0.140, -0.283, -0.787, 0.715, 0.072);

    return m1 + cos(theta) * m2 + sin(theta) * m3;
}
void main () {
    vec2 uv = v_uv * u_uv_transform.xy + u_uv_transform.zw;
    float asp = u_resolution.x / u_resolution.y;
    uv.x *= asp;
    float brightness = u_bright_sat_hue.x;
    float sat = u_bright_sat_hue.y;
    float hue = u_bright_sat_hue.z;
    vec4 col = texture2D(u_tex, uv);
    col.rgb *= brightness;
    vec3 gray = vec3(0.5);
    col.rgb = mix(gray, col.rgb, sat);
    col.rgb *= getHueMat(hue);
    gl_FragColor = col;
}
```

### 使用 LUT 实现各类滤镜（Color Grading)

接下来，我们要介绍一种叫做**颜色查找表**（**LUT** _Look Up Table_）的东西，LUT 是一种常用的图像处理技术，在各类的美图软件上被广泛运用，常见于各类预置的滤镜。它可以通过将输入颜色映射到新的输出颜色来调整图像的颜色和色调。在 LUT 中，每个输入颜色都有一个对应的输出颜色，这些颜色映射关系可以通过一个表格或函数表示出来。

在图像处理中，使用 LUT 技术可以快速改变图像的颜色和色调，而无需对每个像素进行单独的操作。例如，可以使用 LUT 技术来调整图像的对比度、饱和度、色调等属性。另外，LUT 技术还可以用于颜色校正、色彩分级等应用。

LUT 可以通过多种方式创建，包括手动创建、使用图形软件创建、使用校准设备创建等。一旦创建了 LUT 表，它就可以被应用于图像处理软件中，以快速、准确地调整图像的颜色和色调。

#### 3 维 LUT 表

简单的说，LUT 的工作原理就是将图像原始的颜色作为 key，通过某个表，将像素的原始颜色映射为另一个颜色。在实践中，我们常用的 LUT 表是 3 维 LUT 表。在 3 维 LUT 中，输入颜色值被映射到输出颜色值的过程涉及三个通道的颜色值。

例如，在 RGB 颜色空间中，可以使用 3 维 LUT 来进行颜色分级（color grading）操作。颜色分级是一种常用的电影后期处理技术，用于改变电影的色调、对比度等特性，从而达到艺术效果或者情感表达的目的。通过将不同的颜色区域映射到不同的输出颜色值，可以改变整个图像的色调和情感表达。

现在我们就以一张真实的 3 维 LUT 表为例进行介绍。常见的 LUT 表格式有 `.CUBE`, `.3DL`, `.CSP`等。下面我们介绍一下 `CUBE`格式的 LUT 表。其文件格式如下：

```text
#Created by: Adobe Photoshop Export Color Lookup Plugin
TITLE "l_hires.jpeg"

#LUT size
LUT_3D_SIZE 64

#data domain
DOMAIN_MIN 0.0 0.0 0.0
DOMAIN_MAX 1.0 1.0 1.0

#LUT data points
0.000000 0.000000 0.000000
0.003937 0.000000 0.000000
0.009216 0.000122 0.000153
0.014862 0.000122 0.000153
0.021057 0.000244 0.000366
```

文件内容还是比较易懂的。#开头表示的是注释。

`Title`表示的是标题。

`LUT size`表示的 LUT 表的大小，这里是 64，则表示该 3 维 LUT 表为 64 _ 64 _ 64 的大小。

`DOMAIN_MIN` 与 `DOMAIN_MAX`分别表示颜色值的最小和最大范围

`#LUT data points`表示后面就是真实的数据了。其数据的排布方式为：

**以 `size * size` 为一组，从左到右从上到下依次展开**

我们简单的编写一个程序将这个 LUT 表中的数据读取出来，并将其可视化出来。
<VisualizeLUTCube/>

此时你可能有疑问，上面的图明明是一个 2D 图片，为什么你要说是 3D LUT 呢？

此时我们注意，我们的 LUT 表的大小是 `64`，而这张图片是 `512 * 512`大小的，上面这张图不仅仅具有 宽、高两个维度。还有第三个维度，就是每个“格子”的索引。我们每个“小格子”的尺寸是 `64 * 64`。那么我们拿到这样的一张图又该如何进行颜色映射呢？

这里以 `rgb(0, 255, 255)` 为例来进行说明。首先根据我们的 `b` 值来计算我们应该在哪个“小格子”里面进行查找。我们一共有 64 个格子。但是 b 的值却是 0~255，这是因为我们的 LUT 表的精度问题，为了在存储空间和效率上做均衡，我们认为 4 个相邻数值的颜色值是一样的。所以我们把每个小格子的尺寸从 `256 * 256` 压缩到了 `64 * 64`。所以我们可以根据 $\lfloor 255 / 4 \rfloor$ 算出我们应该在第几个“小格子” 里面继续查找。此例中我们的 `b = 255`，$\lfloor 255 / 4\rfloor = 63$ 所以，我们在最后一个格子中继续查找 `R` 和 `G` 值。

类似的，我们的`R=0`, `G = 255`，所在在小格子中的坐标为：$\lfloor 0 / 4 \rfloor = 0$，$\lfloor 255 / 4 \rfloor = 63$。
那么，我们最终对应到 LUT 表中的数据是第 63 个“小格子”中的第 0 行、第 63 列的像素。换算到我们展开的数组中则是：

$$
\begin{split}
&z * 64 * 64 + iy * 64 + ix \\
\end{split}
$$

我们就可以得到最终映射后的值了。

#### LUT Shader 实现

```glsl
vec3 mapLUT(sampler2D tex, vec3 originCol) {
    // 计算当前颜色在哪个格子 0 ~ 63
    float blueIndex = floor(originCol.b * 63.0);

    // 计算当前格子的行列 0 ~ 7
    vec2 quad;
    quad.y = floor(blueIndex / 8.0);
    quad.x = (blueIndex - quad.y * 8.0);

    // 计算小格子中的坐标在整个纹理上的坐标 0 ~ 1
    vec2 texPos;
    texPos.x = quad.x / 8.0 + (0.125 - 1.0 / 512.0) * originCol.r + 0.5 / 512.0;
    texPos.y = quad.y / 8.0 + (0.125 - 1.0 / 512.0) * originCol.g + 0.5 / 512.0;
    texPos.y = 1.0 - texPos.y;
    return texture2D(tex, texPos).rgb;
}
```

此处重点解释一下第 11、12 行的代码，在代码的末尾，有一个 `0.5 / 512.0` 这其实表示的是半个像素的大小。为什么会这样呢？如下图所示，下图中的每个格子表示一个像素格子。我们采样的真实坐标应该是在像素的**中央！**

<ImgContainer :srcs="['/img/5-imgprocess/uv-explain.png']"/>

:::warning 重要提示

此处再额外提示一下：使用 LUT 表一定要在其他的颜色调整效果之前使用！否则会出现画面失真的情况！
:::

#### 在 Shader 中同时使用 2 张纹理

在展示我们的 demo 之前，还有一个问题需要我们解决。我们的 shader 中现在需要同时使用 2 张纹理，一张是我们需要处理的图片，另一张是我们的 LUT 表。我们在 shader 中这样写到：

```glsl{2-3}
precision highp float;
uniform sampler2D u_tex;
uniform sampler2D u_lut;
```

我们需要给 `u_tex`, `u_lut` 两个变量设置不同的纹理。此时我们需要用到另一个 API： `gl.activeTexture`。这个函数只接受一个参数，就是 WebGL 的纹理单元。

在 WebGL 中，最多有 32 个纹理单元。从 `gl.TEXTURE0 ~ gl.TEXTURE31`。这意味着，我们可以在一段 shader 程序中可以同时使用 32 个纹理。

我们首先“**激活**”一个纹理单元`gl.activeTexture(gl.TEXTURE0)`。然后在进行`bindTexture` 和 `texImage2D` 的操作，这样就把一个纹理真正的绑定到了这个纹理单元上。

```ts
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, texture1);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, originImg);

gl.activeTexture(gl.TEXTURE1);
gl.bindTexture(gl.TEXTURE_2D, texture2);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, lutImg);
```

最后，我们需要设定 shader 中的 `u_tex` 和 `u_lut`使用的是哪个纹理单元中的纹理。

与之前往 shader 中传入 uniform 变量类似，我们需要先获取 `u_tex`和 `u_lut`在 shader 程序中的位置。再传入纹理单元的值即可。

```ts
const texture1Loc = gl.getUniformLocation(program, 'u_tex');
const texture2Loc = gl.getUniformLocation(program, 'u_lut');
gl.uniform1i(texture1Loc, 0);
gl.uniform1i(texture2Loc, 1);
```

在[WebGL 核心原理概述](./1-webgl-introduction/#传递纹理)中介绍了他们之间的绑定关系。（如下图）

<ImgContainer :srcs="['/img/1-webgl-introduction/9.png']"/>

### Demo

下方的 Demo 中，左侧是原始图像，右侧是应用了 LUT 表的图像。
<WebGLImgProcess/>

完整代码见文末。

## 结论

### WebGL 图像处理的优点和局限性

使用 WebGL 进行图像处理具有以下优点：

1. 高性能：WebGL 利用 GPU 进行图像处理，因此可以处理大量的图像数据，而不会对 CPU 造成太大的负担，从而提供更快的图像处理速度。
2. 可移植性：WebGL 是一种跨平台的技术，可以在任何支持它的设备上运行，包括桌面计算机、移动设备和游戏机。

3. 实时性：由于 WebGL 的高性能和可移植性，它非常适合实时图像处理，例如实时视频流或游戏图像。

4. 多样化：WebGL 可以处理各种类型的图像，从简单的 2D 图像到复杂的 3D 图像，以及各种类型的特效和滤镜效果。

然而，WebGL 图像处理也有一些局限性：

1. 学习曲线：使用 WebGL 需要一定的编程技能和图形学知识，因此对于一些非专业人士来说，学习曲线可能较陡峭。

2. 浏览器兼容性：WebGL 需要浏览器支持，并且一些较老版本的浏览器可能无法支持它，这可能会对一些用户造成不便。

3. 安全性：WebGL 在处理图像时使用 GPU，因此可能存在一些安全风险，例如恶意代码可能利用 WebGL 访问用户计算机的 GPU 并导致一些安全问题。因此，使用 WebGL 需要谨慎对待。

希望今天的文章能够为你带来一些启发。

<QRCode/>

## 完整代码

:::code-group

<<< @/scripts/webgl/5-webgl-imgprocess.ts#snippet [index.ts]

<<< @/scripts/webgl/util.ts [util.ts]

:::
