import { HttpErrorResponse } from "@angular/common/http";
import { Component, Input, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AngularEndpointsService } from "@endpoints/angular-endpoints.service";
import { Enums } from "@endpoints/enums";
import { Interfaces } from "@endpoints/interfaces";
import { ModalService } from "@onboard-shared/modules/onboard-modal/services/modal-with-route.service";
import { GridHelperService } from "@onboard-shared/services/grid-helper.service";
import { NeoGridConfigBuilder } from "@shared/neo-grid-v2/neo-grid-config-builder";
import { GridV2 } from "@shared/neo-grid-v2/neo-grid-v2-models";
import { NeoGridV2Component } from "@shared/neo-grid-v2/neo-grid-v2.component";
import { NeoLoaderModel } from "@shared/neo-loader-wrapper/neo-loader-wrapper-model";
import { NeoToastrService } from "external/patternlibrary-neogov/src/app/toast/neo-toast/neo-toastr.service";

@Component({
    selector: "onboard-administrator-user-roles",
    templateUrl: "./administrator-user-roles.component.html",
    styleUrls: ["./administrator-user-roles.component.less"]
})
export class AdministratorUserRolesComponent implements OnInit {
    @ViewChild("userRolesGrid") userRolesGrid: NeoGridV2Component;
    @ViewChild("actionsTemplate") actionsTemplate: TemplateRef<any>;

    @Input() private portalType: number;

    public isReady = false;
    public gridConfig: GridV2.IGridConfig;
    public loadingModel: NeoLoaderModel = new NeoLoaderModel();

    private objectName = "portalUserRoleAdministrators";
    private gridColumns: GridV2.IGridColumn[];
    private kendoColumns: Interfaces.KendoColumn[];

    constructor(
        private readonly gridHelper: GridHelperService,
        private readonly endpointsService: AngularEndpointsService,
        private readonly neoToastrService: NeoToastrService,
        private readonly modalWithRouteService: ModalService,
        private readonly activatedRoute: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this.loadingModel.startLoading();
        this.initDefaultKendoStructure();
    }

    private initDefaultKendoStructure(): void {
        this.endpointsService.RewriteGridViewOnboarding.GetDefaultKendoStructure({
            applicationScreenId: this.objectName,
            useViews: true
        })
            .callCached()
            .then((res: Interfaces.KendoStructure) => {
                this.kendoColumns = res.columns as Interfaces.KendoColumn[];
                this.gridColumns = this.gridHelper.mapKendoColumnsToGridColumns(this.kendoColumns);
                this.initializeGrid(this.gridColumns);
                this.isReady = true;
            })
            .catch((ex: HttpErrorResponse) => {
                this.neoToastrService.error(ex.error.message);
            });
    }

    public viewAssignees(entityId: string): void {
        this.modalWithRouteService.openModal("show-assignees-admins", this.activatedRoute, {
            entityId: `${entityId}`,
            portalType: this.portalType,
            entityType: Enums.EntityType.SecurityProfile
        } as Interfaces.IPortalAssigneesGridRequest);
    }

    private initializeGrid(gridColumns: GridV2.IGridColumn[]): void {
        const gridConfigBuilder = new NeoGridConfigBuilder()
            .source(this.endpointsService.RewritePortal.GetUserRoleAdministrators())
            .columns(gridColumns)
            .oldKendoGrid(true)
            .sortable(true)
            .filterable(true, false)
            .paging(true, 5)
            .rowActionsTemplate(this.actionsTemplate);
        this.gridConfig = gridConfigBuilder.build();
        this.loadingModel.stopLoading();
    }
}
