import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';  // Импорт модуля маршрутизации
import { RouterModule } from '@angular/router';          // Импорт RouterModule
import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { LotListComponent } from './lots/lot-list/lot-list.component';
import { LotDetailsComponent } from './lots/lot-details/lot-details.component';
import { AdminPanelComponent } from './admin/admin-panel/admin-panel.component';
import { CreateLotComponent } from './admin/create-lot/create-lot.component';
import { EditLotComponent } from './admin/edit-lot/edit-lot.component';
import { CategoryManagementComponent } from './admin/category-management/category-management.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    LotListComponent,
    LotDetailsComponent,
    AdminPanelComponent,
    CreateLotComponent,
    EditLotComponent,
    CategoryManagementComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,  // Добавление модуля маршрутизации
    RouterModule,      // Добавление RouterModule
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
