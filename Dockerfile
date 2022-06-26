FROM node

WORKDIR /home/web3-api

COPY package.json .

RUN npm install

COPY . .

CMD ["npm", "start"]
