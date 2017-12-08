import {Injectable} from '@angular/core';

var model = {
	prevent_effect_scroll_top:false,
}

var statics = {
	branches_link:'//index/company_br/list/1/100/!/id/1',
	users_link:'//index/company_users/list/1/10/!/!/c.id/1',
	keys_link:'//index/keygen/list/1/10/!/!/id/1',
};


export class GlobalSettingsService {

	_get(name){
		return model[name];
	}

	_set(name) {
		model[name]=true;
	}

	_setv(name, v) {
		model[name]=v;
	}

	_unset(name) {
		model[name]=false;
	}

	_get_s(name){
		if(typeof (Storage) !== 'undefined') return localStorage[name];
		return false;
	}

	_set_s(name, val) {
		if(typeof (Storage) !== 'undefined') localStorage[name]=val;
	}

	getStatic(name) {
		return statics[name];
	}


	
}