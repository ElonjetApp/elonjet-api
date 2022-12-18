import { RequestHandler } from 'express';
import url from 'url'

const targetHeaderName = "Access-Control-Allow-Origin";



export default function corsFirewall(origins: RegExp[], defaultOrigin: string) {
  return ((req, res, next) => {
    try {
      const origin = req.headers['origin'] ?? '';
      const { protocol, host } = url.parse(origin);
      for (const regex of origins) {
        if (regex.test(host ?? '')) {
          res.header(targetHeaderName, `${ protocol }//${ host }`);
          return next();
        }
      }
    }
    catch {}

    res.header(targetHeaderName, defaultOrigin);

    next();
  }) as RequestHandler;
}