import { PosManagerService } from './pos-manager.service';
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
	protected initX : number;
	/* Final x pixel for graph */
	protected finalX : number;
	/* Starting y pixel for graph */
	protected initY : number;
	/* Final y pixel for graph */
	protected finalY : number;

	/** Scale of the vertical axis */
	protected scaleY : number;
	/** Scale of the horizontal axis */
	protected scaleX : number;

	/** Velocities of primary and secondary */
	protected velsPrimary : number[];
	protected velsSecondary : number[];

	/** Values for the x axis */
	protected Xaxis : number[];
	protected initialXaxis : number;
	protected finalXaxis : number;

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

	moveFrames(f : number) : void{
		return;
	}

	constructor(manager : PosManagerService, divName : string){
		this.divName = divName;

		if(window.innerWidth > 1200){ // lg screen
			this.width = 500;
			this.nT = 3;
		}
		if(1200 >= window.innerWidth && window.innerWidth > 500){ // sm screen
			this.width = 400;
			this.nT = 2;
		}
		if(500 >= window.innerWidth ){ // xs screen
			this.width = 3 * window.innerWidth/4;
			this.nT = 2;
		}
		this.height = this.width;

		this.initX = this.width * (1 - this.portionX) / 2 + 20;
		this.finalX = this.width * (1 + this.portionX) / 2 - 20;
		this.initY = this.height * (1 - this.portionY) / 2;
		this.finalY = this.height * (1 + this.portionY) / 2;
	}

	/** Sets up the scaling for both axis, given the values */
	buildScaling() : void
	{
	  this.maxVel =  Math.max(...this.velsPrimary, ...this.velsSecondary);
	  this.minVel =  Math.min(...this.velsPrimary, ...this.velsSecondary);

	  let sizeY = this.finalY - this.initY;
	  this.scaleY =  sizeY / (this.maxVel - this.minVel);


	  this.finalXaxis = this.Xaxis[this.Xaxis.length - 1];
	  this.initialXaxis = this.Xaxis[0];

	  let sizeX = this.finalX - this.initX;
	  this.scaleX =  sizeX / (this.finalXaxis -  this.initialXaxis);
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
	* @param {number} initX Lowest value for x position
	* @param {number} finalX Highest value for x position
	* @param {number} initY Lowest value for y position
	* @param {number} finalY Highest value for y position
	* @param {number} scaleX Scale relating pixel values to real values in x axis
	* @param {number} scaleY Scale relating pixel values to real values in y axis
	* @param {number} minX Minimum x value for real values
	* @param {number} maxX Maximum x value for real values
	* @param {number} minY Minimum y value for real values
	* @param {number} maxY Maximum y value for real values
	* @param {number} fontsize Font height in pixels
	* @param {Two}  two Two scene to drawn on
	*/
	drawCMVelLine(value, initX, finalX, initY, finalY, scaleX, scaleY,
	  minX, maxX, minY, maxY,
	  fontsize, two) : void
	{
		let lineYPos = finalY - (value - minY) * scaleY;

		let steps = 150;
		let cutSize = 1;
		let lineSize = 3;
		let anchors = [];
		let pos = initX;
		let step = (finalX - initX) / steps;
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
		var text = two.makeText('VCM = ' + value + ' km/s', finalX - 20, lineYPos + 10, style);
	}


	/**
	* Draws the axis for the current view (Note: y values are inverted)
	* @param {number} tickLength lengths of the tick in pixels
	* @param {string} xLabel Label for x axis
	* @param {string} yLabel Label for y axis
	* @param {number} nT Number of periods in the graph
	* @param {number} initX Lowest value for x position
	* @param {number} finalX Highest value for x position
	* @param {number} initY Lowest value for y position
	* @param {number} finalY Highest value for y position
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
	  xLabel, yLabel, initX, finalX, initY, finalY, scaleX, scaleY,
	  minX, maxX, minY, maxY,
	  fontsize, two) : void
	{
	  let lengthX = finalX - initX;
	  let lengthY = finalY - initY;
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
	    [initX + lengthX + 20, finalY],
	    [initX, finalY - lengthY - 10]
	    ];
	  let axisEndPoints = [
	    new Two.Anchor(initX + lengthX, finalY),
	    new Two.Anchor(initX, finalY - lengthY)
	    ];

	  let labelsDistancesX = linspace(initX, finalX, stepsX)
	  let labelsDistancesY = linspace(finalY, initY, stepsY)


	  /* Draw the axis */
	  for(let i = 0; i < 2; i++)
	  {
	    let anchors = [
	      new Two.Anchor(initX, finalY),
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

	    var pos = [labelsDistancesX[j], finalY + 2*tickLength];
	    var tickStart = new Two.Anchor(labelsDistancesX[j], finalY + tickLength/2);
	    var tickEnd = new Two.Anchor(labelsDistancesX[j], finalY - tickLength/2);
	    var labelTick = parseFloat((lengthX / scaleX) * j / stepsX + minX).toFixed(2);

	    var text = two.makeText(labelTick, pos[0], pos[1], styles[0]);

	    let anchors = [tickStart, tickEnd];
	    let tick = two.makeCurve(anchors, true);
	    tick.stroke = colors[0];
	  }

	  for(let j = 0; j < labelsDistancesY.length; j++)
	  {
	    var pos = [initX - 2*tickLength, labelsDistancesY[j]];
	    var tickStart = new Two.Anchor(initX - tickLength/2, labelsDistancesY[j]);
	    var tickEnd = new Two.Anchor(initX + tickLength/2, labelsDistancesY[j]);
	    var labelTick = parseFloat((lengthY/scaleY) * j / stepsY + minY).toFixed(0);

	    
	    var text = two.makeText(labelTick, pos[0], pos[1], styles[1]);

	    let anchors = [tickStart, tickEnd];
	    let tick = two.makeCurve(anchors, true);
	    tick.stroke = colors[1];
	  }

	  let tLines = linspace(initX,finalX, nT);

	  /** Draw the lines that divide periods */
	  for(let frac = 1; frac <= nT; frac++)
	  {
	    let pos = [tLines[frac], finalY];
	    let lineStart = new Two.Anchor(tLines[frac], finalY);
	    let lineEnd = new Two.Anchor(tLines[frac], initY);

	    let anchors = [lineStart, lineEnd];
	    let line = two.makeCurve(anchors, true);
	    line.stroke = 'grey';
	  }
	}
}