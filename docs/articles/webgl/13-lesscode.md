# 码少，趣多

## 动机

在进行下一步的学习之前，我们需要整理一下我们之前写的代码。我们回顾一下我们之前编写的 WebGL 代码，我们发现，大部分的代码都是极其重复的。比如：

```ts
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointPos), gl.STATIC_DRAW);

const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

const normalBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

// ......

const uWorldLoc = gl.getUniformLocation(program, 'u_world');
const uViewInvLoc = gl.getUniformLocation(program, 'u_viewInv');
const uLightPos = gl.getUniformLocation(program, 'u_lightPos');
const uViewPosLoc = gl.getUniformLocation(program, 'u_viewWorldPos');
const uGlossLoc = gl.getUniformLocation(program, 'u_gloss');
const uCoefficientLoc = gl.getUniformLocation(program, 'u_coefficient');
const uSpotDirLoc = gl.getUniformLocation(program, 'u_spotDir');
const uCutoffLoc = gl.getUniformLocation(program, 'u_cutoff');

// ......
```

我们可以看出这些代码大量的重复，这显得十分的啰嗦！

## 辅助函数

那么有没有一种办法可以简化这些代码呢？答案是肯定的！我们可以自己编写一些辅助函数来帮助我们来处理这些向 WebGL 传递值的工作，而我们只是需要提供一些必要的信息即可。

当然，我们现在编写的这一套”框架“需要建立在一些假设之上：

1. 一个`attribute`变量就对应了一个 `WebGLBuffer`，我们不采用一个`WebGLBuffer`对应多个`attribute`变量的做法
2. 似乎暂时没有别的约束了。

那我们要产出的辅助函数最终是一个什么东西呢？

我们希望可以通过某种 API，假设我们创建一个`setAttribute` 的 API，我们可以通过调用它来设置好所有的 `attribute`变量的数据。类似的，我们也希望创建类似于`setUniforms`这类的 API 来帮助我们设置好所有的 `uniform` 变量。
