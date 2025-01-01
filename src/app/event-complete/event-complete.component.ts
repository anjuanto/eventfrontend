import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { EventService } from '../service/event.service';
import { Event,SoftcopyType } from '../models/event';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-event-complete',
  templateUrl: './event-complete.component.html',
  styleUrls: ['./event-complete.component.css']
})
export class EventCompleteComponent implements OnInit {
  public editorContent: string = '';
  public Editor = ClassicEditor;
  public editorData: string = '<p>Hello, world!</p>'; 
  public selectedEventId: number | null = null; 
  public editorConfig = {
    toolbar: [
      'heading',
      '|',
      'bold',
      'italic',
      'link',
      'bulletedList',
      'numberedList',
      'blockQuote',
      'insertTable',
      'undo',
      'redo'
    ],};

  public showEditor: boolean = false; 
  events: Event[] = [];
  eventForm!: FormGroup;
  error: string | null = null;
  selectedFiles: File[] = [];
  selectedEvent: Event | null = null;
  selectedFileNames: string[] = [];
  eventData: any = { title: 'Event Title' };
  errorMessage: string = '';
  currentPage: number = 0;
  pageSize: number = 4;
  paginatedEvents: Event[] = [];
  dataSource = new MatTableDataSource<Event>();
  showUpload: { [key: number]: boolean } = {};
  softcopyTypes: SoftcopyType[] = [];
  showUploadMap: { [key: number]: boolean } = {};
  showEditorMap: { [key: number]: boolean } = {};

  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  @ViewChild('fileInput') fileInput!: ElementRef; 

  constructor(
    private eventService: EventService,
    private fb: FormBuilder,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.eventForm = new FormGroup({
      title: new FormControl(''), 
    });
    this.loadEvents();
    this.loadSoftcopyTypes();
    //this.loadEventReport();
  }

    loadSoftcopyTypes(): void {
      this.eventService.getSoftcopyTypes().subscribe({
        next: (data) => {
          this.softcopyTypes = data; // Store the received data
         // console.log(this.softcopyTypes);
        },
        error: (err) => {
          console.error('Error fetching softcopy types:', err);
        }
      });
    }

  loadEvents(): void {
    this.eventService.getparentevent().subscribe({
      next: (data: Event[]) => {
        this.events = data.filter(event => event.status?.status === 'Completed');

        this.events.forEach((event) => {
          const eventWithChildren = event as any;
          eventWithChildren.hasNoChildren = !eventWithChildren.children || eventWithChildren.children.length === 0;
        });

        this.paginateEvents();
      },
      error: (err) => {
        this.error = 'Failed to load events';
        console.error(err);
      }
    });
  }

  onFileSelected(event: any, selectedEvent: any): void {
    const selectedFiles = event.target.files;
    if (selectedFiles.length > 0) {
      console.log(`Files selected for event: ${selectedEvent.title}`, selectedFiles);
      
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


  loadEventReport(): void {
    console.log('Selected Event ID:', this.selectedEventId);

    if (this.selectedEventId !== null && typeof this.selectedEventId === 'number') {
        this.eventService.getEventReport(this.selectedEventId).subscribe(
            response => {
                // Log the entire response to understand its structure
                console.log('API Response:', response);
                console.log('Response Type:', typeof response);
                
                // Check if response is a string
                if (typeof response === 'string') {
                    this.editorContent = response; // Directly use the string
                } else if (response && typeof response.content === 'string') {
                    this.editorContent = response.content; // Load the plain content into CKEditor
                } else {
                    console.error('Unexpected response format', response);
                }
            },
            error => {
                console.error('Error fetching content:', error);
                this.editorContent = ''; // Allow new content in case of an error
            }
        );
    } else {
        console.error('Invalid or null event ID.');
        this.editorContent = ''; // Reset editor content if event ID is invalid
    }
}

  saveContent(): void {
    console.log('Selected Event ID:', this.selectedEventId); // Debugging log
    console.log('Editor Content before cleanup:', this.editorContent); // Debugging log

    // Clean the content before sending
    const cleanedContent = this.sanitizeContent(this.editorContent);
    console.log('Editor Content after cleanup:', cleanedContent); // Debugging log

    if (this.selectedEventId) {
      const payload = {
        event_id: this.selectedEventId,
        content: cleanedContent,
      };

      // Call the service to save the content
      this.eventService.saveEventReport(payload).subscribe(
        response => {
          console.log('Content saved successfully!', response);
          this.showEditor = false;
        },
        error => {
          console.error('Error saving content:', error);
        }
      );
    } else {
      console.error('No event selected for saving content.');
    }
  }

  private sanitizeContent(content: string): string {
    // Remove empty paragraphs
    content = content.replace(/<p><\/p>/g, ''); 
    content = content.replace(/<p>\s*<\/p>/g, ''); 
    content = content.replace(/^<p>(.*?)<\/p>$/, '$1'); 
    return content.trim();
  }

  uploadFiles(): void {
    console.log('Selected Files:', this.selectedFiles);
    console.log('Selected Event:', this.selectedEvent);
  
    if (this.selectedFiles.length > 0 && this.selectedEvent) {
        console.log(`Uploading files for event: ${this.selectedEvent.title}`);
        const formData = new FormData();
        // Append each selected file to the FormData
        for (let i = 0; i < this.selectedFiles.length; i++) {
            formData.append(`files[]`, this.selectedFiles[i]);
        }
        if (this.selectedEvent && this.selectedEvent.id) {
            formData.append('event_id', this.selectedEvent.id.toString());
        } else {
            console.error('Selected event is not properly defined');
            return; // Early return if the event is not defined
        }
        formData.append('softcopy_type', '1'); // Hardcoded softcopy type
        // Call the service to upload files
        this.eventService.uploadFiles(formData).subscribe({
            next: (response) => {
                // Handle successful upload
                console.log('Files uploaded successfully:', response);
            
                this.selectedFileNames = []; 
                this.selectedEvent = null; // Optionally reset the selected event
            },
            error: (err) => {
                console.error('File upload error', err);
            }
        });
    } else {
        console.error('No files selected or event data is missing.');
    }
}
  showDetails(id: number): void {
    // Navigate to show detail after verification is successful
    const currentUrl = this.router.url;
    this.router.navigate(['/showdetail', id], {
      queryParams: { returnUrl: currentUrl }
    });
}

toggleUpload(eventId: number) {
  // Toggle visibility of the upload section for the given event ID
  this.showUploadMap[eventId] = !this.showUploadMap[eventId];
}
toggleEditor(eventId: number): void {
      this.selectedEventId = eventId;
      this.showEditorMap[eventId] = !this.showEditorMap[eventId];
      this.loadEventReport();

    }
    
applyFilter(): void {
  const filterValue = this.eventForm.get('title')?.value.trim().toLowerCase();
  this.events = this.events.filter(event => event.title.toLowerCase().includes(filterValue));
  this.paginateEvents();
}

paginateEvents(): void {
  const startIndex = this.currentPage * this.pageSize;
  const endIndex = startIndex + this.pageSize;
  this.paginatedEvents = this.events.slice(startIndex, endIndex);
  this.dataSource.data = this.paginatedEvents;
}

onPageChange(event: PageEvent): void {
  this.pageSize = event.pageSize;
  this.currentPage = event.pageIndex;
  this.paginateEvents();
}

onCancel(): void {
  this.eventForm.reset();
  this.dataSource.filter = ''; // Reset filter
}
deleteFile(index: number): void {
  this.selectedFileNames.splice(index, 1);
  this.selectedFiles.splice(index, 1);
}



resetForm(): void {
  this.selectedFiles = [];
  this.fileInput.nativeElement.value = '';  // Reset the file input element
  this.eventForm.reset();  // Reset the reactive form if necessary
}



goback(): void {
  this.router.navigate(['/event-master']);
}

}

