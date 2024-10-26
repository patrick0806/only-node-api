import { ObjectId } from "mongodb";
import { Collaborator } from "../../../internal/model/collaborator.model.ts";

export class CollaboratorEntity {
    _id: ObjectId;
    name: string;
    email: string;
    password: string;
    createdAt: string;
    updatedAt: string;
    salt: string;

    public static fromModel(collaborator: Collaborator) {
        const collaboratorEntity = new CollaboratorEntity();
        collaboratorEntity._id = new ObjectId(collaborator.id);
        collaboratorEntity.name = collaborator.name;
        collaboratorEntity.email = collaborator.email;
        collaboratorEntity.password = collaborator.password;
        collaboratorEntity.createdAt = collaborator.createdAt ? collaborator.createdAt : new Date().toISOString();
        collaboratorEntity.updatedAt = new Date().toISOString();
        collaboratorEntity.salt = collaborator.salt;
        return collaboratorEntity;
    }


    public static toModel(collaboratorEntity: CollaboratorEntity) {
        const collaborator = new Collaborator();
        collaborator.id = collaboratorEntity._id.toString();
        collaborator.name = collaboratorEntity.name;
        collaborator.email = collaboratorEntity.email;
        collaborator.password = collaboratorEntity.password;
        collaborator.createdAt = collaboratorEntity.createdAt;
        collaborator.updatedAt = collaboratorEntity.updatedAt;
        collaborator.salt = collaboratorEntity.salt;
        return collaborator;
    }

    public static fromModeList(collaborators: Collaborator[]) {
        return collaborators.map(collaborators => CollaboratorEntity.fromModel(collaborators));
    }

    public static toModelList(collaborators: CollaboratorEntity[]) {
        return collaborators.map(collaborators => CollaboratorEntity.toModel(collaborators));
    }
}