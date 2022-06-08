import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AngularEndpointsService } from "@endpoints/angular-endpoints.service";
import { Endpoints } from "@endpoints/endpoints";
import { Enums } from "@endpoints/enums";
import { Interfaces } from "@endpoints/interfaces";
import { SharedServices } from "@onboard-shared/models/helpers/enums";
import { ModalWithRouteBaseComponent } from "@onboard-shared/modules/onboard-modal/components/modal-with-route-base/modal-with-route-base";
import { ConfigurationService } from "@onboard-shared/services/configuration.service";
import { GridHelperService } from "@onboard-shared/services/grid-helper.service";
import { INeoEmployeePhotoOptions } from "@shared/neo-employee-photo/neo-employee-photo.component";
import { NeoGridConfigBuilder } from "@shared/neo-grid-v2/neo-grid-config-builder";
import { GridV2 } from "@shared/neo-grid-v2/neo-grid-v2-models";
import { NeoToastrService } from "external/patternlibrary-neogov/src/app/toast/neo-toast/neo-toastr.service";

@Component({
    selector: "onboard-portal-assignees-grid",
    templateUrl: "./portal-assignees-modal.component.html",
    styleUrls: ["./portal-assignees-modal.component.less"]
})
export class PortalAssigneesModalComponent extends ModalWithRouteBaseComponent implements OnInit {
    @ViewChild("firstNameTemplate") firstNameTemplate: TemplateRef<any>;
    @ViewChild("lastNameTemplate") lastNameTemplate: TemplateRef<any>;
    @ViewChild("employeeNumberTemplate") employeeNumberTemplate: TemplateRef<any>;
    @ViewChild("photoTemplate") photoTemplate: TemplateRef<any>;
    @ViewChild("positionTitleTemplate") positionTitleTemplate: TemplateRef<any>;
    @ViewChild("directManagerTemplate") directManagerTemplate: TemplateRef<any>;
    @ViewChild("departmentNameTemplate") departmentNameTemplate: TemplateRef<any>;

    public gridConfig: GridV2.IGridConfig;
    public isAvailable = false;
    private gridColumns: GridV2.IGridColumn[];
    private kendoColumns: Interfaces.KendoColumn[];
    private applicationScreenId: string;
    public entityTypes = Enums.EntityType;
    public entityType: Enums.EntityType;
    public currentUserInfo: Interfaces.IUserModel;
    private model: Interfaces.IPortalAssigneesGridRequest;
    public headerSize: SharedServices.Enums.ModalHeaderSize = SharedServices.Enums.ModalHeaderSize.Medium;
    constructor(
        protected readonly activatedRoute: ActivatedRoute,
        private readonly gridHelper: GridHelperService,
        private readonly endpointsService: AngularEndpointsService,
        private readonly neoToastrService: NeoToastrService,
        private readonly configService: ConfigurationService
    ) {
        super(activatedRoute);
    }
    ngOnInit(): void {
        this.getDataAndInitTable();
    }

    private getDataAndInitTable(): void {
        this.configService.getUserInfo().subscribe((userInfo: Interfaces.UserModel) => {
            this.currentUserInfo = userInfo;
            this.model = this.validateAndGetModel<Interfaces.IPortalAssigneesGridRequest>();
            const isPreboarding = this.model.portalType === Enums.AppModule.Preboard;
            this.applicationScreenId = isPreboarding ? "preHireAssigneeList" : "employeeList";
            this.initDefaultKendoStructure();
        });
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
                        case "photo": {
                            column.cellTemplate = this.photoTemplate;
                            column.width = "70px";
                            break;
                        }
                        case "firstName": {
                            column.cellTemplate = this.firstNameTemplate;
                            break;
                        }
                        case "lastName": {
                            column.cellTemplate = this.lastNameTemplate;
                            break;
                        }
                        case "employeeNumber": {
                            column.cellTemplate = this.employeeNumberTemplate;
                            break;
                        }
                        case "positionTitle" : {
                            column.cellTemplate = this.positionTitleTemplate;
                            break;
                        }
                        case "managerFullName" : {
                            column.cellTemplate = this.directManagerTemplate;
                            break;
                        }
                        case "departmentName" : {
                            column.cellTemplate = this.departmentNameTemplate;
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

    public getEmployeePhoto(dataItem: Interfaces.EmployeeGridModel): INeoEmployeePhotoOptions {
        return {
            disabled: false,
            fullName: dataItem.fullName,
            altImgWidth: "30px",
            altImgHeight: "30px",
            altImgFontSize: "12px",
            altImgBorderRadius: "50%",
            imgClass: "employee-photo-32px",
            imgUrl: dataItem.photo ?? ""
        };
    }

    private initializeGrid(): void {
        const gridConfigBuilder = new NeoGridConfigBuilder()
            .source(
                this.endpointsService.RewritePortal.GetPortalAssignees({
                    request: this.model
                } as Endpoints.RewritePortal.IGetPortalAssignees)
            )
            .columns(this.gridColumns)
            .sortable(true)
            .paging(true, 5)
            .dataKey("id")
            .oldKendoGrid(true)
            .filterable(false);
        this.gridConfig = gridConfigBuilder.build();
    }
}
