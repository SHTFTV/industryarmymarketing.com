import test from 'node:test';
import assert from 'node:assert/strict';
import { publicationDate } from '../../artifacts/industry-army/src/lib/publicationDate.ts';
test('publication timestamp takes priority without changing source date',()=>assert.equal(publicationDate('October 27, 2026','2026-10-27T21:50:00-07:00'),'2026-10-27'));
test('full month/day/year is not mistaken for month/year',()=>assert.equal(publicationDate('October 27, 2026'),'2026-10-27'));
test('legacy month/year remains first of that documented month',()=>assert.equal(publicationDate('October 2026'),'2026-10-01'));
test('invalid day and malformed labels are omitted',()=>{assert.equal(publicationDate('February 31, 2026'),undefined);assert.equal(publicationDate('27,-10-01'),undefined)});
