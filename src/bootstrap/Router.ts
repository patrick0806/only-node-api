import { IncomingMessage, ServerResponse } from "node:http";
import { IRequest } from "./http/request.ts";

export type Middleware = (req: IRequest, res: ServerResponse<IncomingMessage>, next: () => void) => void;
export type RouterHandler = (req: IRequest, res: ServerResponse<IncomingMessage>) => any;
type GetRouterHandler = { routeHandler: RouterHandler | null, middlewares: Middleware[] | null, pathParams: Record<string, string> | null };

export class Router {
    private static routes: Map<string, { handler: RouterHandler, pathParams: string[], middlewares: Middleware[] }> = new Map();
    private basePath: string;

    constructor(basePath: string) {
        this.basePath = basePath;
    }

    public get(path: string, callback: RouterHandler, middlewares: Middleware[] = []) {
        const { routeRegex, pathParams } = this.buildPath(path, 'GET');
        Router.routes.set(routeRegex, { handler: callback, pathParams, middlewares });
    }

    public post(path: string, callback: RouterHandler, middlewares: Middleware[] = []) {
        const { routeRegex, pathParams } = this.buildPath(path, 'POST');
        Router.routes.set(routeRegex, { handler: callback, pathParams, middlewares });
    }

    public put(path: string, callback: RouterHandler, middlewares: Middleware[] = []) {
        const { routeRegex, pathParams } = this.buildPath(path, 'PUT');
        Router.routes.set(routeRegex, { handler: callback, pathParams, middlewares });
    }

    public patch(path: string, callback: RouterHandler, middlewares: Middleware[] = []) {
        const { routeRegex, pathParams } = this.buildPath(path, 'PATCH');
        Router.routes.set(routeRegex, { handler: callback, pathParams, middlewares });
    }

    public delete(path: string, callback: RouterHandler, middlewares: Middleware[] = []) {
        const { routeRegex, pathParams } = this.buildPath(path, 'DELETE');
        Router.routes.set(routeRegex, { handler: callback, pathParams, middlewares });
    }

    public static getRoutes() {
        return this.routes;
    }

    private buildPath(path: string, method: string): { routeRegex: string, pathParams: string[] } {
        const pathParams: string[] = [];
        const regexPath = path.replace(/:(\w+)/g, (match, paramName) => {
            pathParams.push(paramName); // Adiciona o nome do parâmetro ao array
            return '(\\w+)'; // Substitui o parâmetro por uma expressão regular
        });

        return {
            routeRegex: path === '/' ? method + '-' + this.basePath : method + '-' + this.basePath + regexPath,
            pathParams,
        };
    }

    public static getRouteHandler(method: string, path: string): GetRouterHandler {
        if (path.endsWith('/')) path = path.slice(0, -1);

        const routeKey = method.toUpperCase() + '-' + path;
        const routeHandler = this.routes.get(routeKey);

        if (routeHandler?.handler) {
            return { routeHandler: routeHandler.handler, middlewares: routeHandler.middlewares, pathParams: {} };
        }

        for (const [key, { handler, pathParams, middlewares }] of this.routes.entries()) {
            const [methodKey, routePattern] = key.split('-');
            if (methodKey !== method.toUpperCase()) continue;

            const regex = new RegExp(`^${routePattern}$`);
            const match = path.match(regex);

            if (match) {
                const params = pathParams.reduce((acc, param, index) => {
                    acc[param] = match[index + 1]; // match[0] is the complete string
                    return acc;
                }, {} as Record<string, string>);

                return { routeHandler: handler, pathParams: params, middlewares };
            }
        }

        return { routeHandler: null, pathParams: null, middlewares: [] };
    }
}