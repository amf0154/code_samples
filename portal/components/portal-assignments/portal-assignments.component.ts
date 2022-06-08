import { HttpErrorResponse } from "@angular/common/http";
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AngularEndpointsService } from "@endpoints/angular-endpoints.service";
import { Interfaces } from "@endpoints/interfaces";
import { IConfirmationModalOptions } from "@onboard-shared/modules/onboard-modal/models/confirmation-modal.model";
import { ModalService } from "@onboard-shared/modules/onboard-modal/services/modal-with-route.service";
import { GridHelperService } from "@onboard-shared/services/grid-helper.service";
import { NeoGridConfigBuilder } from "@shared/neo-grid-v2/neo-grid-config-builder";
import { GridV2 } from "@shared/neo-grid-v2/neo-grid-v2-models";
import { NeoGridV2Component } from "@shared/neo-grid-v2/neo-grid-v2.component";
import { NeoLoaderModel } from "@shared/neo-loader-wrapper/neo-loader-wrapper-model";
import { NeoToastrService } from "external/patternlibrary-neogov/src/app/toast/neo-toast/neo-toastr.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ConfirmationModalComponent } from "@onboard-shared/modules/onboard-modal/components/confirmation-modal/confirmation-modal.component";
import { Subject, Subscription } from "rxjs";
import { Enums } from "@endpoints/enums";
import { takeUntil } from "rxjs/operators";

@Component({
    selector: "onboard-portal-assignments",
    templateUrl: "./portal-assignments.component.html",
    styleUrls: ["./portal-assignments.component.less"]
})
export class PortalAssignmentsComponent implements OnInit, OnDestroy {
    constructor(
        private readonly gridHelper: GridHelperService,
        private readonly endpointsService: AngularEndpointsService,
        private readonly neoToastrService: NeoToastrService,
        private readonly modalWithRouteService: ModalService,
        private readonly activatedRoute: ActivatedRoute,
        private readonly modalService: NgbModal
    ) {}

    @ViewChild("assignmentGrid") assignmentGrid: NeoGridV2Component;
    @ViewChild("actionsTemplate") actionsTemplate: TemplateRef<any>;
    @ViewChild("leftToolbarTemplate") leftToolbarTemplate: TemplateRef<any>;

    @Output() public reload = new EventEmitter<boolean>();
    @Input() public entityType: Enums.EntityType;
    @Input() public title: number;

    @Input() private portalModule: Enums.AppModule;
    @Input() private updateGrid = new Subject();

    public isReady = false;
    public gridConfig: GridV2.IGridConfig;
    public loadingModel: NeoLoaderModel = new NeoLoaderModel();
    public portalId: string = this.activatedRoute.snapshot.paramMap.get("portalId");
    private objectName = "portalAssignedEntities";
    private componentDestroyed$: Subject<void> = new Subject();
    private gridColumns: GridV2.IGridColumn[];
    private kendoColumns: Interfaces.KendoColumn[];

    ngOnInit(): void {
        this.loadingModel.startLoading();
        this.initDefaultKendoStructure();
        this.updateGrid
            .pipe(takeUntil(this.componentDestroyed$))
            .subscribe(() => this.assignmentGrid.instance.reload());
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
            portalType: this.portalModule,
            entityType: this.entityType
        } as Interfaces.IPortalAssigneesGridRequest);
    }

    private initializeGrid(gridColumns: GridV2.IGridColumn[]): void {
        const gridConfigBuilder = new NeoGridConfigBuilder()
            .source(
                this.endpointsService.RewritePortal.GetAssignedEntities({
                    portalId: this.portalId,
                    entityType: this.entityType
                })
            )
            .columns(gridColumns)
            .sortable(true)
            .oldKendoGrid(true)
            .filterable(true, false)
            .paging(true, 5)
            .rowActionsTemplate(this.actionsTemplate);
        this.gridConfig = gridConfigBuilder.build();
        gridConfigBuilder.leftToolbarTemplate(this.leftToolbarTemplate);
        this.loadingModel.stopLoading();
    }

    public deleteAssigneeById(entityId: string): void {
        const neoConfirmationOptions: IConfirmationModalOptions = {
            title: "Delete Assignment",
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
            this.endpointsService.RewritePortal.RemoveAssignedEntity({
                entityType: this.entityType,
                portalId: this.portalId,
                portalEntityId: entityId
            })
                .call()
                .then(() => {
                    this.neoToastrService.success("Selected Assignment deleted successfully!");
                    this.assignmentGrid.instance.reload();
                    this.reload.next(true);
                })
                .catch((error: string) => {
                    this.neoToastrService.error(error);
                });
        };
        modal.componentInstance.activeModal.dismiss = () => {
            modal.close();
        };
    }

    ngOnDestroy(): void {
        this.componentDestroyed$.next();
        this.componentDestroyed$.complete();
    }
}
