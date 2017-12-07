import { Component, OnInit } from '@angular/core';
import { ActivatedRoute,  Router } from '@angular/router';
import { DataService } from '../../../services/data.service';
import * as $ from 'jquery';
import { Helpers } from '../../../../helpers';
import { ScriptLoaderService } from '../../../services/script-loader.service';
import { GlobalSettingsService } from '../../../services/globalSettings.service';
// import  * as Rx from 'rxjs';
// import 'rxjs/add/operator/switchMap';

var show_msg_time=3800; //czas pokazywania komunikatu o sukcesie
var search_keypress_time=500; //max czas pomiedzy wcisnieciami klawiszy przy wyszukiwaniu
declare let mApp: any;//uchwyt do metronica

@Component({
	selector: 'user-list',
	templateUrl: './user-list.component.html',
	styleUrls: ['./user-list.component.css'],
})
export class UserListComponent {

	user:any={};
	users:any=[];
	admin:boolean=false;
	admin_br:boolean=false;
	branch_id:number=0;
	pagination:any={};

	pages_num:number=0;
	this_page:number=1;
	all_length:number=-1;
	this_length:number=0;
	start_fetch:number=1;
	count_fetch:number=0;
	page_sizes:number[]=[10,20,30,50,100];
	page_size_selected:number=0;
	pages_prev=3;
	pages_next=3;
	pages:number[]=null;

	search_query:string='';
	timer_search=null;

	msg_add:boolean=false;
	msg_edit:string='';
	error:boolean=false;
	err_delete:boolean=false;
	userToDelete:any={};

	orderby:string='id';
	orderbydesc:number=1;
	orderbycolumns:any=['c.pname','c.pemail','c.b2b_status','c2.pname'];

	getparams:boolean=true;
	mouseOnElement:any=null;

	constructor(private _dataService: DataService, private _script: ScriptLoaderService, private _settings: GlobalSettingsService,
		private _route: ActivatedRoute, private _router: Router) {
		this.user=this._dataService.getCurrentUserModel();
		this.count_fetch=this.page_sizes[this.page_size_selected];
		this.admin=this._dataService.test('admin')
		this.admin_br=this._dataService.test('admin_br');
	}

	ngOnInit() {
		if(!this.user.islogged) {
			this._router.navigate(['login']);
		}  else if(! (this.admin || this.admin_br) ) {
			this._router.navigate(['']);
		} else {
			if(this._settings._get('user_add_success')) {
				this._settings._unset('user_add_success');
				this.msg_add=true;
				setTimeout(()=> {this.msg_add=false; }, show_msg_time);
			} 
			else if(this._settings._get('user_edit_success')) {
				this._settings._unset('user_edit_success');
				this.msg_edit=this._settings._get('user_edited');
				setTimeout(()=> {this.msg_edit='';}, show_msg_time);
			}
			let self=this;
			this._route.params.subscribe(function(params) {
				if(self.getparams) self.initFromUrl(params);
				self.getparams=true;
				self.refresh();
			});
		}
	}

	initFromUrl(params) {
		this.start_fetch=Helpers.getInt(params, 'start', 1);
		this.count_fetch=Helpers.getInt(params, 'count', this.page_sizes[0], this.page_sizes.slice(-1)[0]);
		if(!this.page_sizes.includes(this.count_fetch)) this.count_fetch=this.page_sizes[0];//jesli wybrany rozmiar strony nie jest dokladnym rozmiarem z tablicy, wybieramy rozmiar najmniejszy

		this.search_query=Helpers.getString(params, 'search');

		this.orderby=Helpers.getString(params, 'orderby');
		if(!this.orderbycolumns.includes(this.orderby)) this.orderby='c.id';
		var ord=Helpers.getInt(params, 'orderbydesc', -1);
		this.orderbydesc=(ord==-1)? 1:ord;
	}

	refresh() {
		Helpers.show_loading(true);
		if(this.admin) this.getUsersByParent();
		else if (this.admin_br) this.getUsersByBranch();
	}

	getUsersByBranch() {
		var self=this;
		this._dataService.getUsersByBranch( this.user.branch, this.start_fetch, this.count_fetch, this.search_query, this.orderby, this.orderbydesc)
			.then(function(res) {
				if(res.is_ok) {
					self.processData();
				} else {
					self.error=true;
				}
				Helpers.show_loading(false);
			})
			.catch(function(err) {
				Helpers.show_loading(false);
				self.error=true;
			})
		;
		
	}

	getUsersByParent() {
		var self=this;
		this._dataService.getUsers(this.start_fetch , this.count_fetch, this.search_query, this.orderby, this.orderbydesc)
			.then(function(res) {
				if(res.is_ok) {
					self.processData();
				} else {
					self.error=true;
				}
				Helpers.show_loading(false);
			})
			.catch(function(err) {
				Helpers.show_loading(false);
				self.error=true;
			})
		;
	}

	processData() {
		this.users=this._dataService.getUsersModel();
		var p=this._dataService.getPaginationModel();
		this.pages_num=p['pages_num'];
		this.this_page=p['this_page'];
		this.all_length=p['all_length'];
		this.this_length=p['this_length'];
		this.count_fetch=p['count'];
		this.start_fetch=p['start'];
		this.generatePages();
		this.prepare();
		if(this.page_size_selected===0) this.setPageSizeSelected();
	}

	
	navigate() {
		this.getparams=false;
		this._settings._set('prevent_effect_scroll_top');//zapobiegniecie efektowi przewiniecia sie  do gory strony, jaki wystepuje przy przelaczaniu sie pomiedyz linkami na stronie
		this._router.navigate(['/index/company_users/list', 
			this.start_fetch, this.count_fetch, 
			(this.search_query==='')? '!':this.search_query, 
			this.orderby, this.orderbydesc]);
	}

	navigateNice() {
		this.getparams=false;
		this._router.navigate(['/index/company_users/list', 
			this.start_fetch, this.count_fetch, 
			(this.search_query==='')? '!':this.search_query, 
			this.orderby, this.orderbydesc]);;
	}

	setOrderBy(orderby) {
		if(this.orderby==orderby) this.orderbydesc=(this.orderbydesc==1)? 0:1;
		this.orderby=orderby;
		this.start_fetch=1;
		this.navigate();	
	}

	
	setPageSize(index) {
		this.page_size_selected=index;
		this.count_fetch=this.page_sizes[index];
		this.navigate();
	}

	setPageSizeSelected() {
		var p=this.page_sizes;
		for(var i=0; i < p.length; i++) {
			if(this.count_fetch <= p[i]) break;
		}
		this.page_size_selected=i;
	}

	//======== paginacja - obsluga

	goToBegin() {
		if(this.this_page > 1) {
			this.start_fetch=1;
			this.navigate();
		}
	}

	goToEdit(id) {
		this._router.navigate(['//index/company_users/edit/',id]);
	}

	prev() {
		if(this.this_page > 1) {
			this.start_fetch-=this.count_fetch;
			if(this.start_fetch < 1) this.start_fetch=1;
			this.navigate();
		}
	}

	next() {
		if(this.this_page < this.pages_num) {
			this.start_fetch+=this.count_fetch;
			if(this.start_fetch > this.all_length) this.start_fetch=this.all_length-this.count_fetch;
			this.navigate();
		}
	}

	goToEnd() {
		if(this.this_page < this.pages_num) {
			this.start_fetch=(this.pages_num-1)*this.count_fetch + 1;
			this.navigate();
		}
	}

	goToPage(p) {
		if(this.this_page !== p) {
			this.start_fetch=this.count_fetch*(p-1)+1;
			if(this.start_fetch > this.all_length) this.start_fetch=(this.pages_num-1)*this.count_fetch+1;
			this.navigate();
		}
	}

	generatePages() {
		let start = this.this_page-this.pages_prev;
		let pages_count = this.pages_prev+this.pages_next+1;
		let end = pages_count + start;
		this.pages=[];
		for(var i=start; i < end; i++) {
			if(i <= 0) end++;
			else if (i > this.pages_num) break;
			else this.pages.push(i);
		}
		if(this.pages.length < pages_count && this.pages_num >= pages_count) { //jesli trzeba dopelnic stronami o nizszych numerach i mozna to zrobic
			start=this.pages[0];
			let left=pages_count-this.pages.length;
			let i=0;
			while(left > 0) {
				left--;
				i++;
				this.pages.unshift(start-i)
			}
		}
	}

	//generowanie kolorow wyswietlania ikony z pierwsza litera imienia
	prepare() {
		var styles=['metal','primary','warning','danger','success', 'warning', 'primary', 'metal', 'success'];
		var len=styles.length;

		for(var i=0; i<this.users.length; i++) {
			let u=this.users[i];
			// u.fillstyle='m--bg-fill-'+styles[i%len];
			let fillstyle;
			switch(u.status) {
				case 0 : fillstyle='metal'; break;
				case 1 : fillstyle='danger'; break;
				case 10 : fillstyle='warning'; break;
				case 20 : fillstyle='success'; break;
			}
			u.fillstyle='m--bg-fill-'+fillstyle;
			u.firstLetter=u.name[0];
		}
	}

	setUserToDelete(u) {
		this.userToDelete=u;
	}

	delete(id) {
		var self=this;
		Helpers.show_loading(true);
		this._dataService.removeUser(id)
			.then(function(res) {
				if(!res.is_ok) {
				 	self.err_delete=true;
				 	mApp.scrollTop();
				 	setTimeout(function(){self.err_delete=false;}, show_msg_time);
				}
				else self.refresh();

				Helpers.show_loading(false);
			})
			.catch(function(err) {
				self.err_delete=true;
				mApp.scrollTop();
				Helpers.show_loading(false);
				setTimeout(function(){self.err_delete=false;}, show_msg_time);
			});
		;
	}

	search() {
		var self=this;
		if(this.timer_search!==null) clearTimeout(this.timer_search);

		this.timer_search=setTimeout(function(){
			self.start_fetch=1;
			self.search_query=Helpers.parseString(self.search_query);
			self.navigate();
		}, search_keypress_time);
		
	}

	setMouseOnElement(el) {
		this.mouseOnElement=el;
	}

	deselectMouseOnElement() {
		this.mouseOnElement=null;
	}

}