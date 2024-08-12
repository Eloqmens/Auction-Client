import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LotListComponent } from './lots/lot-list/lot-list.component';
import { LotDetailsComponent } from './lots/lot-details/lot-details.component';
import { AdminPanelComponent } from './admin/admin-panel/admin-panel.component';
import { CreateLotComponent } from './admin/create-lot/create-lot.component';
import { EditLotComponent } from './admin/edit-lot/edit-lot.component';
import { CategoryManagementComponent } from './admin/category-management/category-management.component';
import { AuthGuard } from './auth/auth.guard';
import { AdminGuard } from './auth/admin.guard';

const routes: Routes = [
  { path: '', component: LotListComponent },
  { path: 'lots/:id', component: LotDetailsComponent },
  { path: 'admin', component: AdminPanelComponent, canActivate: [AdminGuard] },
  { path: 'admin/create-lot', component: CreateLotComponent, canActivate: [AdminGuard] },
  { path: 'admin/edit-lot/:id', component: EditLotComponent, canActivate: [AdminGuard] },
  { path: 'admin/categories', component: CategoryManagementComponent, canActivate: [AdminGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

