import {Matrix} from './tensors';

export interface Layer {
    forward(): void;
    backward(): void;
}

export class FullyConnectedLayer implements Layer {
    private bias: number;
    private weights: number;

    constructor() {

    }

    forward(): void {

    }

    backward(): void {

    }
}