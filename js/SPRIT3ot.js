//some buffers, several objects will be dropped, in several order
// but THREE has to procceed object creating and adding in a precise oreder.
// so will need buffer tto Procceed in TWO step; Loading and then creating
// when everything needed is loaded

var texureBuffer;
var objBuffer;
var mtlBuffer;

var mtlloaded = false;
var objloaded = false;
var textureloaded = false;

// A litte boolean to tell to render function if catching rendered image is
// requested
var catchRender = false;

// THREE needs
var container;
var camera, scene, renderer, mesh, controls;



function traverseFileTree( item, path )
{
	path = path || "";
	
	if ( item.isFile )
	{
		// Get file
		item.file( function(file)
		{
			// Traverse is a recursive function, so	
			// we first need to know what kind of file is procceeded each time
		
			// we call slice on the file.name (string js object) to get 
			// a string object which contain the 3 last char of file name.
			var mimetype = file.name.slice( file.name.length - 3,
			                                file.name.length      );
			
			// here the 3 different case will have the pretty same processing
			// we onlny get datas and store it in (global scope) buffers
			// booleans are also used to indicate in global scope which buffer are
			// filled or not.
			// these booleans will be checked every 1 second by a setInterval handler
			//
			// NOTE: it's' a fast safe way, event management from here should be smarter
			
			
			
			// PROCCESSING CASE
			// the only difference in these 3 processing is on the read function
			// called from reader :
			// - reader.readAsText(file); in case of .mtl or .obj which are text file
			// - reader.readAsDataURL(file); in case of texture file
			if (mimetype == "mtl")
			{
				console.log("materials loading");
				reader = new FileReader();
				reader.onload = function(event)
				{
					mtlBuffer = event.target.result;
					mtlloaded = true;
				};
				reader.readAsText(file);
			}
			if ( mimetype == "obj")
			{
				console.log("mesh loading");
				reader = new FileReader();
				reader.onload = function(event)
				{
					objBuffer = event.target.result;
					objloaded = true;
				};
				reader.readAsText(file);
			}

			if ( mimetype == "jpg" | mimetype == "JPG")
			{
				console.log("texture loading");
				reader = new FileReader();
				reader.onload = function(event)
				{
					 textureBuffer = event.target.result;
					 textureloaded = true;
				};
				reader.readAsDataURL(file);
			}
		});
	}
	// here is the recursive part of the function, in case of it found directory
	// it call itself.
	// so texture may be able to be readed even if they are in a sub folder
 
	else if (item.isDirectory)
	{
	     // Get folder contents
	     var dirReader = item.createReader();
	     
	     dirReader.readEntries(function(entries) {
	         for (var i = 0; i < entries.length; i++) {
	             traverseFileTree(entries[i], path + item.name + "/");
	         }
	     });
	 }
}

// This function is called when a texture is loaded.
// it test itsefl if the mesh is already created if not, textureloaded stay on
// true state, so the function will be called again until full success 
function mapTexture()
{
	var image = document.createElement('img');
	image.src = textureBuffer;
	var texture = new THREE.Texture(image);
	mesh.traverse( function ( child ) {
		// test if esh is created
		if ( child instanceof THREE.Mesh ) {

			child.material.map = texture;
			// avoid future calling
			// it should be cleaner to use a separate boolean like textureMapped
			textureloaded = false;
			
			texture.needsUpdate = true;
			render();
		}
	});              
}
// this function is called when .obj AND .mtl are loaded
// it create the mesh and add it to the THREE scene
function onStuffLoaded()
{
	// avoid future calling
	// it should be cleaner to use a separate boolean like objectCreated
	mtlloaded = false;
	objloaded = false;
	// instanciate a THREE material loader.
	var mtlLoader = new THREE.MTLLoader();
	// get THREE material object suiable with OBJ loader
	var mbuff = mtlLoader.parse(mtlBuffer);

	// instanciate a THREE OBJ loader.
	var loader = new THREE.OBJLoader();
	// .obj contain mesh data, these data refer to materials. so it nbetter
	// lo loat material before readng mesh data
	loader.setMaterials(mbuff);
	// We now read mesh data fromf previosly stored buffer
	var object = loader.parse( objBuffer );
	
	// copy loaded object to a global scope var
	// ( in js only references are copyed )
	mesh = object;
	// add to scene ...
	scene.add(object);
	// fit Camera zoom to object ...
	fitCameraToObject ( camera, mesh, 1.25);
	
	
	// some line to change the drop holder (DOM elememt ) to a kind of button;
	// et DOM elem :
	var holder = document.querySelector('#holder');
	// od DOM elem:
	holder.innerHTML = "Rotates"
	holder.id = "start";
	holder.style.borderRadius = "1em"; 
	holder.onclick = rotate;

	render();
}
function rotate () {

	var rx = ry = rz = 0;
	// remove the start button from DOM
	var startbutton = document.querySelector('#start');
	startbutton.remove();

	// let the render function know that rendering catching is requested
	catchRender = true;
	for ( var i = 0 ; i < 10+10 ; i++)
	{
		if (i < 10) {
			rx += Math.PI / 24;
		} else 
		{
			ry += Math.PI / 24;
		}
		mesh.rotation.x = rx;
		mesh.rotation.y = ry;
		mesh.rotation.z = rz;

		render();		 
	}
	catchRender = false;
}

function init() {
	
	
	// we create a dom element which will contain the THREE renderer
	// we also could had created it from html and then retrived it from js
	// example:
	
	// HTML:
	// <div id="rendererContainer"></div>
	
	// JS:
	//	var  container = document.querySelector('#rendererContainer');	
	 container = document.createElement('div');
	 document.body.appendChild(container);

	 // scene
	 scene = new THREE.Scene();
	 
	 // camera
	 camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
	 camera.aspect = window.innerWidth / window.innerHeight;
	 camera.position.z = 10;
	 camera.position.x = 0;
	 camera.position.y = 0;
	 camera.lookAt(scene.position);
	 controls = new THREE.OrbitControls( camera );
	 

	 scene.add( new THREE.HemisphereLight( 0x443333, 0x111122 ) );

	addShadowedLight( 1, 1, 1, 0xffffff, 1.35 );
	addShadowedLight( 0.5, 1, -1, 0xffaa00, 1 );



	 
	 scene.add(camera);

	 camera.updateProjectionMatrix();
	// rederer
	 renderer = new THREE.WebGLRenderer();
	 renderer.setClearColor( 0xffffff, 1.0);
	 renderer.setPixelRatio(window.devicePixelRatio);
	 renderer.setSize(window.innerWidth, window.innerHeight);
				renderer.gammaInput = true;
				renderer.gammaOutput = true;

				renderer.shadowMap.enabled = true;
	 
	 
				var plane = new THREE.Mesh(
					new THREE.PlaneBufferGeometry( 40, 40 ),
					new THREE.MeshPhongMaterial( { color: 0x999999, specular: 0x101010 } )
				);
				plane.rotation.x = -Math.PI/2;
				plane.position.y = -0.5;
				scene.add( plane );

				plane.receiveShadow = true;
	 
	 			var frame;

			new THREE.MTLLoader()
				.setPath( 'models/' )
				.load( 'frame.mtl', function ( materials ) {

					materials.preload();

					new THREE.OBJLoader()
						.setMaterials( materials )
						.setPath( 'models/' )
						.load( 'frame.obj', function ( object ) {

							alpine = object;
					object.castShadow = true;
					object.receiveShadow = true;
							scene.add( object );


						} );

				} );

	 
	 container.appendChild(renderer.domElement);

	 // shut firefox up !
	 // Firefox use to flood console with 100' of Shader warning ... 
	 var ctx = renderer.context;
	 ctx.getShaderInfoLog = function() {
	     return ''
	 };
	// edd a resize event listener to update camera properties 
	 window.addEventListener('resize', onWindowResize, false);

	 renderer.render(scene, camera);

	 setupDragDrop();

}
			function addShadowedLight( x, y, z, color, intensity ) {

				var directionalLight = new THREE.DirectionalLight( color, intensity );
				directionalLight.position.set( x, y, z );
				scene.add( directionalLight );

				directionalLight.castShadow = true;

				var d = 1;
				directionalLight.shadow.camera.left = -d;
				directionalLight.shadow.camera.right = d;
				directionalLight.shadow.camera.top = d;
				directionalLight.shadow.camera.bottom = -d;

				directionalLight.shadow.camera.near = 1;
				directionalLight.shadow.camera.far = 4;

				directionalLight.shadow.mapSize.width = 1024;
				directionalLight.shadow.mapSize.height = 1024;

				directionalLight.shadow.bias = -0.002;

			}
function fitCameraToObject ( camera, object, offset, controls ) {

	offset = offset || 1.25;

	const boundingBox = new THREE.Box3();

	// get bounding box of object - this will be used to setup controls and camera
	boundingBox.setFromObject( object );

	const center = boundingBox.getCenter();
	const size = boundingBox.getSize();

	console.log (size);

	// get the max side of the bounding box (fits to width OR height as needed )
	const maxDim = Math.max( size.x, size.y, size.z );
	const fov = camera.fov * ( Math.PI / 180 );

	console.log ("fov: "+fov);
	let cameraZ = maxDim / 2 / Math.tan(Math.PI * camera.fov / 360);

	//    let cameraZ = Math.abs( maxDim / 4 * Math.tan( fov * 2 ) );

	cameraZ *= offset; // zoom out a little so that objects don't fill the screen

	camera.position.z = cameraZ;
	console.log (cameraZ);

	const minZ = boundingBox.min.z;
	const cameraToFarEdge = ( minZ < 0 ) ? -minZ + cameraZ : cameraZ - minZ;

	camera.far = cameraToFarEdge * 3;
	camera.updateProjectionMatrix();

	if ( controls ) {
		// set camera to rotate around center of loaded object
		controls.target = center;
		// prevent camera from zooming out far enough to create far plane cutoff
		controls.maxDistance = cameraToFarEdge * 2;
		controls.saveState();
	}
	else {
		camera.lookAt( center )
	}
}
function onWindowResize() {

	 camera.aspect = window.innerWidth / window.innerHeight;
	 camera.updateProjectionMatrix();

	 renderer.setSize(window.innerWidth, window.innerHeight);

}
function setupDragDrop() {
	 var holder = document.querySelector('#holder');
	 // check if filereader is available
	 if (typeof window.FileReader === 'undefined') {
	     console.error("Filereader not supported");
	 }
	 holder.ondragover = function() {
	     this.className = 'hover';
	     return false;
	 };
	 holder.ondragleave = function() {
	     this.className = '';
	     return false;
	 };
	 holder.ondragend = function() {
	     this.className = '';
	     return false;
	 };
	 holder.ondrop = function(e) {
	     this.className = '';
	     e.preventDefault();

	     var items = e.dataTransfer.items;
	     for (var i = 0; i < items.length; i++) {
	         // webkitGetAsEntry is where the magic happens
	         var item = items[i].webkitGetAsEntry();
	         if (item) {
	             traverseFileTree(item);
	         }
	     }
	 }
}
function render()
{
	renderer.render(scene, camera);
	
	if ( catchRender == true )
	{		
		// we get image frome renderer
		var imgData = renderer.domElement.toDataURL();
		// we create an empty Dom image element
		var image = document.createElement('img');
		// We fill it source with data getted from rendere
		image.src = renderer.domElement.toDataURL();
		// then add image dom element to the body
		document.querySelector('body').appendChild(image);
	}
}

init();

document.addEventListener( 'mousemove', render, false );
setInterval(function()
{
	 if ( mtlloaded == true && objloaded == true ) onStuffLoaded();
	 if ( textureloaded == true ) mapTexture();
	 
}, 1000);


