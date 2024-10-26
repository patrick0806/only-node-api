import { Problem } from "./problem.ts";

export class EntityNotFoundException extends Error {
    private status: number;
    private title: string;
    private timestamp: string;


    constructor(message: string) {
        super(message);
        this.name = 'EntityNotFoundException';
        this.message = message;
        this.status = 404;
        this.title = 'Not found';
        this.timestamp = new Date().toISOString();
    }

    public getProblem() {
        return new Problem(this.status, this.title, this.message)
    }
}