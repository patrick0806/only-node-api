import { Collaborator } from "../model/collaborator.model.ts";
import { type IBaseRepository } from "./base.repository.ts";

export interface ICollaboratorRepository extends IBaseRepository<Collaborator> {
    findByEmail: (email: string) => Promise<Collaborator | null>;
}