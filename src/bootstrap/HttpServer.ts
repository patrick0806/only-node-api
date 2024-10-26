import { createServer, IncomingMessage, request, Server, ServerResponse } from 'node:http';
import { Problem } from './exceptions/Problem.ts';
import { Router, type RouterHandler } from './Router.ts';
import { IRequest } from './http/request.ts';

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
        try {
            const { routeHandler, pathParams, middlewares } = Router.getRouteHandler(method, url);

            if (pathParams && Object.keys(pathParams).length > 0) {
                Object.assign(req, { pathParams });
            }

            if (routeHandler) {
                if (middlewares) {
                    let index = 0;

                    const next = async () => {
                        if (index < middlewares.length) {
                            const middleware = middlewares[index++];
                            middleware(req, res, next);
                        } else {
                            if (hasBodyInRequest) {
                                HttpServer.handleBodyRequest(req, res, routeHandler)
                            }
                            await routeHandler(req, res);
                        }
                    };

                    next();
                }

                if (hasBodyInRequest) {
                    HttpServer.handleBodyRequest(req, res, routeHandler)
                }

                await routeHandler(req, res);

                return;
            } else {
                const problem = new Problem(404, 'Not found', 'Route not found')
                res.writeHead(404, 'Not found')
                res.end(JSON.stringify(problem))
                return;
            }
        } catch (error: any) {
            console.error("Unexpected error happen when handle with the request. \n", error);
            const problem = new Problem(500, "Internal server error", error.message)
            res.writeHead(500, 'Internal server error');
            res.end(JSON.stringify(problem));
        }

        res.on('finish', () => {
            console.log("vim aqui depois da req");
        })
    }

    private registerShutdownHandlers() {
        process.on('SIGINT', () => this.gracefulShutdown());
        //process.on('SIGTERM', () => this.gracefulShutdown());
        //process.on('SIGQUIT', () => this.gracefulShutdown());
    }

    private gracefulShutdown() {
        console.info("Start shutdown")

        //Stop accepting new requests
        this.server.close((error) => {
            if (error) {
                console.error("Error on graceful shutdown", error);
            }
            console.info("All pending requests are resolved")
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

    private static handleBodyRequest(req: IRequest, res: ServerResponse<IRequest>, handler: RouterHandler) {
        let body: any = [];
        req.on('data', (chunk) => {
            body.push(chunk)
        }).on('end', async () => {
            body = Buffer.concat(body).toString()
            try {
                body = JSON.parse(body);
                Object.assign(req, { body })
            } catch (error) {
                const problem = new Problem(422, 'Unprocessable entity', 'Invalid json');
                res.writeHead(422, 'Unprocessable entity')
                res.end(JSON.stringify(problem))
            }
            await handler(req, res);
        })
    }
}