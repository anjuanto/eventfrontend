import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-project-avatar',
  templateUrl: './project-avatar.component.html',
  styleUrls: ['./project-avatar.component.css']
})
export class ProjectAvatarComponent {
  @Input() projectName: string | undefined;

  getAvatarImage(): string {
    if (!this.projectName) {
      return 'assets/images/amala.png'; // Default image for null or undefined project names
    }

    switch (this.projectName.toLowerCase()) {
      case 'amala grama': 
        return 'assets/images/amala-gramma.png';
      case 'amala sasthra':
        return 'assets/images/amala-sasthra.png';
      case 'amala abhinava':
        return 'assets/images/amala-abhinava.png';
      case 'amala arogya':
        return 'assets/images/amala-arogya.png';
      case 'amala kshema':
        return 'assets/images/amala-kshema.png';
      default:
        return 'assets/images/amala.png';
    }
  }
}
