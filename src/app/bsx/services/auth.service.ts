import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import * as $ from 'jquery';

@Injectable()
export class AuthService {
	headers:any;

	constructor(private http: Http) {
	}

	login(login, pass, remember) {
		return $.post('http://spa.localhost/account/login', {username: login, password:pass, remember:remember, ajax:1});
	}

	testlogin() {
		return $.post('http://spa.localhost/account/login', {ajax:1, test:1});	
	}

	//--------------------------------------

	loginget(login, pass, remember) {
		// console.log(JSON.stringify({username:login, password:pass, remember:remember, ajax:1}));
		// return this.http.post('http://spa.localhost/account/login',   )
			// .map(function(response: Response) {
			// 	console.log('wynik: ');
			// });

		// var h=new Headers({'Content-Type': 'application/json'});
		// console.log(h);
		// this.http.post('http://spa.localhost/account/login', JSON.stringify({a:1, b:2}), {headers: h})
		// 	.toPromise().then(function(r) {console.log(r);})
		return this.http.get('http://spa.localhost/account/login')
			.map(function(response: Response) {
				console.log(response.json());
			});
	}
}