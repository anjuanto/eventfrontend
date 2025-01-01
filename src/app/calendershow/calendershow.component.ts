import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventService } from 'src/app/service/event.service';
import { ActivatedRoute } from '@angular/router';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-calendershow',
  templateUrl: './calendershow.component.html',
  styleUrls: ['./calendershow.component.css']
})
export class CalendershowComponent implements OnInit {

  returnUrl: string = ''; 
  events: any[] = [];
  eventId!: number; 
  errorMessage: string = '';
  filteredEvents: any[] = []; 
  private eventsLoaded = false;



  constructor(
    private eventService: EventService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get the return URL from the query parameters
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/default-return-route';
    });
    this.route.params.subscribe((params: any) => {
      this.eventId = +params['id']; 
     // console.log('Event ID:', this.eventId);
    });
    this.fetchEvents(this.eventId);
  }


  fetchEvents(eventId: number): void {
    if (this.eventsLoaded) return; // prevent duplicate calls
    this.eventsLoaded = true;
  
    this.eventService.getEvent(eventId).subscribe(
      response => {
        console.log(response);
        this.events = Array.isArray(response) && response.length > 0 ? response : [response];
      
      },
      (error) => {
        this.errorMessage = error.error?.message || 'Error loading events';
      }
    );
  }
  isPDF(filename: string): boolean {
    return filename.toLowerCase().endsWith('.pdf');
  }
  
  isImage(filename: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.jfif'];
    return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  }
  getFileUrl(softcopy: any): string {
    const baseUrl = 'http://localhost/event/storage/app/';
    return baseUrl + softcopy.filename;
  }

 

  showsub(id: number): void {

    const currentUrl = this.router.url;
    this.router.navigate(['/subevent', id], {
      queryParams: { returnUrl: currentUrl }
    });
  }




  goback(): void {
    this.router.navigateByUrl(this.returnUrl);
  }
  
}

