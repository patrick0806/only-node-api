export class Page<T> {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    content: Array<T>;

    constructor(page: number, size: number, totalElements: number, totalPages: number, content: Array<T>) {
        this.page = page;
        this.size = page;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
        this.content = content
    }
}