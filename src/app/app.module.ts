import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AppComponent } from './app.component';
import { EventComponent } from './registration/event/event.component';
import { EventMasterComponent } from './event-master/event-master.component';
import { AppRoutingModule } from './app-routing.module';
import { MatExpansionModule } from '@angular/material/expansion';
import { FlexLayoutModule } from '@angular/flex-layout'; 
import { MAT_DATE_LOCALE, MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { NgxMatDatetimePickerModule, NgxMatNativeDateModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTabsModule } from '@angular/material/tabs';
import { MatStepperModule } from '@angular/material/stepper';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { VenueFormComponent } from './registration/venue-form/venue-form.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ParentFormComponent } from './registration/parent-form/parent-form.component';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { ServiceFormComponent } from './registration/service-form/service-form.component';
import { BudgetFormComponent } from './registration/budget-form/budget-form.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { EventDetailComponent } from './registration/event-detail/event-detail.component';
import { HodApprovedeventComponent } from './approvescreen/hod-approvedevent/hod-approvedevent.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTreeModule } from '@angular/material/tree';
import { PICScreenComponent } from './approvescreen/pic-screen/pic-screen.component';
import { DirectorComponent } from './approvescreen/director/director.component';
import { EventeditComponent } from './edit screens/eventedit/eventedit.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { VenueEditComponent } from './edit screens/venue-edit/venue-edit.component';
import { ServiceEditComponent } from './edit screens/service-edit/service-edit.component';
import { BudgetEditComponent } from './edit screens/budget-edit/budget-edit.component';
import { MatBadgeModule } from '@angular/material/badge';
import { RejectionDialogComponent } from './reusecomponents/budgetshow/rejection-dialog/rejection-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { AccountComponent } from './verifyscreens/account/account.component';
import { PharmacyComponent } from './verifyscreens/pharmacy/pharmacy.component';
import { PurchaseComponent } from './verifyscreens/purchase/purchase.component';
import { EventCompleteComponent } from './event-complete/event-complete.component';
// import { ShowEventComponent } from './approvescreen/show-event/show-event.component';
// import { ShowpicEventComponent } from './approvescreen/showpic-event/showpic-event.component';
// import { DicShowComponent } from './approvescreen/dic-show/dic-show.component';
import { UserComponent } from './user/user.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ShowdetailComponent } from './showdetail/showdetail.component';
import { SubeventComponent } from './reusecomponents/subevent/subevent.component';
import { ServicelistComponent } from './reusecomponents/servicelist/servicelist.component';
import { BudgetshowComponent } from './reusecomponents/budgetshow/budgetshow.component';
import { UploadsComponent } from './reusecomponents/uploads/uploads.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SoftcopyComponent } from './reusecomponents/softcopy/softcopy.component';
import { CalendarComponent } from './calender/calender.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendershowComponent } from './calendershow/calendershow.component';
import { ProjectAvatarComponent } from './project-avatar/project-avatar.component';
import { SoftwareComponent } from './verifyscreens/software/software.component';
import { GroupDetailsComponent } from './verifyscreens/groupdetails/group-details.component';
import { AssigenedstaffComponent } from './verifyscreens/assigenedstaff/assigenedstaff.component';
import { AssignworkComponent } from './verifyscreens/assignwork/assignwork.component';
import { ServicepersonComponent } from './reusecomponents/serviceperson/serviceperson.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { SecondvenueComponent } from './registration/secondvenue/secondvenue.component';
import { VenueinchargeComponent } from './verifyscreens/venueincharge/venueincharge.component';





@NgModule({
  declarations: [
    AppComponent,
    EventComponent,
    EventMasterComponent,
    VenueFormComponent,
    ParentFormComponent,
    ServiceFormComponent,
    BudgetFormComponent,
    EventDetailComponent,
    HodApprovedeventComponent,
    PICScreenComponent,
    DirectorComponent,
    EventeditComponent,
    VenueEditComponent,
    ServiceEditComponent,
    BudgetEditComponent,
    RejectionDialogComponent,
    AccountComponent,
    PharmacyComponent,
    PurchaseComponent,
    EventCompleteComponent,
    UserComponent,
    ShowdetailComponent,
    SubeventComponent,
    ServicelistComponent,
    BudgetshowComponent,
    UploadsComponent,
    SoftcopyComponent,
    CalendarComponent,
    CalendershowComponent,
    ProjectAvatarComponent,
    SoftwareComponent,
    GroupDetailsComponent,
    AssigenedstaffComponent,
    AssignworkComponent,
    ServicepersonComponent,
    ConfirmationDialogComponent,
    SecondvenueComponent,
    VenueinchargeComponent,
   
   
    // ShowEventComponent,
    // ShowpicEventComponent,
    // DicShowComponent,
 
  
   
  ],
  imports: [
    BrowserModule,
    FlexLayoutModule,
    MatPaginatorModule,
    MatSelectModule,
    MatOptionModule,
    BrowserAnimationsModule,
    MatMenuModule,
    MatTableModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatInputModule,
    CKEditorModule,
    ReactiveFormsModule,
    FullCalendarModule,
    MatExpansionModule,
    MatListModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatBadgeModule ,
    MatDialogModule,
    MatCardModule ,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatToolbarModule,
    MatTreeModule ,
    AppRoutingModule,
    MatDatepickerModule,
    MatButtonToggleModule,
    MatNativeDateModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    MatCheckboxModule,
    MatDatepickerModule,
    NgxMatNativeDateModule,
    MatAutocompleteModule,
    MatTabsModule,
    MatStepperModule,
    MatSnackBarModule ,
    MatGridListModule,
    MatRadioModule,
    FormsModule  // Add FormsModule here

   
    

  ],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true },
    },
    
    // { provide: MAT_DATE_LOCALE , useValue: 'en-GB' },
  ],
  
  bootstrap: [AppComponent]
})
export class AppModule { }
