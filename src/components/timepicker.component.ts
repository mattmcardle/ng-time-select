import {
    AfterViewInit,
    Component, ElementRef, EventEmitter, Input, OnInit, Output,
    ViewChild
} from '@angular/core';
import {ControlValueAccessor} from '@angular/forms';
import {Portal, TemplatePortalDirective} from '@angular/cdk/portal';
import * as moment_ from 'moment';
import {Moment} from 'moment';

const moment = moment_;

@Component({
    selector: 'time-select',
    template: `
        <div class="timepicker" *cdk-portal [ngClass]="{'hidden': !visible}" #container
             [style]="{'top.px': top, 'left.px': left, 'width.px': width}">
            <div class="time-picker-container">
                <div id="hour-picker" #hourList>
                    <li matRipple class="time" *ngFor="let hour of hours"
                        [class.selected]="selected.hour == hour.trim()"
                        (click)="setHour(hour)">
                        {{ hour | number:'2.0-0' }}
                    </li>
                </div>
                <div id="minute-picker" #minuteList>
                    <li matRipple class="time" *ngFor="let minute of minutes"
                        [ngClass]="{'selected': selected.minute == minute}"
                        (click)="setMinute(minute)">{{ minute | number:'2.0-0' }}
                    </li>
                </div>
                <div id="period-picker">
                    <li matRipple class="time" [ngClass]="{'selected': selected.period == 'am'}"
                        (click)="setPeriod('am', $event)">am
                    </li>
                    <li matRipple class="time" [ngClass]="{'selected': selected.period == 'pm'}"
                        (click)="setPeriod('pm', $event)">pm
                    </li>
                </div>
            </div>
        </div>`,
    styles: [`
        div.timepicker {
            z-index: 5000000;
            position: absolute;
        }

        div.time-picker-container {
            min-width: 175px;
            background: #fff;
            height: 220px;
            border: 1px solid #ddd;
            box-sizing: border-box;
        }

        div.time-picker-container > div {
            max-height: 100%;
            overflow: hidden;
        }

        div.time-picker-container:hover {
            overflow-y: auto;
            overflow-x: hidden !important;
        }

        div#hour-picker {
            width: 33%;
            float: left;
            display: block;
            border-right: 1px solid #ddd;
        }

        div#minute-picker {
            width: 33%;
            float: left;
            display: block;
            border-right: 1px solid #ddd;
        }

        div#period-picker {
            width: 32%;
            float: left;
            display: block;
        }

        li.time {
            width: auto;
            list-style-type: none;
            padding: 10px 0 10px 10px;
            font-size: 14px;
            cursor: pointer;
        }

        li.time:hover {
            background: #edfaff;
        }

        li.time.selected {
            background: #00695c;
            color: #fff;
        }

        .hidden {
            visibility: hidden;
        }
    `],
    exportAs: 'timeSelect',
})

export class TimepickerComponent implements OnInit, ControlValueAccessor, AfterViewInit {

    @Input() steps = 5;
    @ViewChild(TemplatePortalDirective) timepickerRef: Portal<any>;
    @Output('timeSelected') timeSelected = new EventEmitter<Date | Moment>();
    @ViewChild('container') container: ElementRef;
    @ViewChild('hourList') hourList: ElementRef;
    @ViewChild('minuteList') minuteList: ElementRef;

    hours: string[];
    minutes: string[];
    visible = true;
    selected = {
        minute: '00',
        hour: '00',
        period: 'am'
    };
    useMoment = false;

    private _value: Date | Moment;
    left = -4000;
    top = -4000;
    width = 180;


    constructor() {
    }


    propagateChange = (_: any) => {
    }

    ngOnInit() {
        this.calculateMinuteSteps();
        this.hours = [
            '12',
            '01',
            '02',
            '03',
            '04',
            '05',
            '06',
            '07',
            '08',
            '09',
            '10',
            '11'
        ];
    }

    ngAfterViewInit() {
        if (this.timepickerRef.isAttached) {
            this.timepickerRef.detach();
        }
    }

    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
        this.propagateChange(value);
    }

    calculateMinuteSteps() {
        this.minutes = [];
        for (let i = 0; i < 60; i += this.steps) {
            let minute = i.toString();
            if (minute.length < 2) {
                minute = '0' + minute;
            }
            this.minutes.push(minute);
        }
    }

    private validDate(date: Date) {
        return date instanceof Date && (!date.getTime() || !isNaN(date.getTime()));
    }

    writeValue(obj: Date | Moment): void {
        if (!obj) {
            return;
        }
        if (!this.validDate(<any>obj)) {
            if (moment.isMoment(obj)) {
                this.useMoment = true;
            } else {
                throw new Error('Timepicker model must be date or moment object');
            }
        }
        this.getSelectedFromDate((this.useMoment) ? obj as Moment : moment(obj));
        this.value = obj;
        this.timeSelected.emit(this.value);
        this.propagateChange(this.value);
    }

    getSelectedFromDate(date: Moment) {
        this.selected = {
            minute: date.format('mm'),
            hour: date.format('hh'),
            period: date.format('a'),
        };

        if (parseInt(this.selected.minute, 10) % 5 !== 0) {
            this.selected.minute =
                (parseInt(this.selected.minute, 10) - (parseInt(this.selected.minute, 10) % 5)).toString();
            while (this.selected.minute.length < 2) {
                this.selected.minute = '0' + this.selected.minute;
            }
        }
    }

    setHour(hour: string) {
        this.selected.hour = hour;
        this.getDateFromSelected();
    }

    setMinute(minute: string) {
        this.selected.minute = minute;
        this.getDateFromSelected();
    }

    setPeriod(period: string) {
        this.selected.period = period;
        this.getDateFromSelected();
    }

    getDateFromSelected() {
        let hours = parseInt(this.selected.hour, 10);

        if (this.selected.period === 'pm' && hours < 12) {
            hours += 12;
        }
        if (this.selected.period === 'am' && hours === 12) {
            hours = 0;
        }
        let date: Date;
        if (!this.useMoment) {
            date = this.getNewDateFromDate(<any>this.value);
        } else {
            date = (this.value as Moment).toDate();
        }
        date.setHours(hours);
        date.setMinutes(parseInt(this.selected.minute, 10));
        date.setSeconds(0);

        if (!this.useMoment) {
            this.value = date;
        } else {
            this.value = moment(date);
        }
        this.timeSelected.emit(this.value);
    }

    getNewDateFromDate(date: Date) {
        if (date) {
            return new Date(date.getTime());
        }

        return new Date();
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
    }

    setDisabledState(isDisabled: boolean): void {
    }

    updatePosition(trigger: ElementRef) {
        this.top = trigger.nativeElement.getBoundingClientRect().bottom + 8;
        this.left = trigger.nativeElement.getBoundingClientRect().left;
        this.width = trigger.nativeElement.clientWidth;
    }

    scrollSelectedIntoView() {
        const selectedHourElement = this.findNodeByContent(this.hourList.nativeElement.childNodes, this.selected.hour);
        const selecedMinuteElement = this.findNodeByContent(this.minuteList.nativeElement.childNodes, this.selected.minute);

        if (selectedHourElement) {
            this.smoothScroll(this.hourList.nativeElement, (selectedHourElement as HTMLElement).offsetTop);
        }
        if (selecedMinuteElement) {
            this.smoothScroll(this.minuteList.nativeElement, (selecedMinuteElement as HTMLElement).offsetTop);
        }
    }

    smoothScroll(element: HTMLElement, scrollTop: number) {
        if (element.scrollTop < scrollTop && element.scrollTop < element.scrollHeight) {
            // window.requestAnimationFrame(<any>this.smoothScroll(element, scrollTop));
            element.scrollTop = scrollTop;
        }
    }

    findNodeByContent(nodes: Node[], searchTerm: string) {
        const matching = [];
        for (let i = 0; i < nodes.length; i++) {
            if ((<any>nodes[i].textContent).trim() === searchTerm.toString()) {
                matching.push(nodes[i]);
            }
        }

        if (matching[0]) {
            return matching[0];
        }
    }
}
