import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {  ThemeComponent } from './bsx/theme/theme.component';
import {  AuthComponent } from './bsx/auth/auth.component';
import {  CompanyProfileComponent } from './bsx/theme/company-profile/company-profile.component';
import {  UserProfileComponent } from './bsx/theme/user-profile/user-profile.component';
import {  KeyGenerationComponent } from './bsx/theme/key-generation/key-generation.component';
import { UserListComponent } from './bsx/theme/company-profile/user-list/user-list.component';
import { UserAddEditComponent } from './bsx/theme/company-profile/user-add-edit/user-add-edit.component';
import { BranchListComponent } from './bsx/theme/company-profile/branch-list/branch-list.component';
import { BranchAddEditComponent } from './bsx/theme/company-profile/branch-add-edit/branch-add-edit.component';
import { KeyListComponent } from './bsx/theme/key-generation/key-list/key-list.component';
import { KeyAddEditComponent } from './bsx/theme/key-generation/key-add-edit/key-add-edit.component';
import { ArticleComponent } from './bsx/theme/article/article.component';
import { TemplatesListComponent } from './bsx/theme/templates/list/templates-list.component';
import { TemplatesEditComponent } from './bsx/theme/templates/edit/templates-edit.component';
import { ArticleAllComponent } from './bsx/theme/article-all/article-all.component';

import { ThemeAllComponent } from './bsx/theme/theme-all/theme-all.component';

const routes: Routes = [
	{ path: '', redirectTo: 'index', pathMatch: 'full' }, //przekierowanie ze sciezki '' na index
    { path: 'index', component: ThemeComponent,
		children: [
			{ path: '', redirectTo: 'user', pathMatch: 'full' },
			{ path:'user', component:UserAddEditComponent},
			{ path:'company_users', component:CompanyProfileComponent,
				children: [
					{ path: '', redirectTo: 'list/1/10/!/c.id/1', pathMatch: 'full' },
					{ path: 'list/:start/:count/:search/:orderby/:orderbydesc', component: UserListComponent },
					{ path: 'add', component: UserAddEditComponent },
					{ path: 'edit/:id', component: UserAddEditComponent },
				]
			},
			{ path:'company_br', component:CompanyProfileComponent,
				children: [
					{ path: '', redirectTo: 'list/1/100/!/id/1', pathMatch: 'full' },
					{ path: 'list/:start/:count/:search/:orderby/:orderbydesc', component: BranchListComponent },
					{ path: 'add', component: BranchAddEditComponent },
					{ path: 'edit/:id', component: BranchAddEditComponent }
				]
			},
			{path:'keygen', component:KeyGenerationComponent,
				children: [
					{ path: '', redirectTo: 'list/1/10/!/!/id/1', pathMatch: 'full' },
					{ path: 'list/:start/:count/:search/:filters/:orderby/:orderbydesc', component: KeyListComponent },
					{ path: 'add', component: KeyAddEditComponent },
					{ path: 'edit/:id', component: KeyAddEditComponent },
				],
			},
			{path:'templates/list', component:TemplatesListComponent},
			{path:'templates/edit/:id', component:TemplatesEditComponent},
		]
	},
	{ path: 'login', component: AuthComponent},
	{ path: '**', component: ThemeComponent},
	// { path: '**', redirectTo:'index', pathMatch:'full'  }, //kierowanie wszystkich niepasujacych adresow na index (musi to byc jako ostatnia definicja reguly)
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule] 
})
export class AppRoutingModule { }