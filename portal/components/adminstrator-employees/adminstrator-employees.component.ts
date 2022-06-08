import { HttpErrorResponse } from "@angular/common/http";
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AngularEndpointsService } from "@endpoints/angular-endpoints.service";
import { Interfaces } from "@endpoints/interfaces";
import { GridHelperService } from "@onboard-shared/services/grid-helper.service";
import { NeoGridConfigBuilder } from "@shared/neo-grid-v2/neo-grid-config-builder";
import { GridV2 } from "@shared/neo-grid-v2/neo-grid-v2-models";
import { NeoGridV2Component } from "@shared/neo-grid-v2/neo-grid-v2.component";
import { NeoLoaderModel } from "@shared/neo-loader-wrapper/neo-loader-wrapper-model";
import { NeoToastrService } from "external/patternlibrary-neogov/src/app/toast/neo-toast/neo-toastr.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { IConfirmationModalOptions } from "@onboard-shared/modules/onboard-modal/models/confirmation-modal.model";
import { ConfirmationModalComponent } from "@onboard-shared/modules/onboard-modal/components/confirmation-modal/confirmation-modal.component";
import { Subject, Subscription } from "rxjs";
@Component({
    selector: "onboard-adminstrator-employees",
    templateUrl: "./adminstrator-employees.component.html",
    styleUrls: ["./adminstrator-employees.component.less"]
})
export class AdminstratorEmployeesComponent implements OnInit, OnDestroy {
    constructor(
        private readonly gridHelper: GridHelperService,
        private readonly endpointsService: AngularEndpointsService,
        private readonly neoToastrService: NeoToastrService,
        private readonly activatedRoute: ActivatedRoute,
        private readonly modalService: NgbModal
    ) {}

    @ViewChild("employeesGrid") employeesGrid: NeoGridV2Component;
    @ViewChild("actionsTemplate") actionsTemplate: TemplateRef<any>;
    @Output() public reload = new EventEmitter<boolean>();
    @Input() public updateGrid = new Subject();
    @Input() public grid: NeoGridV2Component;
    public isReady = false;
    public gridConfig: GridV2.IGridConfig;
    public loadingModel: NeoLoaderModel = new NeoLoaderModel();
    private updateGridSubscription: Subscription;
    private objectName = "portalAdministrators";
    @ViewChild("leftToolbarTemplate") leftToolbarTemplate: TemplateRef<any>;
    private gridColumns: GridV2.IGridColumn[];
    private kendoColumns: Interfaces.KendoColumn[];
    private portalId = this.activatedRoute.snapshot.paramMap.get("portalId");

    ngOnInit(): void {
        this.loadingModel.startLoading();
        this.initDefaultKendoStructure();
        this.updateGridSubscription = this.updateGrid.subscribe(() => this.employeesGrid.instance.reload());
    }

    ngOnDestroy(): void {
        this.updateGridSubscription.unsubscribe();
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
                this.loadingModel.stopLoading();
                this.isReady = true;
            })
            .catch((ex: HttpErrorResponse) => {
                this.neoToastrService.error(ex.error.message);
            });
    }

    public deleteEmployee(employeeId: string): void {
        const neoConfirmationOptions: IConfirmationModalOptions = {
            title: "Delete Employee",
            message: "Are you sure you wish to delete this item?",
            positiveButtonText: "Delete",
            negativeButtonText: "Cancel"
        };

        const modal = this.modalService.open(ConfirmationModalComponent, {
            centered: true,
            backdropClass: "modal-backdrop-height"
        });
        
        modal.componentInstance.options = neoConfirmationOptions;
        modal.componentInstance.activeModal.close = () => {
            modal.close();
            this.endpointsService.RewritePortal.RemoveAdministrator({ portalAdministratorId: employeeId })
                .call()
                .then((result: any) => {
                    if (result.success) {
                        this.neoToastrService.success("Selected Employee deleted successfully!");
                        this.employeesGrid.instance.reload();
                        this.reload.next(true);
                    } else {
                        this.neoToastrService.error(result.message);
                    }
                })
                .catch((error: string) => {
                    this.neoToastrService.error(error);
                });
        };
        modal.componentInstance.activeModal.dismiss = () => {
            modal.close();
        };
    }

    private initializeGrid(gridColumns: GridV2.IGridColumn[]): void {
        const gridConfigBuilder = new NeoGridConfigBuilder()
            .source(this.endpointsService.RewritePortal.GetAdministrators({ portalId: this.portalId }))
            .columns(gridColumns)
            .oldKendoGrid(true)
            .sortable(true)
            .filterable(true, false)
            .paging(true, 10)
            .rowActionsTemplate(this.actionsTemplate);
        this.gridConfig = gridConfigBuilder.build();
        this.loadingModel.stopLoading();
    }
}
