import {NgModule} from '@angular/core';
import {TimepickerComponent} from '../components/timepicker.component';
import {TimepickerTriggerDirective} from '../components/timepicker-trigger.directive';
import {BrowserModule} from '@angular/platform-browser';

@NgModule({
    imports: [
        BrowserModule
    ],
    declarations: [
        TimepickerComponent,
        TimepickerTriggerDirective,
    ],
    exports: [
        TimepickerComponent,
        TimepickerTriggerDirective
    ],
    entryComponents: [
        TimepickerComponent,
    ]
})
// Consider registering providers using a forRoot() method
// when the module exports components, directives or pipes that require sharing the same providers instances.
// Consider registering providers also using a forChild() method
// when they requires new providers instances or different providers in child modules.
export class TimeSelectModule {

    /**
     * Use in AppModule: new instance of SumService.
     */
    // public static forRoot(): ModuleWithProviders {
    //     return {
    //         ngModule: TimeSelectModule,
    //     };
    // }

}
