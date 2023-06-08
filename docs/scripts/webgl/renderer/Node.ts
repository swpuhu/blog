import { mat4 } from 'gl-matrix';
import { Mesh } from './Mesh';

export class Node {
    protected _children: Node[] = [];
    protected _parent: PossibleNullObject<Node> = null;
    protected translate: { x: number; y: number; z: number } = {
        x: 0,
        y: 0,
        z: 0,
    };
    protected _localMat: mat4 = mat4.create();
    protected _worldMat: mat4 = mat4.create();
    protected _tempIdentityMat: mat4 = mat4.create();
    protected _mesh: Mesh | null = null;
    constructor(public name: string) {}

    get children(): Node[] {
        return this._children;
    }

    get parent(): PossibleNullObject<Node> {
        return this._parent;
    }

    get x(): number {
        return this.translate.x;
    }

    set x(v: number) {
        this.translate.x = v;
        this._updateLocalMat();
    }

    get y(): number {
        return this.translate.y;
    }
    set y(v: number) {
        this.translate.y = v;
        this._updateLocalMat();
    }

    get z(): number {
        return this.translate.z;
    }

    set z(v: number) {
        this.translate.z = v;
        this._updateLocalMat();
    }

    get mesh(): Mesh | null {
        return this._mesh;
    }

    public setParent(parent: Node): void {
        this._parent = parent;
        parent._children.push(this);
        this._updateWorldMat();
    }

    public addChildren(...nodes: Node[]): void {
        for (let i = 0; i < nodes.length; i++) {
            nodes[i].setParent(this);
        }
    }

    protected _getWorldMat(): mat4 {
        return this._worldMat;
    }

    protected _updateLocalMat(): void {
        this._localMat = mat4.translate(this._localMat, this._tempIdentityMat, [
            this.translate.x,
            this.translate.y,
            this.translate.z,
        ]);
    }

    protected _updateWorldMat(): void {
        if (!this.parent) {
            return;
        }
        const parentWorldMat = this.parent._getWorldMat();
        this._worldMat = mat4.mul(
            this._worldMat,
            parentWorldMat,
            this._localMat
        );
        for (let i = 0; i < this._children.length; i++) {
            this._children[i]._updateWorldMat();
        }
    }

    public setMesh(mesh: Mesh): void {
        this._mesh = mesh;
    }
}
