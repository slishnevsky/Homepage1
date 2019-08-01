import { Component, OnInit, HostListener } from '@angular/core';
import { AppService } from '../app.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isSignedIn: boolean;
  currentDate: any;
  items: any[];
  index = -1;
  translation: string;

  constructor(private service: AppService) { }

  ngOnInit() {
    this.service.isSignedIn.subscribe(isSignedIn => { this.isSignedIn = isSignedIn; });
    this.getDateTime();
    setInterval(() => { this.getDateTime(); }, 1000 * 60); // refresh time every minute
  }

  @HostListener('document:click', ['$event'])
  clickInside() {
    this.items = [];
    this.index = -1;
  }

  getDateTime() {
    this.currentDate = this.service.getDateTime();
  }

  signIn(): any {
    this.service.signIn();
  }

  signOut(): any {
    this.service.signOut();
  }

  onEnter(value: string) {
    window.open('https://www.google.com/search?q=' + value);
  }

  onClick(event: any, element: any) {
    element.value = event.target.innerText;
    this.items = [];
    this.index = -1;
  }

  onKey(event: any) {
    if (event.target.value === '') {
      this.items = [];
      this.index = -1;
      return;
    }
    switch (event.key) {
      case 'ArrowUp':
        if (--this.index < 0) this.index = 9;
        this.items.forEach(item => item.active = false);
        this.items[this.index].active = true;
        event.target.value = this.items[this.index].text;
        break;
      case 'ArrowDown':
        if (++this.index > 9) this.index = 0;
        this.items.forEach(item => item.active = false);
        this.items[this.index].active = true;
        event.target.value = this.items[this.index].text;
        break;
      case 'Enter':
        this.onEnter(event.target.value);
        break;
      case ' ':
        // this.getTranslation(event.target.value);
        break;
      default:
        this.getSuggestions(event.target.value);
        break;
    }
  }

  onMouseOver(event: any) {
    this.index = Array.prototype.indexOf.call(event.target.parentElement.children, event.target);
    this.items.forEach(item => item.active = false);
    this.items[this.index].active = true;
  }

  getSuggestions(text: string) {
    this.service.getSuggestions(text).subscribe(data => {
      this.items = [];
      this.index = -1;
      for (let index = 0; index < data.length; index++) {
        this.items.push({ index: index, text: data[index] });
      }
      console.log('getSuggestions()', this.items);
    }, error => console.error(error));
  }

  getTranslation(text: string) {
    this.service.getTranslation(text).subscribe(value => {
      this.translation = value[0][0][0];
    }, error => console.error(error));
  }
}
