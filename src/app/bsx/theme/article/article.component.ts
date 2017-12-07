import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
	selector: 'article-component',
	templateUrl: './article.component.html',
	styleUrls: ['./article.component.css'],
})
export class ArticleComponent {

	article:any={};
	// link:string='';
	modrewrite:string='';
	error404:boolean=false;
	error:boolean=false;
	user:any={};

	constructor(private _dataService: DataService, private _router: Router, private _route: ActivatedRoute) {
		this.user=this._dataService.getCurrentUserModel();
	}

	ngOnInit() {
		this._route.params.subscribe(params => {
			this.modrewrite=params.modrewrite; //init from url
			console.log(params);
			this.getArticle();//refresh
		});

		console.log(this._router.url);

	}

	getArticle() {
		this.error=false; this.error404=false;
		this._dataService.getArticle(this.modrewrite)
			.then(res => {
				if(res.is_ok) this.article=this._dataService.getArticleModel();
				else if (res.err_code==404) this.error404=true;
				else this.error=true;
			})
			.catch(res => this.error=true)
		;
	}

	// goTo() {
	// 	this._router.navigate(['index/page/', this.link]);
	// }
}