import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BudgetDetail } from 'src/app/models/event';
import { EventService } from 'src/app/service/event.service';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-subevent',
  templateUrl: './subevent.component.html',
  styleUrls: ['./subevent.component.css']
})
export class SubeventComponent implements OnInit {

  returnUrl: string = ''; 
  events: any[] = [];
  eventId!: number; 
  errorMessage: string = '';
  filteredEvents: any[] = []; 
  budgetDetailsMap: { [key: number]: { details: BudgetDetail[], totalAmount: number } } = {};
  displayedColumns: string[] = ['category', 'nos', 'amount'];
  footerColumns: string[] = ['category', 'nos', 'amount'];
  showUploadMap: { [key: number]: boolean } = {};

  constructor(
    private eventService: EventService,
    private route: ActivatedRoute,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const returnUrl = params['returnUrl'] || '/defaultPath'; // fallback if returnUrl doesn't exist
    });

    // Retrieve event ID from route parameters
    this.route.params.subscribe(params => {
      this.eventId = +params['id']; // Get event ID from route
      console.log('Event ID:', this.eventId);
    });

    // Fetch events and budget details based on eventId
    this.fetchEvents(this.eventId);
  }

  fetchEvents(eventId: number): void {
    this.eventService.getEvent(eventId).subscribe(
      (response: any) => {
        if (Array.isArray(response.events) && response.events.length > 0) {
          this.events = response.events;
        } else {
          this.events = [response];
        }
      },
      (error: any) => {
        this.errorMessage = error.error?.message || 'Error loading events';
      }
    );
  }
  
 

  
  goBack(): void {
    this.route.queryParams.subscribe(params => {
      const returnUrl = params['returnUrl'] || '/defaultPath';
      this.router.navigateByUrl(returnUrl);
    });
  }
  showDetails(id: number): void {
    const currentUrl = this.router.url;
    this.router.navigate(['/showdetail', id], {
      queryParams: { returnUrl: currentUrl }
    });
}

}  