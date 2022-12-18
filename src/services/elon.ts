import got from 'got'
import _ from 'lodash'
import cron from 'node-cron'
import pLimit from 'p-limit'
import EventEmitter from 'events'

export type Trace = {
  trace: [number, number, number, string, number, number, number, any, any, string, null, null, null, null][];
}

export type ElonTraceRecord = {
  altitude: number;
  longitude: number;
  latitude: number;
}
export type ElonTrace = {
  datetime: string;
  records?: ElonTraceRecord[];
}[];

const limiter = pLimit(1);


export class ElonTracker extends EventEmitter {
  trace: ElonTrace = [];
  trackingPath: string
  trackingHash: string;
  historyDays: number;
  cache: { [k: string]: Trace; } = {};
  static getRelativeDatetimeStrFromNow(relDaysBack: number) {
    const date = new Date(Date.now() - relDaysBack * 1000 * 60 * 60 * 24);
    return `${ date.getFullYear() }/${ date.getMonth() + 1 }/${ date.getDate() }`;
  }
  static getTodaysDate() {
    const today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);

    return today;
  }
  
  constructor(trackingHash: string, trackingPath: string, historyDays: number) {
    super();

    this.trackingHash = trackingHash;
    this.trackingPath = trackingPath;
    this.historyDays = historyDays;

  
    cron.schedule('*/30 * * * * *', () => {
      this.sync();
    });

    this.sync();
  }
  getTrackingSource(relDaysBack: number) {
    //const today = ElonTracker.getTodaysDate();
    if (relDaysBack <= 0) {
      return `https://globe.adsbexchange.com/data/traces/${ this.trackingPath }/trace_recent_${ this.trackingHash }.json`; 
    }
    else {
      return `https://globe.adsbexchange.com/globe_history/${ ElonTracker.getRelativeDatetimeStrFromNow(relDaysBack) }/traces/${ this.trackingPath }/trace_full_${ this.trackingHash }.json`;
    }
  }
  async init() {
    
    
  }
  async sync() {
    this.trace = await Promise.all(new Array(this.historyDays).fill(0).map(async (_, index) => {
      const relDays = this.historyDays - (index + 1);
      
      const records = await limiter(() => this.getData(relDays, relDays > 0));
      return {
        datetime: ElonTracker.getRelativeDatetimeStrFromNow(relDays),
        records
      };
    }));

    this.emit('update');

    //console.log(this.trace);
    
    
  }
  async getData(pastDays: number, useCache = false) {
    const source = this.getTrackingSource(pastDays);
    
    const trace = await (async () => {
      if (!(useCache && this.cache[source])) {
        try {
          //console.log('GET', source);
          
          const response = await got.get(source, {
            headers: {
              'Referer': 'https://globe.adsbexchange.com/?icao=a835af',
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.3 Safari/605.1.15',
              'Cookie': 'undefined'
            }
          }).json() as Trace;
          this.cache[source] = response;
        }
        catch {
          return undefined;
        }
      }
      else {
        //console.log('CACHE', source);
      }
      return this.cache[source];
    })();
    if (trace) {
      return trace.trace.map(record => {
        const [ altitude, longitude, latitude ] = record;
        return {
          altitude,
          longitude,
          latitude
        }
      });
    }
  }
}