const cp = require('child_process');
const inquirer = require('inquirer');

inquirer
  .prompt({
    name: 'tip',
    type: 'list',
    message: 'Have you ran "pnpm build" command yet?',
    choices: ['No', 'Yes'],
  })
  .then(answers => {
    if (answers.tip === 'No') {
      try {
        console.log("I'm helping you to do that, please wait a moment...");
        cp.execSync('pnpm build && git add .');
        console.log('OK! I have finished it!');
      } catch (err) {
        return Promise.reject(err);
      }
    }
  })
  .catch(console.err);
