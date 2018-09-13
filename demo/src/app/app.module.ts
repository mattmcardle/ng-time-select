import {BrowserModule} from '@angular/platform-browser';
import {LOCALE_ID, NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {TimeSelectModule} from '../../../src/modules/time-select.module';


@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        CommonModule,
        BrowserModule,
        FormsModule,
        TimeSelectModule
    ],
    providers: [{provide: LOCALE_ID, useValue: 'en'}],
    bootstrap: [AppComponent]
})
export class AppModule {
}
