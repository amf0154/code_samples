import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { EditUserComponent } from "./components/edit-user/edit-user.component";
import { UserListComponent } from "./components/user-list/user-list.component";

const routes: Routes = [
    { path: "", component: UserListComponent, data: { title: "User List" } },
    { path: ":userId", component: EditUserComponent, data: { title: "Edit User" } }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UserRoutingModule {}
