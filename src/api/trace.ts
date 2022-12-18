import { Router } from 'express'
import { ElonTracker } from '../services/elon'
import ServiceEventsHandler from '../controllers/ServiceEventsHandler'



//const elon = new ElonTracker('a4df52', '52', 7);
const trackers = {
  N628TS: new ElonTracker('a835af', 'af', 7),
  N272BG: new ElonTracker('a2ae0a', '0a', 7),
  N502SX: new ElonTracker('a64304', '04', 7)
}

const api = Router();

const serviceEvents = new ServiceEventsHandler();

api.get('/:id', (request, response) => {
  if (request.params.id in trackers) {
    // response.json(trackers[request.params.id as keyof typeof trackers].trace);
    if (request.headers.accept === 'text/event-stream') {
      response.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
      });
      const client = serviceEvents.addClient(request, response);
      //console.log(client);

      let lastTrace = trackers[request.params.id as keyof typeof trackers].trace;
      
      try {
        serviceEvents.send(client.id, {
          type: 'initialization',
          data: lastTrace
        });
      }
      catch {}

      const handleUpdate = () => {
        //console.log('handle update', lastTrace);

        const currTrace = trackers[request.params.id as keyof typeof trackers].trace;
        
        const updateTrace = currTrace.map(({ datetime, records }) => {
          const lastTraceWrapper = lastTrace.find(lastTraceWrapper => lastTraceWrapper.datetime === datetime);
          const offset = lastTraceWrapper?.records?.length;
          return {
            datetime,
            records: records?.slice(offset)
          }
        }).filter(({ records }) => records && records.length > 0);

        try {
          serviceEvents.send(client.id, {
            type: 'update',
            data: updateTrace
          });
          lastTrace = currTrace;
        }
        catch {}
      }

      trackers[request.params.id as keyof typeof trackers].on('update', handleUpdate);
      // setInterval(() => {
      //   try {
      //     serviceEvents.send(client.id, {
      //       type: 'update',
      //       data: [
      //         {
      //           datetime: '2022/12/17',
      //           records: [100, 200, 300]
      //         }
      //       ]
      //     });
      //   }
      //   catch {}
      // }, 3000);
    }
    else {
      response.json(trackers[request.params.id as keyof typeof trackers].trace);
    }
  }
  else {
    response.status(404).json({
      error: 'No tracker found'
    });
  }
});

api.get('/listen/:id', (request, response) => {
  response.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  });

  console.log('!!!!!!!');
  

  const client = serviceEvents.addClient(request, response);
  
  response.write('data: LOLOLOL');

  setTimeout(() => {
    try {
      serviceEvents.send(client.id, {
        foo: 42
      });
    }
    catch (err) {
      console.error(err);
      
    }
  }, 5000);
});

export default api;