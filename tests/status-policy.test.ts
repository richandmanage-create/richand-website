import test from 'node:test';
import assert from 'node:assert/strict';
import { canTransition } from '../src/lib/status-policy.ts';
test('only permits forward operational transitions',()=>{assert.equal(canTransition('pending','confirmed'),true);assert.equal(canTransition('confirmed','completed'),true);for(const [from,to] of [['pending','completed'],['cancelled','confirmed'],['completed','pending'],['unknown','confirmed']])assert.equal(canTransition(from,to),false);});
