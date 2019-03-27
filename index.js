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

  const questions = [
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
    // validate if user has existing start scripts
    // tell user to add start script if they don't
    let webpackResult = '';

    if (answers.entrypoint === false) {
      console.log('Please specify start script...exiting');
      return;
    }

    // validate if user has webbpack build

    if (answers.webpack === true) {
      webpackResult = `#RUN a command to build your application in the container 
      RUN npm run build`;
    }

    const docker = `
      FROM node:10.15
      
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

    fs.writeFile('Dockerfile', docker, (err) => {
      if (err) {
        return err;
      }
      console.log('Dockerfile has been created!');
    });


    if (fs.existsSync('Dockerfile')) {
      exec(`docker build -t ${answers.containerName} -f Dockerfile .`, (error, stdout, stderr) => {
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
      });

      // exec(`docker run -p ${answers.port}:3000 ${answers.containerName}`, (error, stdout, stderr) => {
      //   console.log(`stdout: ${stdout}`);
      //   console.log(`stderr: ${stderr}`);
      // });
    }
  });
});
<<<<<<< HEAD

// `docker build -t ${organization}/${containerName} -f DockerFile .`
=======
>>>>>>> 43ae9530b82537d80d62f84c319277089dcec965
