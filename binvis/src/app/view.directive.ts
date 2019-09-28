import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appView]'
})
/**
* Directive to tag templates on which the ViewComponents must be loaded
*/
export class ViewDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
