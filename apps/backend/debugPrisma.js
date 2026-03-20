const { execSync } = require('child_process');
try {
  console.log('Running prisma db push...');
  const out = execSync('npx prisma db push', { stdio: 'pipe', encoding: 'utf-8' });
  console.log('STDOUT:', out);
} catch (e) {
  console.error('ERROR STDOUT:', e.stdout);
  console.error('ERROR STDERR:', e.stderr);
}
