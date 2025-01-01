import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from 'src/app/service/event.service';

interface DepartmentDetail {
  department_name: string;
  category_product_ids: number[];
}

@Component({
  selector: 'app-serviceperson',
  templateUrl: './serviceperson.component.html',
  styleUrls: ['./serviceperson.component.css']
})
export class ServicepersonComponent implements OnInit {

  event_master_id: number | null = null;
  returnUrl: string | null = null;
  departmentNames: string[] = [];  // Array to store department names
  departmentDetails: any = {};
  departmentIds: any =[];  // To store the department details
  loading: boolean = false;
  assignedUserDetails: any = null;
  assignedUsersByDepartment: any = null;
  
  data: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    this.event_master_id = Number(this.route.snapshot.paramMap.get('eventMasterId'));

    if (this.event_master_id) {
      this.fetchDepartmentDetails();
    } else {
      console.error('Invalid eventMasterId');
    }
  }


  // fetchDepartmentDetails(): void {
  //   if (this.event_master_id === null) {
  //     console.error('eventMasterId is null');
  //     return; // Exit the function if eventMasterId is null
  //   }
  
  //   this.loading = true;
  //   this.eventService.getDepartmentDetails(this.event_master_id).subscribe(
  //     (response) => {
  //       console.log('Service response:', response);
  //       this.data = response.data;  // Access 'data' from the response object
  
  //       if (this.data && this.data.department_details) {
  //         this.departmentNames = Object.keys(this.data.department_details);
  //         this.departmentDetails = this.data.department_details; // Store the details for further use
  //         this.depatment_ids = this.data.department_ids;
  //         this.assignedUsersByDepartment = {}; // Initialize assigned users
  //         this.depatment_ids.forEach((departmentId: number) => {
  //           if (this.event_master_id !== null) {
  //             this.eventService.getAssignedUser(this.event_master_id, departmentId).subscribe(
  //               (response) => {
  //                 if (response.success) {
  //                   console.log(`Assigned users for department ${departmentId}:`, response);
  //                   this.assignedUsersByDepartment = response.data.map((item: any) => item.user.name);
  //                   console.log(this.assignedUsersByDepartment);
  //                 } else {
  //                   console.log(`No assigned users for Department ID ${departmentId}`);
  //                   this.assignedUsersByDepartment[departmentId] = []; // Empty array if no users
  //                 }
  //               },
  //               (error) => {
  //                 console.error(`Error fetching assigned users for Department ID ${departmentId}:`, error);
  //               }
  //             );
  //           } else {
  //             console.error('Event master ID is null');
  //           }
  //         });
  //       } else {
  //         console.error('department_details not found in response data');
  //       }
  
  //       this.loading = false;
  //     },
  //     (error) => {
  //       console.error('Error fetching department details:', error);
  //       this.loading = false;
  //     }
  //   );
  // }
  
  fetchDepartmentDetails(): void {
    if (!this.event_master_id) {
      console.error('Event Master ID is null');
      return;
    }
  
    this.loading = true;
    this.eventService.getDepartmentDetails(this.event_master_id).subscribe(
      (response) => {
        console.log('Service response:', response);
  
        if (response.success && response.data) {
          this.data = response.data;
          this.departmentDetails = response.data.department_details;
          this.departmentIds = response.data.department_ids;
  
          this.departmentIds.forEach((departmentId: number) => {
            if (this.event_master_id !== null) {
              this.eventService.getAssignedUser(this.event_master_id, departmentId).subscribe(
                (userResponse) => {
                  console.log(userResponse);
                  if (userResponse.success && userResponse.data) {
                    // Combine user name and mobile number into objects
                    const userDetails = userResponse.data.map((user: any) => ({
                      name: user.user.name,
                      mobile_no: user.user.mobile_no,
                    }));
          
                    console.log(userDetails);
          
                    // Ensure each department gets updated once
                    Object.keys(this.departmentDetails).forEach((key) => {
                      const departmentArray = this.departmentDetails[key];
                      if (departmentArray && departmentArray.length > 0) {
                        // Assign users only to the first department item in the array
                        if (
                          departmentArray[0].event_product_department &&
                          departmentArray[0].event_product_department.department_id === departmentId &&
                          !departmentArray[0].assignedUsers // Prevent re-assignment
                        ) {
                          departmentArray[0].assignedUsers = userDetails; // Assign user details
                        }
                      }
                    });
                  }
                },
                (error) => {
                  console.error(`Error fetching users for Department ID ${departmentId}:`, error);
                }
              );
            }
          });
          
          
        } else {
          console.error('Invalid response or missing department details');
        }
        this.loading = false;
      },
      (error) => {
        console.error('Error fetching department details:', error);
        this.loading = false;
      }
    );
  }
  
  
  
  

  goback(): void {
    // Navigate to returnUrl if it exists, otherwise fallback
    if (this.returnUrl) {
      this.router.navigateByUrl(this.returnUrl);
    } else {
      console.error('No return URL provided');
    }
  }
}
