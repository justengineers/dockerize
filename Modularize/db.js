module.exports = {
  databaseFunc: (answers) => {
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

      inquirer.prompt(questionsDb).then(database.postgresCreate(answers))
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

        inquirer.prompt(questionsDb).then(database.mongodbCreate(answers))
      }
    }

  },
  postgresCreate: (answers) => {
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
  },
  mongodbCreate: (answers) => {
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
  }
}