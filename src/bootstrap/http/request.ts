import { IncomingMessage } from "node:http";

export class IRequest<T = {}> extends IncomingMessage {
    body?: T;
    pathParams?: any;
}
