import { Component, OnInit, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { Helpers } from '../../helpers';
import { DataService } from '../services/data.service';
import { ScriptLoaderService } from '../services/script-loader.service';
import { GlobalSettingsService } from '../services/globalSettings.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

declare let mApp: any;
@Component({
    selector: ".m-grid.m-grid--hor.m-grid--root.m-page",
    templateUrl: "./theme.component.html",
    encapsulation: ViewEncapsulation.None,
})
export class ThemeComponent implements OnInit {

    user:any={};
    route_type:number=-1;
    tasks:number=0;
    error=false;
    get_branches:boolean=false;


    constructor(private _script: ScriptLoaderService, private _router: Router, private _settings: GlobalSettingsService, 
        private _dataService: DataService, private _route: ActivatedRoute, private _location: Location) {
    }

    //komponent inicuje sie, majac juz informacje czy uztkownik jest zalogwany czy nie
    ngOnInit() {
        this.analyseUrl();
        if(this._dataService.getAppState()==0) this.initAppAfterLogin();

        //route events wywolaja sie gdy zmienimy dowolny adres w aplikacji w trakcie jej dzialania, ale nie wyona sie na poczatku
        this._router.events.subscribe(route => {

            if(this._dataService.getAppState()==0) this.initAppAfterLogin();

            if(route instanceof NavigationEnd) {
                this.analyseUrl();
            }

            if (route instanceof NavigationEnd) {
                // content m-wrapper animation
                if(!this._settings._get('prevent_effect_scroll_top')) {
                    mApp.scrollTop();
                    let animation = 'm-animate-fade-in-up';
                    $('.m-wrapper').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(e) {
                        $('.m-wrapper').removeClass(animation);
                    }).removeClass(animation).addClass(animation);
                    // console.log('efekt1 dziala');
                } else {
                    this._settings._unset('prevent_effect_scroll_top');
                    // console.log('efekt1 nie dziala');
                }
            }
        });       
    }

    //to wywoluje sie asynchronicznie - gdy router robi nawigacje
    analyseUrl() {
        var path1=this._location.path().split('/')[1];
        if(path1=='login') this.route_type=1;
        else if(this._dataService.getAppState()==1) this.route_type=-1;//inicjazliacja aplikacji
        else if(this._dataService.getAppState()==2) this.route_type=0;//aplikacja zainicjalizowana - mozna wyswietlic komponenty aplikacji i rozoczac pobieranie danych
    }

    initAppAfterLogin() {
        this.user=this._dataService.getCurrentUserModel();
        if(!this.user.islogged) return;
        this._dataService.setAppState(1);//jesli uzytkownik zalogwany, to rozpocznij inicjalizacje (setAppState(1))
        
        //zadania synchroniczne
        this.setAsideMenu();

        //zadania asynchroniczne
        this.tasks=1;//domyslnie pobieramy tylko licencje
        if(this.user.admin) { this.tasks++; this.get_branches=true;} 

        if (this.get_branches) this.get$Branches();
        this.getLicenses();        
        
    }

    setAsideMenu() {
        var n='aside_menu_hidden.', id=this.user.email;
        var is_hidden=Helpers.getV(n, id);
        if(is_hidden) $('body').addClass('m-brand--minimize m-aside-left--minimize');
        else $('body').removeClass('m-brand--minimize m-aside-left--minimize');
    }

    get$Branches() {
        this._dataService.getBranches(1, 100,'','id',1, true)//true-zapis do innej zmiennej modelu niz domyślnie - dostep poprzez dataService.get$Branches
            .then(res => {
                if(res.is_ok) this.finalizeAppInited();
                else this.initAppError();
            })
            .catch(function(err) {
                this.initAppError();
            });
        ;
    }

    getLicenses() {
        // this._dataService.getLicenses()
        //     .then(res=> {
        //         if(res.is_ok) {
        //             this.programs=this._dataService.getProgramsModel();
        //             this.programs.unshift(this.programAll);
        //             if(this.programs.length==1) this.error=true; //jesli nie ma programów, nie mozna wyswietlac listy
        //             else this.selectedProgram=this.programAll;
        //         } 
        // })
    }

    handleAsync() {
        if(this.tasks > 0) return;
        if(this.error) return;
        if(this.get_user) this.handleUserById();
        if(this.get_branches) this.handleBranches();
    }

    handleUserById() {
        this.processData();
    }

    handleBranches() {
        this.branches=this._dataService.getBranchesModel();
        if(this.branches.length===0) this.disable_form=true; //jesli nie ma oddzialow, nie mozna dodawac uzytkownikow
        else if(this.branches.length > 0 && this.route_type=='add') this.model.branch=this.branches[0];
    }
    

    initAppError() {
        this.route_type=1;//widok logowania
        Helpers.showPopup('Błąd', 'Wystąpił błąd podczas inicjalizacji aplikacji. Zostałeś wylogowany. Zaloguj się ponownie, a jeśli błąd będzie się powtarzał, skontaktuj się z nami.');
        this._dataService.logout();
    }

    finalizeAppInited() {
        console.log('app inited');
        this._dataService.setAppState(2);//aplikacja załadowana pomyslnie
        this.route_type=0;
    }

}