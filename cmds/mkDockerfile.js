const fs = require('fs');
const inquirer = require('inquirer');
const figlet = require('figlet');
const chalk = require('chalk');
// Prints out logo in the terminal
module.exports = () => {
  figlet('Dockerize-it', (err, data) => {
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
    // Dividing prompts based on environment input
    inquirer.prompt(env).then((answers) => {
    // Production Environment
      if (answers.env === 'production') {
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
        ];
        inquirer.prompt(questions).then((nodeconfig) => {
        // validate if user has existing start scripts
        // tell user to add start script if they don't
          let webpackResult = '';

          if (nodeconfig.entrypoint === true) {
            inquirer.prompt([{
              type: 'confirm',
              name: 'webpack',
              message: 'Do you have an existing webpack configured?',
            },
            {
              type: 'input',
              name: 'containerName',
              message: 'Create your container name',
            }]).then((config) => {
              if (config.webpack === true) {
                webpackResult = '#RUN a command to build your application in the container\nRUN npm run build';
              }

              const docker = `
FROM node:${nodeconfig.versions}

WORKDIR /usr/src/app

#COPY all of your application files to the WORKDIR in the container
COPY ./ ./

#RUN a command to npm install your node_modules in the container
RUN npm install

${webpackResult}

#EXPOSE your server port (3000) for when you are running in production
EXPOSE ${nodeconfig.port}

#Create an ENTRYPOINT where you'll run node ./server/server.js
ENTRYPOINT ["npm", "start"]

# CMD will be a default command to run if no commands are givin in terminal when running the container
# ENTRYPOINT is the same but will not be ignored if a command is given in the command line when running the container
`;

              fs.writeFile('Dockerfile', docker, (err) => {
                if (err) {
                  return err;
                }
                console.log(chalk.red.greenBright('Your Dockerfile is ready! 🌟'));
              });
              console.log(config.containerName);
              console.log(nodeconfig.port);

              // if (fs.existsSync('Dockerfile')) {
              //   exec(`docker build -t ${config.containerName} -f Dockerfile .`, (error, stdout, stderr) => {
              //     console.log(`stdout: ${stdout}`);
              //     console.log(`stderr: ${stderr}`);
              //   });

            //   exec(`docker run -p ${nodeconfig.port}:3000 ${config.containerName}`, (error, stdout, stderr) => {
            //     console.log(`stdout: ${stdout}`);
            //     console.log(`stderr: ${stderr}`);
            //   });
            // }
            });
          } else {
            console.log(chalk.red.bold('Please configure your start script in your package.json file...aborting 🐳'));
            process.exit();
          }
        });
      // Development Environment
      } else if (answers.env === 'development') {
        let webpackResult = '';
        // Runtime Node
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
          },
          {
            type: 'input',
            name: 'containerName',
            message: 'Create your container name',
          },
        ];
        inquirer.prompt(questions).then((answers) => {
        // Validate if user has a webpack
          if (answers.webpack === true) {
            webpackResult = '#RUN a command to build your application in the container\nRUN npm i -g webpack';
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
            console.log(chalk.red.greenBright('Your Dockerfile-dev is ready! 🌟'));
          });
        // if (fs.existsSync('Dockerfile-dev')) {
        //   exec(`docker build -t ${answers.containerName} -f Dockerfile-dev .`, (error, stdout, stderr) => {
        //     console.log(`stdout: ${stdout}`);
        //     console.log(`stderr: ${stderr}`);
        //   });
        //   exec(`docker run -p ${answers.port}:3000 ${answers.containerName}`, (error, stdout, stderr) => {
        //     console.log(`stdout: ${stdout}`);
        //     console.log(`stderr: ${stderr}`);
        //   });
        // }
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
                message: 'Where is your database located? Provide relative path.',
              },
              {
                type: 'input',
                name: 'containerName',
                message: 'Create your container name',
              },
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
            // if (fs.existsSync('Dockerfile-db')) {
            //   exec(`docker build -t ${answers.containerName} -f Dockerfile-db .`, (error, stdout, stderr) => {
            //     console.log(`stdout: ${stdout}`);
            //     console.log(`stderr: ${stderr}`);
            //   });
            //   exec(`docker run -p ${answers.port}:3000 ${answers.containerName}`, (error, stdout, stderr) => {
            //     console.log(`stdout: ${stdout}`);
            //     console.log(`stderr: ${stderr}`);
            //   });
            // }
            });
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
                  message: 'Where is your database located? Provide relative path.',
                },
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
              // if (fs.existsSync('Dockerfile-db')) {
              //   exec(`docker build -t ${answers.containerName} -f Dockerfile-db .`, (error, stdout, stderr) => {
              //     console.log(`stdout: ${stdout}`);
              //     console.log(`stderr: ${stderr}`);
              //   });
              //   exec(`docker run -p ${answers.port}:3000 ${answers.containerName}`, (error, stdout, stderr) => {
              //     console.log(`stdout: ${stdout}`);
              //     console.log(`stderr: ${stderr}`);
              //   });
              // }
              });
            }
          }
        });
      }
    });
  });
};
