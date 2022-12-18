import { Router } from 'express'
import trace from './trace'
import config from '../middlewares/config'

const api = Router();


api.use(config);
api.use('/trace', trace);

export default api;