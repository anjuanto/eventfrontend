import { Component, OnInit } from '@angular/core';
import { ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { EventService } from 'src/app/service/event.service';
import { ActivatedRoute } from '@angular/router';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-servicelist',
  templateUrl: './servicelist.component.html',
  styleUrls: ['./servicelist.component.css']
})
export class ServicelistComponent implements OnInit {

  returnUrl: string = ''; // Declare returnUrl to store the value
  events: any[] = [];
  eventId!: number; 
  errorMessage: string = '';
  filteredEvents: any[] = [];
  @ViewChild('contentToConvert', { static: false }) contentToConvert!: ElementRef;

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

    // Fetch events based on eventId
    this.fetchEvents(this.eventId);
  }

  fetchEvents(eventId: number): void {
    this.eventService.getEvent(eventId).subscribe(
      (response: any) => {
        if (Array.isArray(response.events) && response.events.length > 0) {
          this.events = response.events;
        } else {
          this.events = [response];
          console.log(this.events);
        }
  
       // Fetch product details for each event
this.events.forEach(event => {
  this.eventService.getmasterproduct(event.id).subscribe(
    (productDetails: any[]) => {
      if (Array.isArray(productDetails)) {
        console.log(productDetails);
        
        // Filter out products where the response is 'NO'
        const filteredDetails = productDetails.filter(
          product => product.response_id.response !== 'NO'
        );

        // Assign the filtered product details to the event
        event.productDetails = filteredDetails;
      } else {
        console.warn('Unexpected product detail data format:', productDetails);
      }
    },
    (error: any) => {
      console.error('Error fetching product details for event:', event.id, error);
    }
  );
});

      },
      (error: any) => {
        this.errorMessage = error.error?.message || 'Error loading events';
      }
    );
  }
  
  goBack() {
    this.route.queryParams.subscribe(params => {
      const returnUrl = params['returnUrl'] || '/defaultPath';
      this.router.navigateByUrl(returnUrl);
    });
  }

  generatePDF(): void {
    const content = this.contentToConvert.nativeElement; // Get the content to convert

    html2canvas(content).then((canvas: HTMLCanvasElement) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4'); // A4 size

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('content.pdf');
    });
  }
}
