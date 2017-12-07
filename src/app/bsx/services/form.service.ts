import { Injectable } from '@angular/core';

@Injectable()
export class FormService {

	validateName(name) {
		if(name.trim().length === 0) return 'Pole nie może być puste!';

		let arr=name.trim().split(' '); 
		if (arr.length == 1 ) return 'Musisz podać imię i nazwisko!';

		return '';
	}

	validateEmail(email) {
		if(!email) return 'Pole  "E-mail" nie może być puste!';
		if(email.trim().length === 0)  return 'Pole  "E-mail" nie może być puste!';

		var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	    if (!re.test(email) ) return 'Nieprawidłowy adres e-mail!';

	    return '';
	}

	validatePass(pass1, pass2) {
		if(pass1.trim().length === 0) return ['Pole "Hasło" nie może być puste', ''];
		if(pass1.trim().length < 4) return ['Hasło musi zawierac co najmniej 4 znaki', ''];

		if(pass2.trim().length === 0) return ['','Pole nie może być puste'];
		if(pass2.trim().length < 4) return ['','Hasło musi zawierac co najmniej 4 znaki'];

		if(pass1 !== pass2) return ['', 'Musisz wpisać drugi raz to samo hasło']

		return ['', ''];
	}

	validateNotEmpty(name) {
		if(name.trim().length === 0) return 'Pole nie może być puste';

		return '';
	}

}