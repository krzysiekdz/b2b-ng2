import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { DataService } from '../../services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { GlobalSettingsService } from '../../services/globalSettings.service';

@Component({
	selector: 'article-all-component',
	templateUrl: './article-all.component.html',
	styleUrls: ['./article-all.component.css'],
})
export class ArticleAllComponent {

	article:any={};
	// link:string='';
	modrewrite:string='';
	error404:boolean=false;
	error:boolean=false;
	user:any={};
	viewChange:boolean=false;

	constructor(private _dataService: DataService, private _router: Router, private _route: ActivatedRoute, private _settings: GlobalSettingsService,
			private _sanitizer: DomSanitizer) {
		this.user=this._dataService.getCurrentUserModel();
	}

	ngOnInit() {
		this._route.url.subscribe(u => {
			this.modrewrite=this._router.url;
			this.getArticle();//refresh
		});
	}


	getArticle() {
		this.error=false; this.error404=false;
		this.article={};
		this._dataService.getArticle(this.modrewrite)
			.then(res => {
				if(res.is_ok) {
					this.article=this._dataService.getArticleModel();
					this.article.body=this._sanitizer.bypassSecurityTrustHtml(this.article.body);
					this.viewChange=true;
				}
				else if (res.err_code==404) this.error404=true;
				else this.error=true;
			})
			.catch(res => this.error=true)
		;
	}

	processBody() {
		var $:any = jQuery;
		var self=this;
		$('#articleall_body a[href^="/"]').click(function(e){
			e.preventDefault();
			self.goTo($(this).attr('href'));
		});
	}

	ngAfterViewChecked() {
		if(this.viewChange) {
			this.processBody();
			this.viewChange=false;
		}
	}

	goTo(link) {
		this._router.navigate(['', link.substring(1)]);
	}
}