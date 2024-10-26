import { EntityInUseException } from "../../../bootstrap/exceptions/entityInUse.exception.ts";
import { Collaborator } from "../../model/collaborator.model.ts";
import { type ICollaboratorRepository } from "../../repository/collaborator.repository.ts";
import { CryptoUtils } from "../../util/crypto.util.ts";

export class CreateCollaboratorUseCase {
    private repository: ICollaboratorRepository;

    constructor(repository: ICollaboratorRepository) {
        this.repository = repository;
    }

    async execute(collaboratorData: { email: string, name: string, password: string }) {
        const alreadyExists = await this.repository.findByEmail(collaboratorData.email);
        if (alreadyExists) {
            throw new EntityInUseException(`Already Exists a user with email: ${collaboratorData.email} in database`);
        }
        const { hash, salt } = CryptoUtils.hashPassword(collaboratorData.password);
        const collaborator = new Collaborator();
        collaborator.name = collaboratorData.name;
        collaborator.email = collaboratorData.email;
        collaborator.password = hash;
        collaborator.salt = salt;
        return this.repository.save(collaborator);
    }
}