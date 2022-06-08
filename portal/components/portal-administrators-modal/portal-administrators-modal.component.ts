import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { AngularEndpointsService } from "@endpoints/angular-endpoints.service";
import { Enums } from "@endpoints/enums";
import { Interfaces } from "@endpoints/interfaces";
import { SharedServices } from "@onboard-shared/models/helpers/enums";
import { ModalWithRouteBaseComponent } from "@onboard-shared/modules/onboard-modal/components/modal-with-route-base/modal-with-route-base";
import { GridHelperService } from "@onboard-shared/services/grid-helper.service";
import { NeoGridConfigBuilder } from "@shared/neo-grid-v2/neo-grid-config-builder";
import { GridV2 } from "@shared/neo-grid-v2/neo-grid-v2-models";
import { NeoToastrService } from "external/patternlibrary-neogov/src/app/toast/neo-toast/neo-toastr.service";

@Component({
    selector: "portal-administrators-modal",
    templateUrl: "./portal-administrators-modal.component.html",
    styleUrls: ["./portal-administrators-modal.component.less"]
})
export class PortalAdministratorsModalComponent extends ModalWithRouteBaseComponent implements OnInit {
    constructor(
        protected readonly activatedRoute: ActivatedRoute,
        private readonly gridHelper: GridHelperService,
        private readonly endpointsService: AngularEndpointsService,
        private readonly neoToastrService: NeoToastrService
    ) {
        super(activatedRoute);
    }

    @ViewChild("employeeTemplate") employeeTemplate: TemplateRef<any>;

    public gridConfig: GridV2.IGridConfig;
    public isAvailable = false;
    public headerSize: SharedServices.Enums.ModalHeaderSize = SharedServices.Enums.ModalHeaderSize.Medium;
    public entityTypes = Enums.EntityType;

    private gridColumns: GridV2.IGridColumn[];
    private kendoColumns: Interfaces.KendoColumn[];
    private applicationScreenId = "portalAdministrators";
    private portalId = this.activatedRoute.parent.snapshot.params[`portalId`];
    private entityType: Enums.EntityType;

    ngOnInit(): void {
        this.initDefaultKendoStructure();
        this.entityType = this.validateAndGetModel();
    }

    private initDefaultKendoStructure(): void {
        this.endpointsService.RewriteGridViewOnboarding.GetDefaultKendoStructure({
            applicationScreenId: this.applicationScreenId,
            useViews: true
        })
            .callCached()
            .then((res: Interfaces.KendoStructure) => {
                this.kendoColumns = res.columns as Interfaces.KendoColumn[];
                this.gridColumns = this.gridHelper.mapKendoColumnsToGridColumns(this.kendoColumns);
                this.gridColumns.forEach((column) => {
                    switch (column.field) {
                        case "employeeNumber": {
                            column.cellTemplate = this.employeeTemplate;
                            break;
                        }
                    }
                });

                this.initializeGrid();
                this.isAvailable = true;
            })
            .catch((ex: HttpErrorResponse) => {
                this.neoToastrService.error(ex.error.message);
            });
    }

    private initializeGrid(): void {
        const gridConfigBuilder = new NeoGridConfigBuilder()
            .source(
                this.endpointsService.RewritePortal.GetPortalAdministrators({
                    request: {
                        entityType: this.entityType,
                        entityId: this.portalId
                    } as Interfaces.IPortalAssigneesGridRequest
                })
            )
            .columns(this.gridColumns)
            .sortable(true)
            .paging()
            .dataKey("id")
            .oldKendoGrid(true)
            .filterable(false);

        this.gridConfig = gridConfigBuilder.build();
    }

    public selectClassSpec(classSpec: Interfaces.ClassSpecificationPreHireEmployeeModel): void {
        this.dismissModal(false, classSpec);
    }
}
