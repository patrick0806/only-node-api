import { ServerResponse } from "http";
import { IRequest } from "../../bootstrap/http/request.ts";
import { Router } from "../../bootstrap/Router.ts";
import { CreateCollaboratorUseCase } from "../../internal/interactor/collaborator/createCollaborator.useCase.ts";
import { CreateCollaboratorRequestDTO } from "./dtos/createCollaboratorRequest.dto.ts";
import { InvalidParamsException } from "../../bootstrap/exceptions/invalidParams.exception.ts";

export class CollaboratorController {
    private router: Router
    private createCollaboratorUseCase: CreateCollaboratorUseCase;

    constructor(router: Router, createCollaboratorUseCase: CreateCollaboratorUseCase) {
        this.router = router;
        this.createCollaboratorUseCase = createCollaboratorUseCase;
        this.router.get('/', this.getCollaborators.bind(this));
        this.router.get('/:collaboratorId', this.getCollaborator.bind(this));
        this.router.post('/', this.createCollaborator.bind(this));
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

    public async createCollaborator(req: IRequest<CreateCollaboratorRequestDTO>, res: ServerResponse) {
        const body = req.body;

        if (!body || !body.email || !body.password || !body.name) {
            throw new InvalidParamsException('One or more parameters are missing in body request required params are: email, password, name')
        }

        const result = await this.createCollaboratorUseCase.execute(body);
        res.writeHead(201, 'CREATED').end(JSON.stringify(result));
    }
}