import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectionListComponent } from './selection-list.component';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';



@NgModule({
  declarations: [
    SelectionListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgbDropdownModule,
  ],
  exports: [
    SelectionListComponent
  ]
})
export class SelectionListModule { }
