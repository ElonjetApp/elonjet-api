import express from 'express'
import dotenv from 'dotenv'
import api from './api'
//import http from 'http'

dotenv.config();

const port = Number(process.env.PORT);

const app = express();

(async () => {
  //console.log(await elon.getData(1));
})();

app.use('/api', api);

app.listen(port, () => {
  console.log(`Example app listening on port ${ port }`)
});