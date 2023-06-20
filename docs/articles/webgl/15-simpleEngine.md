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

### Geometry 与 Material

`Geometry` 与 `Material` 共同构成了 `Mesh`，所以我们先来看 `Geometry` 与 `Material`。

#### Geometry

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

#### Material

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

    <WebGLSimpleEngine/>
