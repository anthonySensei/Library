import { NgControl } from '@angular/forms';
import {Directive, Input} from '@angular/core';

@Directive({
  selector: '[appDisableControl]'
})
export class DisableFormControlDirective {

  @Input()
  set appDisableControl( condition: boolean ) {
    const action = condition ? 'disable' : 'enable';
    this.ngControl.control[action]();
  }

  constructor( private ngControl: NgControl ) {
  }

}
