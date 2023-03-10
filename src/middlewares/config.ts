import express from 'express'
import corsFirewall from '../util/corsFirewall'

const router = express.Router();

router.use(corsFirewall([
  /^localhost:.*$/,
  /^elonjet.app$/,
], 'https://elonjet.app'));

router.use((req, res, next) => {
  res.header("Access-Control-Allow-Methods", "GET, OPTIONS, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Authorization, Origin, X-Requested-With, Content-Type, Accept"); // Origin, X-Requested-With, Content-Type, Accept
  next();
});


export default router;
