const fs = require('fs');
const inquirer = require('inquirer');
const chalk = require('chalk');

module.exports = () => {
  console.log(chalk.red.greenBright('As you a reminder, you should already have existing images built'));

  const service = [
    {
      type: 'input',
      name: 'serviceName',
      message: 'Create service name',
    },
    {
      type: 'input',
      name: 'imageName',
      message: 'enter image name',
    },
    {
      type: 'input',
      name: 'hmr',
      message: 'Do you want to set up Hot Module Reload? If so, please provide your dev start script',
    },
    {
      type: 'list',
      name: 'db',
      message: 'Select database provider',
      choices: ['PostgreSQL', 'MongoDB'],
    },
  ];

  inquirer.prompt(service).then((answers) => {
    if (answers.db === 'PostgreSQL') {
      const dbquestions = [
        {
          type: 'input',
          name: 'psqluser',
          message: 'Enter PostgreSQL username',
        },
        {
          type: 'password',
          name: 'psqlpwd',
          message: 'Enter PostgreSQL password',
          choices: ['PostgreSQL', 'MongoDB'],
        },
        {
          type: 'input',
          name: 'dbimage',
          message: 'What is your db container image',
        },
        {
          type: 'input',
          name: 'dbname',
          message: 'What is your db name',
        },
        {
          type: 'input',
          name: 'dbconn',
          message: 'Insert PostgreSQL connection string',
        },
      ];

      inquirer.prompt(dbquestions).then((db) => {
        let devStart = '';

        if (answers.hmr !== '') {
          devStart = `command: ${answers.hmr}`;
        }
        const composeFile = `
version: '3'
services:
  ${answers.serviceName}:
    image: '${answers.imageName}'
    ports:
      - '8080:8080'
    volumes:
      - .:/usr/src/app
      - node_modules:/usr/src/app/node_modules
    ${devStart}
    depends_on:
      - postgres-db
    environment:
      - DATABASE_URL: ${db.dbconn}
      - PORT: 3000
  postgres-db:
    image: '${db.dbimage}'
    environment:
      - POSTGRES_PASSWORD=${db.psqlpwd}
      - POSTGRES_USER=${db.psqluser}
      - POSTGRES_DB=${db.dbname}
    volumes:
      - dev-db-volume:/var/lib/postgresql/data
volumes:
  node_modules:
  dev-db-volume:
`;
        fs.writeFile('docker-compose.yml', composeFile, (err) => {
          if (err) {
            return err;
          }
          console.log(chalk.red.greenBright('Your docker-compose file is ready! 🌟'));
        });
      });
    }
  });
};
