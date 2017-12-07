import { Injectable } from '@angular/core';
import * as $ from 'jquery';

var model = {
	user:{
		id:0,
		name:'',
		email:'',
		parent:1,
		islogged:false,
		branch:0,
		status:100,
	},
	users:[],
	companies:[],
};

var login_check_url='http://spa.localhost/account/login';
var create_user_url='http://spa.localhost/account/register';
var get_users_url='http://spa.localhost/account/users_list';
var get_usersall_url='http://spa.localhost/account/users_all';
var get_companies_url='http://spa.localhost/account/companies_list';
var del_user_url='http://spa.localhost/account/delete';
var get_company_url='http://spa.localhost/account/companybyid';
var update_company_url='http://spa.localhost/account/update_company';

@Injectable()
export class UserService {
	

	constructor() {
	}

	setUser(row) {
		var u=model.user;
		u.id=parseInt(row.id);
		u.name=row.pname;
		u.email=row.pemail;
		u.parent=(row.idparent===null) ? 0: parseInt(row.idparent);
		u.islogged=true;
		u.branch=parseInt(row.idbranch);
		u.status=parseInt(row.b2b_status);
	}

	setUsers(res) {
		let users=res.users;
		model.users=[];
		model.users['page']={};
		model.users['page']['this_page']=res._this_page;
		model.users['page']['len']=parseInt(res._length);
		model.users['page']['pages_num']=res._pages_num;
		model.users['page']['start']=res.start;
		model.users['page']['count']=res.count;
		for(var i=0; i<users.length; i++) {
			var u:any={}, row=users[i];
			u.id=parseInt(row.id);
			u.name=row.pname;
			u.email=row.pemail;
			u.branch=parseInt(row.idbranch);
			u.status=parseInt(row.b2b_status);
			model.users.push(u);
		}
	}

	setCompanies(rows) {
		model.companies=[];
		for(var i=0; i<rows.length; i++) {
			var c:any={}, row=rows[i];
			c.id=row.id;
			c.name=row.pname;
			c.city=row.pcity;
			c.country=row.pcountry;
			c.district=row.pdistrict;
			c.phone=row.pphone1;
			c.postcode=row.ppostcode;
			c.street=row.pstreet;
			c.province=row.pprovince;
			c.street_n=row.pstreet_n1;
			model.companies.push(c);
		}
	}

	parseCompany(com) {
		var c={};
		c['id']=parseInt(com.id);
		c['name']=com.pname;
		c['city']=com.pcity;
		c['street']=com.pstreet;
		c['street_n']=com.pstreet_n1;
		c['phone']=com.pphone1;
		c['postcode']=com.ppostcode;
		return c;
	}

	test(type, user=null) {
		if(user===null) user=model.user;
		if(type==='admin' && user.status!==0) return user.status < 10;
		else if (type==='admin_br' && user.status!==0) return user.status < 20;
		else if (type==='user') return user.status >= 20;
		else return false;
	}

	getUserObj() {
		return model.user;
	}

	getUsersObj() {
		return model.users;
	}

	getUser(): Promise<any> {
		let self=this;
		return new Promise(function(resolve, reject)  {
			if(model.user.id > 0) resolve(model.user);
			else $.post(login_check_url, {ajax:1, test:1, save:-1, mock:1} )
				.done(function(res) {
					res=JSON.parse(res);
					if(res.result) self.setUser(res.row);
				})
				.always(function() {
					resolve(model.user);
				})
				;
			// else $.ajax(
			// 	{
			// 		type: 'post',
			// 		url: login_check_url,
			// 		crossDomain:true,
			// 		dataType:"json",
			// 		xhrFields: {withCredentials: true},
			// 		data: {ajax:1, test:1, save:-1},
			// 		success: function(res){console.log(res); resolve(model.user);}
			// 	});

				

		});
	}

	createUser(email, pass, name, idparent):Promise<any> {
		return new Promise(function(resolve, reject) {
			$.post(create_user_url, {
				ajax:1, save:1, 
				pemail:email, pname:name, ppass1:pass, ppass2:pass, idparent:idparent, b2b_status:0,
				account_type:'consumer', pstreet: 'none', pcity:'none', ppostcode:'none', pcountry:'none', pregulations:'none',
			})
			.done(function(res) {
				res=JSON.parse(res);
				// console.log('done:',res);
				resolve(res);
			})
			.fail(function(err) {
				console.log('fail:',err);
				resolve(err);
			})
			;
			// setTimeout(function() {
			// 	resolve();
			// }, 2000);
		});
	}

	createCompany(name, city, street, street_n, phone, postcode, idparent):Promise<any> {
		return new Promise(function(resolve, reject) {
			$.post(create_user_url, {
				ajax:1, save:1, noemail:1,
				pemail:'', pname:name, ppass1:'', ppass2:'', idparentbr:idparent, b2b_status:30, //30 -> oddzial
				account_type:'company', pstreet: street, pstreet_n1:street_n, pcity:city, ppostcode:postcode, pphone1:phone, pcountry:'Polska', pregulations:'yes',
			})
			.done(function(res) {
				res=JSON.parse(res);
				resolve(res);
			})
			.fail(function(err) {
				console.log('fail:',err);
				resolve(err);
			})
			;
		});
	}

	updateCompany(id, name, city, street, street_n, phone, postcode):Promise<any> {
		return new Promise(function(resolve, reject) {
			$.post(update_company_url, {
				ajax:1, uid:model.user.id,
				pname:name, id:id, 
				pstreet: street, pstreet_n1:street_n, pcity:city, ppostcode:postcode, pphone1:phone
			})
			.done(function(res) {
				res=JSON.parse(res);
				resolve(res);
			})
			.fail(function(err) {
				console.log('fail:',err);
				resolve(err);
			})
			;
		});
	}

	getUsers(start, count):Promise<any> {
		var self=this;
		return new Promise(function(resolve, reject) {
			$.post(get_usersall_url, {
				ajax:1, uid:model.user.id, start:start, count:count,
			})
			.done(function(res) {
				res=JSON.parse(res);
				if(res.err !== '') {
					reject(res.err);
				}
				console.log(res);
				self.setUsers(res.res);
				// console.log(res.res);
				resolve(model.users);
			})
			.fail(function(err) {
				reject(err);
			})
			;
		});
	}

	getCompanyById(id):Promise<any> {
		var self=this;
		return new Promise(function(resolve, reject) {
			$.post(get_company_url, {
				ajax:1, uid:model.user.id, cid:id,
			})
			.done(function(res) {
				res=JSON.parse(res);
				resolve(res);
			})
			.fail(function(err) {
				reject(err);
			})
			;
		});
	}

	deleteUser(id):Promise<any> {
		var self=this;
		return new Promise(function(resolve, reject) {
			$.post(del_user_url, {
				ajax:1, uid:model.user.id, contrid:id,
			})
			.done(function(res) {
				res=JSON.parse(res);
				if(res.err !== '') {
					reject(res.err);
				}
				resolve();
			})
			.fail(function(err) {
				reject(err);
			})
			;
		});
	}

	getCompanies():Promise<any> {
		var self=this;
		return new Promise(function(resolve, reject) {
			$.post(get_companies_url, {
				ajax:1, uid:model.user.id,
			})
			.done(function(res) {
				res=JSON.parse(res);
				self.setCompanies(res.companies);
				resolve(model.companies);
			})
			.fail(function(err) {
				console.log('fail companies list:',err);
				resolve(err);
			})
			;
		});
	}



	
}