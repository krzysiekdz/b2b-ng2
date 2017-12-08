import { Component, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { DataService } from '../../services/data.service';
import { GlobalSettingsService } from '../../services/globalSettings.service';
import { Router } from '@angular/router';
import { Helpers } from '../../../helpers';

declare let mLayout: any;
var selectedItem:string='';

@Component({
	selector: 'header-nav',
	templateUrl: './header-nav.component.html',
	styleUrls: ['./header-nav.component.css'],
	encapsulation: ViewEncapsulation.None,
})
export class HeaderNavComponent {

	user:any={};
	admin:boolean=false;
	admin_br:boolean=false;
	_user:boolean=false;
	m_aside_show:boolean=true;

	aside_hidden:boolean=false;

	users_link:string='';
	branches_link:string='';
	keys_link:string='';

	constructor(private _dataService: DataService, private _router: Router, private _settings: GlobalSettingsService) {
		this.user=this._dataService.getCurrentUserModel();
		this.admin=this._dataService.test('admin');
		this.admin_br=this._dataService.test('admin_br');
		this._user=this._dataService.test('user');
		this.m_aside_show=!!this._settings._get_s('m_aside_show');
		this.aside_hidden=Helpers.getV('aside_menu_hidden.',this.user.email);

		this.users_link=this._settings.getStatic('users_link');
		this.keys_link=this._settings.getStatic('keys_link');
		this.branches_link=this._settings.getStatic('branches_link');
	}

	ngAfterViewInit() {

        mLayout.initHeader();

        //chowanie menu po kliknieciu, oraz łatka na 2 przyciski, aby po kliknieciu byly podswietlone
        (<any>jQuery('#menu_left a[href!="#"]')).click(function(e) {
			(<any>jQuery('#m_aside_header_menu_mobile_toggle')).trigger('click');

			var href=$(this).attr('href').split('/')[2];
			if(selectedItem=='company_br') $('#submenu_item_branches').removeClass('m-menu__item--active');
			else if(selectedItem=='company_users') $('#submenu_item_users').removeClass('m-menu__item--active');

			selectedItem=href;
			if(href=='company_br') $('#submenu_item_branches').addClass('m-menu__item--active');
			else if(href=='company_users') $('#submenu_item_users').addClass('m-menu__item--active');

		});
    }

    logout() {
    	var self=this;
    	this._dataService.logout();
    	self._router.navigate(['login']);
    }

    toggleAsideMenu() {
    	let n='aside_menu_hidden.';
    	this.aside_hidden=!this.aside_hidden;
    	if(this.aside_hidden) Helpers.setV(n, this.user.email);
    	else Helpers.unsetV(n, this.user.email);
    }

    menuLeftClick() {
    	(<any>jQuery('#menu_left').css('display','block'));
    	(<any>jQuery('#menu_branch').css('display','block'));
    	(<any>jQuery('#menu_item_branch').addClass('m-menu__item--open'));
    	(<any>jQuery('#menu_item_left').addClass('m-menu__item--open'));
    }

}