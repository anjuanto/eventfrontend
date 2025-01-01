import { Component, OnInit, ViewChild } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventService } from '../service/event.service';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
@Component({
  selector: 'app-calender',
  templateUrl: './calender.component.html',
  styleUrls: ['./calender.component.css']
})
export class CalendarComponent implements OnInit {
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    events: [],
    selectable: true,
    displayEventTime: false,
    dateClick: this.handleDateClick.bind(this),
    datesSet: this.handleDatesSet.bind(this),
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'selectGroup',
    },
    customButtons: {
      selectGroup: {
        text: '🔍',
        click: this.toggleDropdown.bind(this),
      },
    },
    dayCellClassNames: (info) => {
      if (info.date.getDay() === 0) {
        return ['sunday-red'];
      }
      if (this.isHoliday(info.date)) {
        return ['holiday-red'];
      }
      return [];
    },
 dayCellContent: (info) => {
  const holidayName = this.getHolidayName(info.date);
  if (holidayName) {
    return {
      html: `
        <div class="day-cell" style="display: flex; flex-direction: column; ">
          <div class="day-number">${info.dayNumberText}</div>
          <div class="holiday-name" >
            ${holidayName}
          </div>
        </div>
      `
    };
  }
  return { html: `<div class="day-number">${info.dayNumberText}</div>` };
}

    
    
  }    
  
  allEvents: any[] = [];
  eventsForSelectedDate: any[] = [];
  selectedGroup: string = '';
  dropdownVisible: boolean = false; // Controls the visibility of the dropdown
  groupColors: { [key: string]: string } = {
    'amala grama': '#03C03C',
    'amala sasthra': '#007FFF',
    'amala abhinava': '#D2122E',
    'amala arogya': '#6a5acd',
    'amala kshema': '#ff9800',
    'default':'#9e9e9e'
  };
  groupKeys: string[] = Object.keys(this.groupColors);
  searchTerm: string = '';
  filteredEvents: any[] = [];
  holidays: any[] = [];

  constructor(
    private eventService: EventService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.groupKeys = Object.keys(this.groupColors); // Initialize group keys for dropdown
    this.filteredEvents = [...this.eventsForSelectedDate];
    this.loadHolidays();
    
  }
 

  isHoliday(date: Date): boolean {
    return this.holidays.some((holiday) => {
      const holidayStart = new Date(holiday.date_from);
      const holidayEnd = holiday.date_to ? new Date(holiday.date_to) : holidayStart;
      holidayEnd.setHours(23, 59, 59, 999);
      return date >= holidayStart && date <= holidayEnd;
    });
  }
  getHolidayName(date: Date): string | null {
    // Convert `date_from` and `date_to` from the backend response to Date objects
    const holiday = this.holidays.find((holiday) => {
      // Parse the date_from and date_to fields to ensure proper date comparison
      const holidayStart = new Date(holiday.date_from);  // '2023-10-23 00:00:00'
      const holidayEnd = holiday.date_to ? new Date(holiday.date_to) : holidayStart;
      holidayEnd.setHours(23, 59, 59, 999);
      return date >= holidayStart && date <= holidayEnd;
    });
  // Return the holiday name if found, otherwise null
  return holiday ? holiday.holiday_name : null;
  }
  
  
  
  loadHolidays(): void {
    this.eventService.getHolidays().subscribe({
      next: (response) => {
        if (response.success) {
          this.holidays = response.data;
          console.log('Loaded holidays:', this.holidays);
        }
      },
      error: (err) => {
        console.error('Failed to load holidays', err);
      },
    });
  }
  


  
  loadEvents(monthYear: string): void {
    this.eventService.getcalanderevents(monthYear).subscribe(
      (events) => {
        this.allEvents = events;
        this.updateCalendarEvents(events);
      },
      (error) => console.error('Error fetching events:', error)
    );
  }
  



  handleDatesSet(arg: any): void {
    let currentDate = new Date(arg.start);
    if (currentDate.getDate() !== 1) {
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      currentDate.setDate(1); 
    }
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;  
    const formattedMonth = String(month).padStart(2, '0');
    const formattedDate = `${year}-${formattedMonth}`;
    console.log(`Actual month-year: ${formattedDate}`);
    this.loadEvents(formattedDate);
  }
  
  onSearch() {
    if (!this.searchTerm) {
      this.filteredEvents = [...this.eventsForSelectedDate];
    } else {
      this.filteredEvents = this.allEvents.filter(event =>
        event.title && event.title.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  updateCalendarEvents(events: any[]): void {
    const groupedEvents = this.groupEventsByDateAndProject(events);
    this.calendarOptions.events = Object.keys(groupedEvents).map(date => {
      const groupedByProject = groupedEvents[date];
  
      return Object.keys(groupedByProject).map(project => {
        const event = groupedByProject[project][0];
  
        return {
          title: '',  
          start: date, 
          backgroundColor: this.getEventColor(project), 
          borderColor: this.getEventColor(project),
          extendedProps: {
            projectName: project,
            eventVenue: event.event_venue?.name,
            project: event.amala_project_id
          },
          description: project 
        };
      });
    }).flat(); 
  }

  groupEventsByDateAndProject(events: any[]): { [date: string]: { [projectName: string]: any[] } } {
    return events.reduce((grouped, event) => {
      const eventDate = new Date(event.datetime_from).toISOString().split('T')[0];
      const projectName = event.project?.name || 'Unknown Project';
  
      if (!grouped[eventDate]) {
        grouped[eventDate] = {};
      }
  
      if (!grouped[eventDate][projectName]) {
        grouped[eventDate][projectName] = [];
      }
  
      grouped[eventDate][projectName].push(event); 
      return grouped;
    }, {}); 
  }

  getEventColor(projectName: string): string {
    return this.groupColors[projectName?.toLowerCase()] || '#9e9e9e';
  }

  // handleDateClick(info: any): void {
  //   const selectedDate = info.dateStr;
  //   console.log('Selected date:', selectedDate);
  //   this.eventsForSelectedDate = this.allEvents.filter(event => {
  //     const eventDate = new Date(event.datetime_from).toISOString().split('T')[0];
  //     return eventDate === selectedDate;
  //   });
  
  //   console.log('Events for the selected date:', this.eventsForSelectedDate);
  
  //   this.eventsForSelectedDate = this.eventsForSelectedDate.map(event => {
  //     if (!event.extendedProps) {
  //       event.extendedProps = {};
  //     }
  //     event.extendedProps.details = event.extendedProps.details || event.title;
  //     event.extendedProps.eventType =  event.event_type?.name || 'Unknown Type';
  //     event.extendedProps.eventVenue = event.event_venue?.name || 'Unknown Venue';
  //     event.extendedProps.project = event.project?.name;
  //     return event;
  //   });
  // }


  handleDateClick(info: any): void {
    const selectedDate = info.dateStr;
    console.log('Selected date:', selectedDate);
  
    // Filter events for the selected date
    this.eventsForSelectedDate = this.allEvents.filter(event => {
      const eventDate = new Date(event.datetime_from).toISOString().split('T')[0];
      return eventDate === selectedDate;
    });
  
    console.log('Events for the selected date:', this.eventsForSelectedDate);
  
    //Process and add extendedProps to the filtered events
    // this.eventsForSelectedDate = this.eventsForSelectedDate.map(event => {
    //   if (!event.extendedProps) {
    //     event.extendedProps = {};
    //   }
    //   event.extendedProps.details = event.extendedProps.details || event.title;
    //   event.extendedProps.eventType = event.event_type?.name || 'Unknown Type';
    //   event.extendedProps.eventVenue = event.event_venue?.name || 'Unknown Venue';
    //   event.extendedProps.project = event.project?.name;
    //   return event;
    // });
  
    // Assuming there's only one event for the selected date or you want to use the first event's `event_id`
    const id = this.eventsForSelectedDate[0]?.id;

    if (!id) {
      console.error('No event_id found for the selected date.');
      return; // Exit if no event ID is found
    }
  
    if (id === undefined || id === null) {
      console.error('Invalid event id:', id);
      return;
    }
    const currentUrl = this.router.url;
    this.router.navigate(['/calandershow', id], {
      queryParams: { returnUrl: currentUrl }
    });
 
  }
  
  
  showDetails(id: number): void {
    if (id === undefined || id === null) {
      console.error('Invalid event id:', id);
      return;
    }
    const currentUrl = this.router.url;
    this.router.navigate(['/calandershow', id], {
      queryParams: { returnUrl: currentUrl }
    });
  }

 

  toggleDropdown(): void {
    this.dropdownVisible = !this.dropdownVisible;
  }

  filterEventsByGroup(group: string): void {
    console.log('Selected Group:', group);
    this.selectedGroup = group;
    this.dropdownVisible = false;
    
    const groupColor = this.getEventColor(group);
    
    this.eventsForSelectedDate = this.allEvents.filter(event => {
      const eventGroupColor = this.getEventColor(event.project?.name || '');
      return eventGroupColor === groupColor;
    });
  
    console.log('Filtered Events:', this.eventsForSelectedDate);
  }
}
