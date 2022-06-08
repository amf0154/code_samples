import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AngularEndpointsService } from "@endpoints/angular-endpoints.service";
import { Endpoints } from "@endpoints/endpoints";
import { Enums } from "@endpoints/enums";
import { Interfaces } from "@endpoints/interfaces";
import { ModalWithRouteBaseComponent } from "@onboard-shared/modules/onboard-modal/components/modal-with-route-base/modal-with-route-base";
import { GridHelperService } from "@onboard-shared/services/grid-helper.service";
import { NeoGridConfigBuilder } from "@shared/neo-grid-v2/neo-grid-config-builder";
import { GridV2 } from "@shared/neo-grid-v2/neo-grid-v2-models";
import { NeoGridV2Component } from "@shared/neo-grid-v2/neo-grid-v2.component";
import { NeoToastrService } from "external/patternlibrary-neogov/src/app/toast/neo-toast/neo-toastr.service";

@Component({
    selector: "onboard-add-portal-admin",
    templateUrl: "./add-administrator-modal.component.html"
})
export class AddAdministratorModalComponent extends ModalWithRouteBaseComponent implements OnInit {
    @ViewChild("tableGrid") tableGrid: NeoGridV2Component;

    public gridConfig: GridV2.IGridConfig;
    public isAvailable = false;

    private gridColumns: GridV2.IGridColumn[];
    private kendoColumns: Interfaces.KendoColumn[];
    private applicationScreenId = "portalAdministratorsAssignable";
    private portalId = this.activatedRoute.parent.snapshot.params[`portalId`];
    constructor(
        protected readonly activatedRoute: ActivatedRoute,
        private readonly gridHelper: GridHelperService,
        private readonly endpointsService: AngularEndpointsService,
        private readonly neoToastrService: NeoToastrService
    ) {
        super(activatedRoute);
    }

    ngOnInit(): void {
        this.initDefaultKendoStructure();
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
                this.initializeGrid();
                this.isAvailable = true;
            })
            .catch((ex: HttpErrorResponse) => {
                this.neoToastrService.error(ex.error.message);
            });
    }

    private initializeGrid(): void {
        const gridConfigBuilder = new NeoGridConfigBuilder()
            .source(this.endpointsService.RewritePortal.GetAssignableAdministrators({ portalId: this.portalId }))
            .columns(this.gridColumns)
            .oldKendoGrid(true)
            .sortable(true)
            .selectable()
            .filterable(true, false)
            .paging(true, 5);

        this.gridConfig = gridConfigBuilder.build();
    }

    public selectClassSpec(classSpec: Interfaces.ClassSpecificationPreHireEmployeeModel): void {
        this.dismissModal(false, classSpec);
    }

    public addAdmin(): void {
        const {
            selectedKeys: selectedItems,
            deselectedKeys: deselectedItems,
            selectAllMode
        } = this.tableGrid.instance.getSelection();
        if (selectAllMode || (selectedItems && selectedItems.length > 0)) {
            this.endpointsService.RewritePortal.AssignAdministrators({
                request: {
                    portalId: this.portalId,
                    selectAll: selectAllMode,
                    selectedKeys: selectedItems,
                    deselectedKeys: deselectedItems
                }
            } as Endpoints.RewritePortal.IAssignAdministrators)
                .call()
                .then((res: any) => {
                    this.dismissModal(true, res);
                })
                .catch((message: string) => this.neoToastrService.error(message));
        } else {
            this.neoToastrService.warning("Please select at least one record.");
        }
    }
}
