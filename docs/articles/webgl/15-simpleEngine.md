# 一种简单的渲染引擎实现

## 前言

我们已经学习了很多关于渲染的基础知识了，再继续学习更多有关渲染的知识之前。我想将我们的程序结构稍微的整理一下，一方面是对整个渲染逻辑有个大致的了解，另一方面是为了我们能够更好的扩展我们的程序。因为目前的程序都还是比较简单的，但是我们的代码量却并不少，后续的程序会变得越来越复杂。如果我们不及时的整理我们的代码，我们的代码将会渐渐地变得难以维护。在工作中亦是如此。

所以，本文会介绍一种简单的渲染引擎的实现思路，后续的代码我们也将基于我们自己打造的这个渲染引擎来完成。

### 杂谈

我第一在计算机中接触引擎这个词还是在游戏引擎中，当然，渲染是属于游戏引擎的一部分。游戏引擎使用引擎一次我觉得是十分的恰当的，在汽车中的引擎是一个一直重复做功的机器，而游戏引擎也是类似的，它每一帧都按照相同的运行规则一直做功，但是不同的输入会造成输出的变化。它就像是一个游戏的心脏一般，为游戏的各个模块提供了源源不断的动力。

## 基本架构

现在我们就来看一下一个简单的渲染引擎是如何实现的吧。

上面我提到了引擎是一个循环做功的机器，那么我们的渲染引擎也需要每一帧都执行，在 web 中，我们通常使用`requestAnimationFrame` 这个浏览器提供的 API 来实现这样的需求。每一帧执行的方法我们称之为 `mainLoop`

<ImgContainer :srcs="['/img/15-simpleEngine/engine.png']" :height="300" :forceFlex="true"/>

上面提到了渲染器是属于游戏引擎的子部分，我们为了后续的引擎扩展方便，所以我们也将渲染器设为我们引擎实现的子部分。渲染器表示为 `Renderer`。

在渲染器实现中，参考了现在主流的渲染器实现方案，例如 `THREE`。我们借用了其核心概念。如：

-   场景
-   相机
-   节点
-   网格(Mesh)
-   几何体(Geometry)
-   材质(Material)
-   ……

我们现在就来一个个的介绍一下它们分别都是表示什么意思：

1. 场景(Scene)
   场景包含了需要被渲染的所有物体。
2. 相机(Camera)
   在场景中，可以有 1 个相机或者多个相机。目前我们就认为场景中就只有一个相机就好了，这个相机能看见场景中的所有物体。
3. 节点(Node)
   节点用于构造层级树（也就是我们之前提过的[场景图](./9-hierarchy)）
4. 网格(Mesh)
   这是真正被渲染到屏幕上的组件。它决定了物体如何被绘制。它包含了几何体(Geometry)与材质(Material)
5. 几何体(Geometry)
   几何体决定物体的几何形状，包含了物体的顶点数据。
6. 材质(Material)
   材质决定了物体是如何被渲染的

<ImgContainer :srcs="['/img/15-simpleEngine/mesh2.png']" :height="500" :forceFlex="true"/>
如上图所示，我们可以稍微的概括一下渲染流程：
几何体 `Geometry`与 材质`Material` 组成了网格`Mesh`。一个节点`Node`可以包含网格，也可以不包含网格，不包含网格的时候这个节点不会被渲染，只参与场景图的计算，而大量的节点组成了我们的场景Scene，最终我们通过渲染器 `Renderer`来渲染我们的场景。

在很多游戏引擎和 3D 库的设计中，在性能上做了很多的优化，但是今天我们的目的是为了快速的打造一个渲染器，所以性能不在我们的考虑范围之内。我们现在只是实现一个最基本的功能即可。

所以我们对每个`Mesh` 都进行一次 `drawCall`的调用，不考虑合批的问题。意思就是对于每一个`Mesh`我们都单独的渲染一次。

接下来我们就来具体看一下每个类的实现吧。我们自底向上的来实现每个类。

## Geometry 与 Material

`Geometry` 与 `Material` 共同构成了 `Mesh`，所以我们先来看 `Geometry` 与 `Material`。

### Geometry

`Geometry` 表示的是 `Mesh`的顶点数据，它提供了物体的所有的顶点数据。在目前的实现中，仅仅实现了几个 API。

```ts
constructor(
        public vertAttrib: {
            positions: VertexAttribType;
            indices: Uint32Array;
            normals?: VertexAttribType;
            uvs?: VertexAttribType;
        }
    ) {}

get count(): number;

public hasNormal(): boolean;

public hasUV(): boolean;
```

并提供了一个静态方法来供用户快速创建一个平面类型的`Geometry`。

```ts
static getPlane(): Geometry {
   // prettier-ignore
   const vertPos = [
      -1, -1, -1,
      1, -1, -1,
      1, 1, -1,
      -1, 1, -1
   ]
   const uvPos = [0, 0, 1, 0, 1, 1, 0, 1];
   const indices = [0, 1, 2, 2, 3, 0];
   return new Geometry({
      positions: {
            name: BUILT_IN_POSITION,
            array: new Float32Array(vertPos),
      },
      uvs: {
            name: BUILT_IN_UV,
            array: new Float32Array(uvPos),
      },
      indices: new Uint32Array(indices),
   });
}
```

我们可以看到`Geometry`的实现是非常简单的，它仅仅是提供了顶点数据。

### Material

`Material` 决定了是如何渲染的，我们可以理解它是 `Shader`的载体，相同的`Shader`应用不同的参数，则是不同的 `Material`。我们设计 `Material`类如下：

```ts
constructor(
        public effect: Effect,
        protected properties: MaterialPropertyType[] = [],
        protected pipelineState: Partial<PipeLineStateType> = {}
    );

    public setPipelineState(gl: RenderContext): void;

    public setProperty(name: string, value: any): void;

    public use(): void;
```

在其构造函数中，需要传入

1. `Effect` 可以理解为是 Shader 的包装类。
2. `properties` 用于设置 Shader 中的 `uniform`变量。
3. `pipelineState` 用于设置渲染中的状态，比如透明度混合、深度测试、深度写入等

`Effect`类的设计如下：

```ts
class Effect {
    constructor(private vertString: string, private fragString: string) {}

    public compile(_gl: RenderContext): void;

    // Material的setProperty 实际是调用的Effect的setProperty
    public setProperty(name: string, value: any): void;

    public use(): void;
}
```

由于`Geometry`和`Material`共同决定了一个物体是如何被渲染的，那么我们需要一个类，将它俩组合在一起并且将其渲染出来。我们设计了`Mesh`类。

```ts
class Mesh {
    constructor(geometry: Geometry, material: Material);

    private uploadData(gl: RenderContext): void;

    private bindMaterialParams(gl: RenderContext): void;

    private bindVertexInfo(gl: RenderContext): void;

    private bindCameraParams(camera: Camera): void;

    public render(gl: RenderContext, camera: Camera): void;
}
```

由于我们不考虑性能问题，所以我们可以为每一个`Mesh`都调用一次`DrawCall`。

> 什么是 DrawCall?
> 简单的说，调用一次 drawArrays 或者 drawElements 即为一次 `DrawCall`，`DrawCall`的次数越少，则渲染的性能越高。

大致的看一下`render`函数的流程

```ts
public render(gl: RenderContext, camera: Camera): void {
   this.material.use();

   if (!this.dataUploaded) {
      this.uploadData(gl);
   }

   if (!this.material.effect.compiled) {
      this.material.effect.compile(gl);
   }

   this.bindVertexInfo(gl);

   this.bindCameraParams(camera);

   this.bindMaterialParams(gl);

   const vertexCount = this.geometry.count;
   gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_INT, 0);
}
```

整体流程还是很清晰的。

1. `this.material.use()`用于切换 Shader
2. `this.uploadData` 如果还未上传过`Geometry`提供的顶点数据，则先填充数据
3. `this.material.effect.compile` 如果 Shader 还未编译过，则先编译 Shader
4. `this.bindVertexInfo` 绑定包含有顶点数据的 `WebGLBuffer`
5. `this.bindCameraParams` 绑定相机的一些参数，一般是 shader 共有的一些公共 uniform 变量
6. `this.bindMaterialParams` 绑定材质的参数
7. `gl.drawElements` 最后这一步就是所谓的 `drawCall`了。

#### drawArrays v.s. drawElements

之前的文章中我们一直是使用的 `drawArrays`，那么这里为什么我们要使用 `drawElements`呢？

`drawElements`比 `drawArrays` 更加的高效，但是作为代价，需要我们额外的提供一个每个顶点的绘制顺序。我们还是以绘制一个矩形为例来说明。

<ImgContainer :srcs="['/img/15-simpleEngine/drawElements.png']"/>

如上图所示，我们采用 `drawArrays`绘制的时候，我们需要提供 6 个顶点数据。然后调用 `gl.drawArrays(gl.TRIANGLES, 0, 6)`我们发现，**这 6 个顶点中，有 2 个顶点的位置是重复的**，那么我们是不是只需要提供 4 个顶点数据，但是再额外的提供绘制顺序即可？

答案是肯定的，`drawElements`完成的就是这样的一份工作。而作为代价，我们需要需要告诉 WebGL 这几个顶点的绘制顺序，同样我们也需要为其创建一个 `WebGLBuffer`但是，放入的缓冲区则不再是 `gl.ARRAY_BUFFER`了，则是 `gl.ELEMENT_ARRAY_BUFFER`

```ts
this.indicesBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);
gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    this.geometry.vertAttrib.indices,
    gl.STATIC_DRAW
);
```

最终在调用`drawElements`时，还需要指定该 Buffer 是属于哪种类型，目前`WebGL`支持的有：`UNSIGNED_BYTE`, `UNSIGNED_SHORT`和 `UNSINGED_INT`。它们分别对应了不同类型的 `indicesBuffer`

1. 当 drawElements 使用 `UNSIGNED_BYTE`时，indicesBuffer 中的数据则应该是 `Uint8Array`类型；
2. 当 drawElements 使用 `UNSIGNED_SHORT`时，indicesBuffer 中的数据则应该是 `Uint16Array`类型；
3. 当 drawElements 使用 `UNSIGNED_INT`时，indicesBuffer 中的数据则应该是 `Uint32Array`类型，而且需要通过 `
gl.getExtension('OES_element_index_uint');`来开启。

Mesh 的渲染经过上面的步骤就可以完成了。

## 节点 Node

接下来我们继续讲解`Node`，`Node`是构成场景的基本节点，场景本身也可以说是`Node`，只不过是“根节点”罢了。`Node`之间存在父子关系，Node 可以包含`Mesh`也可以不包含`Mesh`，不包含`Mesh`时，不进行渲染。仅仅只是作为构建层级的作用。

有关场景图/层级树的知识在本篇中就不过多的展开了，大家可以参考[场景图](./9-hierarchy)中的内容。

## 相机 Camera

相机也是构成场景的重要组成部分，相机可以决定哪些物体可见与不可见，也可以对“视野之外”的物体作“剔除”处理。不过这里为了简单起见没有实现这一功能，仅仅只是提供了获取裁剪矩阵和世界矩阵的函数。后续我们会不断地完善我们的渲染引擎。

```ts
class Camera {
    public getViewInvMat(): mat4;

    public getProjMat(): mat4;
}
```

## 场景 Scene

```ts
class Scene extends Node {
    getAllMesh(): Mesh[];
}
```

Scene 也是 Node，只不过比较特殊，所以我们的 `Scene`继承了 `Node`类。此处也是考虑简单起见，我们只是提供了一个 `getAllMesh`的函数。

## Renderer

最后则是我们的 `Renderer`类了，它负责我们渲染的总流程，我们也可以叫做**渲染管线**，只不过我们的渲染器还太过简单。还没有涉及比较负责的渲染流程，这里读者可能还比较难以感受，后续随着我们引擎的完善，读者的体会会逐渐加深。

`Renderer`的代码也是很简单的，如下：

```ts
class Renderer {
    constructor(private gl: RenderContext) {}

    render(scene: Scene): void {
        const meshes = scene.getAllMesh();
        const cameras = scene.getCameras();
        for (let i = 0; i < meshes.length; i++) {
            meshes[i].render(this.gl, cameras[0]);
        }
    }
}
```

## 总结

本篇文章概括的介绍了一种简单的渲染引擎实现，也给出了部分代码，由于代码量较多，本文末尾就不再贴出完整的代码了，完整代码请查看[此 Github 仓库]('https://github.com/swpuhu/simple-render-engine')

下面的例子是使用该渲染引擎加载的 `standford-dragon` 模型
<WebGLSimpleEngine/>
