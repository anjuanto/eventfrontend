import { Component, OnInit, Input } from '@angular/core';
import { EventService } from 'src/app/service/event.service';
import { Event } from 'src/app/models/event';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-uploads',
  templateUrl: './uploads.component.html',
  styleUrls: ['./uploads.component.css']
})
export class UploadsComponent implements OnInit {
  selectedFiles: File[] = [];
  //returnUrl: string = ''; 
  selectedFileNames: string[] = [];
  selectedEvent: any = null;
  events: Event[] = [];
  //filteredEvents: Event[] = []; // Store filtered events based on the status
  errorMessage: string = '';
  eventMasterId: number = 0; // Initialize eventMasterId
  softcopyDetails: any[] = [];
  //softcopyId: string = '';  // To store the selected softcopyId
  message: string = '';   // To store success or error messages
  softcopyIds: number[] = []; // To store all softcopy IDs

  @Input() eventId!: number;  
  @Input() softcopy_type!: number;

  constructor(
    private eventService: EventService,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

 ngOnInit(): void {
    const validEventId = this.eventId ?? 0; // Default to 0 if undefined
    const validSoftcopyType = this.softcopy_type ?? 0; // Default to 0 if undefined
    this.fetchEvents(validEventId, validSoftcopyType);
    console.log('softcopy_type:', validSoftcopyType);
}

  fetchEvents(eventId: number, softcopy_type: number): void {
    if (!eventId || !softcopy_type) return;  // Early return if eventId or softcopy_type is invalid

    this.eventService.getEvent(eventId).subscribe(
      (response: any) => {
        // Ensure that events are either an array or a single event
        if (Array.isArray(response.events) && response.events.length > 0) {
          this.events = response.events;
        } else {
          this.events = [response]; // In case of a single event
        }
  
        // Iterate over this.events and call getSoftcopyDetails for each event
        this.events.forEach((event) => {
          if (event.id) {
            this.getSoftcopyDetails(event.id, softcopy_type); // Pass eventId and softcopy_type
          }
        });
      },
      (error) => {
        console.error('Error fetching events:', error);
      }
    );
}


  getSoftcopyDetails(eventId: number, softcopy_type: number): void {
    if (!eventId || !softcopy_type) return;  // Early return if eventId or softcopy_type is invalid

    this.eventService.getSoftcopyDetails(eventId, softcopy_type).subscribe(
      (data: any[]) => {
        const event = this.events.find(e => e.id === eventId); 
        if (event) {
          const mappedDetails = data.map((softcopy: any) => {
            const fileUrl = `http://localhost/event/storage/app/uploads/${softcopy.original_filename}`;
            return {
              ...softcopy,
              fileUrl: fileUrl,   
              id: softcopy.id     
            };
          });
          (event as any).softcopyDetails = mappedDetails; 
        }
      },
      (error) => {
        this.errorMessage = 'Unable to fetch softcopy details';
        console.error(error);
      }
    );
}


  deleteSoftcopy(id: any): void {
    if (!this.eventId) return;  // Check for eventId before proceeding

    this.eventService.deletesoftcopyFile(this.eventId, id).subscribe({
      next: (response) => {
        console.log('Softcopy deleted successfully:', response);
        this.fetchEvents(this.eventId, this.softcopy_type); 
      },
      error: (err) => {
        console.error('Error deleting softcopy:', err);
      }
    });
  }

  onFileSelected(event: any, selectedEvent: any): void {
    const selectedFiles = event.target.files;
    if (selectedFiles.length > 0) {
      this.selectedFiles = [];
      this.selectedFileNames = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        this.selectedFiles.push(file);
        this.selectedFileNames.push(file.name);
      }

      this.selectedEvent = selectedEvent;
    }
  }

  deleteFile(index: number): void {
    this.selectedFileNames.splice(index, 1);
    this.selectedFiles.splice(index, 1);
  }

  uploadFiles(): void {
    if (!this.selectedFiles.length || !this.selectedEvent || !this.eventId) {
      console.error('No files selected, event data, or eventId is missing.');
      return;
    }

    const formData = new FormData();
    
    // Append each selected file to the FormData
    this.selectedFiles.forEach(file => {
      formData.append(`files[]`, file);
    });

    formData.append('event_id', this.eventId.toString());  // Use eventId directly
    formData.append('softcopy_type', this.softcopy_type.toString()); 

    // Call the service to upload files
    this.eventService.uploadFiles(formData).subscribe({
      next: (response) => {
        console.log('Files uploaded successfully:', response);
        this.fetchEvents(this.eventId, this.softcopy_type);
        this.selectedFileNames = []; 
        this.selectedFiles = []; 
        this.selectedEvent = null; 
      },
      error: (err) => {
        console.error('File upload error', err);
      }
    });
  }
}
