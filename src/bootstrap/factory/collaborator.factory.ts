import { CollaboratorMongo } from "../../adapter/datasource/collaborator.mongo.ts";
import { CollaboratorController } from "../../adapter/rest/collaborator.controller.ts";
import { CreateCollaboratorUseCase } from "../../internal/interactor/collaborator/createCollaborator.useCase.ts";
import { Router } from "../Router.ts";

export function mountCollaboratorModule() {
    const router = new Router("/collaborators")
    const collaboratorRepository = new CollaboratorMongo
    const createCollaboratorUseCase = new CreateCollaboratorUseCase(collaboratorRepository);
    return new CollaboratorController(router, createCollaboratorUseCase);
}