import * as fs from 'fs';
import {Matrix, Input} from '../../dist/tensors';

// Points of a polynom a*x^3 + b*x^2 + c*x + d
const noise = 0.005;

// The goal of this example is to reproduce this coeficients
const a = Math.random() - 0.5;
const b = Math.random() - 0.5;
const c = Math.random() - 0.5;
const d = Math.random() - 0.5;

console.log(`Using a: ${a}  b: ${b}  c: ${c}  d: ${d}`);

function polynom(x: number) {
    return a*Math.pow(x,3) + b*Math.pow(x,2) + c*x + d;
}

// Step 1 - Generate the input data

// Number of input points
const N = 100;

const data = (Array.apply(null, Array(N)) as number[])
    .map((v,i)=> ({
        x: i/N,
        y: polynom(i/N) + (Math.random()-0.5)*noise
    }));

// Save the points to file
const inputCsv = data.reduce((prev, current) => (prev + `${current.x}, ${current.y}\n`), '');
fs.writeFile('./example/regression/out/input.csv', inputCsv, error => {
    if(error)
        return console.log(error);

    console.log("Saved input values.");
});

// Step 2 - Build the model