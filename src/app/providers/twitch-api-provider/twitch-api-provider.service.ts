import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TwitchApiStreamsResponse } from '@models/twitch-models';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TwitchApiProviderService {

  constructor(private http: HttpClient) { }

  getTwitchOnlineStatus(userNames: string[], authToken: string): Observable<string[]> {
    let queryParams = new HttpParams();

    userNames.forEach((userName) => {
      queryParams = queryParams.append('user_login', userName);
    });

    return this.http.get<TwitchApiStreamsResponse>('https://api.twitch.tv/helix/streams', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Client-Id': '8cb1honglwfpwmo13luwfkxqx8ba4h'
      },
      params: queryParams,
    }).pipe(
      map((response) => response.data.map((streamData) => streamData.user_login)),
    );
  }
}
