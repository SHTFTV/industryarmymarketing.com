import fs from 'node:fs';
import crypto from 'node:crypto';

// Release-specific media gate. Historical posts are not silently reclassified.
const review = JSON.parse(fs.readFileSync('docs/releases/hvacr-news-media-qa.json', 'utf8'));
const posts = JSON.parse(fs.readFileSync('artifacts/industry-army/src/data/buildJournal.json', 'utf8'));
const post = posts.find(p => p.slug === review.slug);
if (!post || review.manualVisualReview !== true) throw Error('Missing article or manual visual review');
function jpegSize(bytes) {
  if (bytes.readUInt16BE(0) !== 0xffd8) throw Error('Expected JPEG');
  let i = 2;
  while (i < bytes.length) {
    if (bytes[i++] !== 0xff) continue;
    let marker = bytes[i++];
    while (marker === 0xff) marker = bytes[i++];
    if (marker === 0xd9 || marker === 0xda) break;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    const length = bytes.readUInt16BE(i);
    if ([0xc0, 0xc1, 0xc2].includes(marker)) return [bytes.readUInt16BE(i + 5), bytes.readUInt16BE(i + 3)];
    i += length;
  }
  throw Error('JPEG dimensions unavailable');
}
for (const [index, asset] of review.assets.entries()) {
  const bytes = fs.readFileSync(asset.path);
  if (crypto.createHash('sha256').update(bytes).digest('hex') !== asset.sha256) throw Error('Changed image requires a fresh visual review: ' + asset.path);
  const [width, height] = jpegSize(bytes);
  if (width !== asset.width || height !== asset.height) throw Error('Incorrect image dimensions');
  if (index === 0 && (width < 1600 || height < 840)) throw Error('Hero below 1600 × 840');
  if (index === 1 && (width !== 1200 || height !== 630)) throw Error('Share image must be 1200 × 630');
  const articlePath = index === 0 ? post.image : post.ogImage;
  if ('artifacts/industry-army/public' + articlePath !== asset.path) throw Error('Article does not reference reviewed media');
  if (!asset.visualReview) throw Error('Missing visual review evidence');
}
console.log('Reviewed HVACR launch media: dimensions, hashes and article references passed.');
