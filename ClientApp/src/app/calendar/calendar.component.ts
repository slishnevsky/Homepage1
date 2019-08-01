import { Component, OnInit, NgZone, Input } from '@angular/core';
import { AppService } from '../app.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  today = new Date();
  title: string;
  events: any[];
  weeks: any[];
  month: number;
  year: number;

  constructor(private service: AppService, private zone: NgZone) { }

  ngOnInit() {
    this.service.isSignedIn.subscribe(isSignedIn => {
      if (isSignedIn) { this.getEvents(); } else { this.events = null; this.createCalendar(); }
    });
  }

  getEvents() {
    this.service.getEvents().then(data => this.zone.run(() => {
      this.events = [];
      this.events = this.events.concat(...data);
      this.events = this.events.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      this.events = this.events.slice(0, 10);
      console.log('getEvents()', this.events);
      this.createCalendar();
    }), error => console.error(error));
  }

  prevMonth() {
    if (this.month === 1) { this.createCalendar(this.year - 1, 12); } else { this.createCalendar(this.year, this.month - 1); }
  }

  nextMonth() {
    if (this.month === 12) { this.createCalendar(this.year + 1, 1); } else { this.createCalendar(this.year, this.month + 1); }
  }

  createCalendar(year?: number, month?: number) {
    const days = [];
    this.year = year === undefined ? this.today.getFullYear() : year;
    this.month = month === undefined ? this.today.getMonth() + 1 : month;
    this.title = this.monthNames[this.month - 1] + ' ' + this.year;
    const firstOfMonth = new Date(this.year, this.month - 1, 1);
    const lastOfMonth = new Date(this.year, this.month, 0);
    const daysInMonth = lastOfMonth.getDate();
    const daysBefore = firstOfMonth.getDay() - 1;
    const daysAfter = 7 - lastOfMonth.getDay();

    for (let index = daysBefore; index >= 1; index--) { // prev month dates
      const date = new Date(new Date().setDate((firstOfMonth.getDate() - index)));
      days.push({ date: date, weekend: this.isWeekend(date), other: true, event: this.findEvent(date), today: this.isToday(date) });
    }

    for (let index = 1; index <= daysInMonth; index++) { // this month dates
      const date = new Date(this.year, this.month - 1, index);
      days.push({ date: date, weekend: this.isWeekend(date), other: false, event: this.findEvent(date), today: this.isToday(date) });
    }

    for (let index = 1; index <= daysAfter; index++) { // next month dates
      const date = new Date(new Date().setDate((lastOfMonth.getDate() + index)));
      days.push({ date: date, weekend: this.isWeekend(date), other: true, event: this.findEvent(date), today: this.isToday(date) });
    }

    this.weeks = [];
    while (days.length) { // split dates array into weeks array, 6 x 7
      this.weeks.push(days.splice(0, 7));
    }
  }

  isToday(date: Date): any {
    const sameYear = date.getFullYear() === this.today.getFullYear();
    const sameMonth = date.getMonth() === this.today.getMonth();
    const sameDay = date.getDate() === this.today.getDate();
    return sameYear && sameMonth && sameDay;
  }

  private findEvent(date: Date) {
    const found = this.events ? this.events.find(e => e.startTime.split('T')[0] === date.toISOString().split('T')[0]) : null;
    return found;
  }

  private isWeekend(date: Date) {
    return date.getDay() === 6 || date.getDay() === 0; // Sat = 6, Sun = 7 (in Canada)
  }

}
