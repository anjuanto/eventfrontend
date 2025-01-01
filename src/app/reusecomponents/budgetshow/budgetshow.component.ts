import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BudgetDetail } from 'src/app/models/event';  // Ensure the model exists
import { EventService } from 'src/app/service/event.service';  // Ensure the service is implemented
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-budgetshow',
  templateUrl: './budgetshow.component.html',
  styleUrls: ['./budgetshow.component.css']
})
export class BudgetshowComponent implements OnInit {

  returnUrl: string = ''; // Store return URL
  events: any[] = []; // Array to store events
  eventId!: number; // Event ID from route
  errorMessage: string = ''; // Error message display
  displayedColumns: string[] = ['category', 'nos', 'amount']; // Columns for budget table
  footerColumns: string[] = ['category', 'nos', 'amount']; // Footer columns for totals

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
    // Call service to fetch event details
    this.eventService.getEvent(eventId).subscribe(
      (response: any) => {
        if (Array.isArray(response.events) && response.events.length > 0) {
          this.events = response.events;
        } else {
          this.events = [response]; // Handle case where a single event is returned
        }

        // Process each event and fetch its budget details
        this.events.forEach(event => {
          this.eventService.getbudgetdetail(event.id).subscribe(
            (budgetData: BudgetDetail[]) => {
              if (Array.isArray(budgetData)) {
                // Filter budget details to only include those with `nos > 0`
                const filteredBudgetDetails = budgetData.filter(budget => budget.nos > 0);
                
                if (filteredBudgetDetails.length > 0) {
                  // Calculate total amount for the event
                  const totalAmount = filteredBudgetDetails.reduce(
                    (sum, item) => sum + (item.nos * item.amount), 0
                  );

                  // Attach budget details and total amount to the event
                  event.budgetDetails = filteredBudgetDetails;
                  event.totalAmount = totalAmount;
                  event.showBudget = true;  // Flag to control display of budget
                } else {
                  console.warn(`No budget details found for event ${event.id} with nos > 0.`);
                }
              }
            },
            (error) => {
              console.error(`Error fetching budget details for event ${event.id}:`, error);
            }
          );
        });
      },
      (error) => {
        this.errorMessage = 'Error fetching events: ' + error.message;
        console.error(this.errorMessage);
      }
    );
  }
  
  // Toggle showing budget details
  toggleBudgetDetails(event: any): void {
    event.showBudget = !event.showBudget;
  }

  goBack() {
    this.route.queryParams.subscribe(params => {
      const returnUrl = params['returnUrl'] || '/defaultPath';
      this.router.navigateByUrl(returnUrl);
    });
  }
}
