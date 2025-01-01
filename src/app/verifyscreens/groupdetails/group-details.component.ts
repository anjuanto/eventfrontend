import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventService } from 'src/app/service/event.service';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/confirmation-dialog/confirmation-dialog.component';




@Component({
  selector: 'app-group-details',
  templateUrl: './group-details.component.html',
  styleUrls: ['./group-details.component.css'],
})
export class GroupDetailsComponent implements OnInit {
  
  groupKey: string | null  = null;
  groupDetails: any = null;
  filteredGroupDetails: any = [];
  excludedResponse: string = 'NO'; // Configurable or dynamically fetched
  departments: any[] = [];
  users: { [key: number]: any[] } = {}; 
  filteredUsers: { [key: number]: any[] } = {}; 
  selectedUsers: { [key: number]: any[] } = {}; 
  userSearchControl: { [key: number]: FormControl } = {};
  assignedUsers: any[] | null = null;
  eventMasterDetails: any = null; 

  constructor(private route: ActivatedRoute,
    private snackBar: MatSnackBar,
     private router: Router, 
     private eventService: EventService,
     private dialog: MatDialog) {}

  ngOnInit(): void {
    this.groupKey = this.route.snapshot.paramMap.get('groupKey');
    console.log('Group Key (Event ID):', this.groupKey);
  
    const groupedData = localStorage.getItem('groupedData');
    if (groupedData && this.groupKey) {
 
      const parsedData = JSON.parse(groupedData);


        // Fetch eventMaster details for the specific groupKey
        this.eventMasterDetails = parsedData[this.groupKey]?.eventMaster;

        // Check if eventMasterDetails exists and log the details
        if (this.eventMasterDetails) {
          console.log('Event Master Details for Group:', this.eventMasterDetails);
        } else {
          console.error('No eventMaster details found for the group:', this.groupKey);
        }

      const categoryDetails = parsedData[this.groupKey]?.categoryDetails;
      
     // Fetch categoryDetails details from the specific groupKey
      if (categoryDetails && typeof categoryDetails === 'object') {
        // Flatten and group details by department_id
        const allGroups = Object.values(categoryDetails).flat();
        console.log('All Groups:', allGroups);
        this.filteredGroupDetails = allGroups.reduce((acc: any, item: any) => {
          const deptId = item.department_id;
            // Check if the item should be excluded
  if (item.master_product_detail?.response_detail?.response === 'NO') {
    return acc; // Skip this item if the condition is met
  }

          if (!acc[deptId]) {
            acc[deptId] = [];
          }
          acc[deptId].push(item);
          return acc;
        }, {});
  
        // Initialize user search control for each group
        allGroups.forEach((group: any) => {
          if (!this.userSearchControl[group.department_id]) {
            this.userSearchControl[group.department_id] = new FormControl('');
          }
        });
  
        // Call checkAssignedUsers for each department
        Object.keys(this.filteredGroupDetails).forEach((deptId) => {
          this.checkAssignedUsers(Number(this.groupKey), Number(deptId));
        });
  
        console.log('Filtered Group Details:', this.filteredGroupDetails);
      } else {
        console.error('Category details are not in the expected format:', categoryDetails);
      }
    } else {
      console.error('No group data found in localStorage or invalid groupKey.');
    }

}
  

  // for heading 
getDepartmentName(departmentId: number): string {
    const group = this.filteredGroupDetails[departmentId];
    if (group && group.length > 0) {
      return group[0]?.department_details?.departmentName || 'Unknown';
    }
    return 'Unknown';
}

// fetchUsers(departmentId: number): void {
//     this.eventService.getUsersByDepartment(departmentId).subscribe(
//       (response) => {
//         this.users[departmentId] = response;
//         this.filteredUsers[departmentId] = [...response]; // Initialize filtered list
//         if (!this.userSearchControl[departmentId]) {
//           this.userSearchControl[departmentId] = new FormControl('');
//         }
//       },
//       (error) => {
//         console.error('Error loading users for department', departmentId, error);
//       }
//     );
// }
fetchUsers(departmentId: number): void {
  this.eventService.getUsersByDepartment(departmentId).subscribe(
    (response) => {
      const assignedUserIds = this.selectedUsers[departmentId]?.map((user) => user.id) || [];
      
      // Filter out assigned users from the fetched user list
      this.users[departmentId] = response.filter(
        (user: any) => !assignedUserIds.includes(user.id)
      );
      
      // Initialize the filtered list
      this.filteredUsers[departmentId] = [...this.users[departmentId]];
      
      if (!this.userSearchControl[departmentId]) {
        this.userSearchControl[departmentId] = new FormControl('');
      }
      
     // console.log(`Filtered user list for department ${departmentId}:`, this.filteredUsers[departmentId]);
    },
    (error) => {
      console.error('Error loading users for department', departmentId, error);
    }
  );
}


assignUsersToGroup(departmentId: number): void {
  const selectedUsersForDepartment = this.selectedUsers[departmentId];
  if (!selectedUsersForDepartment || selectedUsersForDepartment.length === 0) {
    console.error('No users selected for this department');
    return;
  }
  // Log groupKey to ensure it is correct
  console.log('Group Key (event_master_id):', this.groupKey);
  const eventMasterId = Number(this.groupKey);
  const department = Number(departmentId); // Ensure it's a number

  if (isNaN(eventMasterId) || isNaN(department)) {
    console.error('Invalid IDs:', { eventMasterId, department });
    return; 
  }
  // Loop through the selected users and send individual requests for each one
  selectedUsersForDepartment.forEach((user) => {
    const formData = {
      event_master_id: eventMasterId, 
      department_id: department, 
      user_id: user.id, 
      isAssigned: true, 
    };
  
    // Send the data to the backend for each user
    this.eventService.createEventAssignedUser(formData).subscribe(
      (response: any) => {
        this.snackBar.open(response.message, 'Close', {
          duration: 3000, 
        });
        //console.log( response);
        this.filterUsers('', departmentId!);
      },
      (error) => {
        console.error('Error assigning user to group:', error);
      }
    );
  });

}

navigateBack(): void {
  this.router.navigate(['/software']);
}

checkAssignedUsers(eventMasterId: number, departmentId: number ): void {
  this.eventService.getAssignedUser(eventMasterId, departmentId).subscribe({
    next: (response: any) => {
      if (response.success && response.data) {
        console.log(`Assigned users for event ${eventMasterId}:`, response.data);
        // Initialize selected users with already assigned users
        this.selectedUsers[departmentId!] = response.data.map((user: any) => ({
          id: user.user.id,  
          name: user.user.name || 'Unknown',
          isAssigned: true, 
        }));
        // Update the filtered users list
        this.filterUsers('', departmentId!);
        this.fetchUsers(departmentId);
        
      } else {
      //  console.log(`No users assigned for event ${eventMasterId}.`);
        this.selectedUsers[departmentId!] = [];
      }
    },
    error: (error) => {
      console.error('Error checking assigned users:', error);
    },
  });
}

filterUsers(searchText: string, departmentId: number): void {
  const users = this.users[departmentId] || [];
  const assignedUserIds = this.selectedUsers[departmentId]?.map((user) => user.id) || [];
  
  // Filter out users who are already assigned and those that don't match the search text
  this.filteredUsers[departmentId] = users
    .filter((user) => !assignedUserIds.includes(user.id)) // Exclude assigned users
    .filter((user) => user.name.toLowerCase().includes(searchText.toLowerCase())); // Filter based on search text
  //console.log('Filtered Users:', this.filteredUsers[departmentId]);
}


selectUser(user: any, departmentId: number): void {
  if (!this.selectedUsers[departmentId]) {
    this.selectedUsers[departmentId] = [];
  }
  if (!this.selectedUsers[departmentId].some((u) => u.id === user.id)) {
    this.selectedUsers[departmentId].push(user);
  }
  this.userSearchControl[departmentId].setValue('');
  this.filterUsers('', departmentId); // Update filtered list after selection
  this.fetchUsers(departmentId);
}



removeUser(user: any, departmentId: number): void {
  // Open the confirmation dialog
  const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
    width: '400px',
    data: { message: `Are you sure, you want to remove ${user.name} from the assigned work?` },
  });

  // Handle the dialog result
  dialogRef.afterClosed().subscribe((result: boolean) => {
    if (result) {
      // User confirmed the action
      if (user.isAssigned) {
        // API call to remove the user from the backend
        this.eventService.deleteAssignedUser(this.groupKey, departmentId, user.id).subscribe({
          next: (response: any) => {
            this.snackBar.open('User removed successfully from the group', 'Close', {
              duration: 3000,
            });

            // Update the selectedUsers array
            this.selectedUsers[departmentId] = this.selectedUsers[departmentId].filter(
              (u) => u.id !== user.id
            );
            this.filterUsers('', departmentId);
          },
          error: (error) => {
            console.error('Error removing user from backend:', error);
            this.snackBar.open('Failed to remove user from the group', 'Close', {
              duration: 3000,
            });
          },
        });
        this.fetchUsers(departmentId);
      } else {
        // If the user is not assigned, just remove them from the selectedUsers array
        this.selectedUsers[departmentId] = this.selectedUsers[departmentId].filter(
          (u) => u.id !== user.id
        );
        this.fetchUsers(departmentId);
      }
    } else {
      // User cancelled the action
      console.log('User removal cancelled.');
    }
  });
}



}