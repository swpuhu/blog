# 三维透视投影

<ImgContainer :srcs="['/img/8-perspective/perspective.png']"/>

## 前言

:::warning

前方高能预警！数学推导来袭！
:::
在上一篇文章[正交三维投影](./7-ortho-projection.md)中，我们介绍了三维正交投影矩阵的推导过程，我可以简单的将其理解为是一种坐标的重映射的方法。换句话说，就是将在一个空间中的坐标映射到另一个空间中。

但是今天我们的话题稍微有一些复杂。让我们一起来看看透视投影到底是怎么要一回事吧！

## 什么是透视投影

在我们观察这个世界时，有一种随处可见的现象：远处的景物看起来很小，离我们越近的物体看起来就越大。那么，我们要在 WebGL 中也模拟这种效果，这就是所谓的“透视投影”。下图很形象的展示了正交投影和透视投影的区别。

<ImgContainer :srcs="['/img/8-perspective/perspective.png']"/>

我们可以看出，在透视投影中，我们的观察空间不再是一个立方体，而是一个 “平截头体”，平截头体就是一个四面体被“削掉”了一部分形成的。比较小的部分被称为“近平面”，比较大的部分被称为“远平面”。

投影的过程就是将平截头体中的坐标“投影”到近平面上。那么投影的方向呢？投影的方向是朝着这个四面体的顶点。

## 建立透视投影矩阵

现在，我们开始着手于创建透视投影矩阵。当然你也可以直接使用 `gl-matrix`库中提供的方法。但是我希望你真的弄懂为什么是这样。

到目前为止我们还没有引入“场景图”或者说是“层级树/节点树”的概念（这一点我们会在后续的文章中提到）。所以截止目前，我们所有的坐标都是处于同一坐标系中。我们就把这个坐标系称之为“世界”。所以现在我们所有的坐标都是“世界坐标”。

但是我们的 GPU 中显示的确是 **NDC**（Normalized Device Coordinates)坐标。NDC 空间你可以理解为是各个坐标轴的范围都是 -1~1 之间的一个立方体。

那么如何将平截头体中的坐标映射到 NDC 空间中呢？

一共分为 2 步：

1. 将平截头体中的坐标投影到近平面
2. 将近平面上的坐标映射到 NDC 空间中（参考[正交三维投影](./7-ortho-projection.md)）

### 投影到近平面

请仔细观察下图：

<ImgContainer :srcs="['/img/8-perspective/derivate.png']"/>

上图中的 $P(x, y, z)$ 表示平截头体中的任意一点，$P$ 与四面体顶点的连线与近平面的交点为 $P'(x', y', z')$。

我们可以观察到图中的两个橙色阴影三角形是相似三角形。所以可以得出以下结论：

$$
\frac{x'}{x} = \frac{-d_n}{z} \quad \Rightarrow \quad
x' = \frac{-d_n}{z}x \\

\frac{y'}{y} = \frac{-d_n}{z} \quad \Rightarrow \quad
y' = \frac{-d_n}{z}y
$$

其中：$d_n$表示的是近平面距离相机原点的距离，由于平截头体与我们的坐标系的 z 轴的方向相反，所以这里我们需要加上一个负号。

这里我们得到了投影后的 x' 和 y' 的坐标，根据齐次坐标的表示法，我们还可以将其写为：

$$
\begin{bmatrix}
d_n x \\
d_n y \\
? \\
-z
\end{bmatrix}
$$

此时，我们投影后的 z 坐标还未知，所以用 “?” 表示。

:::tip
齐次坐标：我们引入一个 w 分量来表示齐次项。比如 A = (x, y, z, w)，它等价于 A = (x/w, y/w, z/w)，仅此而已。
:::
现在我们需要构建一个矩阵，使其与 P 点坐标相乘后能得到上述结果。

$$
\begin{bmatrix}
d_n x \\
d_n y \\
? \\
-z
\end{bmatrix} =
\bf M
\begin{bmatrix}
x \\
y \\
z \\
1
\end{bmatrix}
\quad \Rightarrow \quad

\begin{bmatrix}
d_n x \\
d_n y \\
? \\
-z
\end{bmatrix} =
\begin{bmatrix}
? & ? & ? & ? \\
? & ? & ? & ? \\
? & ? & ? & ? \\
? & ? & ? & ? \\
\end{bmatrix}
\begin{bmatrix}
x \\
y \\
z \\
1
\end{bmatrix}
$$

那么 $\bold M$ 中的值到底如何？通过矩阵乘法的运算规则我们可以轻易的得出矩阵 $\bold M$ 应该是如下的形式：

$$
\begin{bmatrix}
d_n & 0 & 0 & 0 \\
0 & d_n & 0 & 0 \\
0 & 0 & A & B \\
0 & 0 & -1 & 0
\end{bmatrix}
$$

上述矩阵中的 A、B，我们尚未明确。紧接着，我们思考这样的一件事情：当我们空间中的点 P 如果恰好位于近平面上时，我们投影后的 z 坐标也会保持不变，同理对于远平面上的点亦是如此。所以，我们可以根据矩阵乘法和上述规则得到：

$$
-Ad_n + B = -d_n^2 \\
-Ad_f + B = -d_f^2 \\
$$

通过解方程可以得到 A、B 的值：

$$
A = d_n + d_f\\
B = d_nd_f
$$

所以，我们得到矩阵 $\bold M$ 为：

$$
\begin{bmatrix}
d_n & 0 & 0 & 0 \\
0 & d_n & 0 & 0 \\
0 & 0 & d_n + d_f & d_nd_f \\
0 & 0 & -1 & 0
\end{bmatrix}
$$

到这步为止，我们完成了将空间中的一点投影到近平面上，现在我们就可以采用类似于正交投影的方式，将近平面上的点映射到 [-1, 1] 区间中。

$$
-1 \leq \frac{2z}{Far-Near} - \frac{Far + Near}{Far - Near} \leq 1
$$

所以我们可以得到从相机近平面映射到[-1, 1]区间的矩阵为：

> 此处我们假设 Left = -Right, Bottom = -Top

$$
\begin{bmatrix}
\frac{1}{Right} & 0 & 0 & 0 \\
0 & \frac{1}{Top} & 0 & 0 \\
0 & 0 & \frac{2}{d_f - d_n} & -\frac{d_n + d_f}{d_f - d_n} \\
0 & 0 & 0 & 1
\end{bmatrix}
$$

由于 WebGL 是采用的左手坐标系，但是从习惯来说我们的世界空间通常使用的是右手坐标系，所以，我们还需要将其转换为左手坐标系，再将该矩阵与上面的矩阵 M 相乘，可以得到最后的结果：

$$
\begin{bmatrix}
\frac{1}{Right} & 0 & 0 & 0 \\
0 & \frac{1}{Top} & 0 & 0 \\
0 & 0 & \frac{2}{d_f - d_n} & -\frac{d_n + d_f}{d_f - d_n} \\
0 & 0 & 0 & 1
\end{bmatrix}

\begin{bmatrix}
0 & 0 & 0 & 0 \\
0 & 0 & 0 & 0 \\
0 & 0 & -1 & 0 \\
0 & 0 & 0 & 1
\end{bmatrix}
\begin{bmatrix}
d_n & 0 & 0 & 0 \\
0 & d_n & 0 & 0 \\
0 & 0 & d_n + d_f & d_nd_f \\
0 & 0 & -1 & 0
\end{bmatrix}
= \\
\begin{bmatrix}
\frac{d_n}{Right} & 0 & 0 & 0 \\
0 & \frac{d_n}{Top} & 0 & 0 \\
0 & 0 & \frac{d_n + d_f}{d_n - d_f} & \frac{2d_nd_f}{d_n - d_f} \\
0 & 0 & -1 & 0
\end{bmatrix}


$$

但是，我们通常不使用近平面的宽 W 与高 H 来设置投影矩阵。我们通常使用竖直方向的视角(Field of View)与画面的长宽比(Aspect)来表示

<ImgContainer :srcs="['/img/8-perspective/aspect.png']"/>

所以 $\frac{d_n}{Right}$与 $\frac{d_n}{Top}$可以表示为：

$$\frac{d_n}{Right} = \cot \frac{fov}{2}$$
$$\frac{d_n}{Top} = \frac{\cot \frac{fov}{2}}{Aspect}$$

我们的矩阵的最终形态为：

$$
\begin{bmatrix}
\frac{\cot \frac{fov}{2}}{Aspect} & 0 & 0 & 0 \\
0 &  \cot \frac{fov}{2} & 0 & 0 \\
0 & 0 & \frac{d_n + d_f}{d_n - d_f} & \frac{2d_nd_f}{d_n - d_f} \\
0 & 0 & -1 & 0
\end{bmatrix}
$$

至此，透视投影矩阵推导完毕。
