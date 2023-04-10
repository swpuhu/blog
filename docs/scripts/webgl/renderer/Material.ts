import { Effect } from './Effect';

export abstract class Material {
    constructor(protected effect: Effect) {}

    get program(): PossibleNullObject<WebGLProgram> {
        return this.effect.program;
    }

    public abstract updateProperties(): void;
}
