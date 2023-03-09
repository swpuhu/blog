# 三维正射投影

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

上面这个矩阵，我们将其称为**投影矩阵**。
