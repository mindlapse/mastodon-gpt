FROM public.ecr.aws/lambda/nodejs:16.2022.05.31.10

# Assumes your function is named "app.js", and there is a package.json file in the app directory 
COPY build /var/task/
COPY package.json package-lock.json /var/task/

# Install NPM dependencies for function
WORKDIR /var/task
RUN npm ci

# Set the CMD to your handler (could also be done as a parameter override outside of the Dockerfile)
CMD [ "app.handler" ]
