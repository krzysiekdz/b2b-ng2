import { Component, AfterViewInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { GlobalSettingsService } from '../../services/globalSettings.service';

declare let mLayout: any;
@Component({
	selector: 'aside-nav',
	templateUrl: './aside-nav.component.html',
	styleUrls:['./aside-nav.component.css'],
})
export class AsideNavComponent {

	user:any={};
	admin:boolean=false;
	admin_br:boolean=false;
	_user:boolean=false;

	users_link:string='';
	branches_link:string='';
	keys_link:string='';

	constructor(private _dataService: DataService, private _settings: GlobalSettingsService) {
		this.user=this._dataService.getCurrentUserModel();
		this.admin=this._dataService.test('admin');
		this.admin_br=this._dataService.test('admin_br');
		this._user=this._dataService.test('user');

		this.users_link=this._settings.getStatic('users_link');
		this.keys_link=this._settings.getStatic('keys_link');
		this.branches_link=this._settings.getStatic('branches_link');
	}

	ngAfterViewInit() {
        mLayout.initAside();
        let menu = (<any>$('#m_aside_left')).mMenu(); let item = $(menu).find('a[href="' + window.location.pathname + '"]').parent('.m-menu__item'); (<any>$(menu).data('menu')).setActiveItem(item);
    }
}