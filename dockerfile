FROM node:16-buster-slim
WORKDIR /app
RUN apt-get update
COPY . /app
CMD ["node", "."]
