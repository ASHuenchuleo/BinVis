import * as THREE from 'three'
import SpriteText from 'three-spritetext';
import OrbitControls from 'three-orbitcontrols';

import {ViewComponent} from './view.component';

import {CsvParser, 	AstrometryRecord} from './csv-parser';



export class ThreeDView implements ViewComponent{
	/** Speed factor of the orbit */
	protected speed : number = 5.0;
	/** Current index of the animation */
	protected index : number = 0;

	/** Scale of the animation */
	protected scale : number;

	/** Scaling function */
	protected scalinFun;

	/** width of the canvas */
	protected width : number = 400;
	/** height of the canvas */
	protected height : number = 400;

	/** Portion of the canvas used for graph */
	protected portion : number = 0.7;
	/* Maximum distance from the origin */
	protected maxDis : number = this.portion * this.width / 2;

	/** Scene for the orbit */
	protected scene;
	/** Camera of the view */
	protected camera;
	/** Renderer of the scene */
	protected renderer;
	/** Camera control */
	protected controls;

	/** Colors for the stars */
	protected primaryColor = 0x0000cc ;
	protected secondaryColor = 0xf39c12;


	/** Maximum value for position in absolute value */
	protected maxAbsPos : number;

	/** Name of the div where it should be drawn */
	protected divName : string;

	/* Scale factor for the plane size according to the axes size */
	planeFactor : number = 5;
	/* Plane Transparency */
	planeTrans : number = 0.2;
	/* Plane color */
	planeColor : string = 'rgb(178, 186, 187)';
	/* Line color */
	lineColor : string = 'rgb(127, 140, 141)';

	/** card class for the component view card */
	cardClass : string;

	/** State of the animation */
	isRunning : boolean;

	/** Not implemented on the parent class! */
	moveFrames(f : number) : void{
	}

	updateRotations(){
		return;
	}



	constructor(divName : string){
		/** Name of the div for the given component */
		this.divName = divName;

		if(window.innerWidth > 1200){ // lg screen
			this.width = 500;
		}
		if(1200 >= window.innerWidth && window.innerWidth > 500){ // sm screen
			this.width = 400;
		}
		if(500 >= window.innerWidth ){ // xs screen
			this.width = 3 * window.innerWidth/4;
		}
		this.height = this.width;
	}

	clean(obj = this.scene)
	{
	  this.isRunning = false;
	  if (obj instanceof THREE.Mesh || obj instanceof THREE.LineLoop || obj instanceof THREE.Line
	  	|| obj instanceof THREE.Sprite)
	  {
	      obj.geometry.dispose();
	      obj.geometry = null;
	      if (obj.material instanceof THREE.Material || obj.material instanceof THREE.SpriteMaterial
	      	|| obj.material  instanceof THREE.LineBasicMaterial || obj.material instanceof THREE.MeshBasicMaterial
	      	) {
	          obj.material.dispose();
	      }


	      obj.material = null;
	      this.scene.remove(obj);
	      obj = null;

	  }
	  else
	  {
	      if (obj.children !== undefined) {
	          while (obj.children.length > 0) {
	              this.clean(obj.children[0]);
	              obj.remove(obj.children[0]);
	          }
	      }
	  }
	  this.renderer.renderLists.dispose();

	}

	initScene()
	{

	  let elem = document.getElementById(this.divName);


	  /* Set up renderer */
	  this.renderer = new THREE.WebGLRenderer({alpha : true});
	  this.renderer.setPixelRatio( window.devicePixelRatio );
	  this.renderer.setSize( this.width, this.height );

	  elem.appendChild(this.renderer.domElement);

	  /* Set up camera */
	  this.camera = new THREE.OrthographicCamera(this.width / -3,
	                this.height / 3, this.height / 3, this.height / - 3, 1, 1000);
	  this.controls = new OrbitControls(this.camera, this.renderer.domElement);
	  this.camera.position.set( 0, 0, 200 );
	  this.controls.update();


	  /* Set up scene */
	  this.scene = new THREE.Scene();

	  /** Set up UI */

	  let onButtonClick = (event) => {
	  	this.camera = new THREE.OrthographicCamera(this.width / -3,
	  	              this.height / 3, this.height / 3, this.height / - 3, 1, 1000);
	  	this.controls = new OrbitControls(this.camera, this.renderer.domElement);
	  	this.camera.position.set( 0, 0, 200 );
	  	this.controls.update();
	  }

	  let buttons : any = document.getElementsByClassName("reset-view");
	  for(let button of buttons)
	  {
	  	button.addEventListener("click", onButtonClick, false);
	  	button.style.width = this.width + 'px';
	  }
	}


	buildScaling(pathx, pathy, pathz)
	{
	  let maxPos =  Math.max(...pathx, ...pathy, ...pathz);
	  let minPos =  Math.min(...pathx, ...pathy, ...pathz);

	  this.maxAbsPos = Math.max(Math.abs(maxPos), Math.abs(minPos))

	  this.scale =  this.maxDis / this.maxAbsPos;

      this.scalinFun = (x) => {return this.scale * x;}
	}


	/**
	* Draws the axis, ticks and labels
	* @param {number} tickLenght The length of each tick on the axes
	* @param {number} scale The 3D scale for the actual space
	* @param {number} length The length of the axes
	* @param {number} steps Number of ticks on the axis
	*/
	drawAxisLabels(tickLength, scale, length, steps){
	  let fontsize = 0.45 * length/steps;

	  /* Texto */
	  let labels = ['E ["]', 'N ["]', 'Z ["]'];
	  let colors = ['blue', 'red', 'green'];
	  let labelPos = [
	    new THREE.Vector3(-(length + 10), 10, 0),
	    new THREE.Vector3(0, (length + 10), 0),
	    new THREE.Vector3(0, 10, -(length + 10))];
	  let axisEndPoints = [
	    new THREE.Vector3(-length, 0, 0),
	    new THREE.Vector3(0, length, 0),
	    new THREE.Vector3(0, 0, -length)
	  ];

	  let labelsDistances = this.linspace(0, length, steps)


	  for(let i = 0; i < 3; i++)
	  {
	    var axisGeometry = new THREE.Geometry();
	    axisGeometry.vertices.push(new THREE.Vector3(0, 0,0));
	    axisGeometry.vertices.push(axisEndPoints[i]);

	    var axisMaterial = new THREE.LineBasicMaterial(
	      { color: colors[i] ,
	        linewidth : 2} );
	    let axis = new THREE.Line(axisGeometry, axisMaterial)

	    this.scene.add(axis);



	    var text = new SpriteText(labels[i]);
	    text.color = colors[i];
	    text.position.copy(labelPos[i]);
	    this.scene.add(text);

	    let tickSpacing = +((length/scale) / steps).toPrecision(2);
	    for(let j = 1; j < labelsDistances.length; j++)
	    {
	      let tickPosReal = j * tickSpacing;
	      let tickTextLen = String(tickPosReal).length;

	      switch(i){
	        case 0:
	          var pos = new THREE.Vector3(-labelsDistances[j], -tickTextLen/2*fontsize, 0);
	          var tickStart = new THREE.Vector3(-labelsDistances[j], -tickLength/2, 0);
	          var tickEnd = new THREE.Vector3(-labelsDistances[j], tickLength/2, 0);
	          var rotation = -Math.PI/2;
	          break;
	        case 1:
	          var pos = new THREE.Vector3(tickTextLen/2*fontsize, labelsDistances[j], 0);
	          var tickStart = new THREE.Vector3(-tickLength/2, labelsDistances[j], 0);
	          var tickEnd = new THREE.Vector3(tickLength/2, labelsDistances[j], 0);
	          var rotation = 0;
	          break;
	        case 2:
	          var pos = new THREE.Vector3(0, -tickTextLen/2*fontsize, -labelsDistances[j]);
	          var tickStart = new THREE.Vector3(0, -tickLength/2, -labelsDistances[j]);
	          var tickEnd = new THREE.Vector3(0, tickLength/2, -labelsDistances[j]);
	          var rotation = -Math.PI/2;
	          break;
	      }

	      var text = new SpriteText(tickPosReal);
	      text.color = colors[i];
	      text.position.copy(pos);
	      text.textHeight = fontsize;
	      text.material.rotation = rotation;
	      this.scene.add(text);

	      var tickGeometry = new THREE.Geometry();
	      tickGeometry.vertices.push(tickStart);
	      tickGeometry.vertices.push(tickEnd);


	      var tickMaterial = new THREE.LineBasicMaterial(
	        { color: colors[i] ,
	          linewidth : tickLength/4} );
	      let tick = new THREE.Line(tickGeometry, tickMaterial)


	      this.scene.add(tick);
	    }
	 	}
	}



	/**
	* Draws the dotted line representing the orbit
	* @param {number[]} xPath x positions for the orbit
	* @param {number[]} yPath y positions for the orbit
	* @param {number[]} zPath z positions for the orbit
	* @param {number} color Color for the line
	* @param {number} segLen Number of points per segment
	*/
	drawOrbitLine(xPath, yPath, zPath, color='black', segLen = 15) {


	  let material = new THREE.LineBasicMaterial(
	    { color: color,
	      linewidth : 1} );

	  let geometry = new THREE.Geometry();

	  for(let i = 0; i < xPath.length; i++){
	    if(i%segLen===0 && i!=0){


	      let line = new THREE.Line( geometry, material );
	      this.scene.add(line);

	      geometry = new THREE.Geometry();
	      i+= parseInt(String(segLen/4));
	    }
	    geometry.vertices.push(new THREE.Vector3(xPath[i], yPath[i], zPath[i]));
	  }
	}

	/**
	* Draws a line between the start and end spots
	* @param {THREE.Vector3} start
	* @param {THREE.Vector3} stop
	* @param {string} color
	* @return {THREE.Line} The line object
	*/
	drawLine(start : THREE.Vector3, stop : THREE.Vector3, color : string)
	{
		let material = new THREE.LineBasicMaterial(
		  { color: color,
		    linewidth : 1} );

		let geometry = new THREE.Geometry();
	    geometry.vertices.push(start);
	    geometry.vertices.push(stop);


		let line = new THREE.Line( geometry, material );
		this.scene.add(line);

		return line;
	}

	/**
	* Draws a star with given properties, and returns the mesh
	* @param {number} color Color for the mesh
	* @param {number} size Size for the star
	* @return {Mesh} primary The mesh for the primary
	*/
	drawStar(color, size){
	  let starGeometry = new THREE.CircleGeometry(size, 16)
	  let starMaterial = new THREE.MeshBasicMaterial({
	      color: color,
	      side : THREE.DoubleSide
	  });
	  let star = new THREE.Mesh(starGeometry, starMaterial);
	  this.scene.add(star);

	  return star;
	}



	/**
	* Draws a star projection with given properties as a circle, and returns the mesh
	* @param {Scene} scene Scene to drawn the primary
	* @param {number} color Color for the mesh
	* @param {number} size Size for the star
	* @return {Mesh} primary The mesh for the primary
	*/
	drawStarProjection(color, size){
	  let starGeometry = new THREE.CircleGeometry(size, 16)
	  starGeometry.vertices.shift();
	  let starMaterial = new THREE.LineBasicMaterial({
	      color: color,
	      side : THREE.DoubleSide,
	      linewidth : 2
	  });
	  let star = new THREE.LineLoop(starGeometry, starMaterial);
	  this.scene.add(star);

	  return star;
	}

	/**
	* Draws a node as a filled square
	* @param {number} color Color for the mesh
	* @param {number} size Size for the marker
	*/
	drawNode(color, size){
	  let nodeGeometry = new THREE.PlaneGeometry(2 * size, 2 * size, 1, 1)
	  let nodeMaterial = new THREE.MeshBasicMaterial({
	      color: color,
	      side : THREE.DoubleSide
	  });
	  let node = new THREE.Mesh(nodeGeometry, nodeMaterial);
	  this.scene.add(node);

	  return node;
	}

	/**
	* Draws a node projection as an empty square
	* @param {number} color Color for the mesh
	* @param {number} size Size for the marker
	*/
	drawNodeProjection(color, size){
		let nodeGeometry = new THREE.EdgesGeometry(new THREE.PlaneGeometry(2 * size, 2 * size, 1, 1));
		let nodeMaterial = new THREE.LineBasicMaterial({
		    color: color,
		    side : THREE.DoubleSide,
		    linewidth : 2
		});
		let node = new THREE.LineSegments(nodeGeometry, nodeMaterial);
		this.scene.add(node);

		return node;
	}


	linspace(init, end, N)
	{
	    let ans = [];
	    let step = (end - init)/N;
	    for(let i = 0; i <= N; i++) ans.push(init + i * step);
	    return ans;
	}

	/**
	* Draws the X-Y plane
	* @param {number} length The length of the axes
	* @param {number} steps Number of steps for the plane
	*/
	drawXYPlane(length, steps){
	  let planeProps = {
	    color : this.planeColor,
	    transparent : true,
	    opacity : this.planeTrans,
	    side : THREE.DoubleSide,  
	    depthWrite : false};
	  let planeLength = this.planeFactor * length;


	  let planeGeometry = new THREE.PlaneGeometry(
	    2 * planeLength, 2 * planeLength);
	  let planeMaterial = new THREE.MeshBasicMaterial(planeProps);
	  let plane = new THREE.Mesh(planeGeometry, planeMaterial);
	  this.scene.add(plane);

	  // Funcion auxiliar

	  let lineSteps = 2 * this.planeFactor * steps;
	  let linesDistances = this.linspace(-planeLength, planeLength, lineSteps);

	  let lineProps = {
	    color : this.lineColor,
	    transparent : true,
	    opacity : this.planeTrans,
	    depthWrite : false};
	  /* Lines for the grid */
	  for(let i = 0; i <= lineSteps; i++)
	  {
	    /* X axis */
	    var lineStart = new THREE.Vector3(-planeLength, linesDistances[i], 0);
	    var lineEnd = new THREE.Vector3(planeLength, linesDistances[i], 0);

	    var lineGeometry = new THREE.Geometry();
	    lineGeometry.vertices.push(lineStart);
	    lineGeometry.vertices.push(lineEnd);

	    var lineMaterial = new THREE.LineBasicMaterial(lineProps);
	    var line = new THREE.Line(lineGeometry, lineMaterial)

	    this.scene.add(line);


	    var lineStart = new THREE.Vector3(linesDistances[i], -planeLength, 0);
	    var lineEnd = new THREE.Vector3(linesDistances[i], planeLength, 0);

	    var lineGeometry = new THREE.Geometry();
	    lineGeometry.vertices.push(lineStart);
	    lineGeometry.vertices.push(lineEnd);

	    var lineMaterial = new THREE.LineBasicMaterial(lineProps);
	    var line = new THREE.Line(lineGeometry, lineMaterial)

	    this.scene.add(line);
	  }
	}

	animate = () => {
		if(this.isRunning)
	  		this.moveFrames(this.speed);

		this.updateRotations();

		this.controls.update();
		this.renderer.render( this.scene, this.camera );
	      
		requestAnimationFrame( this.animate );
	}


	/**
	* Sends the data in the recieved file to be drawn
	* @param {{[type : string] : File | undefined}} fileDict sent file
	*/
	showData(fileDict : {[type : string] : File | undefined}) : void{
		let astroFile = fileDict['astrometry'];
		if(!astroFile) return;

		let reader = new FileReader();

		reader.onload = () => {
		    var astroData = reader.result;
		    let csvRecordsArray = (<string>astroData).split(/\r\n|\n/); 


			let parser = new CsvParser();

		    let headersRow = parser.getHeaderArray(csvRecordsArray, " ");  
		    let records : AstrometryRecord[] = parser.getDataRecordsArrayFromCSVFile(csvRecordsArray,
		    	headersRow.length, false, " ", 'astrometry');
		    this.drawData(records);

		}
		reader.onerror = function () {  
		  console.log('error has occured while reading file!');  
		}

		reader.readAsText(astroFile);
	}

	
	/**
	* Template of the DrawData function
	*/
	drawData(records : AstrometryRecord[]){
		return;
	}

}