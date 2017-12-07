import { Component, OnInit, OnChanges, AfterViewInit } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormService } from '../../../services/form.service';
import { GlobalSettingsService } from '../../../services/globalSettings.service';
import { Helpers } from '../../../../helpers';
import { ScriptLoaderService } from '../../../services/script-loader.service';



declare let mApp: any; //uchwyt do aplikacji metronica
var show_msg_time=3800;
declare let $:any;
@Component({
	selector: 'key-add-edit',
	templateUrl: './key-add-edit.component.html',
	styleUrls:['./key-add-edit.component.css'],
})
export class KeyAddEditComponent  {
	user:any={};
	model:any={ id:0,items:0,price:0,days:0,trial:false,
		client_name:'',client_country:'Polska',client_city:'',client_postcode:'',client_street:'',client_street_n1:'',client_email:'',client_nip:'',client_phone:''};
	err:any={};
	error:boolean=false;
	loading=false;
	route_type:string='';//add lub edit
	disable_form:boolean=false;
	msg_edit:boolean=false;

	programs:any=[];
	selectedProgram:any=null;
	selectedPrice:any=null;
	selectedDay:any=null;
	days:any=[];

	credit_data:any={};
	price:number=0;
	price_limit:boolean=false;

	link_first:string='//index/keygen/list/1/10/!/!/id/1';

	client_email:string='';
	base_price:number=0;
	calculated_price:number=0;
	inited:boolean=false;

	constructor(private _dataService: DataService, private _router: Router, private _script: ScriptLoaderService, private _location: Location,
		private _formService: FormService, private _settings: GlobalSettingsService, private _route: ActivatedRoute) {
		this.user=this._dataService.getCurrentUserModel();
	}

	ngOnInit() {
		var self=this;
		this.getLicenses();
		this.getCreditData();


		this._route.url.map(function(path) {
			return path;
		}).subscribe(function(path) {
			self.route_type=path[0].path;
			self.model.id=Helpers.getInt(path[1], 'path', 0, 1000000);
			if(self.route_type==='edit') {
				if(self.model.id <= 0) self.goback();;
				self.getKey();
			}
		});

	}

	getKey() {
		this._dataService.getKeyById(this.model.id)
			.then(res => {
				if(res.is_ok) {
					this.model=this._dataService.getKeyModel();
					this.client_email=this.model.client_email;
					if(!this.inited) {
						$('#btn_datakeygen').trigger('click');
						this.inited=true;
					}
				} else this.goback();;
			})
			.catch(function(err) {
				this.error=true;
			})
		;
	}

	action() {
		var t = this.route_type;
		this.err={success:'', email:'', err:false, err_create:false, err_edit:false};
		if(this.model.client_email.length > 0) {
			this.err.email=this._formService.validateEmail(this.model.client_email);
		}

		if(this.err.email!=='') this.err.err=true;
		
		if(!this.err.err) {
			this.loading=true;
			if(t==='add') {
			 	this.create();
			} else if (t==='edit') {
				this.edit();
			} 
		}
	}

	getCreditData() {
		var self=this;
		this._dataService.getCredit()
			.then(function(res) {
				if(res.is_ok) {
					self.credit_data=self._dataService.getCreditModel();
					self.calcPrice();
				} else {
					self.error=true;
				}
			})
			.catch(function(err) {
				self.error=true;
			});
		;
	}

	getLicenses() {
		var self=this;
		this._dataService.getLicenses()
			.then(function(res) {
				if(res.is_ok) {
					self.programs=self._dataService.getProgramsModel();
					if(self.programs.length===0) self.disable_form=true; //jesli nie ma programów, nie mozna generowac kluczy
					else self.selectProgram(self.programs[0]);
				}
		});
	}

	create() {
		var self=this;
		this._dataService.createKey(this.selectedProgram.symbol, this.model.items, this.model.days, this.model.client_name, this.model.client_street, this.model.client_street_n1,
			 this.model.client_postcode, this.model.client_city, this.model.client_country, this.model.client_email, this.model.client_nip, this.model.client_phone,
			 (this.model.trial+0) )
			.then(function(res) {
				self.loading=false;
				mApp.scrollTop();
				if(res.is_ok) {
					self._settings._set('key_add_success');//ustawienie komunikatu o pomyslnym dodaniu klucza
					self.navigateFirst();//przekierowanie na poczatek listy kluczy
				} else {
					self.err.err_create=true;
				}
			})
			.catch(function(err) {
				self.loading=false;
				mApp.scrollTop();
				self.err.err_create=true;
			});
			;
	}

	edit() {
		var self=this;
		this._dataService.updateKey(this.model.id, this.model.client_name, this.model.client_street, this.model.client_street_n1, this.model.client_postcode, 
			this.model.client_city, this.model.client_country, this.model.client_email, this.model.client_nip, this.model.client_phone)
			.then(function(res) {
				self.loading=false;
				mApp.scrollTop();
				if(res.is_ok) {
					self._settings._set('key_edit_success');//komunikat o pomyslnej edycji
					self.goback();//powrót tam gdzie kliknelismy edycje
				} else {
					self.err.err_edit=true;
				}
			})
			.catch(function(err) {
				self.loading=false;
				mApp.scrollTop();
				self.err.err_edit=true;
			});
			;
	}

	selectProgram(p) {
		this.selectedProgram=p;
		this.model.symbol=p.symbol;
		this.setPrice(p.prices[0]);
		this.setTrialDays();
		this.calcPrice();
		// console.log(this.model);
	}
	selectPrice(p) {
		this.setPrice(p);
		this.calcPrice();
		// console.log(this.model);
	}
	selectDay(d) {
		this.setDay(d);
		this.calcPrice();
		// console.log(this.model);
	}
	selectDay2(d) {
		this.selectedDay=d;
		this.calcPrice2();
	}
	selectTrialDays() {
		this.setTrialDays();
		this.calcPrice();
	}

	setTrialDays() {//ustawia w zaleznosci czy trial czy nie, odpowiednia liste dni i domyslny dzien dla tej listy (lista dni trial  lub platnych)
		let p =this.selectedProgram;
		if(!this.model.trial) { 
			this.days=p.days; 
			this.setDay(p.default_days);
		}
		else { 
			this.days=p.days_trial;
			this.setDay(p.default_days_trial);
		}
	}
	setPrice(p) {
		this.model.items=p.items;
		this.model.price=p.price;
		this.selectedPrice=p;
	}
	setDay(d) {
		this.selectedDay=d;
		this.model.days=d.days;
	}

	calcPrice() {
		var price=0;
		this.price_limit=false;
		if(this.model.trial) {
			this.price=0;
			return;
		}

		var b=this.model.price, p=this.credit_data.discount/100,  d=this.model.days/365;
		var price=(b-(b*p))*d;
		var dd=this.model.days;
		if(dd < 365) price*= 1.1;
		else if (dd >= 2*365 && dd < 4*365 ) price*=0.9;
		else if (dd >= 4*365) price*=0.8;

		if((price+this.credit_data.price_sum) > this.credit_data.credit) { //przekroczono kwote kredytu kupieckiego
			this.price_limit=true; 
		}

		this.price=price;
	}

	calcPrice2() {//cena bazowa, dni
		var price=0;
		this.price_limit=false;
		
		var days=this.selectedDay.days;
		var b=this.base_price;

		var p=this.credit_data.discount/100,  d=days/365;
		var price=(b-(b*p))*d;
		if(days < 365) price*= 1.1;
		else if (days >= 2*365 && days < 4*365 ) price*=0.9;
		else if (days >= 4*365) price*=0.8;

		if((price+this.credit_data.price_sum) > this.credit_data.credit) { //przekroczono kwote kredytu kupieckiego
			this.price_limit=true; 
		}

		this.calculated_price=price;
	}

	goback() {
		this._location.back();
	}

	navigateFirst() {
		this._router.navigate([this.link_first]);
	}

	comingSoon() {
		Helpers.showPopup('Ostrzeżenie','Już wkrótce :-)');
	}

	sendKey() {
		var e=this._formService.validateEmail(this.client_email);
		if(e !== '') {
			Helpers.showPopup('Ostrzeżenie', 'Należy zapisać e-mail dla tego klienta, aby móc wysyłać do niego powiadomienia e-mail.');
			this.err.email=e;
		} else {
			this._dataService.sendKey(this.model.id)
				.then(res => {
					if(res.is_ok) Helpers.showPopup('Komunikat', 'E-mail wysłany pomyślnie.');
					else Helpers.showPopup('Błąd', 'Nie udało się wysłać e-maila.');
				})
			;
		}
	}

	showRenewForm() {
		var lic=this.programs.find(p=> p.id==this.model.pid);
		var lp=lic.options.limitparagonow;
		var price:any=0;
		if(lp) price=lic.prices.find(p=>  p.items==this.model.receipts);
		else price=lic.prices.find(p=> p.items==this.model.items);

		this.base_price=price.price;
		this.selectProgram=lic;
		this.days=lic.days;
		this.selectedDay=lic.default_days;
		this.calcPrice2();
		
		(<any>jQuery('#modal_renew_key')).modal();
	}

	renewKey() {
		var err='';
		if(!this.model.prepaid) err='Klucz musi być opłacony aby móc go przedłużyć';
		else if (!this.model.active) err='Klucz musi zostać aktywowany aby móc go przedłużyć.'

		if(err=='')  this._dataService.renewKey({id: this.model.id, days:this.selectedDay.days})
			.then(res => {
				if(res.is_ok) this.getKey();
				else Helpers.showPopup('Błąd', 'Wystąpił błąd. Spróbuj ponwnie za chwilę, a jeśli błąd będzie się powtarzał, skontaktuj się z nami.');
			})
			.catch()
			;
		else Helpers.showPopup('Ostrzeżenie', err);
	}

	getPrintKey() {
		Helpers.showPopup('Podglad', 'Za chwię zostanie uruchomiony wydruk... <iframe src="https://b2b-api.binsoft.pl/b2b/print_key?auth='+this._dataService.getAuthModel()+'&id='+this.model.id+'&format=html" style="visibility:hidden;" />');
		return;
		// this._dataService.printKey({id: this.model.id})
		// 	.then(res => {
		// 		if(res.is_ok) {
		// 			var key:any=this._dataService.getPrintKeyModel();					
		// 			Helpers.showPopup('Podglad', html);
		// 		}
		// 		else Helpers.showPopup('Błąd', 'Wystąpił błąd. Spróbuj ponwnie za chwilę, a jeśli błąd będzie się powtarzał, skontaktuj się z nami.');
		// 	})
		// 	.catch()
		// 	;

	}
	

}

