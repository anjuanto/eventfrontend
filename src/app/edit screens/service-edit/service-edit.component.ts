import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EventSupport, Product, EventMasterProductDetail } from 'src/app/models/event';
import { EventService } from 'src/app/service/event.service';
import { Validators } from '@angular/forms'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-service-edit',
  templateUrl: './service-edit.component.html',
  styleUrls: ['./service-edit.component.css']
})
export class ServiceEditComponent implements OnInit {
  eventForm!: FormGroup;
  groupedCategoryProducts: { [categoryId: number]: Product[] } = {};
  finalFormData: { serviceCategory: any[] } = { serviceCategory: [] };
  groupedByCategory: { [key: number]: EventMasterProductDetail[] } = {};
  eventMasterId!: number;
  eventSupports: EventSupport[] = []; 
  returnUrl: string = ''; 

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private eventService: EventService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.eventForm = this.fb.group({});
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/default-return-route';
    });
  
    this.route.params.subscribe(params => {
      this.eventMasterId = +params['id'];
      console.log('EventMasterId:', this.eventMasterId);
    });
  
    this.eventService.getEventSupport().subscribe((data: EventSupport[]) => {
      this.eventSupports = data;
    });

    this.eventService.getmasterproduct(this.eventMasterId).subscribe(
      (data: EventMasterProductDetail[]) => {
        if (data && Array.isArray(data)) {
          console.log('Fetched products:', data);
          // Initialize form controls with fetched data
          this.productdetail(data);
        } else {
          console.warn('Unexpected data format:', data);
        }
      },
      (error: any) => {
        console.error('Error fetching products', error);
      }
    );
  }


  private productdetail(productdetails: EventMasterProductDetail[]): void {
    this.groupedByCategory = {};
    productdetails.forEach(productDetail => {
      if (productDetail.response_id) {
        const responseId = productDetail.response_id;
        if (responseId.response_master_id) {
          const responseMaster = responseId.response_master_id;
          productDetail.form_field_type = responseMaster.type || '';
          productDetail.radio_options = [];
          productDetail.defaultOption = '';
          if (responseMaster.eventresponcedetail && Array.isArray(responseMaster.eventresponcedetail)) {
            productDetail.radio_options = responseMaster.eventresponcedetail.map((detail: any) => detail.response);
            productDetail.defaultOption = responseId.response || '';
          } else {
            console.warn('Response details should be an array:', responseMaster.eventresponcedetail);
          }
        }
      }
      if (productDetail.category_product) {
        const category = productDetail.category_product;
        if (category.supporting_category_id) {
          const supportingCategoryId = category.supporting_category_id;
          if (!this.groupedByCategory[supportingCategoryId]) {
            this.groupedByCategory[supportingCategoryId] = [];
          }
          this.groupedByCategory[supportingCategoryId].push(productDetail);
          productDetail.count = productDetail.count ;
          productDetail.remarks = productDetail.remarks;
          const countControlName = `count_${productDetail.id}`;
          if (!this.eventForm.contains(countControlName)) {
            this.eventForm.addControl(
              countControlName,
              new FormControl(productDetail.count, [
                Validators.required,
                Validators.min(1),
                Validators.pattern('^[0-9]+$')
              ])
            );
          }
  
          const remarksControlName = `remarks_${productDetail.id}`;
          if (productDetail.form_field_type === 'radio_with_count_remarks' && !this.eventForm.contains(remarksControlName)) {
            this.eventForm.addControl(
              remarksControlName,
              new FormControl(productDetail.remarks)
            );
          }
        }
      }
    });
  }
  
  onRadioChange(event: any, productDetail: EventMasterProductDetail): void {
    productDetail.selectedOption = event.value;
    if (!productDetail.response_id || !productDetail.response_id.response_master_id) {
      console.error('response_id or response_master_id is missing in productDetail:', productDetail);
      return; 
    }
  
    const responseMaster = productDetail.response_id.response_master_id;
    if (!responseMaster.eventresponcedetail) {
      console.warn('eventresponcedetail is missing for response_master_id:', responseMaster);
      return; 
    }
    const responseDetails = responseMaster.eventresponcedetail;
    if (!Array.isArray(responseDetails)) {
      console.warn('Response details should be an array but are invalid:', responseDetails);
      return; 
    }

    const selectedResponseDetail = responseDetails.find(detail => detail.response === productDetail.selectedOption);
  
    if (selectedResponseDetail) {
      productDetail.response_id = {
        id: selectedResponseDetail.id,        
        response_master_id: responseMaster,   
        response: selectedResponseDetail.response, 
        value: selectedResponseDetail.value,  
        default: selectedResponseDetail.default || 0 
      };
  
      // Optionally, log the updates for debugging
      //console.log('Updated productDetail.response_id:', productDetail.response_id);
    } else {
      console.error('No matching response detail found for the selected option:', productDetail.selectedOption);
    }
  
    // Log the final state of the product detail after the radio change
   // console.log('Final product after radio change:', productDetail);
  }
  
  getSupportingCategoryNameById(id: number): string {
    const category = this.eventSupports.find((cat: EventSupport) => cat.id === id);
    return category ? category.name : 'Unknown Supporting Category';
  }
  getCategoryIds(): number[] {
    return Object.keys(this.groupedByCategory).map(id => Number(id));
  }

  onsubmit() {
    
    const data = Object.keys(this.groupedByCategory).flatMap(key => {
      return this.groupedByCategory[Number(key)].map(productDetail => {
        const count = this.eventForm.get(`count_${productDetail.id}`)?.value;
        const countValue = count === '0' || count === 0 || count === undefined || count === "" ? null : count;
        const remarks = this.eventForm.get(`remarks_${productDetail.id}`)?.value;
        const remarksValue = remarks === "" || remarks === undefined ? null : remarks;
        return {
          id: productDetail.id,
          event_master_id: productDetail.event_master_id,
          category_product_id: productDetail.category_product_id,
          response_id: productDetail.response_id ? productDetail.response_id.id : null,
          count: countValue,
          remarks: remarksValue  
        };
      });
    });
  
    console.log("data", data);
    const eventMasterId = this.eventMasterId;
    if (!eventMasterId) {
      console.error('Event Master ID is missing');
      return;
    }
    this.eventService.masterproductupdate(eventMasterId, data).subscribe(
      response => {
        console.log('Update successful', response);
        this.router.navigate(['/budgetedit', this.eventMasterId], { queryParams: { returnUrl: this.returnUrl } });
      },
      error => {
        console.error('Update failed', error);
      }
    );
  }

  onBack(): void {
    this.router.navigate(['/venueedit', this.eventMasterId], { queryParams: { returnUrl: this.returnUrl } });
  }

}


 // onsubmit() {
  //   // Prepare the data
  //   const data = Object.keys(this.groupedByCategory).flatMap(key => {
  //     return this.groupedByCategory[Number(key)].map(productDetail => {
  //       return {
  //         id: productDetail.id,
  //         event_master_id: productDetail.event_master_id,
  //         category_product_id: productDetail.category_product_id,
  //         response_id: productDetail.response_id ? productDetail.response_id.id : null,
  //         count: this.eventForm.get(`count_${productDetail.id}`)?.value , // Retrieve count from form control, default to 0 if not set
  //         remarks: this.eventForm.get(`remarks_${productDetail.id}`)?.value  // Retrieve remarks from form control, default to empty string
  //       };
  //     });
  //   });
  
  //   console.log("data", data);
  
  //   // Use this.eventMasterId directly
  //   const eventMasterId = this.eventMasterId;
  
  //   // Check if eventMasterId is valid
  //   if (!eventMasterId) {
  //     console.error('Event Master ID is missing');
  //     return;
  //   }
  
  //   // Submit the form data to the backend
  //   this.eventService.masterproductupdate(eventMasterId, data).subscribe(
  //     response => {
  //       console.log('Update successful', response);
  //      // this.router.navigate(['/budgetedit', this.eventMasterId]);
  //       this.router.navigate(['/budgetedit', this.eventMasterId], { queryParams: { returnUrl: this.returnUrl } });
    
  //       // Handle response
  //     },
  //     error => {
  //       console.error('Update failed', error);
  //     }
  //   );
  // }