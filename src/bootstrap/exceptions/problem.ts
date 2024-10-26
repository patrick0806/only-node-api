export class Problem {
    private status: number;
    private title: string;
    private message: string;
    private timestamp: string;

    constructor(status: number, title: string, message: string) {
        this.status = status;
        this.title = title;
        this.message = message;
        this.timestamp = new Date().toISOString();
    }

    public getStatus() {
        return this.status;
    }

    public getTitle() {
        return this.title;
    }

    public getMessage() {
        return this.message;
    }

    public getTimestamp() {
        return this.timestamp
    }
}