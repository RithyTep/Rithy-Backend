import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { map } from 'rxjs/operators';
import { House } from '../model/House';
@Injectable({
  providedIn: 'root',
})
export class HouseService {
  uid: any;
  constructor(private http: HttpClient, public afAuth: AngularFireAuth) {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.uid = user.uid;
      }
    });
  }

  saveHouse(data: any) {
    return this.http.post<any>(
      'https://auxswot-project-02-default-rtdb.asia-southeast1.firebasedatabase.app/HouseList.json',
      data
    );
  }

  getHouse() {
    return this.http
      .get<{ [id: string]: House }>(
        'https://auxswot-project-02-default-rtdb.asia-southeast1.firebasedatabase.app/HouseList.json'
      )
      .pipe(
        map((posts) => {
          let HousesData: House[] = [];
          for (let id in posts) {
            HousesData.push({ ...posts[id], id });
          }
          return HousesData;
        })
      );
  }

  updateHouse(data: any, id: number) {
    return this.http.put(
      'https://auxswot-project-02-default-rtdb.asia-southeast1.firebasedatabase.app/HouseList/' +
        id +
        '.json',
      data
    );
  }

  deleteHouse(id: number) {
    return this.http.delete<any>(
      'https://auxswot-project-02-default-rtdb.asia-southeast1.firebasedatabase.app/HouseList/' +
        id +
        '.json'
    );
  }

  getUserHouses() {
    return this.http
      .get<{ [id: string]: House }>(
        'https://auxswot-project-02-default-rtdb.asia-southeast1.firebasedatabase.app/HouseList.json'
      )
      .pipe(
        map((posts) => {
          let HousesData: House[] = [];
          for (let id in posts) {
            HousesData.push({ ...posts[id], id });
          }
          let result: House[] = [];
          result = HousesData.filter((data) => data.uid == this.uid);
          return result;
        })
      );
  }
}
