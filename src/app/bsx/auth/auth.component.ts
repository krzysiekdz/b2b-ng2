import { Component, ViewEncapsulation, OnInit, AfterViewInit } from '@angular/core';
import { DataService } from '../services/data.service';
import { FormService } from '../services/form.service';
import { ScriptLoaderService } from '../services/script-loader.service';
import { Router } from '@angular/router';
import * as $ from 'jquery';
import { Helpers } from "../../helpers";
// import { Login } from './login';

@Component({
	// selector: '.m-grid.m-grid--hor.m-grid--root.m-pag',
    selector: '.login-b2b',
	templateUrl: './auth.component.html',
	styleUrls: ['./auth.component.css'],
})
export class AuthComponent {
	model:any={email:'', password:'', remember: false, error:{email_invalid:true}};
	loading:boolean=false;
    user:any={};

	constructor(private _dataService: DataService, private _router: Router,
         private _formService: FormService, private _script: ScriptLoaderService) {
            this.user=this._dataService.getCurrentUserModel();
    }

    ngOnInit() {
        var self=this;
        // this._script.load('body', 'assets/vendors/base/vendors.bundle.js', 'assets/demo/default/base/scripts.bundle.js')
        //     .then(() => {
        //         Login.init();
        //     });
        if(this.user.islogged) this._router.navigate(['//index/user']);
    }

    signin() {
    	this.model.error.msg='';
    	this.model.error.show_msg=true;
    	this.model.error.email_invalid=false;
        var err='';
    	if (err=this.validateEmail()) {
    		this.model.error.msg=err;
    		this.model.error.email_invalid=true;
    	}
    	else if (err=this.validatePass()) {
    		this.model.error.msg=err;
    	} 
    	else {
    		this.model.error.show_msg=false;
    		this.login();
    	}
    }

    checkEmail() {
        this.model.error.email_invalid=false;
    	if (this.validateEmail()) this.model.error.email_invalid=true;
    }

    login() {
    	this.loading=true;
    	var self=this;
    	this._dataService.login(this.model.email, this.model.password, 0, this.model.remember)
    		.then(function(res) {
    			self.loading=false;
    			if(res.err_code!==0) {
    				self.showMessage(res.err);
                } else {
                    self._router.navigate(['']);
                }
    		})
    	;
    }

    private validateEmail() {
	    return this._formService.validateEmail(this.model.email);
	}

    private validatePass() {
        return this._formService.validatePass(this.model.password, this.model.password)[0];
    }


	


    ngAfterViewInit() {
        $('#error_msg_div button').click(function() {
            $('#error_msg_div').hide();
        });
    }

    showMessage(msg) {
        $('#error_msg_span').text(msg);
        $('#error_msg_div').show();
    }

}