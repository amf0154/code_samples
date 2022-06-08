import { AfterContentChecked, ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { AngularEndpointsService } from "@endpoints/angular-endpoints.service";
import { Enums } from "@endpoints/enums";
import { Interfaces } from "@endpoints/interfaces";
import { GlobalConstants } from "@onboard-shared/models/global-constants.model";
import { Framework } from "@onboard-shared/models/helpers/models";
import { ModalWithRouteBaseComponent } from "@onboard-shared/modules/onboard-modal/components/modal-with-route-base/modal-with-route-base";
import { ModalService } from "@onboard-shared/modules/onboard-modal/services/modal-with-route.service";
import { ConfigurationService } from "@onboard-shared/services/configuration.service";
import { CustomLabelService } from "@onboard-shared/services/custom-labels/custom-label.service";
import { NeoToastrService } from "external/patternlibrary-neogov/src/app/toast/neo-toast/neo-toastr.service";
import { Subject } from "rxjs";
import { AddAdministratorModalComponent } from "../add-administrator-modal/add-administrator-modal.component";
import { AddAssignmentModalComponent } from "../add-assignment-modal/add-assignment-modal.component";

@Component({
    selector: "onboard-portal-settings",
    templateUrl: "./portal-settings.component.html",
    styleUrls: ["./portal-settings.component.less"]
})
export class PortalSettingsComponent implements OnInit, AfterContentChecked {
    public isReady = false;
    public portalId = this.activatedRoute.snapshot.paramMap.get("portalId");
    public updateAssignClassSpecGrid = new Subject();
    public updateAssignPositionGrid = new Subject();
    public updateAssignDepartmentGrid = new Subject();
    public updateAssignPositionTypeGrid = new Subject();
    public updateAssignDivisionGrid = new Subject();
    public updateEmployeeGrid = new Subject();
    public portalForm: FormGroup;
    public dateFormat = GlobalConstants.ShortDateFormat;
    public assignmentsClassSpec: Enums.EntityType = Enums.EntityType.ClassSpec;
    public assignmentsPosition: Enums.EntityType = Enums.EntityType.Position;
    public assignmentsDepartment: Enums.EntityType = Enums.EntityType.Department;
    public assignmentsPositionType: Enums.EntityType = Enums.EntityType.PositionType;
    public assignmentsDivision: Enums.EntityType = Enums.EntityType.Division;
    public portal: Interfaces.PortalDataModel;
    public customLabels: Framework.Models.EntityLabels;
    public currentUserInfo: Interfaces.IUserModel;

    constructor(
        private readonly titleService: Title,
        private readonly activatedRoute: ActivatedRoute,
        private readonly fb: FormBuilder,
        private readonly endpointsService: AngularEndpointsService,
        private readonly modalWithRouteService: ModalService,
        private readonly neoToastrService: NeoToastrService,
        private readonly configService: ConfigurationService,
        private readonly cdr: ChangeDetectorRef,
        private readonly customLabelService: CustomLabelService
    ) {}

    ngOnInit(): void {
        this.setTitle();
        this.getUserInfoAndPortalData();
        this.getCustomLabels();
    }

    private initForm(data: Interfaces.PortalDataModel): void {
        this.portalForm = this.fb.group(data);
        this.portalForm.get("title").setValidators([Validators.required]);
        this.portalForm.get("title").updateValueAndValidity();
    }

    private getCustomLabels(): void {
        this.customLabelService.getCustomLabels().subscribe((labels: Framework.Models.EntityLabels) => {
            this.customLabels = labels;
        });
    }

    private getPortalInfo(): void {
        this.endpointsService.RewritePortal.GetPortal({ portalId: this.portalId })
            .call()
            .then((res: Interfaces.PortalDataModel) => {
                this.portal = res;
                this.initForm(this.portal);
                this.isReady = true;
            });
    }

    public getLogicalOperatorText(): string {
        return "-AND-";
    }

    private setTitle(): void {
        this.activatedRoute.data.subscribe((data) => {
            this.titleService.setTitle(data.title);
        });
    }

    public viewAdmins(): void {
        this.modalWithRouteService.openModal(
            "show-portal-admins",
            this.activatedRoute,
            Enums.EntityType.SecurityProfile
        );
    }

    public viewAssignees(): void {
        this.modalWithRouteService.openModal("show-assignees-admins", this.activatedRoute, {
            entityId: this.portalId,
            portalType: this.portal.module,
            entityType: Enums.EntityType.Portal
        } as Interfaces.IPortalAssigneesGridRequest);
    }

    public addPortalAdmin(): void {
        this.modalWithRouteService.openModal("add-portal-admin", this.activatedRoute);
    }

    private getUserInfoAndPortalData(): void {
        this.configService.getUserInfo().subscribe((userInfo: Interfaces.UserModel) => {
            this.currentUserInfo = userInfo;
            this.getPortalInfo();
        });
    }

    public saveSettings(): void {
        this.endpointsService.RewritePortal.SavePortal()
            .call(this.portalForm.value)
            .then((res: Interfaces.BaseResultGeneric1<any>) => {
                this.portal.title = res.data.title;
                this.neoToastrService.success(res.message, null, { enableHtml: true });
            })
            .catch((message: string) => this.neoToastrService.error(message));
    }

    public onModalClosed(modalComponent: ModalWithRouteBaseComponent): void {
        if (modalComponent?.modal?.result === null) {
            return;
        }
        if (modalComponent instanceof AddAdministratorModalComponent) {
            if (modalComponent.modal.result) {
                this.updatePortal();
            }
        }
        if (modalComponent instanceof AddAssignmentModalComponent) {
            if (modalComponent.modal.result) {
                this.getPortalInfo();
                this.updateAssignmentTableByEntity(modalComponent.modal.result.entityType);
            }
        }
    }

    public updatePortal(): void {
        this.updateEmployeeGrid.next();
        this.getPortalInfo();
    }

    private updateAssignmentTableByEntity(entityType: number): void {
        switch (entityType) {
            case this.assignmentsClassSpec:
                this.updateAssignClassSpecGrid.next();
                break;
            case this.assignmentsPosition:
                this.updateAssignPositionGrid.next();
                break;
            case this.assignmentsDepartment:
                this.updateAssignDepartmentGrid.next();
                break;
            case this.assignmentsPositionType:
                this.updateAssignPositionTypeGrid.next();
                break;
            case this.assignmentsDivision:
                this.updateAssignDivisionGrid.next();
                break;
        }
    }

    public newAssignment(entity: Enums.EntityType): void {
        this.modalWithRouteService.openModal("add-portal-assignee", this.activatedRoute, Enums.EntityType[entity]);
    }

    ngAfterContentChecked(): void {
        this.cdr.detectChanges();
    }
}
