import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Helpers } from '../../../../helpers';
import { Location } from '@angular/common';
import { GlobalSettingsService } from '../../../services/globalSettings.service';

declare var mApp:any;

@Component({
	selector: 'templates-edit-component',
	templateUrl: './templates-edit.component.html',
	styleUrls: ['./templates-edit.component.css'],
})
export class TemplatesEditComponent {

	error:boolean=false;
	model:any={templ:{title:'', body:'', id:0}};
	fetched:boolean=false;
	user:any={};
	loading:boolean=false;

	constructor(private _dataService: DataService, private _router: Router, private _route: ActivatedRoute, 
		private _settings: GlobalSettingsService, private _location: Location) {
		this.user=this._dataService.getCurrentUserModel();
	}

	ngOnInit() {
		if(!this._dataService.test('admin')) this._router.navigate(['']);
		this._route.params.subscribe(params => {
			this.initFromUrl(params);
			this.refresh();
		});
	}

	initFromUrl(params) {
		this.model.templ.id=Helpers.getInt(params, 'id', 1, 1000000);
	}

	refresh() {
		this.getTemplate();
	}

	getTemplate() {
		this.error=false; 
		this._dataService.getTemplateById(this.model.templ.id)
			.then(res => {
				if(res.is_ok) {this.model.templ=this._dataService.getTemplateModel(); this.fetched=true;}
				else this.error=true;
			})
			.catch(res => this.error=true)
		;
	}

	goback() {
		this._location.back();
	}

	action() {
		this.loading=true;
		this.edit();
	}

	edit() {
		this._dataService.updateTemplate(this.model.templ)
			.then(res => {
				this.loading=false;
				mApp.scrollTop();
				if(res.is_ok) {
					this._settings._set('templ_edit_success');//komunikat o pomyslnej edycji
					this._settings._setv('templ_edit_name', this.model.templ.type.name);//komunikat o pomyslnej edycji
					this.goback();//powrót tam gdzie kliknelismy edycje
				} else {
					this.error=true;
				}
			})
			.catch(err => {
				this.loading=false;
				mApp.scrollTop();
				this.error=true;
			});
			;
	}
}