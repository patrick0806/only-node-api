import { Collection, ObjectId } from "mongodb";
import { MongoConnection } from "../../bootstrap/mongoConnection.ts";
import { type ICollaboratorRepository } from "../../internal/repository/collaborator.repository.ts";
import { Collaborator } from "../../internal/model/collaborator.model.ts";
import { Page } from "../../internal/model/page.model.ts";
import { CollaboratorEntity } from "./entitie/collaborator.entity.ts";

export class CollaboratorMongo implements ICollaboratorRepository {
    private collection: Collection;

    constructor() {
        const connection = MongoConnection.getInstance();
        this.collection = connection.getCollection('collaborator');
    }

    public async save(collaborator: Collaborator) {
        const collaboratorEntity = CollaboratorEntity.fromModel(collaborator);
        if (!collaborator.id) {
            const { insertedId } = await this.collection.insertOne(collaboratorEntity);
            if (!insertedId) {
                throw new Error("Fail to insert in database");
            }
            const createdCollaborator = await this.collection.findOne({ _id: insertedId });
            return CollaboratorEntity.toModel(createdCollaborator as any);
        }
        const updatedCollaborator = await this.collection.updateOne({ _id: collaboratorEntity._id }, collaboratorEntity);
        return CollaboratorEntity.toModel(updatedCollaborator as any);
    };

    public async find(pagination: { page: number; size: number; order: "ASC" | "DESC"; }, filterParams: Record<string, any>) {
        const { page, size } = pagination;
        const skip = (page - 1) * size;
        const limit = size;

        const collaborators = await this.collection.find<CollaboratorEntity>(filterParams)
            .skip(skip)
            .limit(limit)
            .toArray();

        const totalElements = await this.collection.countDocuments();
        const totalPages = Math.ceil(totalElements / size);
        return new Page(page, size, totalElements, totalPages, CollaboratorEntity.toModelList(collaborators));
    }

    public async findById(collaboratorId: string) {
        const entity = await this.collection.findOne<CollaboratorEntity>({ _id: new ObjectId(collaboratorId) })
        if (!entity) {
            return null;
        }
        return CollaboratorEntity.toModel(entity);
    }

    public async findByEmail(email: string) {
        const entity = await this.collection.findOne<CollaboratorEntity>({ email });
        if (!entity) {
            return null;
        }

        return CollaboratorEntity.toModel(entity);
    }

    public async delete(collaboratorId: string) {
        await this.collection.deleteOne({ _id: new ObjectId(collaboratorId) });
    }
}