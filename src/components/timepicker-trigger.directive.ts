import {
    AfterViewInit, ApplicationRef, ComponentFactoryResolver, Directive, ElementRef, Injector, Input,
    OnInit,
} from '@angular/core';
import {TimepickerComponent} from './timepicker.component';
import * as moment_ from 'moment';
import {DomPortalHost} from '@angular/cdk/portal';
import {ESCAPE} from '@angular/cdk/keycodes';
import {Moment} from 'moment';
import {fromEvent} from 'rxjs/observable/fromEvent';

const moment = moment_;

@Directive({
    selector: 'input[timeselectTrigger]',
    host: {
        '(click)': 'togglePicker()',
        '(keyup)': 'onKeyUp($event)',
    }
})
export class TimepickerTriggerDirective implements OnInit, AfterViewInit {
    @Input('testInput') timepicker: TimepickerComponent;
    portalHost: DomPortalHost;
    private _value: string;

    constructor(private _element: ElementRef,
                private componentFactoryResolver: ComponentFactoryResolver,
                private appRef: ApplicationRef,
                private injector: Injector) {
        this.portalHost = new DomPortalHost(document.body, this.componentFactoryResolver, this.appRef, this.injector);
    }

    propagateChange = (_: any) => {
    }

    ngOnInit() {
        this.timepicker.timeSelected.subscribe((time: Date | Moment) => {
            if (!moment.isMoment(time)) {
                this._element.nativeElement.value = moment(time).format('hh:mm a');
            } else {
                this._element.nativeElement.value = time.format('hh:mm a');
            }
        });
    }

    ngAfterViewInit(): void {
        if (this.timepicker.value) {
            if (this.timepicker.value) {
                this._element.nativeElement.value = moment(this.timepicker.value).format('hh:mm a');
            }
        }
        this.updatePosition();
        this.listenForClose();
    }

    togglePicker() {
        this.updatePosition();
        if (!this.portalHost.hasAttached()) {
            this.portalHost.attach(this.timepicker.timepickerRef);
            setTimeout(() => {
                this.timepicker.scrollSelectedIntoView();
            });
        } else {
            this.portalHost.detach();
        }
    }

    updatePosition() {
        this.timepicker.updatePosition(this._element);
    }

    onKeyUp(event: KeyboardEvent) {
        if (event.keyCode === ESCAPE && this.portalHost.hasAttached()) {
            this.portalHost.detach();
            event.stopPropagation();
            event.preventDefault();
        }
        if (this._element.nativeElement.value) {
            const typed = moment(this._element.nativeElement.value, 'hh:mm a');
            if (typed.isValid()) {
                const dateString = moment(this.timepicker.value).format('YYYY-MM-DD');
                this.timepicker.value = moment(dateString + ' ' + typed.format('HH:mm'));
                this.timepicker.getSelectedFromDate(this.timepicker.value);
            }
        }
    }

    listenForClose() {
        fromEvent(document, 'click').subscribe((event: Event) => {
            if (!this.timepicker.container) {

                return;
            }
            if (!(this.timepicker.container.nativeElement.contains(event.target as HTMLElement))
                && this._element.nativeElement !== event.target as HTMLElement) {
                if (this.portalHost.hasAttached()) {
                    this.portalHost.detach();
                }
            }
        });
    }

}
