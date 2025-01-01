import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventService } from 'src/app/service/event.service';
import { ActivatedRoute } from '@angular/router';
import { RejectionReason,BudgetDetail } from 'src/app/models/event';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-showdetail',
  templateUrl: './showdetail.component.html',
  styleUrls: ['./showdetail.component.css']
})
export class ShowdetailComponent implements OnInit {

  returnUrl: string = ''; // Declare returnUrl to store the value
  events: any[] = [];
  eventId!: number; 
  errorMessage: string = '';
  filteredEvents: any[] = []; 
  budgetDetailsMap: { [key: number]: { details: BudgetDetail[], totalAmount: number } } = {};
  rejectionDetails: RejectionReason[] = [];
  private eventsLoaded = false;
  showUploadMap: { [key: number]: boolean } = {};
  showEditorMap: { [key: number]: boolean } = {};
  public editorContent: string = '';
  public Editor = ClassicEditor;
  public editorData: string = '<p>Hello, world!</p>'; 
  public selectedEventId: number | null = null; 
  isPublic: boolean = false;
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
  assignedUsersVisible = false; 

  constructor(
    private eventService: EventService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/default-return-route';
    });
    this.route.params.subscribe((params: any) => {
      this.eventId = +params['id'];
    });
    this.fetchEvents(this.eventId);
  }
  isPastDate(date: string | Date | undefined): boolean {
    if (!date) {
      return false;
    }
    const eventDate = new Date(date);
    return eventDate < new Date();
  }

  togglePrivacy() {
    this.eventService.togglePrivacyStatus(this.eventId).subscribe(
      (response) => {
        console.log(response);
        this.isPublic = response.isPublic; // Update the local privacy status
        console.log('Privacy status updated:', this.isPublic ? 'Public' : 'Private');
      },
      (error) => {
        console.error('Error updating privacy status:', error);
      }
    );
  }


  fetchEvents(eventId: number): void {
    if (this.eventsLoaded) return; // Prevent duplicate calls
    this.eventsLoaded = true;
  
    this.eventService.getEvent(eventId).subscribe(
      (response) => {
        console.log(response);
        this.events = Array.isArray(response) && response.length > 0 ? response : [response];
  
        // Fetch details for each event rejection
        this.events.forEach((event) => {
          const eventMasterId = event.id;
          let user_id: number | null = null;  
         // Determine the user_id based on the event status
         if (event.status?.status === 'HOD-Rejected') {
             user_id = event.department?.hod_id;
         } else if (event.status?.status === 'Priest-Incharge-Rejected') {
             user_id = event.department?.priest_incharge_id;
         } else if (event.status?.status === 'Director-Rejected') {
             user_id = 7541; // Set to 7541 for Director-Rejected status
         }
          if (user_id !== null) {
            this.eventService.getRejectionDetails(event.id, user_id).subscribe(
              (rejectionData) => {
               // console.log(rejectionData);
                event.rejectionDetails = rejectionData;
              },
              (error) => {
                console.error('Error fetching rejection details for event:', event.id, error);
              }
            );
          } else {
            console.warn(`No valid user_id found for event ID: ${event.id}`);
          }
  
          // Fetch Assigned User Details
          if (eventMasterId) {
            this.eventService.getAssignedUser(eventMasterId, null).subscribe(
              (assignedUserResponse) => {
                if (assignedUserResponse.success) {
                  event.assignedUserDetails = assignedUserResponse.data;
                  console.log('Assigned User Details for Event:', event.assignedUserDetails);
                } else {
                  console.warn(
                    assignedUserResponse.message ||
                    `No assigned user details found for event ID: ${eventMasterId}`
                  );
                }
              },
              (error) => {
                console.error('Error fetching assigned user details:', error);
              }
            );
          } else {
            console.warn('Event Master ID is missing for event:', event);
          }
  
          // Fetch Budget Details
          this.eventService.getbudgetdetail(event.id).subscribe(
            (budgetData: BudgetDetail[]) => {
              if (Array.isArray(budgetData)) {
                const filteredBudgetDetails = budgetData.filter((budget) => budget.nos > 0);
                if (filteredBudgetDetails.length > 0) {
                  const totalAmount = filteredBudgetDetails.reduce(
                    (sum, item) => sum + item.nos * item.amount,
                    0
                  );
                  event.budgetDetails = filteredBudgetDetails;
                  event.totalAmount = totalAmount;
                } else {
                  console.warn(`No valid budget details found for event ${event.id}.`);
                }
              } else {
                console.warn('Unexpected budget detail data format:', budgetData);
              }
  
              // Fetch Product Details
              this.eventService.getmasterproduct(event.id).subscribe(
                (productDetails: any[]) => {
                  if (Array.isArray(productDetails)) {
                    const filteredProducts = productDetails.filter(
                      (product) => product.response_id?.response === 'YES'
                    );
                    event.productDetails = filteredProducts;
                  } else {
                    console.warn('Unexpected product detail data format:', productDetails);
                  }
  
                  // Fetch Softcopy Details
                  this.eventService.getSoftcopyDetails(event.id, 2).subscribe(
                    (softcopyData: any) => {
                      if (Array.isArray(softcopyData)) {
                        const mappedDetails = softcopyData.map((softcopy: any) => ({
                          ...softcopy,
                          fileUrl: `http://localhost/event/storage/app/${softcopy.filename}`,
                          id: softcopy.id,
                        }));
                        event.softcopyDetails = mappedDetails;
                      } else {
                        console.warn(
                          'Expected an array for softcopyData but received:',
                          softcopyData
                        );
                        event.softcopyDetails = []; // Default to an empty array if data is not an array
                      }
                    },
                    (error) => {
                      console.error('Error loading softcopy details for event:', event.id, error);
                      event.softcopyDetails = []; // Default to an empty array in case of an error
                    }
                  );
                },
                (error) => {
                  console.error('Error fetching product details for event:', event.id, error);
                }
              );
            },
            (error) => {
              console.error('Error fetching budget details for event:', event.id, error);
            }
          );
        });
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

  showbudget(id: number): void {
      const currentUrl = this.router.url;
      this.router.navigate(['/budgetshow', id], {
        queryParams: { returnUrl: currentUrl }
      });

  }
  showservice(id: number): void {
    const currentUrl = this.router.url;
    this.router.navigate(['/servicelist', id], {
      queryParams: { returnUrl: currentUrl }
    });
  }

  goback(): void {
    this.router.navigateByUrl(this.returnUrl);
  }
  
  toggleUpload(eventId: number): void {
    console.log('Toggling upload for event ID:', eventId);
    this.showUploadMap[eventId] = !this.showUploadMap[eventId];
    this.fetchEvents(eventId);
}

  

  toggleEditor(eventId: number): void {
    this.showEditorMap[eventId] = !this.showEditorMap[eventId];
    this.loadEventReport(eventId);
  }

  
  loadEventReport(eventId: number): void {
  
    if (typeof eventId === 'number') {
      this.eventService.getEventReport(eventId).subscribe(
        response => {
          if (typeof response === 'string') {
            this.editorContent = response; 
          } else if (response && typeof response.content === 'string') {
            this.editorContent = response.content; 
          } else {
            console.error('Unexpected response format', response);
          }
        },
        error => {
          console.error('Error fetching content:', error);
          this.editorContent = ''; 
        }
      );
    } else {
      console.error('Invalid or null event ID.');
      this.editorContent = ''; 
    }
  }
  saveContent(eventId: number): void {
    const cleanedContent = this.sanitizeContent(this.editorContent);
    if (eventId) {
      const payload = {
        event_id: eventId,
        content: cleanedContent,
      };

      this.eventService.saveEventReport(payload).subscribe(
        response => {
         
          this.showEditorMap[eventId] = false; 
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
    content = content.replace(/<p><\/p>/g, ''); 
    content = content.replace(/<p>\s*<\/p>/g, ''); 
    content = content.replace(/^<p>(.*?)<\/p>$/, '$1'); 
    return content.trim();
  }
  VenueEdit(id: number): void {
    const currentUrl = this.router.url;
    this.router.navigate(['/venueedit', id], {
      queryParams: { returnUrl: currentUrl }
    });
  }
  contactview(eventMasterId: number): void {
    const currentUrl = this.router.url;
    this.router.navigate(
      ['/serviceperson', eventMasterId],
      { queryParams: { returnUrl: currentUrl } } // Properly placed queryParams
    );
  }


  

  
}
