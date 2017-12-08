import { Component, OnInit, AfterViewInit } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { ActivatedRoute,  Router } from '@angular/router';
import { Helpers } from '../../../../helpers';
import { GlobalSettingsService } from '../../../services/globalSettings.service';

var delay=0;
declare let mApp: any;//uchwyt do metronica
var show_msg_time=3800;

@Component({
	selector: 'branch-list',
	templateUrl: './branch-list.component.html',
	styleUrls: ['./branch-list.component.css'],
})
export class BranchListComponent {
	user:any={};
	branches:any=[];
	pagination:any={};
	error:boolean=false;
	err_delete:boolean=false;
	msg_add:boolean=false;
	msg_edit:string='';
	admin:boolean=false;

	timer_search=null;
	search_query:string='';
	branchToDelete:any={};

	start_fetch:number=1;
	count_fetch:number=100;

	orderby:string='id';
	orderbydesc:number=1;
	orderbycolumns:any=['pname','pcity'];

	getparams:boolean=true;
	mouseOnElement:any=null;

	constructor(private _dataService: DataService, private _router: Router, private _settings: GlobalSettingsService, private _route: ActivatedRoute,) {
		this.user=this._dataService.getCurrentUserModel();
		this.admin=this._dataService.test('admin')
	}

	ngOnInit() {
		if(!this.user.islogged) {
			this._router.navigate(['login']);
		}  else if(!this.admin) {
			this._router.navigate(['']);
		} else {
			if(this._settings._get('branch_add_success')) {
				this._settings._unset('branch_add_success');
				this.msg_add=true;
				setTimeout(()=> {this.msg_add=false;}, show_msg_time);
			} 
			else if(this._settings._get('branch_edit_success')) {
				this._settings._unset('branch_edit_success');
				this.msg_edit=this._settings._get('branch_edited');
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
		this.start_fetch=1;
		this.count_fetch=100;

		this.search_query=Helpers.getString(params, 'search');

		this.orderby=Helpers.getString(params, 'orderby');
		if(!this.orderbycolumns.includes(this.orderby)) this.orderby='id';
		var ord=Helpers.getInt(params, 'orderbydesc', -1);
		this.orderbydesc=(ord==-1)? 1:ord;
	}

	refresh() {
		Helpers.show_loading(true);
		this.error=false;
		this.getBranches();
	}

	getBranches() {
		var self=this;
		this._dataService.getBranches(this.start_fetch, this.count_fetch, this.search_query, this.orderby, this.orderbydesc)
			.then(function(res) {
				if(res.is_ok) {
					self.branches=self._dataService.getBranchesModel();
					self.pagination=self._dataService.getPaginationModel();
					self.prepare();
				}
				Helpers.show_loading(false);
			})
			.catch(function(err) {
				Helpers.show_loading(false);
				self.error=true;
			});
		;
	}

	setOrderBy(orderby) {
		if(this.orderby==orderby) this.orderbydesc=(this.orderbydesc==1)? 0:1;
		this.orderby=orderby;
		this.navigate();
	}

	navigate() {
		this.getparams=false;
		this._settings._set('prevent_effect_scroll_top');//zapobiegniecie efektowi przewiniecia sie  do gory strony, jaki wystepuje przy przelaczaniu sie pomiedyz linkami na stronie
		this._router.navigate(['/index/company_br/list', 
			this.start_fetch, this.count_fetch, 
			(this.search_query==='')? '!':this.search_query, 
			this.orderby, this.orderbydesc]);
	}

	navigateNice() {
		this.getparams=false;
		this._router.navigate(['/index/company_br/list', 
			this.start_fetch, this.count_fetch, 
			(this.search_query==='')? '!':this.search_query, 
			this.orderby, this.orderbydesc]);;
	}

	// generowanie kolorow wyswietlania ikony z pierwsza litera
	prepare() {
		var styles=['metal','primary','warning','danger','success', 'warning', 'primary', 'metal', 'success'];
		var len=styles.length;

		for(var i=0; i<this.branches.length; i++) {
			var b=this.branches[i];
			// b.fillstyle='m--bg-fill-'+styles[i%len];
			b.fillstyle='m--bg-fill-primary';
			b.firstLetter=b.name[0];
		}
	}

	setBranchToDelete(b) {
		this.branchToDelete=b;
	}

	delete() {
		var self=this;
		Helpers.show_loading(true);
		this._dataService.removeBranch(this.branchToDelete.id)
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
				setTimeout(function(){self.err_delete=false;}, 5000);
				Helpers.show_loading(false);
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
		}, 500);	
	}

	setMouseOnElement(el) {
		this.mouseOnElement=el;
	}

	deselectMouseOnElement() {
		this.mouseOnElement=null;
	}

	goToEdit(id) {
		this._router.navigate(['//index/company_br/edit/', id]);
	}

	gotoGroup(id) {
		// console.log(id);
		this._router.navigate(['//index/company_users/list/1/10/!/idbranch:'+id+'/id/1']);	
	}
}