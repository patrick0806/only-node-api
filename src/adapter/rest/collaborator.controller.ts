import { ServerResponse } from "http";
import { IRequest } from "../../bootstrap/http/request.ts";
import { Router } from "../../bootstrap/Router.ts";
import { CreateCollaboratorUseCase } from "../../internal/interactor/collaborator/createCollaborator.useCase.ts";

export class CollaboratorController {
    private router: Router
    private createCollaboratorUseCase: CreateCollaboratorUseCase;

    constructor(router: Router, createCollaboratorUseCase: CreateCollaboratorUseCase) {
        this.router = router;
        this.createCollaboratorUseCase = createCollaboratorUseCase;
        this.router.get('/', this.getCollaborators);
        this.router.get('/:collaboratorId', this.getCollaborator);
        this.router.post('/', this.createCollaborator);
    }

    public async getCollaborators(req: IRequest, res: ServerResponse) {
        const collaborators = [];
        res.writeHead(200, 'OK');
        res.end(JSON.stringify(collaborators))
    }

    public async getCollaborator(req: IRequest, res: ServerResponse) {
        const id = req.pathParams.collaboratorId;
        res.writeHead(200, 'OK');
        res.end(JSON.stringify(id));
    }

    public async createCollaborator(req: IRequest, res: ServerResponse) {
        const result = await this.createCollaboratorUseCase.execute(req.body as any);
        console.log(result);
        res.writeHead(201, 'CREATED');
        res.end();
    }
}