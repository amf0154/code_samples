import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { AngularEndpointsService } from "@endpoints/angular-endpoints.service";
import { Endpoints } from "@endpoints/endpoints";
import { Interfaces } from "@endpoints/interfaces";
import { ConfigurationService } from "@onboard-shared/services/configuration.service";
import { GridExportHelperService } from "@onboard-shared/services/grid-export-helper.service";
import { GridHelperService } from "@onboard-shared/services/grid-helper.service";
import { NeoGridConfigBuilder } from "@shared/neo-grid-v2/neo-grid-config-builder";
import { GridV2 } from "@shared/neo-grid-v2/neo-grid-v2-models";
import { NeoGridV2Component } from "@shared/neo-grid-v2/neo-grid-v2.component";
import { NeoToastrService } from "external/patternlibrary-neogov/src/app/toast/neo-toast/neo-toastr.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { INeoConfirmationOptions } from "@shared/neo-confirmation/neo-confirmation.model";
import { NeoConfirmationModalComponent } from "@shared/neo-confirmation/neo-confirmation-modal.component";
import { NeoLoaderModel } from "@shared/neo-loader-wrapper/neo-loader-wrapper-model";
import { SharedServices } from "@onboard-shared/models/helpers/enums";
import { Router } from "@angular/router";
import { UserlistTemplatesComponent } from "../userlist-templates/userlist-templates.component";
import { Subject } from "rxjs";
@Component({
    selector: "onboard-userlist",
    templateUrl: "./user-list.component.html",
    styleUrls: ["./user-list.component.less"]
})
export class UserListComponent implements OnInit, OnDestroy {
    @ViewChild("userGrid") userGrid: NeoGridV2Component;
    @ViewChild(UserlistTemplatesComponent) templates: UserlistTemplatesComponent;
    public isReady = false;
    public gridConfig: GridV2.IGridConfig;
    public loadingModel: NeoLoaderModel = new NeoLoaderModel();
    private objectName = "userList";
    private gridColumns: GridV2.IGridColumn[];
    private kendoColumns: Interfaces.KendoColumn[];
    private isPreboarding: boolean;
    private currentUserInfo: Interfaces.IUserModel;
    private componentDestroyed$: Subject<void> = new Subject();

    constructor(
        private readonly endpointsService: AngularEndpointsService,
        private readonly gridHelper: GridHelperService,
        private readonly gridExportHelper: GridExportHelperService,
        private readonly toastrService: NeoToastrService,
        private readonly modalService: NgbModal,
        private readonly configService: ConfigurationService,
        private readonly router: Router,
    ) {}

    ngOnInit(): void {
        this.initDefaultKendoStructure();
        this.getUserInfo();
    }

    ngOnDestroy(): void {
        this.componentDestroyed$.next();
        this.componentDestroyed$.complete();
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
                this.gridColumns.forEach((column) => {
                    switch (column.field) {
                        case "employeeNumber": {
                            column.cellTemplate = this.templates.employeeNumberTemplate;
                            break;
                        }
                        case "firstName": {
                            column.cellTemplate = this.templates.firstNameTemplate;
                            break;
                        }
                        case "lastName": {
                            column.cellTemplate = this.templates.lastNameTemplate;
                            break;
                        }
                        case "departmentName": {
                            column.cellTemplate = this.templates.departmentTemplate;
                            break;
                        }
                        case "onlineAccessStatus": {
                            column.cellTemplate = this.templates.accountStatusTemplate;
                            break;
                        }
                    }
                    column.advancedFilterOnly = true;
                });
                this.initializeGrid(this.gridColumns);
                this.isReady = true;
            });
    }

    private getUserInfo(): void {
        this.configService.getUserInfo().subscribe((userInfo: Interfaces.UserModel) => {
            this.currentUserInfo = userInfo;
            this.isPreboarding = this.currentUserInfo.isPreboardingEnabled && !this.currentUserInfo.isOnboardEnabled;
        });
    }

    private initializeGrid(gridColumns: GridV2.IGridColumn[]): void {
        const bulkActions = [
            {
                text: "Export to CSV",
                iconClass: "icon-file-csv",
                onClick: () => {
                    this.exportWithConfirmation(SharedServices.Enums.ExportFormat.CSV);
                }
            },
            {
                text: "Export to PDF",
                iconClass: "icon-file-pdf",
                onClick: () => {
                    this.export(SharedServices.Enums.ExportFormat.PDF);
                }
            },
            {
                text: "Export to Excel",
                iconClass: "icon-file-xls",
                onClick: () => {
                    this.exportWithConfirmation(SharedServices.Enums.ExportFormat.EXCEL);
                }
            }
        ];

        if (this.currentUserInfo.isHrAdmin && !this.isPreboarding) {
            bulkActions.push({
                text: "Send Activation",
                iconClass: "icon-send",
                onClick: () => {
                    if (!this.currentUserInfo.canCreateUser && !this.currentUserInfo.canUpdateUser) {
                        this.toastrService.warning("You don't have permission to send activation!");
                        return;
                    }

                    this.validateBulkAction(SharedServices.Enums.BulkActionTypes.ActivateUser, "/bulk-action");
                }
            });
        }

        const gridConfigBuilder = new NeoGridConfigBuilder()
            .source(this.endpointsService.RewriteUserList.GetUserList())
            .columns(gridColumns)
            .selectable()
            .paging()
            .dataKey("id")
            //  .views("All Users") TO-DO: Add view for new angular app
            .filterable()
            .showHideColumns(true)
            .scrollable(true, 8)
            .advancedFilters(true)
            .oldKendoGrid(true)
            .rowActionsTemplate(this.templates.actionsTemplate)
            .bulkActions(bulkActions);

        this.gridConfig = gridConfigBuilder.build();
    }

    private exportWithConfirmation(exportFormat: SharedServices.Enums.ExportFormat): void {
        const neoConfirmationOptions: INeoConfirmationOptions = {
            cancelText: "Cancel",
            confirmText: "Ok",
            contentHtml:
                "The exported file may contain content from untrusted sources, and as such any warnings provided by a spreadsheet application should be taken seriously."
        };
        const modal = this.modalService.open(NeoConfirmationModalComponent, { centered: true });
        modal.componentInstance.settings = neoConfirmationOptions;

        modal.componentInstance.activeModal.close = () => {
            this.export(exportFormat);
        };

        modal.componentInstance.activeModal.dismiss = () => {
            modal.close();
        };
    }

    private validateBulkAction(bulkActionType: SharedServices.Enums.BulkActionTypes, navigateUrl: string): void {
        const selectedKeys = this.userGrid.instance.getSelection().selectedKeys;
        const deselectedKeys = this.userGrid.instance.getSelection().deselectedKeys;
        const selectAllMode = this.userGrid.instance.getSelection().selectAllMode;
        this.endpointsService.RewriteBulkAction.ValidateBulkAction()
            .call({
                bulkActionType: Number(bulkActionType),
                gridRequest: {
                    areAllKeysSelected: selectAllMode,
                    selectedIds: selectedKeys,
                    deselectedIds: deselectedKeys
                } as Interfaces.IGridBulkRequest
            })
            .then((res: number[]) => {
                if (res && res.length > 0) {
                    this.toastrService.warning(res.length + " user(s) ready to be processed.");
                    this.router.navigateByUrl(navigateUrl);
                } else {
                    this.toastrService.warning("There are no users available for this action.");
                }
            })
            .catch((message: string) => this.toastrService.error(message));
    }

    private export(format: SharedServices.Enums.ExportFormat): void {
        let api: Endpoints.IEndpoint;
        switch (format) {
            case SharedServices.Enums.ExportFormat.PDF:
                api = this.endpointsService.RewriteUserList.ExportPdf();
                break;
            case SharedServices.Enums.ExportFormat.CSV:
                api = this.endpointsService.RewriteUserList.ExportCsv();
                break;
            case SharedServices.Enums.ExportFormat.EXCEL:
                api = this.endpointsService.RewriteUserList.ExportXlsx();
                break;
        }

        const actionParams = this.gridExportHelper.getActionParams(this.userGrid);
        this.gridExportHelper.sendRequest(api, actionParams);
    }
}
