import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { EventService } from 'src/app/service/event.service';
import { Event,SoftcopyType } from 'src/app/models/event';
import { ActivatedRoute } from '@angular/router';
import { ElementRef,  ViewChild } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';


@Component({
  selector: 'app-softcopy',
  templateUrl: './softcopy.component.html',
  styleUrls: ['./softcopy.component.css']
})
export class SoftcopyComponent implements OnInit {
  options = ['softcopy','report']; // Add more options as needed
  selectedOption: string = '';
  events: Event[] = [];
  softcopyTypes: SoftcopyType[] = [];
  softcopyDetails: any = null; // Change 'any' to the correct type as per your data structure
  error: string | null = null;
  eventId!: number; 
  returnUrl: string = '';
  @ViewChild('contentToConvert', { static: false }) contentToConvert!: ElementRef;
  

  constructor(
    private eventService: EventService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/default-return-route';
    });
    this.route.params.subscribe((params: any) => {
      this.eventId = +params['id']; // Fetch event ID from route parameters
      console.log('Event ID:', this.eventId);
      this.loadEvents(this.eventId);
     

    });
  }

  selectOption(option: string) {
    this.selectedOption = this.selectedOption === option ? '' : option;
  }

  loadEvents(eventId: number): void {
    this.eventService.getEvent(eventId).subscribe(
      (response: any) => {
        // Filter events based on the parent_id condition
        if (Array.isArray(response.events) && response.events.length > 0) {
          this.events = response.events.filter((event: Event) => event.parent_id === null);
        } else if (response.parent_id === null) {
          this.events = [response]; // Single event response
        } else {
          this.events = []; // No matching events found
        }

        console.log("Filtered events:", this.events);

        // Sanitize the event_report for each event
        this.events.forEach(event => {
          // event.event_report = this.sanitizer.bypassSecurityTrustHtml(event.event_report) as string; // Use type assertion

          // Fetch softcopy details if the event has a valid id
          this.eventService.getSoftcopyDetails(eventId, 1).subscribe(
            (data: any[]) => {
              const mappedDetails = data.map((softcopy: any) => {
                const fileUrl = `http://localhost/event/storage/app/${softcopy.filename}`;
                //console.log(fileUrl);
                return { ...softcopy, fileUrl, id: softcopy.id };
              });

              // Add softcopyDetails to the current event object
              (event as any).softcopyDetails = mappedDetails;
            },
            (error) => {
              console.error("Error loading softcopy details for event:", event.id, error);
            }
          );
        });
      },
      (error) => {
        console.error("Error loading events:", error);
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

  generatePDF(): void {
    const content = this.contentToConvert.nativeElement;
  
    html2canvas(content).then((canvas: HTMLCanvasElement) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
  
      const imgWidth = 190; // Reduce image width to account for 10mm left margin (210 - 10 - 10)
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
  
      let position = 0;
  
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight); // Set x to 10 for left margin
      heightLeft -= pageHeight;
  
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight); // Keep x at 10 for each page
        heightLeft -= pageHeight;
      }
  
      pdf.save('content.pdf');
    });
  }
  goback(): void {
    this.router.navigateByUrl(this.returnUrl);
  }

  
}
