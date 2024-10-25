import { HttpServer } from "./bootstrap/HttpServer.ts";

const server = new HttpServer();

server.init(3000);