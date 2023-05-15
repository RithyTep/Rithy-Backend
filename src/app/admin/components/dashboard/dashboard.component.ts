import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';
import { DailogComponent } from '../dailog/dailog.component';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { House } from '../../model/House';
import { HouseService } from '../../services/House.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  dataSource: MatTableDataSource<House>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  obs: Observable<any>;
  noHouseEntries = false;
  uid: any;

  constructor(
    private Houseservice: HouseService,
    public dialog: MatDialog,
    public afAuth: AngularFireAuth
  ) {
    this.afAuth.authState.subscribe((user) => {
      if (user) this.uid = user.uid;
    });
  }

  ngOnInit(): void {
    this.getAllHouses();
  }

  getAllHouses() {
    this.Houseservice.getHouse().subscribe(
      (res: any) => {
        if (res.length == 0) {
          this.noHouseEntries = true;
        } else {
          this.dataSource = new MatTableDataSource(res);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.obs = this.dataSource.connect();
        }
      },
      (error) => {
        alert('Some error while fetching data');
      }
    );
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  editHouse(HouseData: any) {
    this.dialog
      .open(DailogComponent, {
        width: '100%',
        data: HouseData,
      })
      .afterClosed()
      .subscribe((val) => {
        if (val === 'Update') {
          this.getAllHouses();
        }
      });
  }

  deleteHouse(id: number) {
    if (confirm('Are you sure you want to delete this House?')) {
      this.Houseservice.deleteHouse(id).subscribe((res) => {
        alert('House deleted successfully!');
        this.getAllHouses();
      }),
        (error) => {
          alert('House could not be deleted');
        };
    }
  }
}
