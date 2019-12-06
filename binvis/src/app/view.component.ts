/**
* Interface for all the components that must be displayed
*/
export interface ViewComponent {
	cardClass : string;
	isRunning : boolean;

	moveFrames(f : number) : void;

	showData(dataInput : {[type : string] : File}) : void;

	
}