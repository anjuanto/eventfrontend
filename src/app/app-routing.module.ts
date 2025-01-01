import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventComponent } from './registration/event/event.component';
import { EventMasterComponent } from './event-master/event-master.component';
import {ParentFormComponent } from './registration/parent-form/parent-form.component';
import { ServiceFormComponent } from './registration/service-form/service-form.component';
import { BudgetFormComponent } from './registration/budget-form/budget-form.component';
import { EventDetailComponent } from './registration/event-detail/event-detail.component';
import { HodApprovedeventComponent } from './approvescreen/hod-approvedevent/hod-approvedevent.component';
import { PICScreenComponent } from './approvescreen/pic-screen/pic-screen.component';
import { DirectorComponent } from './approvescreen/director/director.component';
import { EventeditComponent } from './edit screens/eventedit/eventedit.component';
import { VenueEditComponent } from './edit screens/venue-edit/venue-edit.component';
import { ServiceEditComponent } from './edit screens/service-edit/service-edit.component';
import { BudgetEditComponent } from './edit screens/budget-edit/budget-edit.component';
import { AccountComponent } from './verifyscreens/account/account.component';
import { EventCompleteComponent } from './event-complete/event-complete.component';
// import { ShowEventComponent } from './approvescreen/show-event/show-event.component';
// import { ShowpicEventComponent } from './approvescreen/showpic-event/showpic-event.component';
import { UserComponent } from './user/user.component';
// import { DicShowComponent } from './approvescreen/dic-show/dic-show.component'; 
import { PharmacyComponent } from './verifyscreens/pharmacy/pharmacy.component';
import { ShowdetailComponent } from './showdetail/showdetail.component'; 
import { PurchaseComponent } from './verifyscreens/purchase/purchase.component';
import { SubeventComponent } from './reusecomponents/subevent/subevent.component';
import { ServicelistComponent } from './reusecomponents/servicelist/servicelist.component';
import { BudgetshowComponent } from './reusecomponents/budgetshow/budgetshow.component';
import { UploadsComponent } from './reusecomponents/uploads/uploads.component';
import { SoftcopyComponent } from './reusecomponents/softcopy/softcopy.component';
import { CalendarComponent } from './calender/calender.component';
import { CalendershowComponent } from './calendershow/calendershow.component';
import { SoftwareComponent } from './verifyscreens/software/software.component';
import { GroupDetailsComponent } from './verifyscreens/groupdetails/group-details.component';
import { AssigenedstaffComponent } from './verifyscreens/assigenedstaff/assigenedstaff.component';
import { AssignworkComponent } from './verifyscreens/assignwork/assignwork.component';
import { ServicepersonComponent } from './reusecomponents/serviceperson/serviceperson.component';
import { SecondvenueComponent } from './registration/secondvenue/secondvenue.component';
import { VenueinchargeComponent } from './verifyscreens/venueincharge/venueincharge.component';





const routes: Routes = [
  { path: 'events', component: EventComponent },
  { path: 'event-master', component: EventMasterComponent },
  { path: 'serviceform', component: ServiceFormComponent },
  { path: 'budgetform', component: BudgetFormComponent },
  {path: 'create-event', component: ParentFormComponent},
  {path: 'createdetail', component: EventDetailComponent},
  {path: 'hod-approvedevents', component:  HodApprovedeventComponent},
  {path: 'pic', component: PICScreenComponent},
  {path: 'director', component: DirectorComponent },
  {path: 'eventedit', component: EventeditComponent },
  {path: 'venueedit/:id', component: VenueEditComponent },
  {path: 'serviceedit/:id', component: ServiceEditComponent },
  {path: 'budgetedit/:id', component: BudgetEditComponent },
  {path: 'account', component:AccountComponent},
  {path: 'complete', component:EventCompleteComponent},
  // {path: 'show/:id', component: ShowEventComponent },
  // {path: 'showpic/:id', component: ShowpicEventComponent },
  // {path: 'dicshow/:id', component:DicShowComponent},
  {path: 'user', component: UserComponent},
  {path: 'pharmacy', component:PharmacyComponent},
  {path:'showdetail/:id', component:ShowdetailComponent},
  {path:'purchase', component:PurchaseComponent},
  {path:'subevent/:id', component:SubeventComponent},
  {path:'servicelist/:id',component:ServicelistComponent},
  {path:'budgetshow/:id', component:BudgetshowComponent},
  {path:'uploads/:id', component:UploadsComponent},
  {path:'softcopy/:id', component:SoftcopyComponent},
  {path:'calander', component: CalendarComponent},
  {path:'calandershow/:id', component: CalendershowComponent},
  {path:'software', component: SoftwareComponent},
  { path: 'group-details/:groupKey', component: GroupDetailsComponent },
  {path:'assigendstaff', component:AssigenedstaffComponent},
  {path:'assignwork/:eventMasterId', component:AssignworkComponent},
  {path:'serviceperson/:eventMasterId', component:ServicepersonComponent},
  {path: 'secondvenue/:parentId', component:SecondvenueComponent},
  {path: 'Venueincharge', component:VenueinchargeComponent}
  
  

  
  
  



];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
