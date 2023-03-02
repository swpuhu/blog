# 图像处理

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
<ImgContainer :srcs="['/img/5-imgprocess/hue.jpeg']" :height="200"/>

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

`#LUT data points`表示后面就是真实的数据了

我们简单的编写一个程序将这个 LUT 表中的数据读取出来，并将其可视化出来。

### 图像特效实现

<WebGLImgProcess/>
## 结论

### WebGL 图像处理的优点和局限性

### 展望 WebGL 图像处理的未来
