import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  AngularFireStorage,
  AngularFireStorageReference,
  AngularFireUploadTask,
} from '@angular/fire/compat/storage';
import { finalize, map, Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { HouseService } from '../../services/House.service';

export interface Category {
  type: string;
}

@Component({
  selector: 'app-dailog',
  templateUrl: './dailog.component.html',
  styleUrls: ['./dailog.component.css'],
})
export class DailogComponent implements OnInit {
  addOnBlur = true;
  HouseForm: FormGroup;
  editMode = false;
  removable = true;
  ref: AngularFireStorageReference;
  task: AngularFireUploadTask;
  uploadState: Observable<unknown>;
  uploadProgress: Observable<unknown>;
  btnCurrentVal = 'Save';
  userName: any;
  userImage: any;
  uid;

  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  constructor(
    @Inject(MAT_DIALOG_DATA) public editData: any,
    private formbuilder: FormBuilder,
    private Houseservice: HouseService,
    private dialogref: MatDialogRef<DailogComponent>,
    private afStorage: AngularFireStorage,
    public afAuth: AngularFireAuth
  ) {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.uid = user.uid;
        this.userName = user.displayName;
        this.userImage = user.photoURL;
      }
    });
  }

  ngOnInit(): void {
    this.HouseForm = this.formbuilder.group({
      uid: ['', Validators.required],
      discountPrice: ['', Validators.required],
      HouseAddress: ['', Validators.required],
      HouseImage: ['', Validators.required],
      originalPrice: ['', Validators.required],
      // HouseTimings: ['', Validators.required],
      // HouseCategory: [[], Validators.required],
      HouseDescription: ['', Validators.required],
      userImage: ['', Validators.required],
      userName: ['', Validators.required],
    });

    if (this.editData) {
      this.editMode = true;
      this.btnCurrentVal = 'Update';
      this.HouseForm.controls['userImage'].setValue(this.editData.userImage);
      this.HouseForm.controls['userName'].setValue(this.editData.userName);
      this.HouseForm.controls['uid'].setValue(this.editData.uid);
      this.HouseForm.controls['discountPrice'].setValue(this.editData.discountPrice);
      this.HouseForm.controls['HouseAddress'].setValue(this.editData.HouseAddress);
      this.HouseForm.controls['HouseImage'].setValue(this.editData.HouseImage);
      this.HouseForm.controls['originalPrice'].setValue(this.editData.originalPrice);
      this.HouseForm.controls['HouseTimings'].setValue(this.editData.HouseTimings);
      this.HouseForm.controls['HouseCategory'].setValue(
        this.editData.HouseCategory
      );
      this.HouseForm.controls['HouseDescription'].setValue(
        this.editData.HouseDescription
      );
    }
  }

  get categories() {
    return this.HouseForm.get('HouseCategory');
  }

  upload(event) {
    const id = Math.random().toString(36).substring(2);
    const file = event.target.files[0];
    let filePath = id;
    this.ref = this.afStorage.ref(id);
    this.task = this.afStorage.upload(filePath, file);
    this.uploadState = this.task.snapshotChanges().pipe(map((s) => s.state));
    this.uploadProgress = this.task.percentageChanges();
    this.task
      .snapshotChanges()
      .pipe(
        finalize(() => {
          this.ref.getDownloadURL().subscribe((url) => {
            this.HouseForm.patchValue({
              HouseImage: url,
              uid: this.uid,
              userName: this.userName,
              userImage: this.userImage,
            });
          });
        })
      )
      .subscribe();
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our category
    if ((value || '').trim()) {
      this.categories.setValue([...this.categories.value, value.trim()]);
      this.categories.updateValueAndValidity();
    }
    if (input) {
      input.value = '';
    }
  }

  remove(category: Category): void {
    const index = this.categories.value.indexOf(category);

    if (index >= 0) {
      this.categories.value.splice(index, 1);
      this.categories.updateValueAndValidity();
    }
  }

  addHouse() {
    if (this.HouseForm.invalid) {
      return;
    } else {
      if (!this.editData) {
        this.Houseservice.saveHouse(this.HouseForm.value).subscribe((res) => {
          alert('Post saved successfully');
          this.HouseForm.reset();
          this.dialogref.close('save');
        }),
          (error) => {
            alert('Your post did not saved successfully');
          };
      } else {
        this.updateHouse();
      }
    }
  }

  updateHouse() {
    this.Houseservice
      .updateHouse(this.HouseForm.value, this.editData.id)
      .subscribe((res) => {
        alert('Data updated successfully!');
        this.HouseForm.reset();
        this.dialogref.close('Update');
      }),
      (error) => {
        alert('Could not update data');
      };
  }
}
