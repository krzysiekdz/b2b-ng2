import * as $ from "jquery";
// declare let $:any;

var helpers_inited=false;

export class Helpers {
    static loadStyles(tag, src) {
        if (Array.isArray(src)) {
            $.each(src, function(k, s) {
                $(tag).append($('<link/>').attr('href', s).attr('rel', 'stylesheet').attr('type', 'text/css'));
            });
        } else {
            $(tag).append($('<link/>').attr('href', src).attr('rel', 'stylesheet').attr('type', 'text/css'));
        }
    }

    static unwrapTag(element) {
        $(element).removeAttr('appunwraptag').unwrap();
    }

	/**
	 * Set title markup
	 * @param title
	 */
    static setTitle(title) {
        $('.m-subheader__title').text(title);
    }

	/**
	 * Breadcrumbs markup
	 * @param breadcrumbs
	 */
    static setBreadcrumbs(breadcrumbs) {
        if (breadcrumbs) $('.m-subheader__title').addClass('m-subheader__title--separator');

        let ul = $('.m-subheader__breadcrumbs');

        if ($(ul).length === 0) {
            ul = $('<ul/>').addClass('m-subheader__breadcrumbs m-nav m-nav--inline')
                .append($('<li/>').addClass('m-nav__item')
                    .append($('<a/>').addClass('m-nav__link m-nav__link--icon')
                        .append($('<i/>').addClass('m-nav__link-icon la la-home'))));
        }

        $(ul).find('li:not(:first-child)').remove();
        $.each(breadcrumbs, function(k, v) {
            let li = $('<li/>').addClass('m-nav__item')
                .append($('<a/>').addClass('m-nav__link m-nav__link--icon').attr('routerLink', v.href).attr('title', v.title)
                    .append($('<span/>').addClass('m-nav__link-text').text(v.text)));
            $(ul).append($('<li/>').addClass('m-nav__separator').text('-')).append(li);
        });
        $('.m-subheader .m-stack__item:first-child').append(ul);
    }

    static setLoading(enable) {
        let body = $('body');
        if (enable) {
            $(body).addClass('m-page--loading-non-block')
        } else {
            $(body).removeClass('m-page--loading-non-block')
        }
    }

    static appLoading(enable) {
        let app = $('.m-grid.m-grid--hor.m-grid--root.m-pag');
        if (enable) {
            $(app).hide();
        } else {
            $(app).show();
        }
    }

    static bodyClass(strClass) {
        $('body').attr('class', strClass);
    }

    static show_loading(enable) {
        if(enable) {
            let w = window.innerWidth/2;
            let h = window.innerHeight/2;
            $('#loading_component').css('left', w+'px');
            $('#loading_component').css('top', h+'px');
            $('#loading_component').css('display', 'block');
        } else {
            $('#loading_component').css('display', 'none');
        }
        
    }

    static init() { 
        if(helpers_inited) return;
        helpers_inited=true;
        // console.log('helpers init');

        //komponent wczytywania na stronie
        $(window).on('resize', function() {
            let w = window.innerWidth/2;
            let h = window.innerHeight/2;
            $('#loading_component').css('left', w+'px');
            $('#loading_component').css('top', h+'px');
        });
       
    }

    static getInt(arr, name, min=1, max=100000) {
        if(!arr) return min;
        if(arr[name] === undefined) return min;
        var val=parseInt(arr[name]);
        if(val !== val) return min; //NaN
        if(val >= min && val <= max ) return val;
        if(val > max) return max;
        if(val < min) return min;
        return min;
    }

    static getString(arr, name, def='') {
        if(!arr) return def;
        if(arr[name] === undefined) return def;
        var s=arr[name]+'';//rzutowanie na string
        s=s.replace(/[^a-z\sA-Z0-9_$\-żźąęółśćń\,\:\.\@]/g, '');
        return s;
    }

    static parseString(str) {
        if(!str) return '';
        var s=str+'';//rzutowanie na string
        s=s.replace(/[^a-z\sA-Z0-9_$\-żźąęółśćń\,\:\.\@]/g, '');
        return s;
    }

    static isString(s) {
        if(!s) return false;
        if(s.trim().length==0) return false;
        return true;
    }

    static parseParams(p, keys=[]) {
        var p2=p.split(',');
        var res={};
        for(let i=0; i<p2.length; i++) {
            var pp=p2[i].split(':');
            if(pp.length!==2) continue;
            let a=pp[0].trim();
            let b=pp[1].trim();
            if(!keys.includes(a)) continue;
            res[a]=b;
        }
        return res;
    }

    static setV(n:string, id:string) {
        if(typeof (Storage) !== 'undefined') localStorage.setItem(n+id, '1');
    }

    static unsetV(n:string, id:string) {
        if(typeof (Storage) !== 'undefined') localStorage.setItem(n+id, '0');
    }

    static getV(n, id) {
        if(typeof (Storage) !== 'undefined')  return !!parseInt(localStorage[n+id]);
    }

    static showPopup(title, body) {
        jQuery('#m_modal_main_title').html(title);
        jQuery('#m_modal_main_body').html(body);
        (<any>jQuery('#m_modal_main')).modal();
    }


}

//ę