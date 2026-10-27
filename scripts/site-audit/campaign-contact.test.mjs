import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { campaignContact } from '../../artifacts/industry-army/src/lib/campaignContact.ts';
test('campaign attribution uses the fixed IAM enquiry route',()=>assert.deepEqual(campaignContact(' BuildersHaus.COM '),{site:'buildershaus.com',href:'https://www.industryarmymarketing.com/contact?request=guest-post&ref_site=buildershaus.com'}));
test('future trade campaigns retain their own source',()=>{const c=campaignContact('roofers.io');assert.equal(new URL(c.href,'https://www.industryarmymarketing.com').hostname,'www.industryarmymarketing.com');assert.equal(new URL(c.href,'https://www.industryarmymarketing.com').searchParams.get('ref_site'),'roofers.io')});
test('unflagged archive posts and supplied URLs do not create a card',()=>{for(const s of [undefined,'','https://example.com','bad.com?redirect=evil','/contact'])assert.equal(campaignContact(s),undefined)});
test('published first campaign carries its source without changing its edition',()=>{const posts=JSON.parse(readFileSync(new URL('../../artifacts/industry-army/src/data/buildJournal.json',import.meta.url)));const p=posts.find(x=>x.slug==='buildershaus-contractor-project-story-submission-guide');assert.equal(p.campaignSite,'buildershaus.com');assert.equal(p.publishedAt,'2026-10-27T14:40:21-07:00');assert.equal(p.contactBusiness,'iam')});
