const { execSync } = require('child_process');
try {
  console.log('Running npm run build...');
  const out = execSync('npm run build', { stdio: 'pipe', encoding: 'utf-8' });
  console.log('STDOUT:', out);
} catch (e) {
  console.error('ERROR STDOUT:', e.stdout);
  console.error('ERROR STDERR:', e.stderr);
}
