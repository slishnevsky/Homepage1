import { Component, OnInit, NgZone, Input } from '@angular/core';
import { AppService } from '../app.service';

@Component({
  selector: 'app-gmail',
  templateUrl: './gmail.component.html',
  styleUrls: ['./gmail.component.css']
})
export class GmailComponent implements OnInit {
  @Input() snippet: boolean;
  messages: any;

  constructor(private service: AppService, private zone: NgZone) { }

  ngOnInit() {
    this.service.isSignedIn.subscribe(isSignedIn => {
      if (isSignedIn) { this.getGmail(); } else { this.messages = null; }
    });
  }

  getGmail() {
    this.service.getGmail().then(data => this.zone.run(() => {
      this.messages = data;
      console.log('getGmail()', data);
    }), error => console.error(error));
  }
}
