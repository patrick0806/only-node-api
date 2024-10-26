import { Problem } from "./problem.ts";

export class EntityInUseException extends Error {
    private status: number;
    private title: string;
    private timestamp: string;


    constructor(message: string) {
        super(message);
        this.name = 'EntityInUseException';
        this.message = message;
        this.status = 409;
        this.title = 'Conflict entity in use';
        this.timestamp = new Date().toISOString();
    }

    public getProblem() {
        return new Problem(this.status, this.title, this.message)
    }
}