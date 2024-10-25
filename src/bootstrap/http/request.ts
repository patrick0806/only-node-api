import { IncomingMessage } from "node:http";

export class IRequest extends IncomingMessage {
    body?: Record<string, unknown>;
    pathParams?: any;
}
