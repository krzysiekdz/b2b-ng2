import { Injectable, ErrorHandler } from "@angular/core";

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

    constructor() {
    }

    handleError(error: any): void {
    	console.log('moj wlasny handler error:', error);
    }
}