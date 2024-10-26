import { createServer, IncomingMessage, request, Server, ServerResponse } from 'node:http';
import { Problem } from './exceptions/problem.ts';
import { Router, type RouterHandler } from './Router.ts';
import { IRequest } from './http/request.ts';
import { MongoConnection } from './mongoConnection.ts';
import { EntityInUseException } from './exceptions/entityInUse.exception.ts';
import { EntityNotFoundException } from './exceptions/entityNotFound.exception.ts';
import { InvalidParamsException } from './exceptions/invalidParams.exception.ts';

export class HttpServer {
    private server: Server;

    constructor() {
        this.server = createServer(this.requestHandler);
    }

    public init(port: number): void {
        this.server.listen(port, 'localhost', () => {
            this.logMappedRoutes();
            this.registerShutdownHandlers();
            console.info(`Server running in port: ${port}`)
        })
    }

    public close() {
        this.server.close();
    }

    private async requestHandler(req: IRequest, res: ServerResponse<IncomingMessage>) {
        const { method, url } = req;
        const hasBodyInRequest = method === "POST" || method === "PUT" || method === "PATCH";
        if (!method || !url) {
            res.writeHead(400, "Bad Request")
            res.end();
            return;
        }

        if (method === 'HEAD' || method == 'OPTION') {
            res.writeHead(405, "Method Not Allowed")
            res.end();
            return;
        }

        const { routeHandler, pathParams, middlewares } = Router.getRouteHandler(method, url);

        if (pathParams && Object.keys(pathParams).length > 0) {
            Object.assign(req, { pathParams });
        }

        if (routeHandler) {
            try {
                if (middlewares) {
                    let index = 0;

                    const next = async () => {
                        if (index < middlewares.length) {
                            const middleware = middlewares[index++];
                            await middleware(req, res, next); // Use await para garantir a ordem correta
                        } else {
                            if (hasBodyInRequest) {
                                await HttpServer.handleBodyRequest(req, res, routeHandler); // Aguarde aqui
                            } else {
                                await routeHandler(req, res);
                            }
                        }
                    };

                    await next(); // Aguarde a execução do next para evitar duplicação
                } else {
                    if (hasBodyInRequest) {
                        await HttpServer.handleBodyRequest(req, res, routeHandler);
                    } else {
                        await routeHandler(req, res);
                    }
                }
            } catch (error) {
                let problem: Problem;
                switch (true) {
                    case error instanceof EntityInUseException:
                        problem = error.getProblem();
                        res.writeHead(problem.getStatus(), problem.getTitle()).end(JSON.stringify(problem));
                        break;
                    case error instanceof EntityNotFoundException:
                        problem = error.getProblem();
                        res.writeHead(problem.getStatus(), problem.getTitle()).end(JSON.stringify(problem));
                        break;
                    case error instanceof InvalidParamsException:
                        problem = error.getProblem();
                        res.writeHead(problem.getStatus(), problem.getTitle()).end(JSON.stringify(problem));
                        break;
                    default:
                        console.error("Unexpected error happen when handle with the request. \n", error);
                        problem = new Problem(500, "Internal server error", error.message)
                        res.writeHead(500, 'Internal server error').end(JSON.stringify(problem));
                        break;
                }
            }
        } else {
            const problem = new Problem(404, 'Not found', 'Route not found')
            res.writeHead(404, 'Not found')
            res.end(JSON.stringify(problem))
            return;
        }

    }

    private registerShutdownHandlers() {
        process.on('SIGINT', () => this.gracefulShutdown());
        //process.on('SIGTERM', () => this.gracefulShutdown());
        //process.on('SIGQUIT', () => this.gracefulShutdown());
    }

    private gracefulShutdown() {
        console.info("Start shutdown")

        //Stop accepting new requests
        this.server.close(async (error) => {
            if (error) {
                console.error("Error on graceful shutdown", error);
            }

            const mongConnection = MongoConnection.getInstance();
            await mongConnection.close();
            console.info("All pending requests are resolved and connections are finished")
            process.exit(0);
        })
    }

    private logMappedRoutes() {
        const routes = Router.getRoutes();
        if (routes.size === 0) {
            console.info("Any route mapped yet");
            return;
        }
        routes.forEach(({ pathParams }, path) => {
            const [method, route] = path.split('-');
            console.info(`Mapped route [${method}]: ${route}`);
        })
    }

    private static async handleBodyRequest(req: IRequest, res: ServerResponse, handler: RouterHandler) {
        let body: any = [];
        req.on('data', (chunk) => {
            body.push(chunk)
        })

        req.on('end', () => {
            body = Buffer.concat(body).toString()
            try {
                body = JSON.parse(body);
                Object.assign(req, { body })
            } catch (error) {
                const problem = new Problem(422, 'Unprocessable entity', 'Invalid json');
                return res.writeHead(422, 'Unprocessable entity').end(JSON.stringify(problem))
            }

            handler(req, res)
                .catch(error => {
                    let problem: Problem;
                    switch (true) {
                        case error instanceof EntityInUseException:
                            problem = error.getProblem();
                            res.writeHead(problem.getStatus(), problem.getTitle()).end(JSON.stringify(problem));
                            break;
                        case error instanceof EntityNotFoundException:
                            problem = error.getProblem();
                            res.writeHead(problem.getStatus(), problem.getTitle()).end(JSON.stringify(problem));
                            break;
                        case error instanceof InvalidParamsException:
                            problem = error.getProblem();
                            res.writeHead(problem.getStatus(), problem.getTitle()).end(JSON.stringify(problem));
                            break;
                        default:
                            console.error("Unexpected error happen when handle with the request. \n", error);
                            problem = new Problem(500, "Internal server error", error.message)
                            res.writeHead(500, 'Internal server error').end(JSON.stringify(problem));
                            break;
                    }
                });
        })
    }
}