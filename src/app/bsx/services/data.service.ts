import { Injectable } from '@angular/core';
import * as $ from 'jquery';
import { Helpers } from '../../helpers';
import { Router } from '@angular/router';

// var server_path = 'http://spa.localhost/b2b/';
var server_path = 'https://b2b-api.binsoft.pl/b2b/';
var login_url = server_path+'login';
var logout_url = server_path+'logout';
var create_update_user_url = server_path+'create_update_user';
var create_update_branch_url = server_path+'create_update_branch';
var create_update_key_url = server_path+'create_update_key';
var get_user_url = server_path+'get_user';
var get_branch_url = server_path+'get_branch';
var get_users_by_branch_url = server_path+'get_users_by_branch';
var get_branches_url = server_path+'get_branches';
var get_users_url = server_path+'get_users';
var get_keys_url = server_path+'get_keys';
var get_key_url = server_path+'get_key';
var get_licenses_url = server_path+'get_licenses';
var get_article_url = server_path+'page';
var get_credit_url = server_path+'get_credit';
var templates_url = server_path+'templates';
var remove_user_url = server_path+'remove_user';
var remove_branch_url = server_path+'remove_branch';
var remove_key_url = server_path+'remove_key';
var send_key_url = server_path+'send_key';
var print_key_url = server_path+'print_key';


var model = {
	current_user:{
		id:0,
		name:'',
		email:'',
		branch:0,
		branch_name:'',
		status:0,
		islogged:false,
		city:'',phone:'',postcode:'',nip:'',street:'',street_n1:'',country:'',
	},
	auth:'',

	users:[],
	branches:[],
	keys:[],
	programs:[],
	article:{},
	templates:[],
	template:{},
	printKey:{},

	pagination:{},
	user:{},
	branch:{},
	key:{},
	credit:{fetched:false,},
	inited:false,
};


@Injectable()
export class DataService {
	
	constructor(private _router: Router) {
		if(!model.inited) {
			model.inited=true;
			if(typeof (Storage) !== 'undefined') {
				if(Helpers.getV('remember','')) model.auth=localStorage['b2b_auth'];
				else model.auth=sessionStorage['b2b_auth'];
			}
		}
	}	

	filterUser(row) {
		var u:any={};
		u.id=parseInt(row.id);
		u.name=row.pname;
		u.email=row.pemail;
		if(row.b2b_branch) u.branch=parseInt(row.b2b_branch);
		if(row.branch_name) u.branch_name=row.branch_name;
		u.is_branch=Helpers.isString(row.branch_name);
		u.status=parseInt(row.b2b_status);
		u.firstLetter='';
		if(u.name && u.name.trim().length > 0) {
			u.firstLetter=u.name.trim()[0];
		}
		u.city=row.pcity;
		u.postcode=row.ppostcode;
		u.nip=row.pnip;
		u.street=row.pstreet;
		u.street_n1=row.pstreet_n1;
		u.country=row.pcountry;
		u.phone=row.pphone1;
		return u;
	}

	filterArticle(row) {
		var a:any={};
		a.id=parseInt(row.id);
		a.title=row.ptitle;
		a.body=row.pbody;
		a.author=row.pauthor;
		return a;
	}

	filterKey(row) {
		var k:any={};
		k.id=parseInt(row.id);
		k.pid=parseInt(row.fpid);
		k.serial=row.fserial;
		k.caption=row.caption;
		k.trial=!!parseInt(row.ntrial);
		k.price=parseFloat(row.fprice_n);
		k.items=parseInt(row.fitems);
		k.receipts= (row.pparagonow)? parseInt(row.pparagonow):0;

		k.date_end=row.fdate;
		k.date_start=row.fstart;
		k.active=!!row.fstart;
		k.date_label=row.sdate;
		k.prepaid=!!row.frozdate;
		k.expi=parseInt(row.expiration);//0,1,2
		k.days_all=parseInt(row.fdays);

		k.client_name=row.pname;
		k.client_nip=row.pnip;
		k.client_city=row.pcity;
		k.client_postcode=row.ppostcode;
		k.client_street=row.pstreet;
		k.client_street_n1=row.pstreet_n1;
		k.client_country=row.pcountry;
		k.client_phone=row.pphone1;
		k.client_email=row.pemail;

		k.is_client_street=Helpers.isString(row.pstreet);
		k.is_client_name=Helpers.isString(row.pname);
		k.is_client_nip=Helpers.isString(row.pnip);

		k.reseller_name=row.b2b_wname;
		k.is_reseller_name=Helpers.isString(row.b2b_wname);
		k.admin_name=row.wname;
		return k;
	}

	filterProgram(row) {
		var p:any={};
		p.id=parseInt(row.pid);
		p.name=row.caption;
		p.prices=[];
		for(let i in row.prices) p.prices.push({
			items:parseInt(i),
			price:row.prices[i],
		})
		p.seria=row.pseria;
		p.symbol=row.symbol;
		p.options=row.options;
		p.days=this.filterDays(row.days);
		p.days_trial=this.filterDays(row.days_trial);
		p.default_days=this.filterDays([p.options.default_days])[0];
		p.default_days_trial=this.filterDays([p.options.default_days_trial])[0];
		return p;
	}

	filterDays(d) {
		let res=[];
		let days:any=[
			{days:31, name:'1 miesiąc', id:'1M'},
			{days:62, name:'2 miesiące', id:'2M'},
			{days:188, name:'pół roku', id:'6M'},
			{days:365, name:'rok', id:'1Y'},
			{days:2*365, name:'2 lata', id:'2Y'},
			{days:5*365, name:'5 lat', id:'5Y'},
		];
		function isDay(d) {
			d=parseInt(d);
			for(let i=0; i<days.length;i++) if(d===days[i].days) return i;
			return -1;
		}
		for(let i=0; i < d.length; i++) {
			let j=isDay(d[i]);
			if(j >= 0) res.push(days[j]);
			else res.push({
				days:d[i],
				name:d[i] + ' dni',
				id:d[i],
			});
		}
		return res;
	}

	filterPagination(p) {
		var pp:any={};
		pp['this_page']=parseInt(p.this_page);
		pp['pages_num']=parseInt(p.pages_num);
		pp['this_length']=parseInt(p.this_length);
		pp['all_length']=parseInt(p.all_length);
		pp['start']=parseInt(p.start);
		pp['count']=parseInt(p.count);
		return pp;
	}

	filterBranch(row) {
		var b:any={};
		b.id=parseInt(row.id);
		b.name=row.pname;
		b.city=row.pcity;
		b.country=row.pcountry;
		b.district=row.pdistrict;
		b.phone=row.pphone1;
		b.postcode=row.ppostcode;
		b.street=row.pstreet;
		b.is_street=Helpers.isString(row.pstreet);
		b.province=row.pprovince;
		b.street_n=row.pstreet_n1;
		return b;
	}

	filterCredit(row) {
		var c:any={};
		if(!row.price_sum) c.price_sum=0;
		else c.price_sum=parseFloat(row.price_sum);
		c.credit=parseFloat(row.ncredit);
		c.discount=parseInt(row.ndiscount);
		c.fetched=true;
		return c;
	}

	filterResponse(res) {
		var r:any={};
		r.err_code=parseInt(res.err_code);
		r.err=res.err;
		return r;
	}

	filterTemplate(row) {
		var t:any={};
		var ttypes=[
			{typeid:0, name:'Szablon E-mail'}, 
			{typeid:1, name:'Szablon wydruku'}
		];
		t.id = parseInt(row.id);
		t.title=row.ptitle;
		t.body=row.pbody;
		var typeid=parseInt(row.ptype);
		t.type=ttypes.find(obj=>obj.typeid==typeid);
		if(!t.type) t.type={typeid:-1, name:'Inny szablon'};
		return t;
	}

	filterPrintKey(row) {
		var t:any={};
		t.title=row.title;
		t.body=row.body;
		return t;
	}

	//================

	setCurrentUser(row) {
		var u=this.filterUser(row);
		u.islogged=true;
		model.current_user=u;
		// console.log(model.current_user);
	}

	clearCurrentUser() {
		var u=model.current_user;
		u.id=0;
		u.name='';
		u.email='';
		u.branch=0;
		u.branch_name='';
		u.status=0;
		u.islogged=false;
	}


	setPagination(p) {
		model.pagination=this.filterPagination(p);
	}

	setUsers(rows) {
		model.users=[];
		for(var i=0; i<rows.length; i++) {
			model.users.push(this.filterUser(rows[i]));
		}
	}

	setBranches(rows) {
		model.branches=[];
		for(var i=0; i<rows.length; i++) {
			model.branches.push(this.filterBranch(rows[i]));
		}
	}

	setKey(row) {
		model.key=this.filterKey(row);
	}	

	setKeys(rows) {
		model.keys=[];
		for(var i=0; i<rows.length; i++) {
			model.keys.push(this.filterKey(rows[i]));
		}
	}

	setPrograms(rows) {
		model.programs=[];
		for(var i=0; i<rows.length; i++) {
			model.programs.push(this.filterProgram(rows[i]));
		}
		// console.log(model.programs);
	}

	setUser(row) {
		model.user=this.filterUser(row);
	}

	setBranch(row) {
		model.branch=this.filterBranch(row);
	}

	setAuth(auth) {
		model.auth=auth;
		if(typeof (Storage) !== 'undefined') {
			sessionStorage.setItem('b2b_auth', auth);	
			if(Helpers.getV('remember','')) localStorage.setItem('b2b_auth', auth);
			else sessionStorage.setItem('b2b_auth', auth);
		}
	}

	setCredit(row) {
		model.credit=this.filterCredit(row);
	}

	setArticle(row) {
		model.article=this.filterArticle(row);
	}

	setTemplates(rows) {
		model.templates=[];
		for(var i=0; i<rows.length; i++) {
			model.templates.push(this.filterTemplate(rows[i]));
		}
	}

	setTemplate(row) {
		model.template=this.filterTemplate(row);
	}

	setPrintKey(row) {
		model.printKey=this.filterPrintKey(row);
	}

	clearAuth() {
		model.auth='';
		if(typeof (Storage) !== 'undefined') {
			delete sessionStorage['b2b_auth'];
			delete localStorage['b2b_auth'];
		}
	}

	//=======================


	getCurrentUserModel() {
		return model.current_user;
	}

	getUserModel() {
		// console.log(model.user);
		return model.user;
	}

	getUsersModel() {
		return model.users;
	}

	getKeysModel() {
		return model.keys;
	}

	getBranchModel() {
		return model.branch;
	}

	getBranchesModel() {
		return model.branches;
	}

	getPaginationModel() {
		return model.pagination;
	}	

	getAuthModel() {
		return model.auth;
	}

	getProgramsModel(){
		return model.programs;
	}

	getCreditModel(){
		return model.credit;
	}

	getArticleModel(){
		return model.article;
	}

	getKeyModel(){
		return model.key;
	}

	getTemplatesModel(){
		return model.templates;
	}

	getTemplateModel(){
		return model.template;
	}

	getPrintKeyModel(){
		return model.printKey;
	}
	
	test(type, user=null) {
		if(user===null) user=model.current_user;

		if(type==='admin' && user.status===1) return true;
		else if (type==='admin_br' && user.status===10) return true;
		else if (type==='user' && user.status===20) return true;
		else return false;
	}

	//============================ REST methods

	login(email, pass, test=0, remember=false): Promise<any> {//parametr test=1 pozwala wyslac żądanie typu: username:'', password:'', test=1 gdzie sewer zwraca odpowiedz czy uzytkownik jest zalogowany
		let self=this;
		// console.log('logint, test=', test, ', auth=', model.auth);
		// console.log('auth=', model.auth);
		return new Promise(function(resolve, reject)  {
			$.post(login_url, 
				{username: email, password: pass, test:test, auth: model.auth, remember:(remember)? 1:0} 
			)
			.done(function(res) {
				res=JSON.parse(res);
        		res.err_code=parseInt(res.err_code);
				if(test && res.err_code===0) { //sprawdzanie czy zalogowany pomyslne, tj uztkownik zalogowany
					self.setCurrentUser(res.row);
				} else if(res.err_code===0) { //logowanie pomyślne
					self.setCurrentUser(res.row);
					if(remember) Helpers.setV('remember','');
					else Helpers.unsetV('remember','');
					self.setAuth(res.auth);
				}
				resolve(res);//err_code==0 oznacza logowanie pomyslne, kazde inne to niepomyslne
			})
			.fail(function(err) {
				resolve(err);
			})
			;
		});
	}

	logout(): Promise<any> {
		let self=this;
		model.current_user.islogged=false;
		Helpers.unsetV('remember','')
		return new Promise(function(resolve, reject)  {
			$.post(logout_url, 
				{auth: model.auth} 
			)
			.done(function(res) {
				res=JSON.parse(res);
        		res.err_code=parseInt(res.err_code);
				resolve(res);
			})
			.fail(function(err) {
				resolve(err);
			})
			.always(function(){
				self.clearCurrentUser();//niezaleznie od odpowiedzi serwera wylogowuje uzytkownika z aplikacji
				self.clearAuth();
			})
			;
		});
	}

	createUser(email, pass, name, b2b_status, b2b_branch):Promise<any> {
		let self=this;
		return new Promise(function(resolve, reject) {
			$.post(create_update_user_url, 
				{ auth:model.auth, create:1, pemail:email, pname:name, ppass1:pass, ppass2:pass, b2b_status:b2b_status, b2b_branch:b2b_branch}
			)
			.done(function(res) {
				resolve(self.analyseResponse(res));//tylko odpowiedz czy uzytkownik stworzony pomyslnie czy nie (np istnieje juz takie)
			})
			.fail(function(err) {
				resolve(err);
			})
			;
		});
	}

	updateUser(email, pass, name, b2b_status, b2b_branch, id, setpass=0, pcity='',ppostcode='',pnip='',pstreet='',pstreet_n1='',pphone1='',pcountry=''):Promise<any> {
		let self=this;
		return new Promise(function(resolve, reject) {
			$.post(create_update_user_url, 
				{ auth:model.auth, update:1, id:id, pemail:email, pname:name, ppass1:pass, ppass2:pass, b2b_status:b2b_status, b2b_branch:b2b_branch, setpass:setpass, 
					pcity,ppostcode,pnip, pstreet,pstreet_n1,pphone1,pcountry
				 }
			)
			.done(function(res) {
				res=self.analyseResponse(res);
				if(res.is_ok && model.current_user.id===id) { //robimy update dla aktualnego uzytkownika
					let u=model.current_user;
					u.email=email;
					u.name=name;
					u.city=pcity; u.nip=pnip; u.postcode=ppostcode; u.street=pstreet; u.street_n1=pstreet_n1; u.phone=pphone1; u.country=pcountry;
				}
				resolve(res);//tylko odpowiedz czy uzytkownik zmodyfikowany pomyslnie czy nie (np zmieniona nazwa email juz istnieje)
			})
			.fail(function(err) {
				resolve(err);
			})
			;
		});
	}

	createBranch(name, city, postcode, street, street_n, phone):Promise<any> {
		let self=this;
		return new Promise(function(resolve, reject) {
			$.post(create_update_branch_url, 
				{ auth:model.auth, create:1, pname:name, pcity:city, ppostcode:postcode, pstreet:street, pstreet_n1:street_n, pphone1:phone}
			)
			.done(function(res) {
				resolve(self.analyseResponse(res));//tylko odpowiedz czy oddział stworzony pomyslnie czy nie (np istnieje juz taki)
			})
			.fail(function(err) {
				resolve(err);
			})
			;
		});
	}

	createKey(symbol, fitems, fdays, pname, pstreet, pstreet_n1, ppostcode, pcity, pcountry, pemail, pnip, pphone1, ntrial ):Promise<any> {
		let self=this;
		return new Promise(function(resolve, reject) {
			$.post(create_update_key_url, 
				{ auth:model.auth, create:1, symbol, fitems, fdays, pname, pstreet, pstreet_n1, ppostcode, pcity, pcountry, pemail, pnip, pphone1, ntrial }
			)
			.done(function(res) {
				resolve(self.analyseResponse(res));//tylko odpowiedz czy uzytkownik stworzony pomyslnie czy nie (np istnieje juz takie)
			})
			.fail(function(err) {
				resolve(err);
			})
			;
		});
	}

	updateKey(id, pname, pstreet, pstreet_n1, ppostcode, pcity, pcountry, pemail, pnip, pphone1):Promise<any> {
		let self=this;
		return new Promise(function(resolve, reject) {
			$.post(create_update_key_url, 
				{ auth:model.auth, update:1, id, pname, pstreet, pstreet_n1, ppostcode, pcity, pcountry, pemail, pnip, pphone1 }
			)
			.done(function(res) {
				resolve(self.analyseResponse(res));//tylko odpowiedz czy uzytkownik stworzony pomyslnie czy nie (np istnieje juz takie)
			})
			.fail(function(err) {
				resolve(err);
			})
			;
		});
	}

	updateBranch(name, city, postcode, street, street_n, phone, id):Promise<any> {
		let self=this;
		return new Promise(function(resolve, reject) {
			$.post(create_update_branch_url, 
				{ auth:model.auth, update:1, id:id, pname:name, pcity:city, ppostcode:postcode, pstreet:street, pstreet_n1:street_n, pphone1:phone}
			)
			.done(function(res) {
				resolve(self.analyseResponse(res));//tylko odpowiedz czy oddział zmodyfikowany pomyslnie czy nie (np istnieje juz taki)
			})
			.fail(function(err) {
				resolve(err);
			})
			;
		});
	}

	getUserById(id):Promise<any> {
		var self=this;
		return new Promise(function(resolve, reject) {
			$.post(get_user_url, {
				auth:model.auth, id:id,
			})
			.done(function(res) {
				res=self.analyseResponse(res);
				if(res.is_ok) { //pobrano pomyslnie
					self.setUser(res.row);
				}
				resolve(res);
			})
			.fail(function(err) {
				reject(err);
			})
			;
		});
	}

	getKeyById(id):Promise<any> {
		var self=this;
		return new Promise(function(resolve, reject) {
			$.post(get_key_url, {
				auth:model.auth, id:id,
			})
			.done(function(res) {
				res=self.analyseResponse(res);
				if(res.is_ok) { //pobrano pomyslnie
					self.setKey(res.row);
				}
				resolve(res);
			})
			.fail(function(err) {
				reject(err);
			})
			;
		});
	}

	getBranchById(id):Promise<any> {
		var self=this;
		return new Promise(function(resolve, reject) {
			$.post(get_branch_url, {
				auth:model.auth, id:id,
			})
			.done(function(res) {
				res=self.analyseResponse(res);
				if(res.is_ok) { //pobrano pomyslnie
					self.setBranch(res.row);
				}
				resolve(res);
			})
			.fail(function(err) {
				reject(err);
			})
			;
		});
	}

	getUsersByBranch(id, start, count, search='', orderby='',orderbydesc=1):Promise<any> {
		var self=this;
		return new Promise(function(resolve, reject) {
			$.post(get_users_by_branch_url, {
				auth:model.auth, id:id, start:start, count:count,search:search, orderby, orderbydesc,
			})
			.done(function(res) {
				res=self.analyseResponse(res);
				if(res.is_ok) { //pobrano pomyslnie
					self.setUsers(res.rows);
					self.setPagination(res.res);
				}
				resolve(res);
			})
			.fail(function(err) {
				reject(err);
			})
			;
		});
	}

	getBranches(start, count, search='',orderby='',orderbydesc=1):Promise<any> {
		var self=this;
		return new Promise(function(resolve, reject) {
			$.post(get_branches_url, {
				auth:model.auth, start:start, count:count,search:search, orderby, orderbydesc,
			})
			.done(function(res) {
				res=self.analyseResponse(res);
				if(res.is_ok) { //pobrano pomyslnie
					self.setBranches(res.rows);
					self.setPagination(res.res);
				}
				resolve(res);
			})
			.fail(function(err) {
				reject(err);
			})
			;
		});
	}

	getUsers(start, count, search='', orderby='',orderbydesc=1):Promise<any> {
		var self=this;
		return new Promise(function(resolve, reject) {
			$.post(get_users_url, {
				auth:model.auth, start:start, count:count, search:search, orderby, orderbydesc,
			})
			.done(function(res) {
				res=self.analyseResponse(res);
				if(res.is_ok) { //pobrano pomyslnie
					self.setUsers(res.rows);
					self.setPagination(res.res);
				}
				resolve(res);
			})
			.fail(function(err) {
				reject(err);
			})
			;
		});
	}

	getKeys(start, count, search='', filters='', orderby:string='', orderbydesc=0):Promise<any> {
		var self=this;
		return new Promise(function(resolve, reject) {
			$.post(get_keys_url, {
				auth:model.auth, start:start, count:count, search, filters, orderby, orderbydesc
			})
			.done(function(res) {
				res=self.analyseResponse(res);
				if(res.is_ok) { //pobrano pomyslnie
					self.setKeys(res.rows);
					self.setPagination(res.res);
				}
				resolve(res);
				
			})
			.fail(function(err) {
				reject(err);
			})
			;
		});
	}

	getLicenses():Promise<any> {
		var self=this;
		return new Promise(function(resolve, reject) {
			$.post(get_licenses_url, {
				auth:model.auth,
			})
			.done(function(res) {
				res=self.analyseResponse(res);
				if(res.is_ok) { //pobrano pomyslnie
					self.setPrograms(res.rows);
				}
				resolve(res);
			})
			.fail(function(err) {
				reject(err);
			})
			;
		});
	}

	getCredit():Promise<any> {
		var self=this;
		return new Promise(function(resolve, reject) {
			$.post(get_credit_url, {
				auth:model.auth,
			})
			.done(function(res) {
				res=self.analyseResponse(res);
				if(res.is_ok) { //pobrano pomyslnie
					self.setCredit(res.row);
				}
				resolve(res);
			})
			.fail(function(err) {
				reject(err);
			})
			;
		});
	}

	getArticle(modrewrite):Promise<any> {
		var self=this;
		return new Promise(function(resolve, reject) {
			$.post(get_article_url+'/'+modrewrite, {
				auth:model.auth,
			})
			.done(function(res) {
				res=self.analyseResponse(res);
				if(res.is_ok) { //pobrano pomyslnie
					self.setArticle(res.row);
				}
				resolve(res);
			})
			.fail(function(err) {
				reject(err);
			})
			;
		});
	}

	getTemplates():Promise<any> {
		var self=this;
		return new Promise(function(resolve, reject) {
			$.post(templates_url, {
				auth:model.auth, type:'get_all'
			})
			.done(function(res) {
				res=self.analyseResponse(res);
				if(res.is_ok) { //pobrano pomyslnie
					self.setTemplates(res.rows);
				}
				resolve(res);
			})
			.fail(function(err) {
				reject(err);
			})
			;
		});
	}

	getTemplateById(id):Promise<any> {
		var self=this;
		return new Promise(function(resolve, reject) {
			$.post(templates_url, {
				auth:model.auth, type:'get_byid',id,
			})
			.done(function(res) {
				res=self.analyseResponse(res);
				if(res.is_ok) { //pobrano pomyslnie
					self.setTemplate(res.row);
				}
				resolve(res);
			})
			.fail(function(err) {
				reject(err);
			})
			;
		});
	}

	updateTemplate(f):Promise<any> {
		var self=this;
		return new Promise(function(resolve, reject) {
			$.post(templates_url, {
				auth:model.auth, type:'update',id:f['id'], ptitle:f['title'],pbody:f['body'],
			})
			.done(function(res) {
				res=self.analyseResponse(res);
				resolve(res);
			})
			.fail(function(err) {
				reject(err);
			})
			;
		});
	}

	sendKey(id):Promise<any> {
		var self=this;
		return new Promise(function(resolve, reject) {
			$.post(send_key_url, {
				auth:model.auth, id,
			})
			.done(function(res) {
				res=self.analyseResponse(res);
				resolve(res);
			})
			.fail(function(err) {
				reject(err);
			})
			;
		});
	}

	printKey(id):Promise<any> {
		var self=this;
		return new Promise(function(resolve, reject) {
			$.post(print_key_url, {
				auth:model.auth, id,
			})
			.done(function(res) {
				res=self.analyseResponse(res);
				if(res.is_ok) { //pobrano pomyslnie
					self.setPrintKey(res.rows);
				}
				resolve(res);
			})
			.fail(function(err) {
				reject(err);
			})
			;
		});
	}

	renewKey(f):Promise<any> {
		let self=this;
		return new Promise(function(resolve, reject) {
			$.post(create_update_key_url, 
				{ auth:model.auth, renew:1, id:f['id'], fdays:f['days']}
			)
			.done(function(res) {
				resolve(self.analyseResponse(res));
			})
			.fail(function(err) {
				resolve(err);
			})
			;
		});
	}

	removeUser(id):Promise<any> {
		var self=this;
		return new Promise(function(resolve, reject) {
			$.post(remove_user_url, {
				auth:model.auth, id:id,
			})
			.done(function(res) {
				resolve(self.analyseResponse(res));
			})
			.fail(function(err) {
				reject(err);
			})
			;
		});
	}

	removeKey(id):Promise<any> {
		var self=this;
		return new Promise(function(resolve, reject) {
			$.post(remove_key_url, {
				auth:model.auth, id:id,
			})
			.done(function(res) {
				resolve(self.analyseResponse(res));
			})
			.fail(function(err) {
				reject(err);
			})
			;
		});
	}

	removeBranch(id):Promise<any> {
		var self=this;
		return new Promise(function(resolve, reject) {
			$.post(remove_branch_url, {
				auth:model.auth, id:id,
			})
			.done(function(res) {
				resolve(self.analyseResponse(res));
			})
			.fail(function(err) {
				reject(err);
			})
			;
		});
	}

	//==========================

	private analyseResponse(res) {
        res=JSON.parse(res);
        res.err_code=parseInt(res.err_code);
        res.is_ok=false; 

        if(res.err_code===0) {
        	res.is_ok=true;
        }
        else if(res.err_code===-2) {
            Helpers.showPopup('Ostrzeżenie', 'Twoja sesja wygasła. Zaloguj się ponownie.');
            this.clearCurrentUser();
            this.clearAuth();
            Helpers.show_loading(false);
            this._router.navigate(['login']);
        } 

        return res;
    }
	
}