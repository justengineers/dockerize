const figlet = require('figlet');
const chalk = require('chalk');

module.exports = () => {
  figlet('Dockerize - it', (err, data) => {
    if (err) {
      console.log(err);
      console.dir(err);
      return;
    }
    console.log(chalk.blue.bold(`${data}🐳`));
    console.log(
      chalk.cyan.bold(` 
          Usage: dockerize-it <command>

          These are dockerize-it commands used:
          
          mkdockerfile    Makes a Dockerfile
          mkcompose       Makes a docker-compose.yaml
          help            Shows list of commands
`),
    );
  });
};
