import { Response, Request } from 'express'
import uniqid from 'uniqid'

export default class ServiceEventsHandler {
  private clients: { id: string; response: Response }[] = [];
  private chunkSize = 4096;
  static sendResponse(response: Response, msg: string, chunkSize: number) {
    let i = 0;
    while (msg.length > 0) {
      const chunk = msg.slice(0, chunkSize);
      response.write(chunk);
      console.log('sent chunk', i);
      i++;
      msg = msg.slice(chunkSize);
    }
  }
  constructor() {

  }
  private retrieveClient(clientId: string) {
    return this.clients.find(({ id }) => id === clientId);
  }
  private removeClient(clientId: string) {
    this.clients = this.clients.filter(({ id }) => id !== clientId);
  }
  addClient(request: Request, response: Response) {
    const client = {
      id: uniqid(),
      response
    };
    this.clients.push(client);
    request.on('close', () => {
      console.log(`${ client.id } Connection closed`);
      this.removeClient(client.id);
    });
    return client;
  }
  send(clientId: string, data: any) {
    const client = this.retrieveClient(clientId);
    if (client) {
      ServiceEventsHandler.sendResponse(client.response, `data: ${JSON.stringify(data)}\n\n`, this.chunkSize);
    }
    else {
      throw new Error('No client with this id');
    }
  }
}