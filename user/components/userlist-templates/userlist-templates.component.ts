import { Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { AngularEndpointsService } from "@endpoints/angular-endpoints.service";
import { Interfaces } from "@endpoints/interfaces";
import { NeoToastrService } from "external/patternlibrary-neogov/src/app/toast/neo-toast/neo-toastr.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ConfigurationService } from "@onboard-shared/services/configuration.service";
import { NeoGridV2Component } from "@shared/neo-grid-v2/neo-grid-v2.component";
import { Enums } from "@endpoints/enums";
import { NeoLoaderModel } from "@shared/neo-loader-wrapper/neo-loader-wrapper-model";
import { ISubscribeable } from "@onboard-shared/interfaces/subscribeable.interface";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { IConfirmationModalOptions } from "@onboard-shared/modules/onboard-modal/models/confirmation-modal.model";
import { ConfirmationModalComponent } from "@onboard-shared/modules/onboard-modal/components/confirmation-modal/confirmation-modal.component";
@Component({
    selector: "onboard-userlist-templates",
    templateUrl: "./userlist-templates.component.html"
})
export class UserlistTemplatesComponent implements OnInit, ISubscribeable, OnDestroy {
    constructor(
        private readonly endpointsService: AngularEndpointsService,
        private readonly toastrService: NeoToastrService,
        private readonly modalService: NgbModal,
        private readonly configService: ConfigurationService
    ) {}
    public componentDestroyed$: Subject<void> = new Subject();

    @Input() userGrid: NeoGridV2Component;
    @ViewChild("employeeNumberTemplate") employeeNumberTemplate: TemplateRef<any>;
    @Input() loadingModel: NeoLoaderModel;
    @ViewChild("firstNameTemplate") firstNameTemplate: TemplateRef<any>;
    @ViewChild("lastNameTemplate") lastNameTemplate: TemplateRef<any>;
    @ViewChild("departmentTemplate") departmentTemplate: TemplateRef<any>;
    @ViewChild("leftToolbarTemplate") leftToolbarTemplate: TemplateRef<any>;
    @ViewChild("actionsTemplate") actionsTemplate: TemplateRef<any>;
    @ViewChild("accountStatusTemplate") accountStatusTemplate: TemplateRef<any>;
    private isPreboarding: boolean;
    public entityTypes = Enums.EntityType;
    private currentUserInfo: Interfaces.IUserModel;

    ngOnInit(): void {
        this.getUserInfo();
    }

    ngOnDestroy(): void {
        this.componentDestroyed$.next();
        this.componentDestroyed$.complete();
    }

    private getUserInfo(): void {
        this.configService
            .getUserInfo()
            .pipe(takeUntil(this.componentDestroyed$))
            .subscribe((userInfo: Interfaces.UserModel) => {
                this.currentUserInfo = userInfo;
                this.isPreboarding =
                    this.currentUserInfo.isPreboardingEnabled && !this.currentUserInfo.isOnboardEnabled;
            });
    }

    public sendActivation(dataItem: Interfaces.UserGridModel): void {
        this.loadingModel.startLoading();
        this.endpointsService.RewriteUser.SendActivation({ userId: dataItem.id })
            .call()
            .then((response: any) => {
                if (response.isSuccessful) {
                    this.toastrService.success(response.successMessage.message);
                    this.userGrid.instance.reload();
                } else {
                    this.toastrService.error(response.errorMessage);
                }
                this.loadingModel.stopLoading();
            });
    }

    public openActivateDeactivateModal(dataItem: Interfaces.UserGridModel): void {
        if (dataItem.canActivateDeactivate && !this.isPreboarding) {
            const neoConfirmationOptions: IConfirmationModalOptions = {
                title: `${dataItem.isActive ? "Deactivate " : "Activate "}` + dataItem.userName,
                message:
                    `You are about to ${dataItem.isActive ? "deactivate" : "activate"} ` +
                    dataItem.userName +
                    "<br>Do you wish to continue?",
                positiveButtonText: dataItem.isActive ? "Deactivate" : "Activate",
                negativeButtonText: "Cancel"
            };

            const modal = this.modalService.open(ConfirmationModalComponent, {
                centered: true,
                backdropClass: "modal-backdrop-height"
            });

            modal.componentInstance.options = neoConfirmationOptions;
            modal.componentInstance.activeModal.close = () => {
                modal.close();
                this.endpointsService.RewriteUserList.ActivateDeactivateUser({ userId: dataItem.id })
                    .call()
                    .then((result: any) => {
                        if (result.success) {
                            this.toastrService.success(result.message);
                            this.userGrid.instance.reload();
                        } else {
                            this.toastrService.error(result.message);
                        }
                    })
                    .catch((err: string) => {
                        this.toastrService.error(err);
                    });
            };
            modal.componentInstance.activeModal.dismiss = () => {
                modal.close();
            };
        }
    }

    public resetPasswordModal(dataItem: Interfaces.UserGridModel): void {
        if (dataItem.canSendPasswordReset && !this.isPreboarding) {
            const neoConfirmationOptions: IConfirmationModalOptions = {
                title: "Send the password reset link",
                message: `You are about to send the password reset link to ${dataItem.userName} ?`,
                positiveButtonText: "Continue",
                negativeButtonText: "Cancel"
            };

            const modal = this.modalService.open(ConfirmationModalComponent, {
                centered: true,
                backdropClass: "modal-backdrop-height"
            });
            modal.componentInstance.options = neoConfirmationOptions;
            modal.componentInstance.activeModal.close = () => {
                modal.close();
                this.endpointsService.RewriteUserList.ResetPasswordForUser({ userId: dataItem.id })
                    .call()
                    .then((result: any) => {
                        if (result.isSuccessful) {
                            this.toastrService.success(result.successMessage.message);
                            this.userGrid.instance.reload();
                        } else {
                            this.toastrService.error(result.errorMessage);
                        }
                    })
                    .catch((err: string) => {
                        this.toastrService.error(err);
                    });
            };
            modal.componentInstance.activeModal.dismiss = () => {
                modal.close();
            };
        }
    }
}
