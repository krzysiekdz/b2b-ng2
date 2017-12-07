import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { GlobalSettingsService } from '../../../services/globalSettings.service';

var show_msg_time=3800;

@Component({
	selector: 'templates-list-component',
	templateUrl: './templates-list.component.html',
	styleUrls: ['./templates-list.component.css'],
})
export class TemplatesListComponent {

	error:boolean=false;
	templates:any=[];
	user:any={};
	mouseOnElement:any=null;
	msg_edit:string='';

	constructor(private _dataService: DataService, private _router: Router, private _route: ActivatedRoute, 
		private _settings: GlobalSettingsService, private _location: Location) {
		this.user=this._dataService.getCurrentUserModel();
	}

	ngOnInit() {
		if(!this._dataService.test('admin')) this._router.navigate(['']);
		
		if(this._settings._get('templ_edit_success')) {
			console.log('edit success', this._settings._get('templ_edit_name'));
			this._settings._unset('templ_edit_success');
			this.msg_edit=this._settings._get('templ_edit_name');
			setTimeout(()=> {this.msg_edit='';}, show_msg_time);
		}

		this._route.params.subscribe(params => {
			this.initFromUrl(params);
			this.refresh();
		});
	}

	initFromUrl(params) {
		
	}

	refresh() {
		this.getTemplates();
	}

	getTemplates() {
		this.error=false; 
		this._dataService.getTemplates()
			.then(res => {
				if(res.is_ok) this.templates=this._dataService.getTemplatesModel();
				else this.error=true;
			})
			.catch(res => this.error=true)
		;
	}

	goToEdit(id) {
		this._router.navigate(['//index/templates/edit/',id]);
	}

	setMouseOnElement(el) {
		this.mouseOnElement=el;
	}

	deselectMouseOnElement() {
		this.mouseOnElement=null;
	}
}