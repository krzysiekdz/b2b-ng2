import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { Router } from '@angular/router';
import { FormService } from '../../services/form.service';

declare let mApp: any;
@Component({
	selector: 'company-profile',
	templateUrl: './company-profile.component.html',
})
export class CompanyProfileComponent {
	user:any={};
	loading=false;

	constructor(private _dataService: DataService, private _router: Router, private _formService: FormService) {
		this.user=this._dataService.getCurrentUserModel();
	}

	ngOnInit() {
		if(this._dataService.test('user')) {
			this._router.navigate(['']);
		}
		// console.log(this._dataService.test('admin'));
	}

	
}

