import { Collection, ObjectId } from "mongodb";
import { MongoConnection } from "../../bootstrap/mongoConnection.ts";
import { type ICollaboratorRepository } from "../../internal/repository/collaborator.repository.ts";
import { Collaborator } from "../../internal/model/collaborator.model.ts";
import { Page } from "../../internal/model/page.model.ts";

export class CollaboratorMongo implements ICollaboratorRepository {
    private collection: Collection;

    //TODO - create mongo entity and made the parse
    constructor() {
        const connection = MongoConnection.getInstance();
        this.collection = connection.getCollection('collaborator');
    }

    public async save(collaborator: Collaborator) {
        if (!collaborator.id) {
            return this.collection.insertOne(collaborator) as any;
        }
        return this.collection.updateOne({ _id: new ObjectId(collaborator.id) }, collaborator) as any;
    };

    public async find(pagination: { page: number; size: number; order: "ASC" | "DESC"; }, filterParams: Record<string, any>) {
        const { page, size } = pagination;
        const skip = (page - 1) * size;
        const limit = size;

        const collaborators = await this.collection.find<Collaborator>(filterParams)
            .skip(skip)
            .limit(limit)
            .toArray();

        const totalElements = await this.collection.countDocuments();
        const totalPages = Math.ceil(totalElements / size);
        return new Page(page, size, totalElements, totalPages, collaborators)
    }

    public async findById(collaboratorId: string) {
        return this.collection.findOne<Collaborator>({ _id: new ObjectId(collaboratorId) })
    }

    public async delete(collaboratorId: string) {
        await this.collection.deleteOne({ _id: new ObjectId(collaboratorId) });
    }
}