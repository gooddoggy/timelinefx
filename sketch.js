
/*
 Timelinejs port

 Options:
 1. Pure JS port
 2. asm.js port via emscriptem

 First option allows for procedural effects? Or an in browser editor (although could in theory still be possible)
 Second option would have better performance? Small API across boundary?

*/

function loadXMLDoc(filename)
{
if (window.XMLHttpRequest)
  {
  xhttp=new XMLHttpRequest();
  }
else // code for IE5 and IE6
  {
  xhttp=new ActiveXObject("Microsoft.XMLHTTP");
  }
xhttp.open("GET",filename,false);
xhttp.send();
return xhttp.responseXML;
}


var g_particleManager = new ParticleManager(1000,1);

var g_xml = null;
//var g_img = null;
function preload() {
  //g_xml = loadXML("data/Explosions/DATA.XML");
  g_xml=loadXMLDoc("data/Explosions/DATA.XML");
//  g_img = loadImage("data/Explosions/Flare7.png");

  EffectsLibrary.Init();
  EffectsLibrary.Load(g_xml);

  // PASS xml data to particle manager
//  EffectsLibrary.ClearAll();
}


function setup() {
  // put setup code here
  var w = 200;
  var h = 200;
  createCanvas(w,h);

  g_particleManager.SetScreenSize(w,h);
  g_particleManager.SetOrigin(0, 0);

  var eff = EffectsLibrary.GetEffect("Stylised/Stylised 2");

  console.log(eff);

//  console.log(pm);
  imageMode(CENTER);
}


var g_rotation = 0;
function draw() {

  background(0);
  g_particleManager.Update();

  // put drawing code here
  //ellipse(50, 50, 80, 80);

/*
  tint(200,80,25);
  translate(100,100);
  rotate(g_rotation);

  image(g_img,0,0);
  g_rotation += 0.1;
*/
}
