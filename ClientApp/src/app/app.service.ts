import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

const API_KEY = 'AIzaSyAN0GfthnVg9PjHxBL4wPIv4bXc58f61rA';
const CLIENT_ID = '597988925903-ujhd67pn077ldnioepu4c06kqk3ke72n.apps.googleusercontent.com';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest', 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];
const SCOPE = 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar.readonly';
const DAYS = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
const MONTHS = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'];

declare var gapi: any;

@Injectable({
  providedIn: 'root'
})
export class AppService {
  private GAPI_CONFIGURATION = { apiKey: API_KEY, clientId: CLIENT_ID, discoveryDocs: DISCOVERY_DOCS, scope: SCOPE };
  private signedInSubject = new BehaviorSubject(false);

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) {
    gapi.load('client:auth2', () => this.initClient());
  }

  getDateTime() {
    const today = new Date();
    const day = DAYS[today.getDay()];
    const date = today.getDate();
    const month = MONTHS[today.getMonth()];
    const time = today.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    return { date: `${day}, ${date} ${month}`, time: time };
  }

  public get isSignedIn() {
    return this.signedInSubject.asObservable();
  }

  private initClient() {
    gapi.client.init(this.GAPI_CONFIGURATION).then(() => {
      gapi.auth2.getAuthInstance().isSignedIn.listen(status => this.signedInSubject.next(status));
      this.signedInSubject.next(gapi.auth2.getAuthInstance().isSignedIn.get());
    });
  }

  signIn() {
    gapi.auth2.getAuthInstance().signIn();
    this.signedInSubject.next(true);
  }

  signOut() {
    gapi.auth2.getAuthInstance().signOut();
    this.signedInSubject.next(false);
  }

  getSuggestions(text: string): Observable<string[]> {
    const url = 'https://suggestqueries.google.com/complete/search?client=firefox&q=' + encodeURIComponent(text);
    return this.http.jsonp(url, 'callback').pipe(map(res => res[1]));
  }

  getTranslation(text: string) {
    let url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&q=' + encodeURIComponent(text);
    return this.http.get(url).pipe(
      switchMap(next => {
        const sl = next[2];
        const tl = (sl === 'ru') ? 'en' : 'ru';
        url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=' + tl + '&dt=t&dt=t&q=' + encodeURIComponent(text);
        return this.http.get(url);
      })
    );
  }

  getWeather(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl + 'api/weather');
  }

  getNews(source: string): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl + 'api/news?source=' + source);
  }

  getBookmarks(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl + 'bookmarks.json');
  }

  getGmail() {
    const params = { userId: 'me', labelIds: ['INBOX', 'UNREAD'] };
    return gapi.client.gmail.users.messages.list(params).then(response => {
      if (response.result.messages === undefined) { return undefined; }
      const requests = response.result.messages.map(message => {
        const params = { userId: 'me', id: message.id };
        return gapi.client.gmail.users.messages.get(params).then(response => {
          const message = response.result;
          return {
            id: message.id,
            from: message.payload.headers.find(header => header.name === 'From').value,
            subject: message.payload.headers.find(header => header.name === 'Subject').value,
            snippet: message.snippet
          };
        });
      });
      return Promise.all(requests);
    });
  }

  getEvents() {
    return gapi.client.calendar.calendarList.list().then(response => {
      const calendars = response.result.items;
      if (calendars === undefined) { return undefined; }
      const requests = calendars.map(calendar => {
        const params = { calendarId: calendar.id, timeMin: (new Date()).toISOString(), showDeleted: false, singleEvents: true, orderBy: 'startTime' as 'startTime' };
        return gapi.client.calendar.events.list(params).then(response => {
          const events = response.result.items;
          return events.map(event => {
            return {
              title: event.summary,
              startTime: event.start.dateTime !== undefined ? event.start.dateTime : event.start.date !== undefined ? event.start.date : null,
              endTime: event.end.dateTime !== undefined ? event.end.dateTime : event.end.date !== undefined ? event.end.date : null,
              allDay: event.start.date !== undefined,
              backgroundColor: calendar.backgroundColor,
              htmlLink: event.htmlLink
            };
          });

        });
      });
      return Promise.all(requests);
    });
  }
}
