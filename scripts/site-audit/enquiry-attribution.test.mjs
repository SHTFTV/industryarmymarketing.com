import test from 'node:test';
import assert from 'node:assert/strict';
import { readReferral, referralNote } from '../../artifacts/industry-army/src/lib/enquiryAttribution.ts';

test('network referral and industry survive as bounded plain text', () => {
  const referral = readReferral('?iamref=roofers.io%7Ciam%7Csession&industry=Roofing&ref_page=%2Froofing%3Fsecret%3D1');
  assert.deepEqual(referral, {site:'roofers.io', industry:'Roofing', page:'/roofing'});
  assert.ok(referralNote(referral,'guest-post').includes('Request: guest-post'));
  assert.ok(!referralNote(referral,'guest-post').includes('secret'));
});
test('direct visits do not invent an external referral; referrers disclose hostname only', () => {
  assert.equal(readReferral('', 'https://www.industryarmymarketing.com/pricing').site, '');
  assert.equal(readReferral('', 'https://buildershaus.com/private?token=abc').site, 'buildershaus.com');
  assert.equal(readReferral('?ref_page=https://evil.example/').page, '');
});
