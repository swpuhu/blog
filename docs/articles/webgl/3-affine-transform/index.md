# 仿射变换

## 引言

### 什么是仿射变换

<span style="color: #df0000"> **仿射变换简单的讲就是线性变换和平移** </span>。在线性变换中，每个向量都会按照相同的比例被缩放，也就是说，它们之间的线性关系在变换后保持不变。这种变换可以应用于多种领域，例如计算机图形学、物理学、经济学等等。<span style="color: #df0000">**在计算机图形学中，线性变换常用于描述平移、旋转、缩放等操作。** </span>

请牢记最后这句话。

### 为什么要学习仿射变换

学习仿射变换的原因很多，其中最重要的原因是因为仿射变换可以用来描述和改变图像和物体在二维或三维空间中的位置、形状和方向等特征，对于计算机图形学和计算机视觉领域的应用非常广泛。例如，在游戏和动画中，我们可以使用仿射变换来制作出各种不同的视觉效果，比如旋转、平移、缩放和扭曲等。

说人话就是：如果不学习仿射变换，我们将不能控制物体在我们的场景中进行移动！

### 本文将要介绍的内容

首先，我们已经介绍了什么是仿射变换以及为什么我们要学习仿射变换。接下来将从以下几部分展开。

1. 仿射变换涉及到基本的数学知识，比如向量与矩阵的运算。所以我们会简要的介绍一下关于这部分的知识。我们将使用向量与矩阵来表示我们的仿射变换过程。
2. 接着，我们将介绍仿射变换的基本类型，包括平移、旋转、缩放类型。
3. 然后，我们将探索一下多个仿射变换在不同组合的情况下会发生什么事情。
4. 最后，我们将通过实际案例和实例代码俩演示如何在实践中应用仿射变换。

## 坐标系与向量

### 笛卡尔坐标系

笛卡尔坐标系是由法国哲学家、数学家笛卡尔（René Descartes）发明的一种用于描述平面和空间中点位置的坐标系统。它是一种直角坐标系，包含了两条互相垂直的坐标轴，通常用 x 和 y 来表示平面坐标系，用 x、y 和 z 来表示空间坐标系。

在笛卡尔坐标系中，每个点都可以由一组坐标来表示。对于二维平面坐标系而言，一个点的坐标通常被表示为 (x, y) 的形式，其中 x 表示该点在 x 轴上的位置，y 表示该点在 y 轴上的位置。对于三维空间坐标系而言，则需要用三个坐标 (x, y, z) 来表示。

想必这一部分的知识各位读者应该都很清楚了吧~

### 向量的定义及运算

向量是有大小和方向的量，通常用箭头来表示。向量可以在二维或三维空间中表示，每个向量都有一个起点和一个终点。向量的长度被称为模，可以用数值表示。向量的方向可以用角度或者用一个具有方向的单位向量来表示。

如下图所示，用代数的方式表示一个向量，可以将其写作：$\vec{a} = (1, 1)$

![](/img/affine-transform/1.png)

但是，我们需要注意的是一个点的坐标表示与向量的表示在形式上是一样的，比如向量 $\vec a$ 与点 $A$ 的表示形式都是 $(1, 1)$ 但是他们表示的含义是截然不同的。

向量 $\vec a$表示的是一个从原点为起点，指向 $(1, 1)$位置的具有方向和长度的量，而点 $A$ 仅仅只是表示坐标系中的一个位置。这一点需要大家分清！

### 向量的基本运算法则

假设现在我们有两个向量 $\vec a = (x_a, y_a)$ 与 $\vec b = (x_b, y_b)$。

-   加法：$\vec a + \vec b = (x_a + x_b, y_a + y_b)$，减法同理。
-   点乘：点乘是向量运算的一种，也被称为内积或数量积。点乘有许多应用，例如计算两个向量之间的夹角、计算向量的长度等等。在计算机图形学中，点乘还被广泛应用于计算光照效果、投影等方面。其运算规则如下：
    $$
        \vec a \cdot \vec b = x_a * x_b + y_a * y_b
    $$
    关于点乘需要注意的是，两个向量他们的点乘结果不再是向量，而是一个标量了。
-   叉乘是向量运算中的一种，通常表示为 $\vec{a} \times \vec{b}$，结果是另一个向量。它的运算规则是：$\vec{a} \times \vec{b}$ 的结果是垂直于 $\vec{a}$ 和 $\vec{b}$ 的向量，方向由右手定则确定，大小为 $|\vec{a}||\vec{b}|\sin\theta$，其中 $\theta$ 是 $\vec{a}$ 和 $\vec{b}$ 之间的夹角。因此，叉乘的结果是一个与 $\vec{a}$ 和 $\vec{b}$ 都垂直的向量，其大小等于两个向量张成的平行四边形的面积。

## 矩阵表示

如下所示，矩阵是一个由数值排列成的矩形阵列，通常用方括号括起来表示。我们可以简单将其理解为是一种特殊的排列数字的方式，它有着属于自己的一套运算规则，仅此而已。

$$
\begin{bmatrix}
a & b\\
c & d
\end{bmatrix}
$$

#### 本文的向量与矩阵表示约定

<p class="highlight-blue">
我们本文中所说的向量与矩阵都使用粗体来进行表示：

向量$\bold{\vec v}$ 与 矩阵$\bold{M}$

一般指的都是列向量，表示为：

$$
\bold{\vec v} = \begin{bmatrix}
a \\
b \\
c \\
d
\end{bmatrix}
$$

但是由于列向量在页面排版上比较占据空间，所以我们使用转置符号和行向量来表示列向量。

$$
\bold{\vec v} = (a, b, c, d)^{\bold T}
$$

以上两种表示向量的方式等价。

</p>

### 矩阵的乘法运算法则

在计算机图形学中，我们经常会遇到的数学问题就是向量与矩阵进行乘法操作。那么我们需要理解矩阵是如何进行乘法运算的。

首先，我们需要明白一点就是不是所有的矩阵和矩阵之间都能够进行乘法操作。假设我们有两个矩阵 $\bold M(m \times n)$ 与 $\bold P(q \times p)$ 这两个矩阵必须要满足 $n == q$ 时，他们才可以进行乘法操作。

我们可以将向量作一种特殊的矩阵，比如向量$\bold {\vec v} = (a, b, c, d)^{\bold T}$ 我们可以将其看做是一个 $4 \times 1$的矩阵。那么一个 $4 \times 4$的矩阵与其相乘后，我们同样也会得到一个 $4 \times 1$的矩阵。也就是一个向量了。

下面给出矩阵与矩阵的乘法表示：

#### 矩阵与矩阵之间相乘

$$
\begin{bmatrix}
a & b & c \\
d & e & f \\
g & h & i
\end{bmatrix}
\begin{bmatrix}
m & n & o \\
p & q & r \\
s & t & u
\end{bmatrix} = \begin{bmatrix}
am + bp + cs & an + bq + ct & ao + br + cu \\
dm + ep + fs & dn + eq + ft & do + er + fu \\
gm + hp + is & gn + hq + it & go + hr + iu
\end{bmatrix}
$$

也可以抽象的表示为：

$$
\Large
\bold{M^{'}}_{rc} =\sum_{i = 0}^{k - 1}\bold{M}_{ri} * \bold{N}_{ic}
$$

## 基本变换

### 线性变换的矩阵表示

#### 缩放

![旋转公式推导过程](/img/affine-transform/scale.webp)
缩放是最容易理解的一种线性变换，就是简单给 x, y 分别乘上一个值即可。用代数表示可以写为：

$$
x' = S_x * x;
$$

$$
y' = S_y * y;
$$

根据矩阵的乘法规则，我们可以将其改写为：

$$

\begin{bmatrix}
x'\\
y'
\end{bmatrix} =\begin{bmatrix}
S_x & 0 \\
0 & S_y
\end{bmatrix}
 \begin{bmatrix}
x \\
y
\end{bmatrix}
$$

#### 旋转

![旋转公式推导过程](/img/affine-transform/rotate.webp)

旋转就稍微的要复杂一点了，我们先给出旋转的代数表达式和矩阵表示

$$
x' = x\cos\theta - y\sin\theta
$$

$$
y' = x\sin\theta + y\cos\theta
$$

$$

\begin{bmatrix}
x'\\
y'
\end{bmatrix} =\begin{bmatrix}
\cos\theta & -\sin\theta \\
\sin\theta & \cos\theta
\end{bmatrix}
 \begin{bmatrix}
x \\
y
\end{bmatrix}
$$

为什么是这样，下图有详细的推导过程：
![旋转公式推导过程](/img/affine-transform/derivate.webp)

### 仿射变换的矩阵表示

#### 平移

![平移](/img/affine-transform/translate.webp)

$$
x' = T_x * x;
$$

$$
y' = T_y * y;
$$

平移的表示就更加的简单了,就是给坐标加上一个数就是表示平移。我们发现，对于二维坐标，我们无法使用 2x2 的矩阵和 2 维向量的乘法来表示这样的加减关系（如下列公式所示）。

$$

\begin{bmatrix}
x + T_x\\
y + T_y
\end{bmatrix} \xcancel=
\begin{bmatrix}
A & B \\
C & D
\end{bmatrix}
\begin{bmatrix}
x \\
y
\end{bmatrix} =
\begin{bmatrix}
Ax + By \\
Cy + Dy
\end{bmatrix}
$$

为了解决平移在矩阵中的表示问题，齐次坐标应运而生了。

### 齐次坐标

平面上的任何点都可以表示成一三元组 (X, Y, W)，称之为该点的齐次坐标

当 W 不为 0，则该点表示欧氏平面上的 (X/W, Y/W)

那么，我们使用齐次坐标表示平移，如下：

$$
\begin{bmatrix}
x' \\
y' \\
1
\end{bmatrix} =
\begin{bmatrix}
1 & 0 & T_x \\
0 & 1 & T_y \\
0 & 0 & 1
\end{bmatrix}
\begin{bmatrix}
x \\
y \\
1
\end{bmatrix}
$$

同理的，对于缩放和旋转我们也可以改写为

$$
\begin{bmatrix}
x' \\
y' \\
1
\end{bmatrix} =
\begin{bmatrix}
S_x & 0 & 0 \\
0 & S_y & 0 \\
0 & 0 & 1
\end{bmatrix}
\begin{bmatrix}
x \\
y \\
1
\end{bmatrix}
$$

$$
\begin{bmatrix}
x' \\
y' \\
1
\end{bmatrix} =
\begin{bmatrix}
\cos\theta & -\sin\theta & 0 \\
\sin\theta & \cos\theta & 0 \\
0 & 0 & 1
\end{bmatrix}
\begin{bmatrix}
x \\
y \\
1
\end{bmatrix}
$$

## 复合变换

复杂的事情现在来了，如果我们将平移、旋转、缩放这三种变换组合起来会发生什么样的奇妙反应呢？读者可以先在下方的 demo 中尝试一下调整平移、缩放和旋转属性，我们可以发现虽然平移、旋转、缩放这三者的值是一样的。但是由于他们的组合顺序不同，我们最终看到的结果也是截然不同的。所以**变换组合的顺序也是至关重要的！**

<script setup>
import AffineExample from '../../../components/AffineExample.vue';
import WebGLExample3 from '../../../scripts/webgl/WebGLExample3.vue'
</script>

<AffineExample/>

## 应用实例

现在我们将其应用到我们的 WebGL 程序中。我依然使用我们在上一章中使用的代码，不过为了应用我们的仿射变换，我们需要额外的引入一些 `uniform` 变量。分别为：`u_translate`, `u_rotate`, `u_scale`，它们分别表示平移、旋转、缩放矩阵。

我们还额外的引入了`gl-matrix`的库来帮助我们快速的生成平移、旋转、缩放矩阵。

完整的代码及 demo 如下：
:::code-group

<<< @/scripts/webgl/3-webgl-affine-transform.js#snippet [affine-transform.js]

<<< @/scripts/webgl/1-util.js [util.js]

:::

<WebGLExample3/>

## 总结
