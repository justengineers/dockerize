
FROM node:10.15

WORKDIR /usr/src/app

#COPY all of your application files to the WORKDIR in the container
COPY ./ ./

#RUN a command to npm install your node_modules in the container
RUN npm install

#RUN a command to build your application in the container
RUN npm run build

#EXPOSE your server port (3000) for when you are running in production
EXPOSE 8080

#Create an ENTRYPOINT where you'll run node ./server/server.js
ENTRYPOINT ["npm", "start"]

# CMD will be a default command to run if no commands are givin in terminal when running the container
# ENTRYPOINT is the same but will not be ignored if a command is given in the command line when running the container
