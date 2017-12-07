import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute,  Router } from '@angular/router';
import { DataService } from '../../../services/data.service';
import { Helpers } from '../../../../helpers';
import { GlobalSettingsService } from '../../../services/globalSettings.service';

var show_msg_time=3800; //czas pokazywania komunikatu o sukcesie
var search_keypress_time=500; //max czas pomiedzy wcisnieciami klawiszy przy wyszukiwaniu
declare let mApp: any;//uchwyt do metronica
declare let $:any;
@Component({
	selector: 'key-list',
	templateUrl: './key-list.component.html',
	styleUrls: ['./key-list.component.css'],
})
export class KeyListComponent {

	user:any={};
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
	msg_edit:boolean=false;
	error:boolean=false;
	err_delete:boolean=false;

	keys:any=[];
	credit_data:any={};
	keyToDelete:any={};

	programs:any=[];
	programAll:any={name:'Wszystkie', id:-1};
	selectedProgram:any=null;
	filterPrepaid:boolean=false;
	filterEndDate:boolean=false;
	filters:string='';
	filterNames:any=['idprogram','prepaid','enddate'];

	orderby:string='id';
	orderbydesc:number=1;
	orderbycolumns:any=['id','pname','frozdate','fstart','fdate'];

	getparams:boolean=true;

	mouseOnElement:any=null;

	constructor(private _dataService: DataService,  private _settings: GlobalSettingsService, private _route: ActivatedRoute, private _router: Router) {
		this.user=this._dataService.getCurrentUserModel();
		this.count_fetch=this.page_sizes[this.page_size_selected];
	}

	ngOnInit() {
		this.initAsync();
		if(this._settings._get('key_add_success')) {
			this._settings._unset('key_add_success');
			this.msg_add=true;
			setTimeout(()=> {this.msg_add=false;}, show_msg_time);
		} 
		else if(this._settings._get('key_edit_success')) {
			this._settings._unset('key_edit_success');
			this.msg_edit=true;
			setTimeout(()=> {this.msg_edit=false;}, show_msg_time);
		}
	}

	initAsync() {
		var self=this;
		this._dataService.getLicenses()
			.then(function(res) {
				if(res.is_ok) {
					self.programs=self._dataService.getProgramsModel();
					self.programs.unshift(self.programAll);
					if(self.programs.length<1) self.error=true; //jesli nie ma programów, nie mozna wyswietlac listy
					else self.selectedProgram=self.programAll;
				} 
		})
			.then(function() {
				self._route.params.subscribe(function(params) {//wywola sie przy kazdej zmianie parametrow
					if(self.getparams) self.initFromUrl(params);
					self.getparams=true;
					self.refresh();
				});
			});
		;
	}

	initFromUrl(params) {
		this.start_fetch=Helpers.getInt(params, 'start', 1);
		this.count_fetch=Helpers.getInt(params, 'count', this.page_sizes[0], this.page_sizes.slice(-1)[0]);
		if(!this.page_sizes.includes(this.count_fetch)) this.count_fetch=this.page_sizes[0];//jesli wybrany rozmiar strony nie jest dokladnym rozmiarem z tablicy, wybieramy rozmiar najmniejszy

		this.search_query=Helpers.getString(params, 'search');

		var f:any=Helpers.parseParams(Helpers.getString(params, 'filters'), this.filterNames);
		this.setProgram(f.idprogram);
		this.setFilterPrepaid(f.prepaid);
		this.setFilterEndDate(f.enddate);
		this.setFilterString();

		this.orderby=Helpers.getString(params, 'orderby');
		if(!this.orderbycolumns.includes(this.orderby)) this.orderby='id';
		var ord=Helpers.getInt(params, 'orderbydesc', -1);
		this.orderbydesc=(ord==-1)? 1:ord;
	}

	ngAfterViewInit() {
		var self=this;
		$('#m_select2_1').select2({});
		$('#m_select2_1').change(function(e:any) {
			var id=parseInt($('#m_select2_1').val());
			self.selectedProgram=self.programs[id];
			self.onFilterChange();
		});
		
	}

	refresh() {
		Helpers.show_loading(true);
		this.getCreditData();
		this.getKeys();
	}

	getKeys() {
		var self=this;
		this._dataService.getKeys( this.start_fetch, this.count_fetch, this.search_query, this.filters, 's.'+this.orderby, this.orderbydesc)
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
			});
		;
	}

	getCreditData() {
		var self=this;
		this._dataService.getCredit()
			.then(function(res) {
				if(res.is_ok) {
					self.credit_data=self._dataService.getCreditModel();
				} else {
					self.error=true;
				}
			})
			.catch(function(err) {
				self.error=true;
			});
		;
	}

	processData() {
		this.keys=this._dataService.getKeysModel();
		var p=this._dataService.getPaginationModel();
		this.pages_num=p['pages_num'];
		this.this_page=p['this_page'];
		this.all_length=p['all_length'];
		this.this_length=p['this_length'];
		this.count_fetch=p['count'];
		this.start_fetch=p['start'];
		this.generatePages();
		if(this.page_size_selected===0) this.setPageSizeSelected();
	}

	navigate() {
		this.getparams=false;
		this._settings._set('prevent_effect_scroll_top');//zapobiegniecie efektowi przewiniecia sie  do gory strony, jaki wystepuje przy przelaczaniu sie pomiedyz linkami na stronie
		this._router.navigate(['/index/keygen/list', 
			this.start_fetch, this.count_fetch, 
			(this.search_query==='')? '!':this.search_query, 
			(this.filters==='')? '!':this.filters, 
			this.orderby, this.orderbydesc]);
	}

	navigateNice() {
		this.getparams=false;
		this._router.navigate(['/index/keygen/list', 
			this.start_fetch, this.count_fetch, 
			(this.search_query==='')? '!':this.search_query, 
			(this.filters==='')? '!':this.filters, 
			this.orderby, this.orderbydesc]);
	}
	
	setOrderBy(orderby) {
		if(this.orderby==orderby) this.orderbydesc=(this.orderbydesc==1)? 0:1;
		this.orderby=orderby;
		this.start_fetch=1;
		this.navigate();	
	}

	setProgram(name) {
		if(!name) this.selectedProgram=this.programAll;
		else {
			let p=this.programs.find(p=>p.symbol==name);
			if(p) this.selectedProgram=p;
			else this.selectedProgram=this.programAll;
		}
	}

	setFilterPrepaid(val) {
		this.filterPrepaid=!!parseInt(val);
	}

	setFilterEndDate(val) {
		this.filterEndDate=!!parseInt(val);
	}

	setFilterString() {
		var f1 = (this.selectedProgram.id==-1)? '':'idprogram:'+this.selectedProgram.symbol+',';
		var f2 = (this.filterPrepaid) ? 'prepaid:1,':'';
		var f3 = (this.filterEndDate) ? 'enddate:1':'';
		this.filters=f1+f2+f3;
		this.filters.trim();
	}

	onFilterChange() {
		this.setFilterString();
		this.start_fetch=1;
		this.navigate();
	}


	setPageSize(index) {
		this.page_size_selected=index;
		this.count_fetch=this.page_sizes[index];
		this.navigate();
	}

	setMouseOnElement(el) {
		this.mouseOnElement=el;
	}

	deselectMouseOnElement() {
		this.mouseOnElement=null;
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
		this._router.navigate(['//index/keygen/edit/',id]);
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

	setKeyToDelete(k) {
		// console.log('set key',k);
		// document.body.focus();
		// var e:any=document.activeElement;
		// console.log(e);
		// console.log(e.blur());
		this.keyToDelete=k;
	}

	delete(id) {
		var self=this;
		Helpers.show_loading(true);
		this._dataService.removeKey(id)
			.then(function(res) {
				if(!res.is_ok) {
					(<any>$('#m_modal_2')).modal();
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

}