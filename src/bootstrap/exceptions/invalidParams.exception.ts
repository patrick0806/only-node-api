import { Problem } from "./problem.ts";

export class InvalidParamsException extends Error {
    private status: number;
    private title: string;
    private timestamp: string;


    constructor(message: string) {
        super(message);
        this.name = 'InvalidParamsException';
        this.message = message;
        this.status = 400;
        this.title = 'Bad Request';
        this.timestamp = new Date().toISOString();
    }

    public getProblem() {
        return new Problem(this.status, this.title, this.message)
    }
}