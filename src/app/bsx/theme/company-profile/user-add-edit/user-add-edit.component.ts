import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormService } from '../../../services/form.service';
import { GlobalSettingsService } from '../../../services/globalSettings.service';
import { Helpers } from '../../../../helpers';
import { Location } from '@angular/common';

declare let mApp: any; //uchwyt do aplikacji metronica
var show_msg_time=3800;

@Component({
	selector: 'user-add-edit',
	templateUrl: './user-add-edit.component.html',
	styleUrls:['./user-add-edit.component.css'],
})
export class UserAddEditComponent {
	user:any={};
	model:any={ name:'', email:'', pass1:'', pass2:'', status:'20', branch:0, setpass:0, id:0, city:'', street:'', nip:'', postcode:'',street_n1:'',phone:'', country:''};
	branches:any=[];
	err:any={};
	error:boolean=false;
	loading=false;
	route_type:string='';//add edit user 
	admin:boolean=false;
	admin_br:boolean=false;
	disable_form:boolean=false;
	msg_edit:boolean=false;

	link_first_page:string='';

	tasks:number=0;
	get_user:boolean=false;
	get_branches:boolean=false;

	collapsed:boolean=true;
	collapsing:boolean=false;

	constructor(private _dataService: DataService, private _router: Router, private  _location: Location,
		private _formService: FormService, private _settings: GlobalSettingsService, private _route: ActivatedRoute) {
		this.user=this._dataService.getCurrentUserModel();
		this.admin=this._dataService.test('admin')
		this.admin_br=this._dataService.test('admin_br');
		this.link_first_page=this._settings.getStatic('users_link');
	}

	ngOnInit() {
		if(!this.user.islogged) {
			this._router.navigate(['login']);
		} 

		var self=this;

		this._route.url.map(function(path) {
			return path;
		}).subscribe(function(path) {
			self.route_type=path[0].path;
			self.model.id=Helpers.getInt(path[1], 'path', 0, 1000000);
			if(self.model.id <= 0 && self.route_type=='edit') self.goback();
			self.initAsync();
		});

	}

	initAsync() {
		var t=this.route_type;
		var get_user:boolean=false, get_branches:boolean=false;
		if(t=='user') {
			this.model.id=this.user.id;
			get_user=true;
			this.tasks=1;
		} else if (t=='edit' && this.admin) {
			get_user=true;
			get_branches=true;
			this.tasks=2;
		} else if (t=='edit' && this.admin_br) {
			get_user=true;
			this.tasks=1;
		} else if (t=='add' && this.admin) {
			get_branches=true;
			this.tasks=1;
		} else if (t=='add' && this.admin_br) {
			this.setUserBranch();
		}

		this.get_user=get_user;
		this.get_branches=get_branches;
		if (get_user) this.getUserById();
		if (get_branches) this.getBranches();
	}

	
	getUserById() {
		var self=this;
		this._dataService.getUserById(this.model.id)
			.then(function(res) {
				self.tasks--;
				if(!res.is_ok) self.error=true;
				self.handleAsync();
			})
			.catch(function(err) {
				self.tasks--;
				self.error=true;
			})
		;
	}

	getBranches() {
		var self=this;
		this._dataService.getBranches(1, 100) 
			.then(function(res) {
				self.tasks--;
				if(!res.is_ok) self.error=true;
				self.handleAsync();
		})
			.catch(function(err) {
				self.tasks--;
				self.error=true;
			})
		;
	}

	handleAsync() {
		if(this.tasks > 0) return;
		if(this.error) return;
		if(this.get_user) this.handleUserById();
		if(this.get_branches) this.handleBranches();
	}

	handleUserById() {
		this.processData();
	}

	handleBranches() {
		this.branches=this._dataService.getBranchesModel();
		if(this.branches.length===0) this.disable_form=true; //jesli nie ma oddzialow, nie mozna dodawac uzytkownikow
		else if(this.branches.length > 0 && this.route_type=='add') this.model.branch=this.branches[0];
	}

	setUserBranch() {//ustawienie oddzialu w pryzpadku gdy jest kierownik oddzialu i dodawanie
		var u:any=this.user;
		var branch={id:u.branch,name:u.branch_name};
		this.model.branch=branch;
		this.branches=[branch];
	}

	processData() {
		var u:any=this._dataService.getUserModel();
		this.model.name=u.name;
		this.model.email=u.email;
		this.model.status=''+u.status;
		var branch={id:u.branch,name:u.branch_name};
		this.model.branch=branch;
		this.branches=[branch];
		this.user.branch_city=u.branch_city;
		this.user.branch_postcode=u.branch_postcode;
		this.user.branch_street=u.branch_street;
		this.user.branch_street_n1=u.branch_street_n1;
		if(this.admin && this.route_type=='user') {//admin chce zmodyfikowac swoje dane
			this.model.city=u.city;
			this.model.postcode=u.postcode;
			this.model.nip=u.nip;
			this.model.street=u.street;
			this.model.street_n1=u.street_n1;
			this.model.country=u.country;
			this.model.phone=u.phone;
		}
	}

	navigateFirst() {
		this._router.navigate([this.link_first_page]);
	}

	goback() {
		this._location.back();
	}

	//walidacja oraz typ uztkownika - admin_br nie moze modyfkowac oddzialu
	//walidacja - tj haslo gdy modyfikacja
	action() {
		var t = this.route_type;
		this.model.setpass=0;
		this.err={name:'', email:'', pass1:'', pass2:'', success:'', branch:'', err:false, err_create:false, err_edit:false};
		this.err.name=this._formService.validateNotEmpty(this.model.name);
		this.err.email=this._formService.validateEmail(this.model.email);
		var pass_err=this._formService.validatePass(this.model.pass1, this.model.pass2);
		if((t==='edit' || t==='user' ) && this.model.pass1.length>0) this.model.setpass=1;
		if((t==='add') || ((t==='edit' || t==='user' ) && this.model.setpass)) {
			this.err.pass1=pass_err[0];
			this.err.pass2=pass_err[1];
		}
		if(t=='edit') this.err.branch=this.checkExistsBranch();

		if(this.err.name!=='' || this.err.email!=='' || this.err.pass1!=='' || this.err.pass2!=='' || this.err.branch!=='') this.err.err=true;

		if(!this.err.err) {
			this.loading=true;
			if(this.route_type==='add') {
			 	this.create();
			} else if (t==='edit' || t==='user' ) {
				this.edit();
			} 
		}
	}

	checkExistsBranch() {
		var b=this.branches;
		for(let i =0; i < b.length; i++) if(b[i].id==this.model.branch.id) return '';
		return 'Musisz wybrać jakiś oddział';
	}

	create() {
		var self=this;
		this._dataService.createUser(this.model.email, this.model.pass1, this.model.name, this.model.status, this.model.branch.id)
			.then(function(res) {
				self.loading=false;
				mApp.scrollTop();
				if(res.is_ok) {
					self._settings._set('user_add_success');//ustawienie komunikatu o pomyslnym dodaniu na stronie company_users/list
					self.navigateFirst();//przekierowanie do listy uzytkownikow
				} else {
					if(res.err_code==1) self.err.email=res.err;//istnieje juz taki uzytkownik
					else self.err.err_create=true;
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
		this._dataService.updateUser(this.model.email, this.model.pass1, this.model.name, this.model.status, this.model.branch.id, this.model.id, this.model.setpass,
			this.model.city, this.model.postcode, this.model.nip, this.model.street, this.model.street_n1, this.model.phone, this.model.country
			)
			.then(function(res) {
				self.loading=false;
				mApp.scrollTop();
				if(res.is_ok && self.route_type==='edit') {
					self._settings._set('user_edit_success');//komunikat o pomyslnej edycji
					self._settings._setv('user_edited', self.model.name);//nazwa edytowanego elementu - bedzie wyswietlona
					self.goback();//przekierowanie
				} else if(res.is_ok && self.route_type==='user') {
					self.msg_edit=true;
					self.model.pass1='';
					self.model.pass2='';
					setTimeout(()=> self.msg_edit=false, show_msg_time);
				} else {
					if(res.err_code==1) self.err.email=res.err;
					else self.err.err_edit=true;
				}
			})
			.catch(function(err) {
				self.loading=false;
				mApp.scrollTop();
				self.err.err_edit=true;
			});
			;
	}

	selectBranch(b) {
		this.model.branch=b;
	}

	toggleCollapse() {
		this.collapsed=!this.collapsed;
		this.collapsing=true;
		setTimeout(()=> this.collapsing=false, 500);
	}

	

}

