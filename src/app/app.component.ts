import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { Helpers } from './helpers';
import { DataService } from './bsx/services/data.service';
import { ScriptLoaderService } from './bsx/services/script-loader.service';

@Component({
    selector: 'body',
    templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
    app_loading=true;

    constructor(private _router: Router, private _dataService: DataService, private _script: ScriptLoaderService) {
    }

    ngOnInit() {
        Helpers.init();

        this._script.load('body', 'assets/core/vendors.bundle.js', 'assets/core/scripts.bundle.js');

        this._dataService.login('','',1)
            .then(res => {
                this.app_loading=false;
                if(res.err_code!==0) {
                    this._router.navigate(['login']);
                } 
            });
    }
    
}