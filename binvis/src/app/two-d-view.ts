import { PosManagerService} from './pos-manager.service';
import { ConfigService} from './config.service';
import {ViewComponent} from './view.component';
import {CsvParser, VelocityRecord} from './csv-parser';

import Two from 'two.js'


export class TwoDView implements ViewComponent
{
	/** Speed factor of the orbit */
	protected speed : number = 5.0;
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

	/** Label for the x axis */
	protected xLabel : string;

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


	moveFrames(f : number) : void{
		return;
	}

	constructor(manager : PosManagerService, config : ConfigService, divName : string){
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
	* @param {number} width The width of the window
	* @param {number} height The height of the window
	* @param {times} times The time array for the graph
	* @param {number[]} vels The velocity array for the graph
	* @param {Two} two The two canvas to draw on
	* @param {String} color The color for the graph
	* @return {Two.Circle} The circle marking the current velocity
	*/
	makeVelocityCurve(width, height, times, vels, two, color) : Two.Circle
	{
	  
	  var current = two.makeCircle(width/2, height/2, 5);

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
	* @param {number} initXpixel Lowest value for x position
	* @param {number} finalXpixel Highest value for x position
	* @param {number} initYpixel Lowest value for y position
	* @param {number} finalYpixel Highest value for y position
	* @param {number} scaleX Scale relating pixel values to real values in x axis
	* @param {number} scaleY Scale relating pixel values to real values in y axis
	* @param {number} minX Minimum x value for real values
	* @param {number} maxX Maximum x value for real values
	* @param {number} minY Minimum y value for real values
	* @param {number} maxY Maximum y value for real values
	* @param {number} fontsize Font height in pixels
	* @param {Two}  two Two scene to drawn on
	*/
	drawCMVelLine(value, initXpixel, finalXpixel, initYpixel, finalYpixel, scaleX, scaleY,
	  minX, maxX, minY, maxY,
	  fontsize, two) : void
	{
		let lineYPos = finalYpixel - (value - minY) * scaleY;

		let steps = 150;
		let cutSize = 1;
		let lineSize = 3;
		let anchors = [];
		let pos = initXpixel;
		let step = (finalXpixel - initXpixel) / steps;
		for(let i = 0; i < steps; i++){
		  if(i%lineSize===0 && i!=0){

		    let line = two.makeCurve(anchors, true);
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
		var text = two.makeText('VCM = ' + value + ' km/s', finalXpixel - 20, lineYPos + 10, style);
	}


	/**
	* Draws the axis for the current view (Note: y values are inverted)
	* @param {number} tickLength lengths of the tick in pixels
	* @param {string} xLabel Label for x axis
	* @param {string} yLabel Label for y axis
	* @param {number} nT Number of periods in the graph
	* @param {number} initXpixel Lowest value for x position
	* @param {number} finalXpixel Highest value for x position
	* @param {number} initYpixel Lowest value for y position
	* @param {number} finalYpixel Highest value for y position
	* @param {number} scaleX Scale relating pixel values to real values in x axis
	* @param {number} scaleY Scale relating pixel values to real values in y axis
	* @param {number} minX Minimum x value for real values
	* @param {number} maxX Maximum x value for real values
	* @param {number} minY Minimum y value for real values
	* @param {number} maxY Maximum y value for real values
	* @param {number} fontsize Font height in pixels
	* @param {Two}  two Two scene to drawn on
	*/
	drawAxis(tickLength, nT,
	  xLabel, yLabel, initXpixel, finalXpixel, initYpixel, finalYpixel, scaleX, scaleY,
	  minX, maxX, minY, maxY,
	  fontsize, two) : void
	{
	  let lengthX = finalXpixel - initXpixel;
	  let lengthY = finalYpixel - initYpixel;
	  let stepsX = 0.3 * lengthX / fontsize; 
	  let stepsY = 0.3 * lengthY / fontsize; 

	  // Funcion auxiliar
	  let linspace = (init, end, N) => {
	    let ans = [];
	    let step = (end - init)/N;
	    for(let i = 0; i <= N; i++) ans.push(init + i * step);
	    return ans;
	  }

	  /* Texto */
	  let labels = [xLabel, yLabel];
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
	    [initXpixel + lengthX + 20, finalYpixel],
	    [initXpixel, finalYpixel - lengthY - 10]
	    ];
	  let axisEndPoints = [
	    new Two.Anchor(initXpixel + lengthX, finalYpixel),
	    new Two.Anchor(initXpixel, finalYpixel - lengthY)
	    ];

	  let labelsDistancesX = linspace(initXpixel, finalXpixel, stepsX)
	  let labelsDistancesY = linspace(finalYpixel, initYpixel, stepsY)


	  /* Draw the axis */
	  for(let i = 0; i < 2; i++)
	  {
	    let anchors = [
	      new Two.Anchor(initXpixel, finalYpixel),
	      axisEndPoints[i]
	    ];
	    let axis = two.makeCurve(anchors, true);

	    axis.linewidth = 2;
	    axis.stroke = colors[i];
	    axis.noFill();

	    var text = two.makeText(labels[i], labelPos[i][0], labelPos[i][1], styles[i]);
	  }

	  /** Draw the labels */
	  for(let j = 0; j < labelsDistancesX.length; j++)
	  {

	    var pos = [labelsDistancesX[j], finalYpixel + 2*tickLength];
	    var tickStart = new Two.Anchor(labelsDistancesX[j], finalYpixel + tickLength/2);
	    var tickEnd = new Two.Anchor(labelsDistancesX[j], finalYpixel - tickLength/2);

	    let labelSpacing = +((lengthX / scaleX) / stepsX).toPrecision(2);
	    var tickPosReal = +(j * labelSpacing + minX).toPrecision(2);

	    var text = two.makeText(tickPosReal, pos[0], pos[1], styles[0]);

	    let anchors = [tickStart, tickEnd];
	    let tick = two.makeCurve(anchors, true);
	    tick.stroke = colors[0];
	  }

	  for(let j = 0; j < labelsDistancesY.length; j++)
	  {
	    var pos = [initXpixel - 2*tickLength, labelsDistancesY[j]];
	    var tickStart = new Two.Anchor(initXpixel - tickLength/2, labelsDistancesY[j]);
	    var tickEnd = new Two.Anchor(initXpixel + tickLength/2, labelsDistancesY[j]);

	    let labelSpacing = +((lengthY / scaleY) / stepsY).toPrecision(2);
	    var tickPosReal = +(j * labelSpacing + minY).toPrecision(2);
	    
	    var text = two.makeText(tickPosReal, pos[0], pos[1], styles[1]);

	    let anchors = [tickStart, tickEnd];
	    let tick = two.makeCurve(anchors, true);
	    tick.stroke = colors[1];
	  }

	  let tLines = linspace(initXpixel,finalXpixel, nT);

	  /** Draw the lines that divide periods */
	  for(let frac = 1; frac <= nT; frac++)
	  {
	    let pos = [tLines[frac], finalYpixel];
	    let lineStart = new Two.Anchor(tLines[frac], finalYpixel);
	    let lineEnd = new Two.Anchor(tLines[frac], initYpixel);

	    let anchors = [lineStart, lineEnd];
	    let line = two.makeCurve(anchors, true);
	    line.stroke = 'grey';
	  }
	}
}