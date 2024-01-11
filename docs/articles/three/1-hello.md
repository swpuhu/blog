# 工欲善其事，必先利其器 ThreeJS 介绍

## 前言

很久没有更文了，让我们继续我们的图形学学习之旅，经过前面的学习，我们已经学习了一些关于图形学的基础知识，如 MVP 变换、贴图、图像处理技术等，尤其是我们手撸了一些纯原生的 WebGL 代码，我们理解了图形渲染管线的基本流程。

从我们之前编写的代码中可以看出，编写原生的 WebGL 代码是非常冗长、低效的，如果我们想要高效的进行开发，我们需要一套框架来辅助我们进行编程，在 [码少，趣多](../webgl/13-lesscode.md)的章节中，我们也尝试减少我们重复的代码量。但是，这套逻辑是非常简单的，对于一些比较复杂的场景来说这套代码的能力还是显得捉襟见肘了，所以我们需要引进比较成熟的 3D 框架。所以接下来的后续安排中我们会开启 Three.js 的学习。

在接下来的学习中，我们的重点不会放在 Three.js 的具体 API 的学习，我只需要大致的了解 Three.js 的 API 就行了，我们的重点会放在 `shader` 的学习上，通过学习 `shader` 我们会对图形学有更加深入的了解。OK，Let's started!

## Three.js 入门

我们今天的学习目标是利用 Three.js 创建一个场景，并且其中包含一个 3D 物体，且使用我们自己编写的 shader。我们需要尽快的熟悉如何在 Three.js 中使用我们自定义的 shader，这是我们后续学习必不可少的。

### Three.js API 简介

我们从 Three.js 的入门文档[Creating a scene](https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene)开始讲起。

```js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

function animate() {
    requestAnimationFrame(animate);

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render(scene, camera);
}

animate();
```

在上面的代码中，有几个核心的概念。

#### THREE.Scene

场景，我们的物体都应该处于场景中，也是渲染器进行渲染时，我们必须告知渲染的是哪一个 Scene。

#### THREE.PerspectiveCamera

透视相机，属于相机的一种，在 THREE 中，不仅提供了透视相机，也提供了正交相机，关于相机这一部分的知识我们之前已经讲过了，如果还有不理解的地方，可以参考之前的文章：[相机](../webgl/10-camera.md)

#### THREE.WebGLRenderer

Three.js 提供的渲染器，利用 WebGL 进行场景的渲染，后续 Three.js 支持 WebGPU 后可能会提供 WebGPU 版本的渲染器。

#### THREE.BoxGeometry

立方体几何体，几何体可以理解为是顶点数据。包含了顶点的位置信息、法线信息、颜色信息、uv 坐标等。

#### THREE.MeshBasicMaterial

Three.js 提供的一些基础材质之一。材质决定了物体如何被渲染。

#### THREE.Mesh

`Mesh`是将 `Geometry` 与 `Material` 链接起来的桥梁，一个可以被渲染的物体需要几何体来提供顶点信息，也需要材质来提供渲染的方式。

以上就是 Three.js 中极为重要的几个概念了。我们将一些物体初始化完成后，只需要将其加入到场景中，最后调用 `WebGLRenderer.render(Scene, Camera)`就可以将他们渲染到我们的画布中了。

### Three.js 自定义 Shader 使用

接下来，我们要学习在 Three.js 中如何使用自定义 Shader 程序。Three.js 提供了 `ShaderMaterial`这一材质来提供使用自定义 shader 的能力。

我们参考 Three.js 提供的文档 [ShaderMaterial](https://threejs.org/docs/index.html?q=Shader#api/en/materials/ShaderMaterial)

```ts
const material = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 1.0 },
        resolution: { value: new THREE.Vector2() },
    },

    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent,
});
```

可以看出我们只需要 `vertexShader`与 `fragmentShader`即可。我们简单编写一下对应的顶点着色器与片元着色器的代码：

**顶点着色器：**

```glsl
#include <common>
#include <normal_pars_vertex>
#include <uv_pars_vertex>

void main() {
    #include <uv_vertex>
	#include <beginnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <project_vertex>
}
```

**片元着色器：**

```glsl
#include <normal_pars_fragment>
void main() {
    gl_FragColor = vec4(vNormal, 1.0);
}
```

我们可以发现，Three.js 的 shader 与我们之前编写的 shader 略微的有一些不同，three.js 提供了类似于 C 语言中的预处理器的功能，这可以帮助我们很方便的复用代码。大家可以将其当成 js 中的 `import` 语法即可。而它们的源代码大家可以在 Three.js 的[Github](https://github.com/mrdoob/three.js/tree/dev/src/renderers/shaders/ShaderChunk)仓库中找到。

最后我们合并一下我们的代码，最终代码及效果如下：

:::code-group

<<< @/scripts/three/three-hello.ts#snippet [hello-three.ts]
<<< @/scripts/three/shaders/hello.vert.glsl#snippet [vert.glsl]
<<< @/scripts/three/shaders/hello.frag.glsl#snippet [frag.glsl]
:::

<ThreeHello/>

## 小结

今天我们简单的学习了 Three.js 的基本 API 以及如何在 Three.js 中使用自定义 Shader 的方法，Three.js 为我们提供了类似于预处理器的功能，这可以使我们的很方便的复用我们的 Shader 代码，接下来我们的学习就会以 Three.js 为基础进行开展，后续的 Shader 我们不再使用 Three.js 提供的内置代码，我们也会逐步的解开 Three.js 内置 Shader 的神秘面纱！
