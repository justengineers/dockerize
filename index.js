const minimist = require('minimist');

module.exports = () => {
  const args = minimist(process.argv.slice(2));
  const cmd = args._[0] || 'help';
  // console.log(process.argv);

  switch (cmd) {
    case 'mkdockerfile':
      require('./cmds/mkDockerfile')();
      break;
    case 'mkdockercompose':
      require('./cmds/mkDockerComposeYaml')();
      break;
    case 'help':
      require('./cmds/help')();
      break;
    default:
      console.error(
        `"${cmd}" is not a valid command! Type in 'dockerize-it help' to see valid commands`,
      );
      break;
  }
};
