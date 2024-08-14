import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';  
import { RouterModule } from '@angular/router';          
import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { LotListComponent } from './lots/lot-list/lot-list.component';
import { LotDetailsComponent } from './lots/lot-details/lot-details.component';
import { AdminPanelComponent } from './admin/admin-panel/admin-panel.component';
import { AuthInterceptor } from './auth/auth-interceptor.service';
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
    AppRoutingModule,  
    RouterModule,      
    HttpClientModule,
    FormsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
