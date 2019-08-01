import { Component, OnInit, Input } from '@angular/core';
import { AppService } from '../app.service';

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css']
})
export class WeatherComponent implements OnInit {
  @Input() count: number;
  items: any[];

  constructor(private service: AppService) { }

  ngOnInit() {
    this.getWeather(4);
  }

  getWeather(count: number) {
    this.service.getWeather().subscribe(data => {
      this.items = data.slice(0, count);
      console.log('getWeather()', this.items);
    }, error => console.error(error));
  }
}
