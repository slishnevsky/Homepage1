import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';

@Component({
  selector: 'app-bookmarks',
  templateUrl: './bookmarks.component.html',
  styleUrls: ['./bookmarks.component.css']
})
export class BookmarksComponent implements OnInit {
  bookmarks: any;

  constructor(private service: AppService) { }

  ngOnInit() {
    this.getBookmarks();
  }


  getBookmarks() {
    this.service.getBookmarks().subscribe(data => {
      this.bookmarks = data;
      console.log('getBookmarks()', this.bookmarks);
    }, error => console.error(error));
  }

}
