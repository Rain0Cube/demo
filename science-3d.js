/*
This is a demo, the code is not fully refactored yet.
*/

/*
p5.js function implementation
*/

class VectorClass {
  constructor() {
  }
  add(vector1,vector2) {
    let vector = vector1.copy()
    vector.x += vector2.x
    vector.y += vector2.y
    vector.z += vector2.z

    return createVector(vector.x,vector.y,vector.z)
  }
  div(vector1,factor) {
    let vector = vector1.copy()
    vector.x = vector.x/factor
    vector.y = vector.y/factor
    vector.z = vector.z/factor

    return createVector(vector.x,vector.y,vector.z)
  }
  mult(vector1,factor) {
    let vector = vector1.copy()
    vector.x = vector.x * factor
    vector.y = vector.y * factor
    vector.z = vector.z * factor

    return createVector(vector.x,vector.y,vector.z)
  }
  copy(vector1) {
    vector = {}
    vector.x = vector1.x
    vector.y = vector1.y
    vector.z = vector1.z
    return createVector(vector.x,vector.y,vector.z)
  }
}
const Vector = new VectorClass()


var system = {}

function draw() {
  //Dummy
}

function color(color) {
  return color;
}

function createCanvas(x,y,mode) {
  system.width = x;
  system.height = y;
  width = x
  height = y

  system.scene = new THREE.Scene();

  system.renderer = new THREE.WebGLRenderer();
  system.renderer.shadowMap.enabled = true;

  system.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  system.renderer.outputEncoding = THREE.sRGBEncoding;

  if(!mode) {
    system.camera = new THREE.OrthographicCamera( 0, x,0, y, 1, 1000 )
    system.camera.position.z = 100;
    system.renderer.setSize( x, y );
    system.camera.projectionMatrix.scale
    (new THREE.Vector3(1, -1, 1));

  } else {
    system.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 2000 );
    system.camera.position.set( 10, 40, 120 );
    system.renderer.setSize( window.innerWidth, window.innerHeight );
    system.renderer.setPixelRatio( window.devicePixelRatio );
    system.renderer.shadowMap.enabled = true;

    system.renderer.gammaInput = true;
    system.renderer.gammaOutput = true;

  }

  document.body.appendChild( system.renderer.domElement );

  const axesHelper = new THREE.AxesHelper( 50 );
  system.scene.add( axesHelper );
}

function background(color) {
  system.renderer.setClearColor( new THREE.Color( `rgb(${color}, ${color}, ${color})`), 1 );
}

function createVector(x,y,z) {
  if(z==undefined) z=0; //z can be optional

  let frame = 1;
  let vector = {x:x,y:y,z:z}

  vector.add = function(vector2) {
    vector.x += vector2.x/frame
    vector.y += vector2.y/frame
    vector.z += vector2.z/frame
  }

  vector.div = function(factor) {
    vector.x = vector.x/factor
    vector.y = vector.y/factor
    vector.z = vector.z/factor
  }

  vector.copy = function() {
    vectorCopy = {}
    vectorCopy.x = vector.x
    vectorCopy.y = vector.y
    vectorCopy.z = vector.z
    return createVector(vectorCopy.x,vectorCopy.y,vectorCopy.z)
  }
  return vector
}

var controls = false;

function random(min, max) {
  return Math.random() * (max - min) + min;
}

let framerate = false;
function frameRate(fr) {
  framerate = fr*1.5 //p5js frameRate is quite faster than d3js frameRate
}

//replace draw() with animate() and implement setup()
var setupOnce = false;
function animate() {

  if(!setupOnce && typeof setup === "function") {
    setup();
    setupOnce = true;
  }

  draw();

  if(system.renderer)
  system.renderer.render( system.scene, system.camera );
  if(!system.renderer) {
    requestAnimationFrame( animate );
  } else {
    if(framerate) {
    setTimeout( function() {
      requestAnimationFrame( animate );
    }, 1000 / framerate );
  } else {
    requestAnimationFrame( animate );
    }
  }
}

animate();

/*
science-sim.js function implementation
*/
var KineticMass = function(pos,vel,accel,radius,color) {
  const geometry = new THREE.SphereGeometry(radius/2,32,32);
  const material = new THREE.MeshBasicMaterial( {  color: new THREE.Color( color ),
    transparent: true,
    opacity:0.7} );
  const sphere = new THREE.Mesh( geometry, material );
  sphere.position.x = pos.x
  sphere.position.y = pos.y
  sphere.position.z = pos.z
  system.scene.add( sphere );

  sphere.mass = radius
  sphere.size = radius
  sphere.castShadow = true;


  // Frame
  // const wireframe = new THREE.WireframeGeometry( sphere.geometry ); //This has to be geometry
  //
  // const line = new THREE.LineSegments( wireframe );
  // line.material.depthWrite = false;
  // line.material.opacity = 0.3;
  // line.material.opacity = 0;
  // line.material.transparent = true;
  // // line.material.color = new THREE.Color( sphere.outline )
  // line.material.color = new THREE.Color( 'black' )
  // line.position.x = pos.x
  // line.position.y = pos.y
  // line.position.z = pos.z
  // sphere.outlinevectorCopyframe = line

  // Outline
  var outlineMaterial = new THREE.MeshBasicMaterial( { color: 0x000000, side: THREE.BackSide,
    transparent: true,
    opacity:1 } );
    var line = new THREE.Mesh( sphere.geometry, outlineMaterial );
    line.position.x = pos.x
    line.position.y = pos.y
    line.position.z = pos.z
    line.scale.multiplyScalar(1.13);
    sphere.outlinevectorCopyframe = line

    system.scene.add( line );

    sphere.vel = vel
    sphere.accel = accel
    line.vel = vel
    line.accel = accel

    sphere.trace = []
    sphere.lastTrace = new Date()

    sphere.update = function(surrounding)
    {
      sphere.previousVel = sphere.vel
      sphere.vel.add(sphere.accel);
      sphere.avgXVel = (sphere.previousVel.x+sphere.vel.x)/2;
      sphere.avgYVel = (sphere.previousVel.y+sphere.vel.y)/2;
      sphere.avgZVel = (sphere.previousVel.z+sphere.vel.z)/2;
      if(surrounding) {
        sphere.position.x = sphere.vel.x;
        sphere.position.y = sphere.vel.y;
        sphere.position.z = sphere.vel.z;
      } else {
        sphere.position.x += sphere.avgXVel;
        sphere.position.y += sphere.avgYVel;
        sphere.position.z += sphere.avgZVel;
      }
      line.position.x = sphere.position.x;
      line.position.y = sphere.position.y;
      line.position.z = sphere.position.z;

      if(sphere.tail==true) {
        sphere.trace.forEach((trace, i) => {
          trace.material.opacity = trace.material.opacity - 0.2/60
          if(trace.material.opacity<=0)
          sphere.trace.splice(i, 1);
        });

        if(new Date() - sphere.lastTrace > 100 && sphere.trace.length<100) {
          const traceGeo = new THREE.SphereGeometry(2,32,32);
          const traceMaterial = new THREE.MeshBasicMaterial( { color: new THREE.Color( sphere.tailFill ), opacity: 1, transparent: true, depthWrite: false } );

          const traceSphere = new THREE.Mesh( traceGeo, traceMaterial );
          traceSphere.position.x = sphere.position.x
          traceSphere.position.y = sphere.position.y
          traceSphere.position.z = sphere.position.z
          system.scene.add( traceSphere );
          sphere.trace.push(traceSphere)
          sphere.lastTrace = new Date()
        }
      }
    }

    sphere.display = function() {
      //Dummy
    }
    sphere.applyForce = function(force){
      f = force.copy()
      f.div(sphere.mass);
      sphere.accel = f;
    };

    sphere.wrapEdgesBounceFloor = function() {

      if (ball.position.x > width) {
        ball.position.x = 0 ;
      }
      else if (ball.position.x < 0) {
        ball.position.x = width ;
      }
      if(ball.position.y < -1*(height-ball.size/2)){
        // overiny = ball.position.y-height+ball.size/2;
        // vatheight = Math.sqrt(Math.pow(ball.vel.y,2)-2*ball.accel.y*overiny);
        ball.position.y = -1*(height-ball.size/2);
        // ball.vel.y = -1*vatheight;
        ball.vel.y = -1*ball.vel.y;
      }
    }

    return sphere
  }

  var Arrow = function(pos,vel) {
    let helper = {arrow:[],cylinder:[]}
    let height = ((vel.x)**2 + (vel.y)**2 + (vel.z)**2)**(1/2) * 15 *2 ; //15 to make vel longer
    let color = 'white'
    let posvectorCopyv = new THREE.Vector3( pos.x, pos.y, pos.z )
    let velvectorCopyv = new THREE.Vector3( vel.x, vel.y, vel.z )

    let material = new THREE.MeshBasicMaterial( {color: color} );
    let geometry = new THREE.CylinderGeometry( 2, 2, height, 32);

    let cylinder = new THREE.Mesh( geometry, material );

    var axis = new THREE.Vector3(0, 1, 0);
    cylinder.quaternion.setFromUnitVectors(axis, velvectorCopyv.clone().normalize());

    ratiovectorCopyx = Math.abs(vel.x) / ((vel.x)**2 + (vel.y)**2 + (vel.z)**2)**(1/2)
    ratiovectorCopyy = Math.abs(vel.y) / ((vel.x)**2 + (vel.y)**2 + (vel.z)**2)**(1/2)
    ratiovectorCopyz = Math.abs(vel.z) / ((vel.x)**2 + (vel.y)**2 + (vel.z)**2)**(1/2)
    cylinder.position.adjX = (vel.x - 0 !=0) ? ratiovectorCopyx*Math.sign(vel.x - 0)*height/2 : 0
    cylinder.position.adjY = (vel.y - 0 !=0) ? ratiovectorCopyy*Math.sign(vel.y - 0)*height/2 : 0
    cylinder.position.adjZ = (vel.z - 0 !=0) ? ratiovectorCopyz*Math.sign(vel.z - 0)*height/2 : 0
    cylinder.position.x = pos.x + cylinder.position.adjX;
    cylinder.position.y = pos.y + cylinder.position.adjY;
    cylinder.position.z = pos.z + cylinder.position.adjZ;

    helper.cylinder.push(cylinder)

    // Lines
    let dir = new THREE.Vector3( vel.x, vel.y, vel.z );
    dir.normalize();


    let origin = new THREE.Vector3( pos.x, pos.y, pos.z );
    let length = height + 15;
    let hex = color;

    let arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex, 15, 10 );

    arrowHelper.attach( cylinder );

    arrowHelper.originVel = vel
    cylinder.originVel = vel
    cylinder.originHeight = height
    arrowHelper.vel = vel
    cylinder.vel = vel

    helper.arrow.push(arrowHelper)
    system.scene.add( helper.arrow[0] );


    helper.update = function() {

      arrowHelper.position.x = helper.origin.x
      arrowHelper.position.y = helper.origin.y
      arrowHelper.position.z = helper.origin.z

      if(helper.color && cylinder.material.color!=helper.color) {
        cylinder.material.color.setHex( color2hex(helper.color) );
        arrowHelper.setColor( new THREE.Color( helper.color ) );
      }

      if(helper.target) {
        let newDir = new THREE.Vector3( helper.target.x, helper.target.y, helper.target.z )
        let normalize = ((helper.target.x)**2 + (helper.target.y)**2 + (helper.target.z)**2)**(1/2)
        let height = normalize ;
        arrowHelper.setDirection(newDir.normalize());
        arrowHelper.setLength(height, 15, 10);
        // 15 for arrow height
        cylinder.scale.y = (height-15)/cylinder.originHeight
        cylinder.position.y =+ (height-15)/2;
      }
    }

    helper.display = function() {
      //Dummy
    }

    return helper
  }

  var spotLight;
  /*
  Helper function
  */
  function color2hex(htmlColor) {
    var color ={}
    color.white = 0xFFFFFF
    color.sliver = 0xC0C0C0
    color.gray = 0x808080
    color.black = 0x000000
    color.red = 0xFF0000
    color.maroon = 0x800000
    color.yellow = 0xFFFF00
    color.olive = 0x808000
    color.lime = 0x00FF00
    color.green = 0x008000
    color.aqua = 0x00FFFF
    color.teal = 0x008080
    color.blue = 0x0000FF
    color.navy = 0x000080
    color.fuchsia = 0xFF00FF
    color.purple = 0x800080

    return color[htmlColor.toLowerCase()]
  }

  /*
  Extra function
  */
  system.mode = 'normal'
  let lightOnce = false;
  function darkMode() {

    if(!lightOnce){
      lightOnce = true;
      system.lightMode = {}
      system.lightMode.color = ball.material.color
      system.lightMode.background = 250

      //Create a new ambient light
      const ambient = new THREE.AmbientLight( 0xffffff, 0.1 );
      system.scene.add( ambient );

      //Create floor
      var floorMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff,opacity: 0.8, transparent: true } );

      var floorGeometry = new THREE.PlaneGeometry(800, 500);
      floorMaterial.side = THREE.DoubleSide;
      floorMaterial.shadowSide = THREE.DoubleSide;

      floorMaterial.needsUpdate = true;
      floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.receiveShadow = true;
      floor.position.x = 400;
      floor.position.y = -500;
      floor.rotation.x = -Math.PI / 2;
      system.scene.add(floor);

      // spotlight
      spotLight = new THREE.SpotLight( 0xffffff, 1 );
      spotLight.penumbra = 0.1;
      spotLight.decay = 0.2;

      // spotLight.distance = 900;
      // spotLight.position.set( system.width/2, 300, 0 );
      // spotLight.target=ball;
      // spotLight.angle = Math.PI / 20;
      spotLight.distance = 900;
      spotLight.position.set( system.width/2, 200, 0 );
      spotLight.target=floor;
      spotLight.angle = Math.PI / 7;
      spotLight.intensity = 1

      spotLight.castShadow = true;
      spotLight.shadow.mapSize.width = 512;
      spotLight.shadow.mapSize.height = 512;
      spotLight.shadow.camera.near = 10;
      spotLight.shadow.camera.far = 1200;
      spotLight.shadow.focus = 1;
      spotLight.shadowCameraFov = 30;
      system.scene.add( spotLight );
      spotLight.shadow.camera.updateProjectionMatrix()
      spotLight.target.updateMatrixWorld();

      // lightHelper = new THREE.SpotLightHelper( spotLight );
      // system.scene.add( lightHelper );
      //
      // shadowCameraHelper = new THREE.CameraHelper( spotLight.shadow.camera );
      // system.scene.add( shadowCameraHelper );

    }

    if(system.mode == 'normal') {
      ball.material = new THREE.MeshPhongMaterial({
        color: system.lightMode.color
      });

      background(11)
      system.camera = new THREE.PerspectiveCamera( 45, system.width / system.height, 1, 10000 );
      system.camera.position.set( 100, 0, 650 );
      system.camera.lookAt(floor.position);

      system.mode = 'dark'
      spotLight.target.updateMatrixWorld();

    } else {
      ball.material = new THREE.MeshBasicMaterial( { color: system.lightMode.color} )

      background(system.lightMode.background)
      system.camera = new THREE.OrthographicCamera( 0, system.width,0, system.height, 1, 1000 )
      system.camera.rotation.set( 0, 0, 0 );
      system.camera.position.set( 0, 0, 100 );
      system.camera.projectionMatrix.scale
      (new THREE.Vector3(1, -1, 1));
      system.mode = 'normal'
    }

  }
