// const fs = require('fs');
// const inquirer = require('inquirer');
// const figlet = require('figlet');
// const chalk = require('chalk');

module.exports = {
  productionFunc: (answers) => {
    // For runtime Node
    if (answers.runtime === 'node') {
      const questions = [
        {
          type: 'list',
          name: 'versions',
          message: 'Select your Node version',
          choices: ['10.15', '11.12', '6.17', '8.15'],
        },
        {
          type: 'input',
          name: 'port',
          message: "What's your current server port?",
        },
        {
          type: 'confirm',
          name: 'entrypoint',
          message: 'Do you have a start script in your existing package.json?',
        },
        {
          type: 'confirm',
          name: 'webpack',
          message: 'Do you have an existing webpack configured?',
        },
        {
          type: 'input',
          name: 'containerName',
          message: 'Create your container name',
        },
      ];

      inquirer.prompt(questions).then(
        production.nodeProdCreate(answers)
      );
      // For runtime Python
    } else if (answers.runtime === 'python') {
      const questionsPython = [
        {
          type: 'list',
          name: 'versions',
          message: 'Select your Python version',
          choices: ['2.7', '3.5', '3.7', '3.8'],
        },
        {
          type: 'confirm',
          name: 'requirementsFile',
          message: 'Do you have a requirements.txt file',
        },
        {
          type: 'input',
          name: 'appFile',
          message: 'Insert file path to your app.py file',
        },
        {
          type: 'input',
          name: 'port',
          message: "What's your current server port?",
        },
        {
          type: 'input',
          name: 'containerName',
          message: 'Create your container name',
        },
      ];
      inquirer.prompt(questionsPython).then(
        production.pythonProdCreate(answers)
      );
    }
  },

  nodeProdCreate: (answers) => {
    let webpackResult = '';
    // User has to provide input for entrypoint
    if (answers.entrypoint === false) {
      console.log('Please specify start script...exiting');
      return;
    }

    // Validate if user has webbpack build
    if (answers.webpack === true) {
      webpackResult = `#RUN a command to build your application in the container
RUN npm run build`;
    }

    const docker = `
    FROM node:${answers.versions}
    WORKDIR /usr/src/app
    #COPY all of your application files to the WORKDIR in the container
    COPY ./ ./
    #RUN a command to npm install your node_modules in the container
    RUN npm install
    ${webpackResult}
    #EXPOSE your server port (3000) for when you are running in production
    EXPOSE ${answers.port}
    #Create an ENTRYPOINT where you'll run node ./server/server.js
    ENTRYPOINT ["npm", "start"]
    # CMD will be a default command to run if no commands are givin in terminal when running the container
    # ENTRYPOINT is the same but will not be ignored if a command is given in the command line when running the container
    `;
    // Create Dockerfile
    fs.writeFile('Dockerfile', docker, (err) => {
      if (err) {
        return err;
      }
      console.log('Dockerfile has been created!');
    });
  },

  pythonProdCreate: (answers) => {
    // User has to provide input for requirements file
    if (answers.requirementsFile === 'false') {
      console.log('Please configure your requirements.txt file...aborting');
      return;
    }
    const docker = `
    FROM python:${answers.versions}
    WORKDIR /usr/src/app
    #COPY all of your application files to the WORKDIR in the container
    COPY ./ ./
    #RUN a command to npm install your node_modules in the container
    RUN pip install --trusted-host pypi.python.org -r requirements.txt
    #EXPOSE your server port (3000) for when you are running in production
    EXPOSE ${answers.port}            
    # CMD will be a default command to run if no commands are givin in terminal when running the container
    # ENTRYPOINT is the same but will not be ignored if a command is given in the command line when running the container
    ENTRYPOINT ["python", "${answers.appFile}"]
    `;
    // Create Dockerfile
    fs.writeFile('Dockerfile', docker, (err) => {
      if (err) {
        return err;
      }
      console.log('Dockerfile has been created!');
    });
  }
}