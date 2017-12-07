import { Component, OnInit } from '@angular/core';
import { ActivatedRoute,  Router } from '@angular/router';
import { DataService } from '../../services/data.service';


@Component({
	selector: 'key-generation',
	templateUrl: './key-generation.component.html',
	styleUrls: ['./key-generation.component.css'],
})
export class KeyGenerationComponent {

	

	constructor(private _router: Router){}

	ngOnInit() {
		// this._router.navigate(['index/keygen/list/1/10/!/!/id/1']);
	}

	

}