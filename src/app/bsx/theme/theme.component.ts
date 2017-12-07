import { Component, OnInit, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { Helpers } from '../../helpers';
import { DataService } from '../services/data.service';
import { ScriptLoaderService } from '../services/script-loader.service';
import { GlobalSettingsService } from '../services/globalSettings.service';
import { ActivatedRoute } from '@angular/router';

var effect_name='prevent_effect_scroll_top';
declare let mApp: any;
@Component({
    selector: ".m-grid.m-grid--hor.m-grid--root.m-page",
    templateUrl: "./theme.component.html",
    encapsulation: ViewEncapsulation.None,
})
export class ThemeComponent implements OnInit {

    user:any={};
    index:boolean=true;

    constructor(private _script: ScriptLoaderService, private _router: Router, private _settings: GlobalSettingsService, 
        private _dataService: DataService, private _route: ActivatedRoute) {
        this.user=this._dataService.getCurrentUserModel();
    }

    ngOnInit() {

        var self=this;

            //, 'assets/app/js/dashboard.js'
        // this._script.load('body', 'assets/core/vendors.bundle.js', 'assets/core/scripts.bundle.js');

        // this._router.events.subscribe((route) => {
        //     if (route instanceof NavigationStart) {
        //         if(!self._settings._get(effect_name)) {
        //             mApp.scrollTop();
        //         } 
        //     }
        //     if (route instanceof NavigationEnd) {
        //         // content m-wrapper animation
        //         if(!self._settings._get(effect_name)) {
        //             let animation = 'm-animate-fade-in-up';
        //             $('.m-wrapper').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(e) {
        //                 $('.m-wrapper').removeClass(animation);
        //             }).removeClass(animation).addClass(animation);
        //             // console.log('efekt1 dziala');
        //         } else {
        //             self._settings._unset(effect_name);
        //             // console.log('efekt1 nie dziala');
        //         }
        //     }
        // });

        this._route.url.subscribe(u => {
            if(u[0].path=='index') this.index=true;
            else this.index=false;
        });

        this.setAsideMenu();
       
    }

    //inicjalizacja menu bocznego
    setAsideMenu() {
        var n='aside_menu_hidden.', id=this.user.email;
        var is_hidden=Helpers.getV(n, id);
        if(is_hidden) $('body').addClass('m-brand--minimize m-aside-left--minimize');
        else $('body').removeClass('m-brand--minimize m-aside-left--minimize');
    }

}