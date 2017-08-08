export * from './layers';

import { Matrix, Input } from './tensors';

let W = new Matrix({ width: 3, height: 3, kind: 'parameter', init: {method: 'fix', data: [1,2,3,4,5,6,7,8,9]}, name: 'W' });
let b = new Matrix({ width: 1, height: 3, kind: 'parameter', init: {method: 'fix', data: [1,2,3]}, name: 'b' });
let x = new Input(1, 3);

let net = W.multiply(x).add(b);
x.data = [1, 2, 3];
let y = net.eval();

console.log(y);