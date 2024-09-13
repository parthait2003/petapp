import { NextApiRequest } from 'next';
import { IncomingMessage } from 'http';

export function toNodeReadableStream(req: NextApiRequest): IncomingMessage {
  const readable = new ReadableStream({
    start(controller) {
      req.body.pipeTo(new WritableStream({
        write(chunk) {
          controller.enqueue(chunk);
        },
        close() {
          controller.close();
        },
        abort(err) {
          controller.error(err);
        },
      }));
    },
  });
  
  const incomingMessage = readable as unknown as IncomingMessage;
  return Object.assign(incomingMessage, req);
}
