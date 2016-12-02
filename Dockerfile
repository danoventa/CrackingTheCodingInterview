FROM node:6.5.0
ADD . /nteract
WORKDIR /nteract
RUN npm i
# RUN npm run dist:linux64
