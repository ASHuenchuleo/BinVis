import { Type } from '@angular/core';

/**
* Class for creating the components in the view
*/
export class ViewItem {
  constructor(public component: Type<any>) {}
}