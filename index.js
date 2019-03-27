const fs = require('fs');
const inquirer = require('inquirer');
const figlet = require('figlet');
const chalk = require('chalk');

// Prints out logo in the terminal
figlet('Dockerize', (err, data) => {
  if (err) {
    console.log(err);
    console.dir(err);
    return;
  }
  console.log(chalk.blue.bold(`${data}🐳`));
  
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
      inquirer.prompt(prod).then((answers) => {
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

          inquirer.prompt(questions).then((answers) => {
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
          });
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
          inquirer.prompt(questionsPython).then((answers) => {
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
          });
        }
      });
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
      inquirer.prompt(dev).then((answers) => {
        let webpackResult = '';
        // Runtime Node
        if (answers.runtime === 'node') {
          const questions = [
            {
              type: 'list',
              name: 'versions',
              message: 'Select your Node version',
              choices: ['10.15', '11.12', '6.17', '8.15'],
            },
            {
              type: 'confirm',
              name: 'webpack',
              message: 'Do you have an existing webpack configured?',
            },
            {
              type: 'input',
              name: 'port',
              message: "What's your current server port?",
            }
          ];
          inquirer.prompt(questions).then((answers) => {
            // Validate if user has a webpack
            if (answers.webpack === true) {
              webpackResult = `#RUN a command to build your application in the container
              RUN npm i -g webpack`;
            }
            const docker = `         
FROM ${answers.versions}
${webpackResult}
WORKDIR /usr/src/app
#Copy is used to copy files from docker host file system into the container
COPY package*.json ./
#install all dependecies from package.json inside container
RUN npm install
EXPOSE ${answers.port}
`;
            // Create Dockerfile-dev
            fs.writeFile('Dockerfile-dev', docker, (err) => {
              if (err) {
                return err;
              }
              console.log('Dockerfile-dev has been created!');
            });
          })
          // For Python runtime 
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
          inquirer.prompt(questionsPython).then((answers) => {
            // User has to provide input for requirements File
            if (answers.requirementsFile === 'false') {
              console.log('Please configure your requirements.txt file...aborting');
              return;
            }
            const docker = `
FROM python:${answers.versions}
WORKDIR /usr/src/app
#Copy is used to copy files from docker host file system into the container
COPY package*.json ./
#RUN a command to npm install your node_modules in the container
RUN pip install --trusted-host pypi.python.org -r requirements.txt
# CMD will be a default command to run if no commands are givin in terminal when running the container
EXPOSE ${answers.port}
`;
            // Create Dockerfile-dev
            fs.writeFile('Dockerfile-dev', docker, (err) => {
              if (err) {
                return err;
              }
              console.log('Dockerfile-dev has been created!');
            });
          });
        }
      });

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
      inquirer.prompt(db).then((answers) => {
        // For PostgreSQL
        if (answers.runtime === 'postgres') {
          const questionsDb = [
            {
              type: 'list',
              name: 'versions',
              message: 'Select your PostgreSQL version',
              choices: ['9.5.6', '10.1'],
            },
            {
              type: 'input',
              name: 'location',
              message: "Where is your database located? Provide relative path.",
            }
          ];

          inquirer.prompt(questionsDb).then((answers) => {
            // Validate if user has a webpack
            if (answers.webpack === true) {
              webpackResult = `#RUN a command to build your application in the container
              RUN npm i -g webpack`;
            }
            if (answers.location === false) {
              console.log('Please specify the database path');
              return;
            }

            const docker = `         
FROM ${answers.versions}
COPY ${answers.location} /docker-entrypoint-initdb.d/
`;
            // Create Dockerfile-db
            fs.writeFile('Dockerfile-db', docker, (err) => {
              if (err) {
                return err;
              }
              console.log('Dockerfile-db has been created!');
            });
          })
          // For MongoDB 
        } else if (answers.runtime === 'python') {
          if (answers.runtime === 'mongodb') {
            const questionsDb = [
              {
                type: 'list',
                name: 'versions',
                message: 'Select your MongoDB version',
                choices: ['3.2', '3.4', '4.0'],
              },
              {
                type: 'input',
                name: 'location',
                message: "Where is your database located? Provide relative path.",
              }
            ];

            inquirer.prompt(questionsDb).then((answers) => {
              // Validate if user has a webpack
              if (answers.webpack === true) {
                webpackResult = `#RUN a command to build your application in the container
                RUN npm i -g webpack`;
              }
              if (answers.location === false) {
                console.log('Please specify the database path');
                return;
              }

              const docker = `         
  FROM ${answers.versions}
  COPY ${answers.location} /docker-entrypoint-initdb.d/
  `;
              // Create Dockerfile-db
              fs.writeFile('Dockerfile-db', docker, (err) => {
                if (err) {
                  return err;
                }
                console.log('Dockerfile-db has been created!');
              });
            })
          }
        }
      })
    }
  })
})