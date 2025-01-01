import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-assignwork',
  templateUrl: './assignwork.component.html',
  styleUrls: ['./assignwork.component.css']
})
export class AssignworkComponent implements OnInit {
  eventMasterProductDetails: any[] = [];
  eventMasterId: number | null = null;
  displayedColumns: string[] = ['category', 'serviceResponse', 'remarks'];
  eventmaster: any = {};

  constructor(private route: ActivatedRoute, private router: Router) { }


  ngOnInit(): void {
    const { eventMasterProductDetails, eventMasterId, event_master } = history.state || {};
    if (eventMasterProductDetails && eventMasterId) {
      this.eventMasterProductDetails = eventMasterProductDetails.filter(
        (productDetail: any) => productDetail.response_detail?.response !== 'NO'
      );
      this.eventMasterId = eventMasterId;
      this.eventmaster = event_master;

      // Debugging Outputs
     // console.log('Filtered Event Master Product Details:', this.eventMasterProductDetails);
      //console.log('Received Event Master ID:', this.eventMasterId);
     // console.log('Event Master Details:', this.eventmaster);
    } else {
      console.error('No state passed through router');
    }
  }
  goBack(): void {
    this.router.navigate(['/assigendstaff']);
  }
}
