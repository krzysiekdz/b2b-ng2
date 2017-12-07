import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormService } from '../../../services/form.service';
import { GlobalSettingsService } from '../../../services/globalSettings.service';
import { Helpers } from '../../../../helpers';
import { Location } from '@angular/common';

declare let mApp: any;
@Component({
	selector: 'branch-add-edit',
	templateUrl: './branch-add-edit.component.html',
})
export class BranchAddEditComponent {
	user:any={};
	model:any={ name:'', postcode:'', street:'', street_n:'', city:'', phone:'', id:''};
	err:any={};
	loading=false;
	error:boolean=false;
	route_type:string='';//add lub edit
	link_first:string='//index/company_br/list/1/100/!/id/1';
	admin:boolean=false;

	constructor(private _dataService: DataService, private _router: Router, private  _location: Location,
		private _formService: FormService, private _settings: GlobalSettingsService, private _route: ActivatedRoute) {
		this.user=this._dataService.getCurrentUserModel();
		this.admin=this._dataService.test('admin')
	}

	ngOnInit() {
		if(!this.user.islogged) {
			this._router.navigate(['login']);
		} else if (!this.admin) {
			this._router.navigate(['']);
		}

		var self=this;
		this._route.url.map(function(path) {
			return path;
		}).subscribe(function(path) {
			self.route_type=path[0].path;
			self.model.id=Helpers.getInt(path[1], 'path', 0, 1000000);
			if(self.model.id <= 0 && self.route_type=='edit') self.goback();

			if(self.route_type==='edit') self.getBranchById();
		});
	}

	getBranchById() {
		var self=this;
		this._dataService.getBranchById(this.model.id)
			.then(function(res) {
				if(res.is_ok) {
					self.model=self._dataService.getBranchModel();
				} else self.goback();
			})
			.catch(function(err) {
				self.error=true;
			})
		;
	}

	action() {
		this.err={name:'', postcode:'', street:'', street_n:'', city:'', phone:'', success:'', err:false, err_create:false, fatal:false};
		this.err.name=this._formService.validateNotEmpty(this.model.name);
		this.err.city=this._formService.validateNotEmpty(this.model.city);
		this.err.postcode=this._formService.validateNotEmpty(this.model.postcode);
		this.err.street=this._formService.validateNotEmpty(this.model.street);
		this.err.street_n=this._formService.validateNotEmpty(this.model.street_n);
		this.err.phone=this._formService.validateNotEmpty(this.model.phone);

		if(this.err.name!=='' || this.err.city!=='' || this.err.postcode!=='' || this.err.street!=='' || this.err.street_n!=='' || this.err.phone!=='') this.err.err=true;

		if(!this.err.err) {
			this.loading=true;
			if(this.route_type==='add') {
			 	this.create();
			} else if (this.route_type==='edit') {
				this.edit();
			}
		}
	}

	create() {
		var self=this;
		this._dataService.createBranch(this.model.name, this.model.city, this.model.postcode, this.model.street, this.model.street_n, this.model.phone)
			.then(function(res) {
				self.loading=false;
				mApp.scrollTop();
				if(res.is_ok) {
					self._settings._set('branch_add_success');//ustawienie komunikatu o pomyslnym dodaniu na stronie company_br/list
					self.navigateFirst();//przekierowanie do listy oddziałow
				} else {
					if(res.err_code==1) self.err.name=res.err;//istnieje juz taki oddzial
					else self.err.err_create=res.err;
				}
			})
			.catch(function(err) {
				self.loading=false;
				mApp.scrollTop();
				self.error=true;
			});
			;
	}

	edit() {
		var self=this;
		this._dataService.updateBranch(this.model.name, this.model.city, this.model.postcode, this.model.street, this.model.street_n, this.model.phone, this.model.id)
			.then(function(res) {
				self.loading=false;
				mApp.scrollTop();
				if(res.is_ok) {
					self._settings._set('branch_edit_success');//komunikat o pomyslnej edycji
					self._settings._setv('branch_edited', self.model.name);//nazwa edytowanego elementu - bedzie wyswietlona
					self.goback();//przekierowanie
				} else {
					if(res.err_code==1) self.err.name=res.err;
					else self.err.err_create=res.err;
				}
			})
			.catch(function(err) {
				self.loading=false;
				mApp.scrollTop();
				self.error=true;
			});
			;
	}

	navigateFirst() {
		this._router.navigate([this.link_first]);
	}

	goback() {
		this._location.back();
	}

}

