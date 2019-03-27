module.exports = {
  developmentFunc: (answers) => {
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
      });
    }
  }
}