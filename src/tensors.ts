import * as _ from 'lodash';

// Usecase
// let W = new Matrix(10,10)
// let b = new Matrix(10,1)
// let x = new Input(10)

// let net = W.multiply(x)+b
// x.data =[1,2,3,4,5,6,7,8,9,0]
// let y = net.eval()

export interface Tensor {
    width: number;
    height: number;
    name: string;
    eval(): number[];
}

export class Input implements Tensor {

    public readonly name: string;
    private _data: number[];

    constructor(public width: number, public height: number, name?: string) {
        this._data = Array.apply(null, Array(width*height)).map(() => 0.0);
        this.name = name || 'input';
    }

    eval() {
        return this._data;
    }

    set data(data: number[] | number[][]) {
        const flatten = _.flatten(data);
        if (flatten.length !== this.width * this.height) {
            throw new Error(`Data dimensions do not match. Expected ${this.width * this.height} items, but got ${flatten.length}`);
        }
        else {
            this._data = flatten;
        }
    }
}

export interface ParameterConfig {
    kind: 'parameter';
    width: number;
    height: number;
    init?: { method: 'uniform', min: number, max: number } | {method: 'fix', data: number[]};
    name: string;
}

export interface OperationConfig {
    kind: '+' | '*' | '-';
    left: Tensor;
    right: Tensor;
}

export class Matrix implements Tensor {

    public readonly width: number;// { return this.config.width || this.config.left.width; }
    public readonly height: number;// { return this.config.height;}
    public readonly name: string;

    private _data: number[];

    constructor(private config: ParameterConfig | OperationConfig) {

        if (config.kind === 'parameter') {
            const init = config.init || { method: 'uniform', min: -1, max: 1 };
            this.width = config.width;
            this.height = config.height;

            switch (init.method) {
                case 'uniform':
                    this._data = Array.apply(null, Array(this.width * this.height)).map(() =>
                        init.min + Math.random() * (init.max - init.min)
                    );
                    break;
                case 'fix':
                    const data = _.flatten(init.data);
                    if(data.length !== this.width*this.height) {
                        throw new Error(`The size (${data.length}) of the data array does not match the dimensions. ${this.width}x${this.height}`);
                    }
                    this._data = init.data;
                    break;
            }
            this.name = config.name;
        }
        else {
            if (this.config.kind === '+' || this.config.kind === '-') {
                this.width = config.left.width;
                this.height = config.left.height;
            }
            else if (this.config.kind === '*') {
                this.height = this.config.left.height;
                this.width = this.config.right.width;
            }
            this._data = Array.apply(null, Array(this.width * this.height)).map(() => 0);
            this.name = this.config.kind;
        }
    }

    eval() {
        switch (this.config.kind) {
            case '+':
                this._add();
                break;
            case '-':
                this._subsctract();
                break;
            case '*':
                this._multiply();
                break;
        }
        return this._data;
    }

    multiply(right: Tensor): Matrix {
        if (right.height !== this.width) {
            const message = `Matrix dimensions do not match ${this.width}x${this.height} * ${right.width}x${right.height} (${this.name}*${right.name})`;
            console.error(message);
            throw new Error(message);
        }

        return new Matrix({ left: this, right, kind: '*' });
    }

    add(right: Tensor): Matrix {
        if (right.height !== this.height || right.width !== this.width) {
            const message = `Matrix dimensions do not match ${this.width}x${this.height} + ${right.width}x${right.height} (${this.name}+${right.name})`;
            console.error(message);
            throw new Error(message);
        }

        return new Matrix({ left: this, right, kind: '+' });
    }

    substract(right: Tensor): Matrix {
        if (right.height !== this.height || right.width !== this.width) {
            const message = `Matrix dimensions do not match ${this.width}x${this.height} - ${right.width}x${right.height} (${this.name}-${right.name})`;
            console.error(message);
            throw Error(message);
        }

        return new Matrix({ left: this, right, kind: '-' });
    }

    private _multiply() {
        /* istanbul ignore else  */
        if (this.config.kind === '*') {
            const { left, right } = this.config;
            const leftData = left.eval();
            const rightData = right.eval();

            // M_mn = sum_k left_mk * right_kn

            for(let m = 0; m < this.height; m++) {
                for (let n = 0; n < this.width; n++) {
                    const cellIndex = m * this.width + n;
                    this._data[cellIndex] = 0;
                    for (let k = 0; k < left.width; k++) {
                        this._data[cellIndex] += leftData[m * left.width + k] * rightData[k*right.width + n];
                    }
                }
            }
        }
    }

    private _add() {
        /* istanbul ignore else  */
        if (this.config.kind === '+') {
            const leftData = this.config.left.eval();
            const rightData = this.config.right.eval();
            for (let i = 0; i < this.height * this.width; i++) {
                this._data[i] = leftData[i] + rightData[i];
            }
        }
    }

    private _subsctract() {
        /* istanbul ignore else  */
        if (this.config.kind === '-') {
            const leftData = this.config.left.eval();
            const rightData = this.config.right.eval();
            for (let i = 0; i < this.height * this.width; i++) {
                this._data[i] = leftData[i] - rightData[i];
            }
        }
    }
}

export class Operation extends Matrix {

}