import {expect}  from 'chai';

import { Matrix, Input } from './math';

describe('Matrix', () => {

    describe('as input', () => {
        it('with correct data', () => {
            const x = new Input(1,3);
            x.data = [1,2,3];
            expect(x.eval()).to.be.deep.equal([1,2,3]);

        });

        it('with too less data', () => {
            const x = new Input(1,3);
            expect(() => x.data = [1,3]).to.throw('Data dimensions do not match. Expected 3 items, but got 2');
        });
    });

    describe('initialized as paramter', ()=> {
        describe('uniform', () => {
            it('with constraints should be in range', () => {
                const W = new Matrix({ width: 3, height: 2, kind: 'parameter', init: {method: 'uniform', min: -1, max: 1}, name: 'W' });

                expect(W.height).to.be.equal(2);
                expect(W.width).to.be.equal(3);
                expect(W.eval().length).to.be.equal(3*2);
                expect(W.name).to.be.equal('W');
                for(let i = 0; i < 3*2; i++) {
                    expect(W.eval()[i]).to.be.least(-1);
                    expect(W.eval()[i]).to.be.most(1);
                }
            });

            it('without any initializer', () => {
                const W = new Matrix({ width: 3, height: 2, kind: 'parameter', name: 'W' });

                expect(W.height).to.be.equal(2);
                expect(W.width).to.be.equal(3);
                expect(W.eval().length).to.be.equal(3*2);
                expect(W.name).to.be.equal('W');
                for(let i = 0; i < 3*2; i++) {
                    expect(W.eval()[i]).to.be.least(-1);
                    expect(W.eval()[i]).to.be.most(1);
                }
            });

        });

        describe('with fix values', () => {
            it('valid', () => {
                const W = new Matrix({ width: 3, height: 2, kind: 'parameter', init: {method: 'fix', data: [1,2,3,4,5,6]}, name: 'W' });
                expect(W.eval()).to.be.deep.equal([1,2,3,4,5,6]);
                expect(W.height).to.be.equal(2);
                expect(W.width).to.be.equal(3);
                expect(W.name).to.be.equal('W');
            });

            it('of to much count', () => {
                expect(() => new Matrix({ width: 3, height: 2, kind: 'parameter', init: {method: 'fix', data: [1,2,3,4,5,6,7]}, name: 'W' }))
                    .to.throw('The size (7) of the data array does not match the dimensions. 3x2');
            });

        });
    });

    it('should chain multiply and add', () => {
        const W = new Matrix({ width: 3, height: 3, kind: 'parameter', init: {method: 'fix', data: [1,2,3,4,5,6,7,8,9]}, name: 'W' });
        const b = new Matrix({ width: 1, height: 3, kind: 'parameter', init: {method: 'fix', data: [1,2,3]}, name: 'b' });
        const x = new Input(1, 3);

        const net = W.multiply(x).add(b);
        x.data = [1, 2, 3];
        const actual = net.eval();
        const expected = [15, 34, 53];

        expect(actual).to.be.deep.equal(expected);
    });

    it('should chain multiply and add', () => {
        const W = new Matrix({ width: 2, height: 2, kind: 'parameter', init: {method: 'fix', data: [1,2,3,4]}, name: 'W' });
        const b = new Matrix({ width: 1, height: 2, kind: 'parameter', init: {method: 'fix', data: [0,0]}, name: 'b' });
        const x = new Input(1, 2);

        const net = W.multiply(x).add(b);
        x.data = [1, 3];
        const actual = net.eval();
        const expected = [7,15];

        expect(actual).to.be.deep.equal(expected);
    });

    describe('as operator', () => {
        describe('plus', () => {
            it('valid', () => {
                const a = new Matrix({ width: 3, height: 2, kind: 'parameter', init: {method: 'fix', data: [1,2,3,4,5,6]}, name: 'a' });
                const b = new Matrix({ width: 3, height: 2, kind: 'parameter', init: {method: 'fix', data: [1,2,3,4,5,6]}, name: 'b' });

                const c = a.add(b);
                expect(c.width).to.be.equal(3);
                expect(c.height).to.be.equal(2);
                expect(c.name).to.be.equal('+');
                expect(c.eval()).to.be.deep.equal([2,4,6,8,10,12]);
            });

            it('mismatch dimensions', () => {
                const a = new Matrix({ width: 3, height: 1, kind: 'parameter', init: {method: 'fix', data: [1,2,3]}, name: 'a' });
                const b = new Matrix({ width: 3, height: 2, kind: 'parameter', init: {method: 'fix', data: [1,2,3,4,5,6]}, name: 'b' });

                expect(() => a.add(b)).to.throw('Matrix dimensions do not match 3x1 + 3x2 (a+b)');
            });
        });

        describe('minus', () => {
            it('valid', () => {
                const a = new Matrix({ width: 3, height: 2, kind: 'parameter', init: {method: 'fix', data: [1,2,3,4,5,6]}, name: 'a' });
                const b = new Matrix({ width: 3, height: 2, kind: 'parameter', init: {method: 'fix', data: [1,2,3,4,5,6]}, name: 'b' });

                const c = a.substract(b);
                expect(c.width).to.be.equal(3);
                expect(c.height).to.be.equal(2);
                expect(c.name).to.be.equal('-');
                expect(c.eval()).to.be.deep.equal([0,0,0,0,0,0]);
            });

            it('mismatch dimensions', () => {
                const a = new Matrix({ width: 3, height: 1, kind: 'parameter', init: {method: 'fix', data: [1,2,3]}, name: 'a' });
                const b = new Matrix({ width: 3, height: 2, kind: 'parameter', init: {method: 'fix', data: [1,2,3,4,5,6]}, name: 'b' });

                expect(() => a.substract(b)).to.throw('Matrix dimensions do not match 3x1 - 3x2 (a-b)');
            });
        });

        describe('multiply', () => {
            it('valid', () => {
                const a = new Matrix({ width: 3, height: 2, kind: 'parameter', init: {method: 'fix', data: [1,2,3,4,5,6]}, name: 'a' });
                const b = new Matrix({ width: 2, height: 3, kind: 'parameter', init: {method: 'fix', data: [1,2,3,4,5,6]}, name: 'b' });

                const c = a.multiply(b);
                expect(c.width).to.be.equal(2);
                expect(c.name).to.be.equal('*');
                expect(c.height).to.be.equal(2);
                // Checked with Octave
                expect(c.eval()).to.be.deep.equal([22, 28, 49, 64]);
            });

            it('small', () => {
                const a = new Matrix({ width: 1, height: 2, kind: 'parameter', init: {method: 'fix', data: [1,2]}, name: 'a' });
                const b = new Matrix({ width: 2, height: 1, kind: 'parameter', init: {method: 'fix', data: [1,2]}, name: 'b' });

                const c = a.multiply(b);
                expect(c.width).to.be.equal(2);
                expect(c.name).to.be.equal('*');
                expect(c.height).to.be.equal(2);
                expect(c.eval()).to.be.deep.equal([1,2,2,4]);
            });

            it('small', () => {
                const a = new Matrix({ width: 2, height: 1, kind: 'parameter', init: {method: 'fix', data: [1,2]}, name: 'a' });
                const b = new Matrix({ width: 1, height: 2, kind: 'parameter', init: {method: 'fix', data: [1,2]}, name: 'b' });

                const c = a.multiply(b);
                expect(c.width).to.be.equal(1);
                expect(c.name).to.be.equal('*');
                expect(c.height).to.be.equal(1);
                expect(c.eval()).to.be.deep.equal([5]);
            });

            it('mismatch dimensions', () => {
                const a = new Matrix({ width: 3, height: 1, kind: 'parameter', init: {method: 'fix', data: [1,2,3]}, name: 'a' });
                const b = new Matrix({ width: 3, height: 2, kind: 'parameter', init: {method: 'fix', data: [1,2,3,4,5,6]}, name: 'b' });

                expect(() => a.multiply(b)).to.throw('Matrix dimensions do not match 3x1 * 3x2 (a*b)');
            });
        });
    });

});
