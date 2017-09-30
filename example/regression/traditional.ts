// Linear regression with SGD
// Run this file with ts-node ./traditional.ts

import * as fs from 'fs';
import {Matrix, Input} from '../../dist/tensors';

// Some helper functions

function printVector(vector: number[], description: string) {
    console.log(`${description}: ${vector.map(t => t.toString()).join(', ')}`);
}

// Creates a vector of uniform random numbers
function createUniformVector(size: number, max: number = 1.0, min: number = 0.0) {

    return (Array.apply(null, Array(size)) as number[])
        .map(v => min + Math.random()* (max - min));
}

// Points of a polynom a*x^3 + b*x^2 + c*x + d
const noise = 0.002;

// The goal of this example is to reproduce this coeficients
const COEFICIENTS_COUNT = 4;

const coeficients = createUniformVector(COEFICIENTS_COUNT);
printVector(coeficients, 'Coeficients');

function polynom(coeficients: number[], x: number) {
    return coeficients.reduce((prev, current, index) => prev + current*Math.pow(x, index),0.0);
}

// f = Sum c_i*x^i  -> df_i = x^i
function dPolynom(theta: number[], x: number) {
    return theta.map((value, index) => Math.pow(x, index));
}

function sq(value: number) {
    return value*value;
}

const f = polynom.bind({}, coeficients);

// --------------------------------------------------------------------------------------
// Step 1 - Generate the input data
// --------------------------------------------------------------------------------------

interface Point {
    x: number;
    y: number;
}

// Number of input points
const N = 100;

const data: Point[] = (Array.apply(null, Array(N)) as number[])
    .map((v,i)=> ({
        x: i/N,
        y: f(i/N) + (Math.random()-0.5)*noise
    }));

// Save the points to file
const inputCsv = data.reduce((prev, current) => (prev + `${current.x}, ${current.y}\n`), '');
fs.writeFile('./example/regression/out/input.csv', inputCsv, error => {
    if(error)
        return console.log(error);

    console.log("Saved input values.");
});

// --------------------------------------------------------------------------------------
// Step 2 - Build the model
// --------------------------------------------------------------------------------------

// The model: polynom(theta, x)
const model = polynom;//(theta: number, x: number) => number = polynom.bind({}, theta);

// cost: |y - model|^2
const cost = (theta: number[], p: Point) => sq(model(theta, p.x) - p.y);

// loss: cost + lambda*|theta|^2 (where lambda is a hyperparameter)
const lambda = 0.0;
const loss = (theta: number[], p: Point) => cost(theta, p) + lambda * theta.reduce((prev, curr) => prev + sq(curr), 0.0);

// --------------------------------------------------------------------------------------
// Step 3 - Build Gradients
// --------------------------------------------------------------------------------------

// End result should be of the form: dloss/dtheta
function vectorTimesScalar(vec: number[], scalar: number) {
    return vec.map(v => v*scalar);
}

// dModel/dTheta
const dModel = dPolynom;
// dCost/dModel
const dCost = (theta: number[], p: Point) => 2*(model(theta, p.x) - p.y );
// dCost/dTheta = dModel/dTheta * dCost/dModel
const dCostDTheta = (theta: number[], p: Point) => vectorTimesScalar(dModel(theta, p.x), -dCost(theta, p));

// --------------------------------------------------------------------------------------
// Step 4 - Train the model
// --------------------------------------------------------------------------------------

function addToVector(a: number[], b: number[]) {
    if(a.length !== b.length) {
        console.error(`Vectors must have the same size. Not: ${a.length} and ${b.length}`);
        return [];
    }
    for(let i = 0; i < a.length;++i)
        a[i] += b[i];
}

function pad(value: number, width: number, z?: string) {
    z = z || '0';
    const n = value + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }

class Tracer {
    private lines: string[];
    constructor(){
        this.lines = [];
    }

    Add(iteration: {theta: number[], gradient: number[]}) {
        const sep = ', ';
        this.lines.push(iteration.theta.map(n => n.toString()).join(sep)
            + sep
            + iteration.gradient.map(n => n.toString()).join(sep));
    }

    Save(filename: string = './example/regression/out/params.csv') {
        fs.writeFile(filename, this.lines.join('\n'), error => {
            if(error)
                return console.log(error);
            console.log(`Saved snapshot `);
        });
    }
}

const ITERATION_COUNT = 500;
const LEARNING_RATE = 0.10;

{
    // Parameter: theta (init with random)
    const theta = createUniformVector(COEFICIENTS_COUNT);

    const tracer = new Tracer();

    for(let i = 0; i < ITERATION_COUNT; ++i) {
        // console.log(`Iteration: #${i+1}`);
        const batch = data; // Maximal batch size
        const from = 0;
        const to = data.length;
        const learningRate = LEARNING_RATE / batch.length;

        // printVector(theta, 'Parameter');

        let gradient = theta.map(v => 0.0);
        for(let j = from; j < to; ++j) {
            addToVector(gradient, dCostDTheta(theta, batch[j]));
        }
        gradient = vectorTimesScalar(gradient, learningRate);
        // printVector(gradient, 'Gradient');

        addToVector(theta, gradient);

        let batchCost = 0.0;
        for(let j = from; j < to; ++j) {
            batchCost += cost(theta, batch[j]);
        }
        console.log(`Cost: ${batchCost}`);
        // console.log(`Loss: ${loss}`);
        tracer.Add({theta, gradient});
    }

    printVector(theta, 'Found Parameter');
    printVector(coeficients, 'Orig Parameter');
    tracer.Save();
}