import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AngularEndpointsService } from "@endpoints/angular-endpoints.service";
import { Enums } from "@endpoints/enums";
import { Interfaces } from "@endpoints/interfaces";
import { GlobalConstants } from "@onboard-shared/models/global-constants.model";
import { NeoMultiSelectSettings } from "@shared/neo-multi-select/neo-multi-select-models";
import { NeoSingleSelectSettings } from "@shared/neo-single-select";
import { NeoToastrService } from "external/patternlibrary-neogov/src/app/toast/neo-toast/neo-toastr.service";
import * as _ from "lodash";
import { ReplaySubject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
    selector: "onboard-edit-user",
    templateUrl: "./edit-user.component.html",
    styleUrls: ["./edit-user.component.less"]
})
export class EditUserComponent implements OnInit, OnDestroy {
    constructor(
        private readonly endpointsService: AngularEndpointsService,
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly toastrService: NeoToastrService,
        private readonly fb: FormBuilder
    ) {}

    public isAvailable = false;
    public securitySettings = new NeoSingleSelectSettings("Security Profile", "Employee/Manager");
    public selectedDepartmentsSettings = new NeoMultiSelectSettings("Tag a competency or goal");
    private userId: string = this.activatedRoute.snapshot.paramMap.get("userId");
    public userData: Interfaces.UserEditModel;
    public userForm: FormGroup;
    public showDepartmentRadio: boolean;
    public warningText: string;
    public showDepartmentAccessMatrix: boolean;
    public departmentLabels: Array<string> = ["All Departments", "Specific Departments"];
    private componentDestroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
    public selectedDepartments: Interfaces.DepartmentModel[];
    public allDepartments: Interfaces.DepartmentModel[];

    public ngOnInit(): void {
        this.loadAllData();
    }

    private loadAllData(): void {
        this.endpointsService.RewriteUserEdit.GetUser({ userId: this.userId })
            .call()
            .then((userData: Interfaces.UserEditModel) => {
                this.userData = userData;
                this.allDepartments = [...userData.allDepartments, ...userData.selectedDepartments];
                this.selectedDepartments = userData.selectedDepartments;
                this.createForm();
                this.isAvailable = true;
            });
    }

    public showHideDAM(): void {
        const onProfile = _.find(
            this.userData.securityProfiles,
            (f: Interfaces.SecurityProfileModel) => f.entityId === this.userForm.get("securityProfileId").value.entityId
        );
        this.setWarningMessage(onProfile);
        if (onProfile.rowLevelAccessTypeId === 1) {
            this.showDepartmentAccessMatrix = this.userForm.get("allDepartmentsRadio").value === 1;
            this.showDepartmentRadio = true;
            return;
        }
        this.showDepartmentAccessMatrix = false;
        this.showDepartmentRadio = false;
    }

    private setWarningMessage(onProfile: Interfaces.SecurityProfileModel): void {
        this.warningText = null;
        if (
            onProfile.securityProfileType === Enums.NeogovSecurityProfiles.HrAdmin ||
            onProfile.securityProfileType === Enums.NeogovSecurityProfiles.HrUser ||
            onProfile.securityProfileType === Enums.NeogovSecurityProfiles.ItUser
        ) {
            if (this.userData.insightUserActive && this.userData.isPerformUserHrAdminHrUser) {
                this.warningText = "The department access configured here also applies to Insight and Perform.";
            } else if (this.userData.insightUserActive && !this.userData.isPerformUserHrAdminHrUser) {
                this.warningText = "The department access configured here also applies to Insight.";
            } else if (!this.userData.insightUserActive && this.userData.isPerformUserHrAdminHrUser) {
                this.warningText = "The department access configured here also applies to Perform.";
            }
        }
    }

    private createSaveModel(): Interfaces.UserEditModel {
        return {
            ...this.userData,
            ...this.userForm.getRawValue(),
            allDepartmentsRadio: this.userForm.value.allDepartmentsRadio === 0,
            securityProfileId: this.userForm.value?.securityProfileId?.entityId,
            selectedDepartments: this.selectedDepartments
        } as Interfaces.UserEditModel;
    }

    public saveUser(): void {
        const saveModel = this.createSaveModel();
        this.endpointsService.RewriteUserEdit.SaveUser()
            .call(saveModel)
            .then((message: string) => {
                this.toastrService.success(message);
                this.router.navigate(["user"]);
            })
            .catch((message: string) => this.toastrService.error(message));
    }

    public createForm(): void {
        const selectedSecurity = this.userData.securityProfiles.find(
            (s: Interfaces.SecurityProfileModel) => s.entityId === this.userData.securityProfileId
        );
        const selectedDepartmentRadio = this.userData.allDepartmentsRadio ? 0 : 1;
        this.userForm = this.fb.group({
            userName: [
                this.userData.userName,
                [
                    Validators.required,
                    Validators.pattern(GlobalConstants.regexExpression.Email),
                    Validators.maxLength(254)
                ]
            ],
            passwordInput: [this.userData.passwordInput],
            isActive: [{ value: this.userData.isActive, disabled: !this.userData.allowIsActiveChange }],
            securityProfileId: [{ value: selectedSecurity, disabled: !this.userData.isHired }],
            allDepartmentsRadio: [selectedDepartmentRadio],
            selectedDepartments: [this.userData.selectedDepartments]
        });

        this.userForm
            .get("securityProfileId")
            .valueChanges.pipe(takeUntil(this.componentDestroyed$))
            .subscribe(() => {
                this.showHideDAM();
            });
        this.userForm
            .get("allDepartmentsRadio")
            .valueChanges.pipe(takeUntil(this.componentDestroyed$))
            .subscribe(() => {
                this.showHideDAM();
            });
    }

    public ngOnDestroy(): void {
        this.componentDestroyed$.next();
        this.componentDestroyed$.complete();
    }
}
