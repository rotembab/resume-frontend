import { spawn } from 'node:child_process';

const run = (script: string, args: string[] = []): Promise<void> =>
  new Promise((resolve, reject) => {
    const proc = spawn('npx', ['tsx', script, ...args], {
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${script} exited with code ${code}`));
    });
  });

const main = async () => {
  const pdfArg = process.argv[2];

  console.log('=== Step 1/3: Import PDF → resume.json ===');
  await run('scripts/import-resume.ts', pdfArg ? [pdfArg] : []);

  console.log('\n=== Step 2/3: Fetch skill icons ===');
  await run('scripts/fetch-skill-icons.ts');

  console.log('\n=== Step 3/3: Translate to Hebrew + Japanese ===');
  await run('scripts/translate-resume.ts');

  console.log('\nResume pipeline complete.');
};

main().catch((err) => {
  console.error('\nBuild failed:', err.message);
  process.exit(1);
});
