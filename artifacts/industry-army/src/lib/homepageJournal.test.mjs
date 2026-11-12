import test from 'node:test';import assert from 'node:assert/strict';import {homepageJournal,homepagePublicationLabel} from './homepageJournal.mjs';
const post=(slug,publishedAt,more={})=>({slug,publishedAt,title:slug,image:'/real.jpg',...more});
test('uses actual published time, ignores updated/build time, deterministic equal-time order',()=>{const a=post('old','2026-10-25T20:16:53Z',{updatedAt:'2026-11-12T23:59:00Z'}),before=JSON.stringify(a);assert.deepEqual(homepageJournal([a,post('z','2026-11-12T01:00:00Z'),post('a','2026-11-12T01:00:00Z')],Date.parse('2026-11-13')).map(p=>p.slug),['a','z','old']);assert.equal(JSON.stringify(a),before);});
test('one held, future or undated row cannot hide another published story',()=>{assert.deepEqual(homepageJournal([post('held','2026-11-12',{status:'held'}),post('future','2030-01-01'),post('undated',null),post('good','2026-11-11')],Date.parse('2026-11-13')).map(p=>p.slug),['good']);});
test('Pacific date agrees with original local publication day across UTC midnight',()=>assert.equal(homepagePublicationLabel('2026-11-12T05:03:24Z'),'November 11, 2026'));

test('keeps an explicitly recorded historical date instead of reinterpreting it in another timezone',()=>assert.equal(homepagePublicationLabel('2026-11-11T07:31:00Z','November 10, 2026'),'November 10, 2026'));
