import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event } from '../models/event';
import { EventType,EventVenue,EventSupport,CategoryProduct,ResponseMaster,BudgetCategory,SoftcopyType,User} from '../models/event';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/enviroments/enviroment';



@Injectable({
  providedIn: 'root'
})
export class EventService {
  private data: any;

  private approvedEventsSource = new BehaviorSubject<any[]>([]);
  approvedEvents$ = this.approvedEventsSource.asObservable();


  private apiUrl = environment.apiUrl; // Replace with your API endpoint

  constructor(private http: HttpClient) { }


  getEventList(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}events/get-events`); // filtercomponent(event component)
  }

  getparentevent(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}events/parent`); // loadevent(event complete)
  }

 
// EVENTMASTER

  createEvent(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}events/create`, payload);  // create events
  } 
  deleteEvent(id: number): Observable<any> {
      return this.http.delete(`${this.apiUrl}events/delete/${id}`);
  }

  updateEvent(formData: FormData, eventId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}events/update/${eventId}`, formData);  // update events
  }
 
  getEvent(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}events/get/${id}`); // get events
  }

  cancelEvent(eventId: number, cancelReason: string): Observable<any> {
    return this.http.post(`${this.apiUrl}events/cancel`, {
      event_id: eventId,
      cancel_reason: cancelReason,
    });
  }
  checkVenue(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}events/checkvenue`, data); // venue checking
  }
  checkTime(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}events/checktype`, data);  // time checking
  }
  updatestatus(eventId: number, approvalStatus: string): Observable<any> {
    const body = { id: eventId, approvalStatus };                              // status update in hod and priest screen
    return this.http.post(`${this.apiUrl}events/status/update`, body);
  }
 
  uploadFiles(formData: FormData): Observable<any> {                      // softcopy upload
    return this.http.post(`${this.apiUrl}events/upload-softcopy-file`, formData);
  }
  verifyEntity(entityType: string, id: number): Observable<any> {        // account,pharmacy  view 
  return this.http.post(`${this.apiUrl}events/${entityType}/${id}`, {});
  }  
  getEventReport(eventId: number) {
    return this.http.get<{ content: string }>(`${this.apiUrl}events/${eventId}/report`);
  }   
  deletesoftcopyFile(eventId: number, softcopyId: number): Observable<any> {
    const body = { event_id: eventId, softcopy_id: softcopyId };
    return this.http.delete<any>(`${this.apiUrl}events/softcopy/delete`, { body });
  } 
  saveEventReport(payload: { event_id: number, content: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}events/save-event-report`, payload); 
  }
  createSubEvent(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}events/sub-event-create`, data);
  } 

  getEventsByDate(params: { start_date?: string; end_date?: string; check_budget?: boolean; status?: string[] }): Observable<any> {
  return this.http.get<any[]>(`${this.apiUrl}events/date-range-events`, { params });
  }

  
  getcalanderevents(month: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}events/monthevents`, { month});
  } 
  togglePrivacyStatus(eventId: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}events/${eventId}/privacy-status`, {});
  }

  getVenueInchargeEvents(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}events/venue-incharge`, payload);
  }

  getEventsByDateRangeAndStatus(
    start_date: string | null,
    end_date: string | null,
    status: string,
    department_id?: number,
    awaitFlag?: boolean,
    meeting?: boolean 

  ): Observable<{ events: Event[]; awaitEvents?: Event[] }> {
    const payload: any = { status };
  
  
    if (start_date) payload.start_date = start_date;
    if (end_date) payload.end_date = end_date;
    if (department_id) payload.department_id = department_id;
    if (awaitFlag ) payload.awaitFlag = awaitFlag ? 'true' : 'false';
    // if (meeting !== undefined) payload.meeting = meeting ? 'true' : 'false';
    if (meeting !== undefined) payload.meeting = String(meeting);

    return this.http.post<{ events: Event[]; awaitEvents?: Event[] }>(
      `${this.apiUrl}events/getEventsByDateRangeAndStatus`,
      payload
    );
  }
  
  getEventsGroupedByStatuss(
    departmentId?: number,
    meeting?: boolean,
    awaitFlag?: boolean,
    status?: string
  ): Observable<any> {
    const params: any = {};
  
    if (departmentId != null) {
      params.department_id = departmentId;
    }

    if (meeting !== undefined) {
      params.meeting = meeting.toString();
    }
    if (awaitFlag !== undefined) {
      params.awaitFlag = awaitFlag.toString();
    }
    if (status) {
      params.status = status;
    }
    return this.http.get(`${this.apiUrl}/events/grouped-by-status`, { params });
  }
  
  
  

// EVENTMASTER


  getEventTypes(): Observable<EventType[]> {
    return this.http.get<EventType[]>(`${this.apiUrl}events/event-types`);
  }
  getEventVenues(): Observable<EventVenue[]> {
    return this.http.get<EventVenue[]>(`${this.apiUrl}events/event-venues`);
  }
  getEventSupport(): Observable<EventSupport[]> {
    return this.http.get<EventSupport[]>(`${this.apiUrl}events/eventSupports`); // both service form and service edit
  }

  getResponceMaster(): Observable<ResponseMaster[]> {
    return this.http.get<ResponseMaster[]>(`${this.apiUrl}events/Responsemaster`);
  }
  
  getBudgetCategories(): Observable<BudgetCategory[]> {
    return this.http.get<BudgetCategory[]>(`${this.apiUrl}events/event-budget-categories`); // display dropdown for budget category both budget form and budget edit
  }
  
  getAmalaProjects(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}events/project`);
  }

  getCategoryProduct(): Observable<CategoryProduct[]> {
    return this.http.get<CategoryProduct[]>(`${this.apiUrl}events/CategoryProducts`);
  }
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}events/users`);
  }
  getHolidays(): Observable<any> {
    return this.http.get(`${this.apiUrl}/events/holidays`);
  } 
  getUsersByDepartment(departmentId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}events/users-department/${departmentId}`);
  }                                                       
  
 




 

// master-product table

  getEventMasterProductDetails(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}events/MasterProduct`);
   }
  getmasterproduct(eventMasterId: number): Observable<any> {           // servicedit screen backend data taking serviceproducts
    return this.http.get<any>(`${this.apiUrl}events/MasterProduct/${eventMasterId}`);
  }

  masterproductupdate(eventMasterId: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}events/MasterProduct/update/${eventMasterId}`, data);   // serviceedit screen eventsupdate 
  }
  getServiceGroupedByDepartment(userId: number, startDate?: string, endDate?: string, status: string = 'Notified Supporting Departments'): Observable<any> {
    let params = new HttpParams().set('user_id', userId.toString());

    if (startDate) {
        params = params.set('start_date', startDate);
    }
    if (endDate) {
        params = params.set('end_date', endDate);
    }
    if (status) {
        params = params.set('status', status);  // Add status to the request
    }

    return this.http.get<any>(`${this.apiUrl}events/master-product-grouped-data`, { params });
}

  getDepartmentDetails(event_master_id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}events/event-product-department/${event_master_id}`);
  }
  
  
  
  
  
  
  

// master-product-table


// BUDGET DETAILS 
  createBudget(expense: any): Observable<any> {
    return this.http.post(`${this.apiUrl}events/event-budget-details`, expense); // budget edit screen
  } 
  getbudgetdetail(eventMasterId: number): Observable<any>  {
    return this.http.get<any>(`${this.apiUrl}events/event-budget-details/event-master/${eventMasterId}`);   // budgetedit screen
  }

  budgetdetailupdate(eventMasterId: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}events/event-budget-details/update/${eventMasterId}`,data);   // budgetedit screen
  }

  deletebudgetdetail(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}events/event-budget-details/${id}`);
  }

// BUDGET DETAILS 



// REJECTION DETAILS 
  submitRejectionDetails(formData: FormData) {
    return this.http.post(`${this.apiUrl}events/event-rejections`, formData);
  }
  
  getRejectionDetails(eventId: number, userId: number): Observable<any> {
  const payload = { event_id: eventId, user_id: userId };
  return this.http.post<any>(`${this.apiUrl}events/rejection-details`, payload);
  }
// REJECTION DETAILS 


// SOFTCOPY TABLE 
  getSoftcopyTypes(): Observable<SoftcopyType[]> {
    return this.http.get<SoftcopyType[]>(`${this.apiUrl}events/softcopytype`);
  }
  getSoftcopyDetails(eventId: number, softcopy_type: number): Observable<any> {
    return this.http.get(`${this.apiUrl}events/${eventId}/softcopy-details/${softcopy_type}`);
  }
// SOFTCOPY TABLE



//ASSIGNED USER TABLE 
  createEventAssignedUser(data: { event_master_id: number; department_id: number; user_id: number }) {
    return this.http.post(`${this.apiUrl}events/event-assigned-users`, data);
  }

  getAssignedUserDetails(userId: number, startDate?: string, endDate?: string, completed?: string): Observable<any> {
    const params: any = { user_id: userId.toString() };
  if (startDate) { params.start_date = startDate;}
  if (endDate) {params.end_date = endDate;}
  if (completed) params.completed = completed;
  return this.http.get(`${this.apiUrl}events/eventassigned`, { params });
  }

  getAssignedUser(eventMasterId: number, departmentId: number | null): Observable<any> {
  const payload: any = {
    event_master_id: eventMasterId,
  };
  if (departmentId !== null) {
    payload.department_id = departmentId;
  }
  return this.http.post(`${this.apiUrl}events/assigned-user`, payload);
  }


  deleteAssignedUser(eventMasterId: string | null, departmentId: number, userId: number) {
  const params = { event_master_id: eventMasterId, department_id: departmentId, user_id: userId };
  return this.http.post(`${this.apiUrl}events/event-assigned-users/delete`, params);
  }
// ASSIGNED USER TABLE 

}


  // getEventsByDepartment(departmentId: number): Observable<any> {           // take evnts by department
  // return this.http.get<any>( `${this.apiUrl}events/department/${departmentId}`);
  // }

  // getVenueInchargeEvents(userId: number): Observable<any> {
  //   return this.http.post<any>(`${this.apiUrl}events/venue-incharge`, { user_id: userId });
  // }
  // getEventsByDateRanges(params: { start_date: string; end_date: string; check_budget?: boolean }): Observable<any> {
  //   const queryParams: any = {
  //     start_date: params.start_date,
  //     end_date: params.end_date,
  //   };
  
  //   // Add check_budget only if it's provided
  //   if (params.check_budget !== undefined) {
  //     queryParams.check_budget = params.check_budget ? 'true' : 'false';
  //   }
  
  //   return this.http.get<any[]>(`${this.apiUrl}events/date-range-events`, { params: queryParams });
  // }
    // getEventsByDateRange(startDate: string, endDate: string): Observable<any> {
  //   const params = {
  //     start_date: startDate,  // Use start_date instead of startDate
  //     end_date: endDate,       // Use end_date instead of endDate
  //   };
  
  //   return this.http.get<any[]>(`${this.apiUrl}events/date-range-events`, { params });
  // }  

  //  getEventsByDepartments(departmentId?: number, status?: string, ismeeting?: boolean, awaitFlag?: boolean): Observable<any> {
  //   // Initialize HttpParams
  //   let params = new HttpParams();
  
  //   // Conditionally add 'department_id' if provided
  //   if (departmentId !== undefined && departmentId !== null) {
  //     params = params.set('department_id', departmentId.toString());
  //   }
  
  //   // Conditionally add other query parameters
  //   if (status) {
  //     params = params.set('status', status);
  //   }
  //   if (ismeeting !== undefined) {
  //     params = params.set('ismeeting', ismeeting.toString());
  //   }
  //   if (awaitFlag !== undefined) {
  //     params = params.set('await', awaitFlag.toString());
  //   }
  
  //   // Perform HTTP GET request
  //   return this.http.get<any>(`${this.apiUrl}/events/department-events`, { params });
  // }
  // getEventsGroupedByStatus(): Observable<any> {
  //   return this.http.get(`${this.apiUrl}/events/grouped-by-status`);
  // }