# Some Dnn tests

The prupose of this repo is in learning DNN concepts while implementing fundamental algorithms by scratch.

> Do not use this for your production code!

> Hints and contributions are welcome.

## Tensors

```typescript
const W = new Matrix(10,10);
const b = new Matrix(10,1);
const x = new Input(10);

const net = W.multiply(x).add(b);     // W*x+b
x.data = [1,2,3,4,5,6,7,8,9,0];
const y = net.eval();                 //
```