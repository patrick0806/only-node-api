import asssert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';
import { Router } from '../../src/bootstrap/Router.ts';

describe('Router suit tests', () => {

    it('Should create a router handler', () => {
        const router = new Router("/");

        if (!router) {
            asssert.fail('Except router be diferent than null or undefined')
        }
    })

    it('Should match a mapped basic route with success', () => {
        const router = new Router("/")
        mock.method(router, 'get')
        mock.method(Router, 'getRouteHandler')
        router.get('/mappedRoute', () => {
            return true;
        })

        const { routeHandler } = Router.getRouteHandler("GET", '/mappedRoute');
        if (!routeHandler) {
            asssert.fail('Handler should not be null or undefined')
        }

        const fakeReq = {} as any;
        const fakeRes = {} as any;
        const result = routeHandler(fakeReq, fakeRes);

        asssert.equal(router.get.mock.callCount(), 1)
        asssert.equal(Router.getRouteHandler.mock.callCount(), 1)
        asssert.notEqual(routeHandler, null, 'Expect routeHandler not be null');
        asssert.equal(result, true, 'Result is expected to be true, if route is mathed')
    })

    it('Should match a route with path params', () => {
        const router = new Router("/")
        mock.method(Router, 'getRouteHandler');
        mock.method(router, 'get');
        router.get('/mappedRoute', () => {
            return 'whitout param';
        })
        router.get('/mappedRoute/:route', () => {
            return 'with one param'
        })
        router.get('/mappedRoute/:route/segments/:segment', () => {
            return 'with multiple params'
        }
        )

        const { routeHandler: handlerNoParam } = Router.getRouteHandler('GET', '/mappedRoute')
        const { routeHandler: handlerOneParam } = Router.getRouteHandler('GET', '/mappedRoute/1')
        const { routeHandler: handlerMultiParam } = Router.getRouteHandler('GET', '/mappedRoute/1/segments/2')

        if (!handlerNoParam || !handlerOneParam || !handlerMultiParam) {
            asssert.fail('Handlers need to be defined')
        }

        const fakeReq = {} as any;
        const fakeRes = {} as any;
        const resultNoParam = handlerNoParam(fakeReq, fakeRes);
        const resultOneParam = handlerOneParam(fakeReq, fakeRes);
        const multiParam = handlerMultiParam(fakeReq, fakeRes);

        asssert.equal(Router.getRoutes().size, 3)
        asssert.equal(router.get.mock.callCount(), 3)
        asssert.equal(resultNoParam, 'whitout param')
        asssert.equal(resultOneParam, 'with one param')
        asssert.equal(multiParam, 'with multiple params')
    })

    it('Should return path params', () => {
        const router = new Router("/")
        mock.method(Router, 'getRouteHandler');
        mock.method(router, 'get');

        router.get('/mappedRoute/:route', () => {
            return 'with one param'
        })

        const { pathParams } = Router.getRouteHandler('GET', '/mappedRoute/12')

        asssert.equal(router.get.mock.callCount(), 1)
        asssert.notEqual(pathParams?.route, null)
        asssert.equal(pathParams?.route, '12')
    })
})