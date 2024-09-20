import { describe, expect, it } from '@jest/globals';

import { splitReach, areReachsCompatible } from '../src/module/weaponGrips.ts';

describe('The splitReach fuction', () => {
  it('Should return a input without * unchanged in an array', () => {
    expect(splitReach('1-2')).toEqual(['1-2']);
  });
  it('Should return a input with * unchanged in an array, if it is a single reach', () => {
    expect(splitReach('1*')).toEqual(['1*']);
  });
  it('Should split a input with * at a ,', () => {
    expect(splitReach('1,2*')).toEqual(['1*','2*']);
  });
  it('Should expand a range with * to single reaches', () => {
    expect(splitReach('1-3*')).toEqual(['1*','2*','3*']);
  });
  it('Should handle C* correcly', () => {
    expect(splitReach('C*')).toEqual(['C*']);
  });
  it('Should handle C,1* correcly', () => {
    expect(splitReach('C,1*')).toEqual(['C*','1*']);
  });
  it('Should handle C-2* correcly', () => {
    expect(splitReach('C-2*')).toEqual(['C*','1*','2*']);
  });
});

describe('The areReachsCompatible fuction', () => {
    it.each([['1','1'],['1-2','1-2'],['1*','1*'],['2*','2*']])('Should treat equal reaches as compatible', (a : string, b: string) => {
      expect(areReachsCompatible(a,b)).toEqual(true);
    });
    it.each([['1','2'],['1-2','1'],['1','2-3'],['1','C,1']])('Should treat all reaches without * as compatible', (a : string, b: string) => {
        expect(areReachsCompatible(a,b)).toEqual(true);
      });
      it.each([['1*','2*'],['2*','1*'],['C*','1*'],['1*','C*']])('Should treat differnt reaches with * as incompatible', (a : string, b: string) => {
        expect(areReachsCompatible(a,b)).toEqual(false);
      });
      it.each([['1*','1'],['1','1*'],['C','1*'],['1','C*']])('Should treat  reaches with * as incompatible wiht reaches without *', (a : string, b: string) => {
        expect(areReachsCompatible(a,b)).toEqual(false);
      });
  });  
