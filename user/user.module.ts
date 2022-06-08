import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { UserRoutingModule } from "./user-routing.module";
import { UserListComponent } from "./components/user-list/user-list.component";
import { NeoGridV2Module } from "@shared/neo-grid-v2/neo-grid-v2.module";
import { BannerModule } from "@onboard-shared/modules/banner/banner.module";
import { NeoLoaderWrapperModule } from "@shared/neo-loader-wrapper/neo-loader-wrapper.module";
import { NeoTooltipModule } from "@shared/neo-tooltip/neo-tooltip.module";
import { UserlistTemplatesComponent } from "./components/userlist-templates/userlist-templates.component";
import { NeoRequiredLabelModule } from "@shared/neo-required-label/neo-required-label.module";
import { NeoCheckBoxModule } from "@shared/neo-check-box/neo-check-box.module";
import { OnboardModalModule } from "@onboard-shared/modules/onboard-modal/onboard-modal.module";
import { NeoFormElementsModule } from "@shared/form-elements/neo-form-elements.module";
import { NeoSingleSelectModule } from "@shared/neo-single-select";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { EditUserComponent } from "./components/edit-user/edit-user.component";
import { EntityUrlModule } from "@onboard-shared/modules/entity-url/entity-url.module";
import { SelectionListModule } from "@onboard-shared/modules/selection-list/selection-list.module";


@NgModule({
    declarations: [UserListComponent, EditUserComponent, UserlistTemplatesComponent],
    imports: [
        CommonModule,
        UserRoutingModule,
        NeoGridV2Module,
        BannerModule,
        NeoTooltipModule,
        NeoLoaderWrapperModule,
        NeoRequiredLabelModule,
        NeoCheckBoxModule,
        OnboardModalModule,
        NeoFormElementsModule,
        NeoSingleSelectModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        EntityUrlModule,
        SelectionListModule
    ]
})
export class UserModule {}
