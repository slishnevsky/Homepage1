import { Component, OnInit, Input } from '@angular/core';
import { AppService } from '../app.service';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css']
})

export class NewsComponent implements OnInit {
  @Input() source: string;
  items: any[];

  constructor(private service: AppService) { }

  ngOnInit() {
    this.getNews();
    setInterval(() => { this.getNews(); }, 1000 * 60 * 10); // refresh news every 10 minutes
  }

  getNews() {
    this.service.getNews(this.source).subscribe(data => {
      this.items = data.slice(0, 10);
      console.log('getNews()', this.items);
    }, error => console.error(error));
  }
}
