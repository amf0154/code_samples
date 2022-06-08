import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { FlyoutSize } from "@shared/neo-flyout";
import { PortalCreateFlyoutComponent } from "./components/portal-create-flyout/portal-create-flyout.component";
import { PortalListFlyoutComponent } from "./components/portal-list-flyout/portal-list-flyout.component";
import { PortalListComponent } from "./components/portal-list/portal-list.component";
import { PortalPreviewFlyoutComponent } from "./components/portal-preview-flyout/portal-preview-flyout.component";
import { ModalSize } from "@onboard-shared/modules/onboard-modal/components/modal-with-route/modal-with-route.component";
import { PictureWidgetModalComponent } from "@onboard-shared/modules/portal-elements/components/portal-widget/picture-widget/picture-widget-modal/picture-widget-modal.component";
import { AuditTrailFlyoutComponent } from "../../shared/modules/audit-trail/components/audit-trail-flyout/audit-trail-flyout.component";
import { AddAdministratorModalComponent } from "./components/add-administrator-modal/add-administrator-modal.component";
import { AddAssignmentModalComponent } from "./components/add-assignment-modal/add-assignment-modal.component";
import { PortalAdministratorsModalComponent } from "./components/portal-administrators-modal/portal-administrators-modal.component";
import { PortalAssigneesModalComponent } from "./components/portal-assignees-modal/portal-assignees-modal.component";
import { PortalSettingsComponent } from "./components/portal-settings/portal-settings.component";
import { PortalWrapperComponent } from "./components/portal-wrapper/portal-wrapper.component";
import { ChangeHeaderModalComponent } from "@onboard-shared/modules/portal-elements/components/modals/change-header-modal/change-header-modal.component";
import { AddEditWidgetModalComponent } from "@onboard-shared/modules/portal-elements/components/modals/add-edit-widget-modal/add-edit-widget-modal.component";
import { UnsavedChangesGuard } from "src/app/security/guards/unsaved-changes.guard";
import { BaseOnboardFeatureEnabledGuard } from "src/app/security/guards/base-onboard-feature-enabled.guard";
import { AuditTrailDetailPortalComponent } from "./components/audit-trail/audit-trail-detail-portal/audit-trail-detail-portal.component";

const portalRoutes: Routes = [
    {
        path: "",
        component: PortalListComponent,
        data: { title: "Portals" }
    },
    {
        path: ":moduleId",
        component: PortalListComponent,
        data: { title: "Portals" },
        children: [
            {
                path: "create-portal",
                component: PortalListFlyoutComponent,
                data: {
                    title: "Create Portal",
                    flyoutSize: FlyoutSize.Quarter
                }
            },
            {
                path: "create-portal/merge",
                component: PortalListFlyoutComponent,
                data: {
                    title: "Create Portal",
                    flyoutSize: FlyoutSize.Quarter
                }
            },
            {
                path: "create-portal-from-template",
                component: PortalCreateFlyoutComponent,
                data: {
                    title: "Create Portal",
                    flyoutSize: FlyoutSize.Quarter
                }
            },
            {
                path: "create-portal-from-template/:templateId",
                component: PortalCreateFlyoutComponent,
                data: {
                    title: "Create Portal",
                    flyoutSize: FlyoutSize.Quarter
                },
                children: [
                    {
                        path: "preview-portal-only/:templateId",
                        component: PortalPreviewFlyoutComponent,
                        data: {
                            title: "Preview Portal",
                            flyoutSize: FlyoutSize.NineTenths
                        }
                    }
                ]
            },
            {
                path: "preview-portal-template/:templateId",
                component: PortalPreviewFlyoutComponent,
                data: {
                    title: "Preview Portal",
                    flyoutSize: FlyoutSize.NineTenths
                }
            },
            {
                path: "copy-portal/:templateId",
                component: PortalCreateFlyoutComponent,
                data: {
                    title: "Copy Portal",
                    flyoutSize: FlyoutSize.Quarter
                }
            }
        ]
    },
    {
        path: "portal-preview/:portalId",
        component: PortalWrapperComponent,
        data: { title: "Portal Editor" },
        children: [
            {
                path: "photo-library",
                component: PictureWidgetModalComponent,
                data: {
                    modalSize: ModalSize.Small
                }
            },
            {
                path: "change-portal-header",
                component: ChangeHeaderModalComponent,
                data: {
                    modalSize: ModalSize.ExtraSmall,
                    title: "Change Portal Header"
                }
            },
            {
                path: "add-edit-portal-widget",
                component: AddEditWidgetModalComponent,
                data: {
                    modalSize: ModalSize.Small,
                    title: "Edit Portal"
                }
            },
            {
                path: "auditTrail",
                component: AuditTrailFlyoutComponent,
                data: {
                    title: "Audit Trail",
                    flyoutSize: FlyoutSize.NineTenths
                },
                children: [
                    {
                        path: "detail",
                        component: AuditTrailDetailPortalComponent,
                        data: {
                            title: "Audit Trail Detail",
                            flyoutSize: FlyoutSize.Quarter
                        }
                    }
                ]
            }
        ],
        canActivate: [BaseOnboardFeatureEnabledGuard],
        canDeactivate: [UnsavedChangesGuard]
    },
    {
        path: "settings/:portalId",
        component: PortalSettingsComponent,
        data: { title: "Portal settings" },
        children: [
            {
                component: PortalAdministratorsModalComponent,
                path: "show-portal-admins",
                data: {
                    title: "Administrators",
                    modalSize: ModalSize.Large
                }
            },
            {
                component: PortalAssigneesModalComponent,
                path: "show-assignees-admins",
                data: {
                    title: "Assignees",
                    modalSize: ModalSize.Large
                }
            },
            {
                component: AddAssignmentModalComponent,
                path: "add-portal-assignee",
                data: {
                    title: "Add Assignee",
                    modalSize: ModalSize.Large
                }
            },
            {
                component: AddAdministratorModalComponent,
                path: "add-portal-admin",
                data: {
                    title: "Add Administrator",
                    modalSize: ModalSize.Large
                }
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(portalRoutes)],
    exports: [RouterModule]
})
export class PortalRoutingModule {}
