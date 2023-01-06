FROM node:16
WORKDIR /app
COPY . .
RUN npm install
CMD ["npm","run","dev"]
# docker build -t sft_cup . 
# docker run -p 80:3000 -d sft_cup