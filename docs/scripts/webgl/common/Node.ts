import { mat4, vec3 } from 'gl-matrix';
// #region snippet
export class Node {
    private _localMatrix: mat4 = mat4.create();
    private _worldMatrix: mat4 = mat4.create();
    private _x: number = 0;
    private _y: number = 0;
    private _rotation: number = 0;
    private _scale: number = 1;
    private _parent: Node = null!;
    private _children: Node[] = [];
    constructor(public name: string, position?: vec3, rotation?: number) {
        if (position) {
            this._x = position[0];
            this._y = position[1];
        }
        if (rotation) {
            this._rotation = rotation;
        }
        this.updateLocalMatrix();
    }
    public get parent(): Node {
        return this._parent;
    }

    public get children(): Node[] {
        return this._children;
    }

    public get x(): number {
        return this._x;
    }

    public get y(): number {
        return this._y;
    }

    public get rotation(): number {
        return this._rotation;
    }

    public get scale(): number {
        return this._scale;
    }

    public set x(v: number) {
        this._x = v;
        this.updateLocalMatrix();
        this._children.forEach(child => {
            child.updateWorldMatrix(this._worldMatrix);
        });
    }

    public set y(v: number) {
        this._y = v;
        this.updateLocalMatrix();
        this._children.forEach(child => {
            child.updateWorldMatrix(this._worldMatrix);
        });
    }

    public set rotation(v: number) {
        this._rotation = v;
        this.updateLocalMatrix();
        this._children.forEach(child => {
            child.updateWorldMatrix(this._worldMatrix);
        });
    }

    public set scale(v: number) {
        this._scale = v;
        this.updateLocalMatrix();
        this._children.forEach(child => {
            child.updateWorldMatrix(this._worldMatrix);
        });
    }

    public get worldMatrix(): mat4 {
        return this._worldMatrix;
    }

    public addChild(child: Node) {
        this.children.push(child);
        child._parent = this;
        child.updateWorldMatrix(this._worldMatrix);
    }

    private updateLocalMatrix(): void {
        mat4.identity(this._localMatrix);
        mat4.translate(this._localMatrix, this._localMatrix, [
            this._x,
            this._y,
            0,
        ]);
        const rad = (this._rotation / 180) * Math.PI;
        mat4.rotateZ(this._localMatrix, this._localMatrix, rad);
        mat4.scale(this._localMatrix, this._localMatrix, [
            this._scale,
            this._scale,
            this._scale,
        ]);
        if (this._parent) {
            mat4.multiply(
                this._worldMatrix,
                this.parent._worldMatrix,
                this._localMatrix
            );
        } else {
            mat4.copy(this._worldMatrix, this._localMatrix);
        }
    }

    private updateWorldMatrix(parentMatrix?: mat4): void {
        if (parentMatrix) {
            mat4.multiply(this._worldMatrix, parentMatrix, this._localMatrix);
        } else {
            mat4.copy(this._worldMatrix, this._localMatrix);
        }

        const worldMatrix = this._worldMatrix;
        this._children.forEach(child => {
            child.updateWorldMatrix(worldMatrix);
        });
    }

    public getWorldPos(): vec3 {
        const pos = vec3.fromValues(0, 0, 0.0);
        const result = vec3.create();
        vec3.transformMat4(result, pos, this._worldMatrix);
        return result;
    }
}

// #endregion snippet
