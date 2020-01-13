import { ConfigService} from './config.service';
import {ViewComponent} from './view.component';
import {CsvParser, VelocityRecord} from './csv-parser';

import Two from 'two.js'

import {linspace} from './utils';


export class TwoDView implements ViewComponent
{
	/** Speed factor of the orbit */
	protected speed : number = 1.0;
	/** Current index of the animation */
	protected index : number = 0;
	/** Numero de periodos en el gráfico */
	protected nT : number;


	protected width : number = 400;
	protected height : number = 400;


	/** Portion of the canvas used for graph */
	protected portionX : number = 0.9;
	protected portionY : number = 0.8;
	/* Starting x pixel for graph */
	protected initXpixel : number;
	/* Final x pixel for graph */
	protected finalXpixel : number;
	/* Starting y pixel for graph */
	protected initYpixel : number;
	/* Final y pixel for graph */
	protected finalYpixel : number;

	/** Scale of the vertical axis */
	protected scaleY : number;
	/** Scale of the horizontal axis */
	protected scaleX : number;

	/** Velocities of primary and secondary */
	protected velsPrimary : number[];
	protected velsSecondary : number[];

	/** Values for the x axis */
	protected Xaxis : number[];
	protected initXval : number;
	protected finalXval : number;

	/** Labels for the axis */
	protected xLabel : string;
	protected yLabel : string;

	/** Extremes for the velocity */
	protected minVel : number;
	protected maxVel : number;

	/** Parametrization */
	protected parametrization;

	/** Two.js scene */
	protected two : Two;

	/** HTML element for the view */
	protected elem;
	/** Params for the view */
	protected params;


	/* css class for the component view card */
	cardClass : string;

	/** Name of the div for the given component */
	divName : string;

	/** true of the animation is running */
	isRunning : boolean;

	/** Selected data point information dict */
	selectedData : { [id : string] : string}; 

	/** Selected object */
	selectedObj;

	// Colors
	dataColor1 = 'blue';
	dataColor2 = 'orange';

	dataColorSelected1 = 'orangered';
	dataColorSelected2 = 'darkblue';

    toFixed( num, precision ) {
    	var multiplicator = Math.pow(10, precision);
    	num = num * multiplicator;

    	return Math.round(num) / multiplicator;
    }

	moveFrames(f : number) : void{
		return;
	}

	constructor(config : ConfigService, divName : string){
		this.divName = divName;

		if(window.innerWidth > 1200){ // lg screen
			this.width = 500;
			this.nT = 2;
		}
		if(1200 >= window.innerWidth && window.innerWidth > 500){ // sm screen
			this.width = 400;
			this.nT = 1;
		}
		if(500 >= window.innerWidth ){ // xs screen
			this.width = 3 * window.innerWidth/4;
			this.nT = 1;
		}
		this.height = this.width;

		this.initXpixel = this.width * (1 - this.portionX) / 2 + 20;
		this.finalXpixel = this.width * (1 + this.portionX) / 2 - 20;
		this.initYpixel = this.height * (1 - this.portionY) / 2;
		this.finalYpixel = this.height * (1 + this.portionY) / 2;

		// Configuration
	}

	/** Sets up the scaling for both axis, given the values */
	buildScaling() : void
	{
	  this.maxVel =  Math.max(...this.velsPrimary, ...this.velsSecondary);
	  this.minVel =  Math.min(...this.velsPrimary, ...this.velsSecondary);

	  let sizeY = this.finalYpixel - this.initYpixel;
	  this.scaleY =  sizeY / (this.maxVel - this.minVel);


	  this.finalXval = this.Xaxis[this.Xaxis.length - 1];
	  this.initXval = this.Xaxis[0];

	  let sizeX = this.finalXpixel - this.initXpixel;
	  this.scaleX =  sizeX / (this.finalXval -  this.initXval);
	}

	ngOnDestroy() : void
	{
	  this.two.clear();
	}

	showData(fileDict : {[type : string] : File | undefined}) : void{
		let velFile = fileDict['velocity'];
		if(!velFile) return;

		let reader = new FileReader();

		reader.onload = () => {
		    var velData = reader.result;
		    let csvRecordsArray = (<string>velData).split(/\r\n|\n/); 


			let parser = new CsvParser();

		    let headersRow = parser.getHeaderArray(csvRecordsArray, " ");  
		    let records : VelocityRecord[] = parser.getDataRecordsArrayFromCSVFile(csvRecordsArray,
		    	headersRow.length, false, " ", 'velocity');

		    this.drawData(records);


		}
		reader.onerror = function () {  
		  console.log('error has occured while reading file!');  
		}

		reader.readAsText(velFile);


	}

	/**
	* Template of the DrawData function
	*/
	drawData(records : VelocityRecord[]){
		return;
	}

	update = (frameCount) => {
		/* For some reason, it requests a frame before Xaxis is defined */
	    if(this.isRunning)
	      this.moveFrames(this.speed)

	}

	/**
	* Creates a velocity graph, and returns the circle marking the current velocity
	* @param {number} size The size of the circle
	* @param {times} times The time array for the graph
	* @param {number[]} vels The velocity array for the graph
	* @param {Two} two The two canvas to draw on
	* @param {String} color The color for the graph
	* @return {Two.Circle} The circle marking the current velocity
	*/
	makeVelocityCurve(size, times, vels, two, color) : Two.Circle
	{
	  
	  var current = two.makeCircle(this.width, this.height, size);

	  current.fill = color;
	  current.noStroke();

	  let anchors = [];    
	  for(let i = 0; i < vels.length; i++){
	    anchors.push(new Two.Anchor(times[i], vels[i]));
	  }
	  let curve = two.makeCurve(anchors, true);
	  curve.linewidth = 2;
	  curve.stroke = color;
	  curve.noFill();

	  return current;
	}


	/**
	* Draws the dotted line for a given y value
	* @param {number} value Value to be drawn on the graph
	* @param {String} label Label for the line
	* @param {number} fontsize Font height in pixels
	*/
	drawCMVelLine(value, label, fontsize) : void
	{
		let lineYPos = this.finalYpixel - (value - this.minVel) * this.scaleY;

		let steps = 150;
		let cutSize = 1;
		let lineSize = 3;
		let anchors = [];
		let pos = this.initXpixel;
		let step = (this.finalXpixel - this.initXpixel) / steps;
		for(let i = 0; i < steps; i++){
		  if(i%lineSize===0 && i!=0){

		    let line = this.two.makeCurve(anchors, true);
		    line.color = 'grey';

		    i+=cutSize;
		    pos += cutSize * step;
		    anchors = [];
		  }
		  pos += step;
		  anchors.push(new Two.Anchor(pos, lineYPos));
		}

	  let style = {
	      family: 'arial',
	      size: fontsize,
	      leading: 50,
	      fill: 'black',
	      weight: 150
	    };
		var text = this.two.makeText(label, this.finalXpixel - 20, lineYPos + 10, style);
	}


	/**
	* Draws the axis for the current view. Y values are measured from the top
	* @param {number} tickLength lengths of the tick in pixels
	* @param {number} fontsize Font height in pixels
	*/
	drawAxis(tickLength, fontsize) : void
	{
	  let lengthX = this.finalXpixel - this.initXpixel;
	  let lengthY = this.finalYpixel - this.initYpixel;
	  let stepsX = 0.3 * lengthX / fontsize; 
	  let stepsY = 0.3 * lengthY / fontsize; 


	  /* Texto */
	  let labels = [this.xLabel, this.yLabel];
	  let colors = ['blue', 'red'];
	  let styles = [{
	      family: 'arial',
	      size: fontsize,
	      leading: 50,
	      fill: 'blue',
	      weight: 100
	    }, {
	      family: 'arial',
	      size: fontsize,
	      leading: 50,
	      fill: 'red',
	      weight: 100
	    }];
	  let labelPos = [
	    [this.initXpixel + lengthX + 20, this.finalYpixel],
	    [this.initXpixel, this.finalYpixel - lengthY - 10]
	    ];
	  let axisEndPoints = [
	    new Two.Anchor(this.initXpixel + lengthX, this.finalYpixel),
	    new Two.Anchor(this.initXpixel, this.finalYpixel - lengthY)
	    ];

	  let labelsDistancesX = linspace(this.initXpixel, this.finalXpixel, stepsX)
	  let labelsDistancesY = linspace(this.finalYpixel, this.initYpixel, stepsY)


	  /* Draw the axis */
	  for(let i = 0; i < 2; i++)
	  {
	    let anchors = [
	      new Two.Anchor(this.initXpixel, this.finalYpixel),
	      axisEndPoints[i]
	    ];
	    let axis = this.two.makeCurve(anchors, true);

	    axis.linewidth = 2;
	    axis.stroke = colors[i];
	    axis.noFill();

	    var text = this.two.makeText(labels[i], labelPos[i][0], labelPos[i][1], styles[i]);
	  }

	  /** Draw the labels */
	  for(let j = 0; j < labelsDistancesX.length; j++)
	  {

	    var pos = [labelsDistancesX[j], this.finalYpixel + 2*tickLength];
	    var tickStart = new Two.Anchor(labelsDistancesX[j], this.finalYpixel + tickLength/2);
	    var tickEnd = new Two.Anchor(labelsDistancesX[j], this.finalYpixel - tickLength/2);

	    let labelSpacing = +this.toFixed(((lengthX / this.scaleX) / stepsX), 2);
	    var tickPosReal = +this.toFixed((j * labelSpacing + this.initXval), 2);

	    var text = this.two.makeText(tickPosReal, pos[0], pos[1], styles[0]);

	    let anchors = [tickStart, tickEnd];
	    let tick = this.two.makeCurve(anchors, true);
	    tick.stroke = colors[0];
	  }

	  for(let j = 0; j < labelsDistancesY.length; j++)
	  {
	    var pos = [this.initXpixel - 2*tickLength, labelsDistancesY[j]];
	    var tickStart = new Two.Anchor(this.initXpixel - tickLength/2, labelsDistancesY[j]);
	    var tickEnd = new Two.Anchor(this.initXpixel + tickLength/2, labelsDistancesY[j]);

	    let labelSpacing = +this.toFixed(((lengthY / this.scaleY) / stepsY), 2);
	    var tickPosReal = +this.toFixed((j * labelSpacing + this.minVel), 2);
	    
	    var text = this.two.makeText(tickPosReal, pos[0], pos[1], styles[1]);

	    let anchors = [tickStart, tickEnd];
	    let tick = this.two.makeCurve(anchors, true);
	    tick.stroke = colors[1];
	  }

	  let tLines = linspace(this.initXpixel,this.finalXpixel, this.nT);

	  /** Draw the lines that divide periods */
	  for(let frac = 1; frac <= this.nT; frac++)
	  {
	    let pos = [tLines[frac], this.finalYpixel];
	    let lineStart = new Two.Anchor(tLines[frac], this.finalYpixel);
	    let lineEnd = new Two.Anchor(tLines[frac], this.initYpixel);

	    let anchors = [lineStart, lineEnd];
	    let line = this.two.makeCurve(anchors, true);
	    line.stroke = 'grey';
	  }
	}
}