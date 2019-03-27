const fs = require('fs');
const inquirer = require('inquirer');
const figlet = require('figlet');
const chalk = require('chalk');

const production = require('./prod')
const development = require('./dev')
const database = require('./db')

// Prints out logo in the terminal
figlet('Dockerize', (err, data) => {
  if (err) {
    console.log(err);
    console.dir(err);
    return;
  }
  console.log(chalk.blue.bold(`${data}🐳`));

  // Prompt for environment of the docker image
  const env = [
    {
      type: 'list',
      name: 'env',
      message: 'Select your environment',
      choices: ['development', 'production', 'database'],
    },
  ];
  // Deviding prompts based on environment input
  inquirer.prompt(env).then((answers) => {
    // Production Environment
    if (answers.env === 'production') {
      const prod = [
        {
          type: 'list',
          name: 'runtime',
          message: 'Select your runtime',
          choices: ['node', 'python'],
        },
      ];
      inquirer.prompt(prod).then(production.productionFunc(answers));
      // Development Environment
    } else if (answers.env === 'development') {
      const dev = [
        {
          type: 'list',
          name: 'runtime',
          message: 'Select your runtime',
          choices: ['node', 'python'],
        },
      ];
      inquirer.prompt(dev).then(development.developmentFunc(answers));

      // Database Environment
    } else if (answers.env === 'database') {
      const db = [
        {
          type: 'list',
          name: 'runtime',
          message: 'Select your runtime',
          choices: ['postgres', 'mongodb'],
        },
      ];
      inquirer.prompt(db).then(database.databaseFunc(answers))
    }
  })
})