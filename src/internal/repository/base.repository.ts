import { Page } from "../model/page.model.ts";

type PaginationProperties = {
    page: number;
    size: number;
    order: 'ASC' | 'DESC'
}

export interface IBaseRepository<T> {
    save: (entity: T) => Promise<T>;
    find: (pagination: PaginationProperties, filterParams: Record<string, any>) => Promise<Page<T>>
    findById: (id: string) => Promise<T | null>;
    delete: (id: string) => Promise<void>;
}