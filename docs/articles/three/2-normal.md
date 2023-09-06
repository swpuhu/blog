# 法线贴图（凹凸映射 Bump Mapping ）

## 简介

今天我们学习的内容是法线贴图，法线贴图也是贴图的一种。在法线贴图中，储存了每个像素点的法线方向。（法线方向用 x,y,z 表示，贴图中的 r,g,b 三个通道正好可以表示）。

### 动机

法线贴图通常使用在一些模型精度不是很高，但是需要展示更多细节的地方。比如，我们需要渲染一面砖墙。我们当然可以在建模工具中将每一块的砖的顶点数据都表示出来，但是这样做的代价就是巨大的人工成本。而使用法线贴图则可以将砖墙的法线存储在一张图片中，在渲染时再进行计算。

观察下面两张图片（左侧为没有应用法线贴图，右侧应用了法线贴图），我们可以发现应用了发现贴图的立方体更加显得有凹凸感。而我们却没有对模型的顶点做出任何的修改。这就是法线贴图的便利之处。

<ImgContainer :srcs="['/img/three-example/brick-main.png', '/img/three-example/brick-normal.png']"/>

## 法线贴图的类型

法线贴图中存储的是物体的法线方向，由于法线方向处于[-1, 1]的范围之间，而像素颜色的 RGB 则处于[0,1]之间。那么我们需要做一个映射，不难得出下面的公式：

$$
color = \frac{normal + 1}{2}
$$

$$
normal = color \times 2 - 1
$$

有了上面的基础理论，我们还面临另一个问题，我们的法线是存储在哪个坐标空间中呢？首先我们联想到的就是存储在模型空间中。

### 模型空间法线贴图

顾名思义，模型空间的法线贴图就是这些法线坐标都是以模型空间为基准生成的。模型空间下的法线贴图有以下的优点：

1. 实现简单，非常直观。我们都不需要模型的原始法线和切线信息，生成模型空间的法线贴图也非常的简单。
2. 在纹理坐标的缝合处和尖锐的边角部分，可见的突变较少，即可以提供平滑的边界。

但是法线贴图有一些缺点：

1. 不可重用，比如在一个立方体中我们要给每个面都贴上法线贴图的话，那么对于模型空间的法线贴图，我们需要“6”张不同的贴图。（这里的 6 加上引号是因为这 6 张图也可以合并为 1 张大图表示）
2. 不可压缩，因为模型空间下需要完整的使用 rgb 三个分量的值，所以没有压缩的空间了。

但当前业界中，更常用的是另一种法线贴图：切线空间的法线贴图。

### 切线空间法线贴图

#### 什么是切线空间

切线空间的坐标系的 z 轴是模型的原始法线方向，x 轴是顶点的切线(Tangent)方向。这个切线方向我们暂时可以理解为是沿着纹理坐标的 u 轴方向。切线空间坐标系的 y 轴被称为副切线(BiTangent),它等于法线与切线的叉乘。如下图所示，x 轴为切线方向，y 轴为副切线方向，z 轴为法线方向。为了与模型空间的 x,y,z 轴区分，我们通常将其称为 `T(Tangent)`,`B(Bitangent)`,`N(Normal)`。切线空间的矩阵也称为 `TBN` 矩阵。

<ImgContainer :srcs="['/img/three-example/tangent.png']" :height="200"  :forceFlex="true"/>

#### 为什么是切线空间

其实法线无论存储在哪个坐标系中都是可以，甚至可以选择存储在世界空间下。但是存储法线不是目的，后续的光照计算才是重点！我们引入切线空间，我们还需要将法线坐标从切线空间转换到世界中间中才能够与世界空间中的光线进行运算（或者将世界空间的坐标转换到切线空间中）。但是使用切线空间坐标系有着诸多的有点：

1. 切线空间中记录的法线信息是相对信息，这意味着即便把该法线纹理应用另一个完全不同的网格上，也可以得到一个相对合理的结果。
2. 可重用法线纹理，比如之前举例的立方体，在模型空间下我们需要使用“6”张法线纹理，但是在切线空间下，我们完全使用 1 张法线纹理就可以了。
3. 可压缩，因为切线空间下的法线纹理 z 方向总是正方向，因此我们可以仅仅只存储切线和副切线的信息，再通过叉乘来计算出法线坐标

## 实践

说了这么多，让我们开始实践吧！

在之前的文章中我们已经介绍了如何在 Three.js 之中使用自定义的 Shader,我们就从编写 Shader 部分开始吧！

首先编写顶点着色器的部分：

### 顶点着色器

```glsl
varying vec3 vNormal;
varying vec2 vUv;
void main () {
    vUv = uv;
    vec3 transformedNormal = normalMatrix * vec3(normal);
    vNormal = normalize(transformedNormal);

    vec4 mvPosition = vec4(position, 1.0);
    mvPosition = modelViewMatrix * mvPosition;
    gl_Position = projectionMatrix * mvPosition;
}

```

在上面的代码中，出现了一些“未定义”的变量，比如：`normal`, `normalMatrix`, `position`, `modelViewMatrix`, `projectionMatrix`。其实这些变量并不是未定义，而是因为我们编写的 Shader 还不是最终的 shader 代码，Three.js 还会对我们的代码进行一系列的处理，比如增加一些预制的 attribute 和 uniform 变量，替换`include`的部分，替换宏等等。

其中，`position`与 `normal`是 Three.js 内置的 `attribute` 变量。

`normalMatrix`, `modelViewMatrix`, `projectionMatrix`是 Three.js 内置的`uniform`变量。它们的含义分别如下：

-   `normalMatrix`: 法线矩阵，将模型空间的法线坐标转换到相机空间中
-   `modelViewMatrix`: 模型相机矩阵，将模型空间的法线坐标转换到相机空间中
-   `projectionMatrix`: 投影矩阵，将相机空间的坐标转换到 NDC (_Normal Device Coordinates_) 空间。

另外，在主函数的上方，我们还额外的声明了两个`varying`变量，`vNormal`与 `vUv`，因为这两个变量会在片元着色器中使用，所以我们需要使用`varying`关键字来修饰它们。

### 片元着色器

接下来就是编写片元着色器的部分了：

```glsl
varying vec3 vNormal;
varying vec2 vUv;
uniform sampler2D mainTex;
uniform sampler2D normalTex;

void main() {
    vec2 uv = vUv;
    vec4 normalColor = texture(normalTex, uv);
    vec4 mainColor = texture(mainTex, uv);
    vec3 normal = normalize(vNormal);
    gl_FragColor = vec4(normal, 1.0);
}
```

在上面的代码中，我们声明了与顶点着色器中相同的变量`vNormal`与`vUv`。这是 GLSL 中一种固定的写法，可以理解为这样我们就可以使用顶点着色器传递过来的值了。

除此之外，我们还需要声明两个纹理变量`mainTex`与 `normalTex`，它们分别表示主纹理与法线纹理。

我们先检验一下上述的 shader 代码是否正确。

<ThreeNormal/>
