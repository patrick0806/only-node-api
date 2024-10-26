import { mountCollaboratorModule } from "./bootstrap/factory/collaborator.factory.ts";
import { HttpServer } from "./bootstrap/HttpServer.ts";
import { MongoConnection } from "./bootstrap/mongoConnection.ts";

const mongoConnection = MongoConnection.getInstance();
await mongoConnection.connection();
const server = new HttpServer();

mountCollaboratorModule();
server.init(3000);