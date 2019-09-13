import { Injectable } from '@angular/core';

import Two from 'two.js';

@Injectable({
  providedIn: 'root'
})
export class VelocityManagerService {

  constructor() { }

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

    let tLines = linspace(initX,finalX, 3);

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
