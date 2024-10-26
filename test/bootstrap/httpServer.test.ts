import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';
import { HttpServer } from '../../src/bootstrap/HttpServer.ts';
import { Router } from '../../src/bootstrap/Router.ts';

describe('Http Server suit tests', () => {
    it('Should create a http server with success', () => {
        try {
            const server = new HttpServer();
            mock.method(server, 'init');
            server.init(8080);
            server.close();

            assert.equal(server.init.mock.callCount(), 1)
        } catch (error) {
            assert.fail('Should be up a http server with success')
        }
    })
})