import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { EventService } from 'src/app/service/event.service';
import { EventSupport, Product } from 'src/app/models/event';
import { MatStepper } from '@angular/material/stepper';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-service-form',
  templateUrl: './service-form.component.html',
  styleUrls: ['./service-form.component.css']
})
export class ServiceFormComponent implements OnInit {
  @Input() stepper!: MatStepper;
  @Input() formGroup!: FormGroup;
  @Output() serviceCategoryData = new EventEmitter<any[]>(); // Output property to emit serviceCategory array

  groupedCategoryProducts: { [key: string]: any[] } = {};
  eventSupports: { [key: string]: string } = {};

  constructor(
    private eventService: EventService, 
    private router: Router,
    private fb: FormBuilder) {}

  ngOnInit(): void {
    this.eventService.getCategoryProduct().subscribe((data) => {
      this.groupCategoryProducts(data);
    });

    this.eventService.getEventSupport().subscribe((data: EventSupport[]) => {
      this.eventSupports = {};
      data.forEach(support => {
        this.eventSupports[support.id] = support.name;
      });
    });
  }

  private groupCategoryProducts(products: Product[]): void {
    this.groupedCategoryProducts = {};
  
    products.forEach(product => {
      const countControl = new FormControl(product.count || null);
      const remarksControl = new FormControl(product.remarks || '');
      this.formGroup.addControl(`count_${product.id}`, countControl);
      this.formGroup.addControl(`remarks_${product.id}`, remarksControl);
      if (product.eventresponcemaster) {
        const responseMaster = product.eventresponcemaster;
        const responseDetails = responseMaster.eventresponcedetail || [];
        const options = responseDetails.map(detail => String(detail.response));
        const defaultOption = responseDetails.find(detail => detail.default === 1)?.response || '';
        const selectedResponseDetail = responseDetails.find(detail => detail.default === 1);
        product.response_id = selectedResponseDetail ? selectedResponseDetail.id : null;
        product.form_field_type = responseMaster.type;
        product.radio_options = options;
        product.defaultOption = String(defaultOption);
      }
      if (!this.groupedCategoryProducts[product.supporting_category_id]) {
        this.groupedCategoryProducts[product.supporting_category_id] = [];
      }
      this.groupedCategoryProducts[product.supporting_category_id].push(product);
    });
    this.emitServiceCategoryData();
  }
  
  onRadioChange(event: any, product: Product): void {
    
    product.selectedOption = event.value;
    const selectedResponseDetail = product.eventresponcemaster?.eventresponcedetail.find(
      detail => String(detail.response) === event.value
    );
    product.response_id = selectedResponseDetail ? selectedResponseDetail.id : null;
    if (product.form_field_type === 'radio_with_count') {
      if (product.selectedOption === 'YES') {
        product.showCountInput = true;
        this.formGroup.get(`count_${product.id}`)?.setValue(product.count);
        this.formGroup.get(`count_${product.id}`)?.valueChanges.subscribe((value: number) => {
          product.count = value; 
          this.emitServiceCategoryData(); 
        });
  
      } else {
        product.count === null; 
        this.formGroup.get(`count_${product.id}`)?.setValue(null); 
        product.showCountInput = false; 
      }
    }
    if (product.form_field_type === 'radio_with_count_remarks') {
      if (product.selectedOption === 'YES') {
        product.showCountInput = true; 
        product.showSpecialInput = true; 
        this.formGroup.get(`count_${product.id}`)?.setValue(product.count);
        this.formGroup.get(`count_${product.id}`)?.valueChanges.subscribe((value: number) => {
          product.count = value; 
          this.emitServiceCategoryData(); 
        });
        product.remarks = product.remarks || '';
        this.formGroup.get(`remarks_${product.id}`)?.setValue(product.remarks);
  
      } else {
        product.count === null; 
        this.formGroup.get(`count_${product.id}`)?.setValue(null); 
        product.remarks = ''; 
        this.formGroup.get(`remarks_${product.id}`)?.setValue(''); 
        product.showCountInput = false; 
        product.showSpecialInput = false; 
      }
    }
    this.emitServiceCategoryData();
  }

  private emitServiceCategoryData(): void {
    // Clear existing validation errors
    Object.keys(this.groupedCategoryProducts).forEach(key => {
      this.groupedCategoryProducts[key].forEach(product => {
        product.validationErrors = []; // Initialize or clear errors
      });
    });
  
    const serviceCategory = Object.keys(this.groupedCategoryProducts).flatMap(key => {
      return this.groupedCategoryProducts[key].map(product => {
        const responseId = product.response_id || null;
        const count = this.formGroup.get(`count_${product.id}`)?.value ?? null;
        const remarks = this.formGroup.get(`remarks_${product.id}`)?.value ?? null;
  
        // Add validation errors
        if (responseId && product.form_field_type === 'radio_with_count') {
          if (count === null) {
            product.validationErrors.push('Count is required.');
          } else {
            if (count <= 0) {
              product.validationErrors.push('Count must be greater than zero.');
            }
            if (!Number.isInteger(count)) {
              product.validationErrors.push('Count must be an integer.');
            }
          }
        }
        if (responseId && product.form_field_type === 'radio_with_count_remarks') {
          if (count === null) product.validationErrors.push('Count is required.');
          if (!remarks) product.validationErrors.push('Remarks are required.');
        }
  
        return {
          category_product_id: product.id,
          response_id: responseId,
          count,
          remarks,
        };
      });
    });
  
    this.serviceCategoryData.emit(serviceCategory);
  }
  

}


