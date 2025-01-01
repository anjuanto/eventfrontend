import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StatusService {
  // Define the structure for role-based statuses
  private statusNames: {
    hod: { approved: string[]; rejected: string[]; pending: string[]; all: string[] };
    priestIncharge: { approved: string[]; rejected: string[]; pending: string[]; all: string[] };
    director: { approved: string[]; rejected: string[]; pending: string[]; all: string[]};
  } = {
    hod: {
      all: ['Director-Approved','Completed','HOD-Approved','Notified Supporting Departments','Priest-Incharge-Approved','Priest-Incharge-Rejected','Director-Rejected','HOD-Rejected','Scheduled'],
      approved: ['HOD-Approved','Notified Supporting Departments','Director-Approved','Priest-Incharge-Approved','Priest-Incharge-Rejected','Director-Rejected'],
      rejected: ['HOD-Rejected'],
      pending: ['Scheduled'],
    },
    priestIncharge: {
      all:['Priest-Incharge-Approved','Completed','Scheduled','Notified Supporting Departments','Director-Approved','Director-Rejected','Priest-Incharge-Rejected','HOD-Approved'],
      approved: ['Priest-Incharge-Approved','Notified Supporting Departments','Director-Approved','Director-Rejected'],
      rejected: ['Priest-Incharge-Rejected'],
      pending: ['HOD-Approved'],
    },
    director: {
      all:['Director-Approved','Completed','Director-Rejected','Notified Supporting Departments','HOD-Approved','Priest-Incharge-Approved'],
      approved: ['Director-Approved','Notified Supporting Departments'],
      rejected: ['Director-Rejected'],
      pending: ['Priest-Incharge-Approved'],
    },
  };

  // Define the additional status groups
  private allStatuses: string[] =['HOD-Rejected', 'Priest-Incharge-Rejected', 'Director-Rejected','Cancelled','HOD-Approved', 'Priest-Incharge-Approved','Director-Approved','Notified Supporting Departments','Scheduled','Completed']
  private rejectedStatuses: string[] = ['HOD-Rejected', 'Priest-Incharge-Rejected', 'Director-Rejected','Cancelled'];
  private processingStatuses: string[] = ['HOD-Approved', 'Priest-Incharge-Approved'];
  private approvedStatuses: string[] = ['Director-Approved','Notified Supporting Departments'];
  private scheduledStatuses: string[] = ['Scheduled'];
  private completedStatuses: string[] = ['Completed'];

  constructor() {}

  // Get all HOD-related statuses
  getHodStatuses(): { approved: string[]; rejected: string[]; pending: string[]; all: string[] } {
    return this.statusNames.hod;
  }

  // Get all Priest-Incharge-related statuses
  getPriestInchargeStatuses(): { approved: string[]; rejected: string[]; pending: string[]; all: string[] } {
    return this.statusNames.priestIncharge;
  }

  // Get all Director-related statuses
  getDirectorStatuses(): { approved: string[]; rejected: string[]; pending: string[]; all: string[] } {
    return this.statusNames.director;
  }

  // Method to dynamically get a status list by role and key (approved/rejected/pending)
  getStatusesByRoleAndKey(role: 'hod' | 'priestIncharge' | 'director', key: 'approved' | 'rejected' | 'pending'): string[] {
    return this.statusNames[role]?.[key] || [];
  }

  // Get rejected statuses
  getRejectedStatuses(): string[] {
    return this.rejectedStatuses;
  }

  // Get processing statuses
  getProcessingStatuses(): string[] {
    return this.processingStatuses;
  }

  // Get approved statuses
  getApprovedStatuses(): string[] {
    return this.approvedStatuses;
  }
   // Get approved statuses
   getAllStatuses(): string[] {
    return this.allStatuses;
  }

  // Get scheduled statuses
  getScheduledStatuses(): string[] {
    return this.scheduledStatuses;
  }
  getCompletedStatuses(): string[] {
     return this.completedStatuses;
  }
}
