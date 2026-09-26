import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeOrigin, repairCityLinks } from './repair-static.mjs';

test('canonical and schema share www without altering other hosts', () => {
  assert.equal(normalizeOrigin('https://industryarmymarketing.com/a https://industryarmymarketing.com.evil/a'), 'https://www.industryarmymarketing.com/a https://industryarmymarketing.com.evil/a');
});
test('CTA and related links become usable while markup and unsafe URLs stay intact', () => {
  const input = '<script>"[x](/scan-wizard)"</script><p>[Scan](/scan-wizard)</p><strong>[City](https://www.industryarmymarketing.com/city/)</strong><a href="/x">[Existing](/y)</a><p>[Bad](javascript:evil)</p>';
  const output = repairCityLinks(input);
  assert.ok(output.includes('<p><a href="/scan-wizard">Scan</a></p>'));
  assert.ok(output.includes('<strong><a href="https://www.industryarmymarketing.com/city/">City</a></strong>'));
  assert.ok(output.includes('<script>"[x](/scan-wizard)"</script>'));
  assert.ok(output.includes('<a href="/x">[Existing](/y)</a>'));
  assert.ok(output.includes('[Bad](javascript:evil)'));
  assert.equal(repairCityLinks(output), output);
});

test('industry enquiry links carry type and originating city page without duplicate insertion', async () => {
  const { addIndustryEnquiry } = await import('./repair-static.mjs');
  const output = addIndustryEnquiry('<body><h1>HVAC</h1></body>', '/contractor-marketing/hvac-surprise/');
  assert.ok(output.includes('request=marketing&amp;industry=HVAC'));
  assert.ok(output.includes('request=guest-post'));
  assert.ok(output.includes('ref_page=%2Fcontractor-marketing%2Fhvac-surprise%2F'));
  assert.equal(addIndustryEnquiry(output, '/contractor-marketing/hvac-surprise/'), output);
});
