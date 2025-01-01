//event model

export interface EventStatus {
  id: number;
  status: string; // e.g., "Director-Approved"
  status_alias?: string;
  description?: string;
}

export interface Event {
  id?: number; // Make id optional
  parent_id?: number | null;
  event_type_id: number;
  title: string;
  datetime_from: string;
  datetime_to: string;
  contact_no: string;
  contact_email: string;
  event_venue_id: number;
  status: EventStatus; // Update this to be an object instead of a number
  created_by: number;
  amala_project_id: number;
  project:Project;
  accounts_verified: number;
  pharmacy_verified: number;
  purchace_verified: number;
  event_report:  string;
  department?: Department;
  cancelreason: string;
}
export interface Department {
  id: number;
  departmentName: string;
  availability: number;
  deleted_at: string | null;
  created_at: string | null;
}
export interface Project {
  id: number;
  name: string;
}

export interface SoftcopyType {
  id: number;
  softcopy_type: string;
}
//Event type model 

export interface EventType {
  id: number;
  name: string;
}

//Event venue model

export interface EventVenue {
  id: number;
  name: string;
}

// Event Support
export interface EventSupport{
  id: number;
  name: string;
  // supporting_category_id: number;
}

export interface CategoryProduct {
  id: number;
  name: string;
  supporting_category_id: number;
  response_master_id: number;
  response_master: ResponseMaster;
}

export interface ResponseDetail {
  id: number;
  response_master_id: EventResponseMaster;
  response: string;
  default:number;
  value: string | number;
}

export interface ResponseMaster {
  name: string;
  type: string;
  eventresponcedetail: ResponseDetail[];
}

export interface EventMasterProductDetail {
  id: number;
  event_master_id: number;
  category_product_id: CategoryProduct;
  response_id:ResponseDetail | null; 
  count?: number|null;
  remarks: string;
  category_product: CategoryProduct; 
  eventresponcemaster: ResponseMaster; 
  form_field_type?: string;
  radio_options?: string[];
  defaultOption?:string;
  selectedOption?: string;
  showCountInput?: boolean;
  showSpecialInput?: boolean;

}

export interface Product {
  id:number;
  supporting_category_id: number; 
  category_product_id?: number; 
  eventresponcemaster?: ResponseMaster;
  form_field_type?: string;
  radio_options?: string[];
  response_id?: number | null;
  selectedOption?: string;
  showCountInput?: boolean;
  showSpecialInput?: boolean;
  defaultOption?:string;
  count?: number|null;
  remarks?: string|null;
}

export interface BudgetCategory {
  id: number; 
  name: string; 
  price: number; 
}


export interface EventResponseDetail {
  id: number;
  response_master_id: number;
  response: string;
  default: number;
  value: string;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}


 export interface EventResponseMaster {
  id: number;
  name: string;
  type: string;
  eventresponcedetail: EventResponseDetail;
}


export interface BudgetDetail {
  id: number;
  event_budget_category_id: number;
  amount: number;
  nos: number;
  event_master_id: number;
  eventmaster: Event;
}

export  interface RejectionReason {
  id: number;
  event_id: number;
  reason_for_rejection: string;
  user_id: number;
  created_at: string;
}
export interface SoftcopyDetail {
  id: number; 
  event_id: number; 
  softcopy_type: number; 
  mime: string;
  original_filename: string;
 
}

export interface User {
  id: number;
  name: string;
  email: string;
  // other fields as per your requirements
}