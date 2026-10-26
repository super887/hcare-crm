const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'public', 'proposal-assets');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const screens = [
  {
    name: 'screen_therapist.png',
    url: 'https://hcare-crm.vercel.app/therapist',
    w: 1440,
    h: 960,
  },
  {
    name: 'screen_admin.png',
    url: 'https://hcare-crm.vercel.app/admin',
    w: 1440,
    h: 960,
  },
  {
    name: 'screen_client_pc.png',
    url: 'https://hcare-crm.vercel.app/my?view=pc',
    w: 1440,
    h: 960,
  },
  {
    name: 'screen_client_mobile.png',
    url: 'https://hcare-crm.vercel.app/my?view=mobile',
    w: 1000,
    h: 960,
  },
];

console.log('Waiting 10 seconds for Vercel deployment...');
setTimeout(() => {
  for (const s of screens) {
    const outFile = path.join(outDir, s.name);
    console.log(`Capturing ${s.name} from ${s.url}...`);
    try {
      execSync(
        `"${chromePath}" --headless --disable-gpu --no-sandbox --virtual-time-budget=6000 --window-size=${s.w},${s.h} --screenshot="${outFile}" "${s.url}"`,
        { stdio: 'inherit' }
      );
      console.log(`✓ Saved ${s.name} (${fs.statSync(outFile).size} bytes)`);
    } catch (e) {
      console.error(`✗ Error on ${s.name}:`, e.message);
    }
  }
  console.log('All captures done!');
}, 10000);
