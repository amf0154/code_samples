import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { NeoGridV2Module } from "@shared/neo-grid-v2/neo-grid-v2.module";
import { NeoLoaderWrapperModule } from "@shared/neo-loader-wrapper/neo-loader-wrapper.module";
import { NeoPopoverModule } from "@shared/neo-popover/popover.module";
import { NeoTooltipModule } from "@shared/neo-tooltip/neo-tooltip.module";
import { PortalListTemplatesComponent } from "./components/portal-list/portal-list-templates/portal-list-templates.component";
import { PortalListComponent } from "./components/portal-list/portal-list.component";
import { AuditTrailPortalAssignmentComponent } from "./components/audit-trail/audit-trail-portal-assignment/audit-trail-portal-assignment.component";
import { AuditTrailPortalHeaderSettingsComponent } from "./components/audit-trail/audit-trail-portal-header-settings/audit-trail-portal-header-settings.component";
import { CapitalizeString } from "./pipes/capitalize-string.pipe";
import { HeaderSizeToString } from "./pipes/header-size-to-string.pipe";
import { ImageCropParametersToString } from "./pipes/image-crop-parameters-to-string.pipe";
import { WidgetTypeToString } from "./pipes/widget-type-to-string";
import { PortalRoutingModule } from "./portal-routing.module";
import { OnboardModalModule } from "@onboard-shared/modules/onboard-modal/onboard-modal.module";
import { EntityUrlModule } from "@onboard-shared/modules/entity-url/entity-url.module";
import { NeoEmployeePhotoModule } from "@shared/neo-employee-photo/neo-employee-photo.module";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PortalHeaderButtonsComponent } from "./components/portal-header-buttons/portal-header-buttons.component";
import { PortalWrapperComponent } from "./components/portal-wrapper/portal-wrapper.component";
import { PortalAssignmentsComponent } from "./components/portal-assignments/portal-assignments.component";
import { AddAdministratorModalComponent } from "./components/add-administrator-modal/add-administrator-modal.component";
import { AddAssignmentModalComponent } from "./components/add-assignment-modal/add-assignment-modal.component";
import { AdministratorUserRolesComponent } from "./components/administrator-user-roles/administrator-user-roles.component";
import { AdminstratorEmployeesComponent } from "./components/adminstrator-employees/adminstrator-employees.component";
import { PortalAdministratorsModalComponent } from "./components/portal-administrators-modal/portal-administrators-modal.component";
import { PortalAssigneesModalComponent } from "./components/portal-assignees-modal/portal-assignees-modal.component";
import { PortalSettingsComponent } from "./components/portal-settings/portal-settings.component";
import { PortalListFlyoutComponent } from "./components/portal-list-flyout/portal-list-flyout.component";
import { OnboardFlyoutModule } from "@onboard-shared/modules/onboard-flyout/onboard-flyout.module";
import { PortalCreateFlyoutComponent } from "./components/portal-create-flyout/portal-create-flyout.component";
import { NeoRequiredLabelModule } from "@shared/neo-required-label/neo-required-label.module";
import { NeoFormElementsModule } from "@shared/form-elements/neo-form-elements.module";
import { NeoToastModule } from "external/patternlibrary-neogov/src/app/toast/neo-toast.module";
import { PortalPreviewFlyoutComponent } from "./components/portal-preview-flyout/portal-preview-flyout.component";
import { SafeResourceUrlPipeModule } from "@onboard-shared/pipes/safe-resource-url.module";
import { PipesModule } from "@shared/pipes/pipes.module";
import { PortalElementsModule } from "@onboard-shared/modules/portal-elements/portal-elements.module";
import { AuditTrailDetailPortalComponent } from "./components/audit-trail/audit-trail-detail-portal/audit-trail-detail-portal.component";
import { AuditTrailPortalAdministratorComponent } from "./components/audit-trail/audit-trail-portal-administrator/audit-trail-portal-administrator.component";
import { AuditTrailPortalSettingsComponent } from "./components/audit-trail/audit-trail-portal-settings/audit-trail-portal-settings.component";
import { AuditTrailPortalWidgetItemsComponent } from "./components/audit-trail/audit-trail-portal-widget-items/audit-trail-portal-widget-items.component";
import { AuditTrailPortalWidgetPositionComponent } from "./components/audit-trail/audit-trail-portal-widget-position/audit-trail-portal-widget-position.component";
import { AuditTrailPortalWidgetSettingsComponent } from "./components/audit-trail/audit-trail-portal-widget-settings/audit-trail-portal-widget-settings.component";
import { AuditTrailModule } from "@onboard-shared/modules/audit-trail/audit-trail.module";

@NgModule({
    declarations: [
        PortalSettingsComponent,
        PortalListComponent,
        PortalListTemplatesComponent,
        AdministratorUserRolesComponent,
        PortalAdministratorsModalComponent,
        AddAdministratorModalComponent,
        AdminstratorEmployeesComponent,
        PortalAssigneesModalComponent,
        PortalAssignmentsComponent,
        AddAssignmentModalComponent,
        PortalListFlyoutComponent,
        PortalCreateFlyoutComponent,
        PortalPreviewFlyoutComponent,
        PortalWrapperComponent,
        PortalHeaderButtonsComponent,
        AuditTrailDetailPortalComponent,
        AuditTrailPortalAdministratorComponent,
        AuditTrailPortalAssignmentComponent,
        AuditTrailPortalHeaderSettingsComponent,
        AuditTrailPortalSettingsComponent,
        AuditTrailPortalWidgetItemsComponent,
        AuditTrailPortalWidgetPositionComponent,
        AuditTrailPortalWidgetSettingsComponent,
        HeaderSizeToString,
        CapitalizeString,
        ImageCropParametersToString,
        WidgetTypeToString
    ],
    imports: [
        CommonModule,
        NeoLoaderWrapperModule,
        NeoTooltipModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        NeoGridV2Module,
        NeoPopoverModule,
        PortalRoutingModule,
        OnboardModalModule,
        EntityUrlModule,
        NeoFormElementsModule,
        NeoEmployeePhotoModule,
        NgbModule,
        OnboardFlyoutModule,
        NeoRequiredLabelModule,
        NeoFormElementsModule,
        NeoToastModule,
        SafeResourceUrlPipeModule,
        PortalElementsModule,
        AuditTrailModule,
        PipesModule,
        PortalRoutingModule
    ],
    exports: [PortalListComponent, PortalSettingsComponent, AdministratorUserRolesComponent, PortalAdministratorsModalComponent]
})
export class PortalModule {}
