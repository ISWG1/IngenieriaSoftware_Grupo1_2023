import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class DireccionService {

  googleMapsAccessToken: string = "";
  resourceUrl: string = "";
  constructor(private http: HttpClient) {

    this.googleMapsAccessToken = environment.googleMaps.accesToken;
  }

  getDireccionByCoords(lng: number, lat: number): Observable<any> {
    return this.http.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lng + '&key=' + this.googleMapsAccessToken);
  }

  
}
