const fs = require('fs');
const inquirer = require('inquirer');
const figlet = require('figlet');
const chalk = require('chalk');
const { exec } = require('child_process');


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
      choices: ['dev', 'production', 'test'],
    },
  ];

  inquirer.prompt(env).then((answers) => {
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

                // if (fs.existsSync('Dockerfile')) {
                //   exec(`docker build -t ${answers.containerName} -f Dockerfile .`, (error, stdout, stderr) => {
                //     console.log(`stdout: ${stdout}`);
                //     console.log(`stderr: ${stderr}`);
                //   });

                //   exec(`docker run -p ${answers.port}:3000 ${answers.containerName}`, (error, stdout, stderr) => {
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
        }
        if (answers.runtime === 'python') {
          inquirer.prompt([
            {
              type: 'list',
              name: 'versions',
              message: 'Select your Python version',
              choices: ['2.7', '3.5', '3.7', '3.8'],
            },
            {
              type: 'confirm',
              name: 'requirementsFile',
              message: 'Do you have a requirements.txt file?',
            },
          ]).then((answers) => {
            console.log('hola', answers.requirementsFile);

            if (answers.requirementsFile === true) {
              inquirer.prompt([{
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
              }]).then((config) => {
                const docker = `
FROM python:${answers.versions}

WORKDIR /usr/src/app

#COPY all of your application files to the WORKDIR in the container
COPY ./ ./

#RUN a command to npm install requirements.txt Python packages in the container
RUN pip install --trusted-host pypi.python.org -r requirements.txt

#EXPOSE your server port (3000) for when you are running in production
EXPOSE ${config.port}            

# CMD will be a default command to run if no commands are givin in terminal when running the container
# ENTRYPOINT is the same but will not be ignored if a command is given in the command line when running the container
CMD ["python", "${config.appFile}"]
`;
                fs.writeFile('Dockerfile', docker, (err) => {
                  if (err) {
                    return err;
                  }
                  console.log(chalk.red.greenBright('Your Dockerfile is ready! 🌟'));

                  // if (fs.existsSync('Dockerfile')) {
                  //   exec(`docker build -t ${answers.containerName} -f Dockerfile .`, (error, stdout, stderr) => {
                  //     console.log(`stdout: ${stdout}`);
                  //     console.log(`stderr: ${stderr}`);
                  //   });

                  //   exec(`docker run -p ${answers.port}:3000 ${answers.containerName}`, (error, stdout, stderr) => {
                  //     console.log(`stdout: ${stdout}`);
                  //     console.log(`stderr: ${stderr}`);
                  //   });
                  // }
                });
              });
            } else {
              console.log(chalk.red.bold('Please configure your requirements.txt file...aborting 🐳'));
              process.exit();
            }
          });
        }
      });
    }
  });
});
