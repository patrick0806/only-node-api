import { Collaborator } from "../../model/collaborator.model.ts";
import { type ICollaboratorRepository } from "../../repository/collaborator.repository.ts";

export class CreateCollaboratorUseCase {
    private repository: ICollaboratorRepository;

    constructor(repository: ICollaboratorRepository) {
        this.repository = repository;
    }

    async execute(collaboratorData: Collaborator) {
        return this.repository.save(collaboratorData);
    }
}