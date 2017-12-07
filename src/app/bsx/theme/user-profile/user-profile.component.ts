import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { Router } from '@angular/router';

@Component({
	selector: 'user-profile',
	templateUrl: './user-profile.component.html',
})
export class UserProfileComponent {

	user:any={};

	constructor(private _dataService: DataService, private _router: Router) {
            this.user=this._dataService.getCurrentUserModel();
    }

	ngOnInit() {
		if(!this.user.islogged) this._router.navigate(['login']);
	}

}