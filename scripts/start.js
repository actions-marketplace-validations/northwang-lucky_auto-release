const cp = require('child_process');

const handler = (error, stdout, stderr) => {
  if (error) {
    console.error(stderr || stdout);
    return;
  }
  console.log(stdout);
};

cp.exec('pnpm watch:tsc', handler);
cp.exec('pnpm watch:ncc', handler);
