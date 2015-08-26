
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

  var path = "data/Explosions/";

  //g_xml = loadXML("data/Explosions/DATA.XML");
  g_xml=loadXMLDoc(path + "DATA.XML");
//  g_img = loadImage("data/Explosions/Flare7.png");

  EffectsLibrary.Init();
  EffectsLibrary.Load(g_xml);

  var images = EffectsLibrary.GetShapes();

  for(var i=0;i<images.length;i++)
  {
    var filename = path + stripFilePath(images[i].GetFilename());

    //  console.log(filename);
    images[i].m_image = loadImage(filename);
  }

  // PASS xml data to particle manager
//  EffectsLibrary.ClearAll();
}


function setup() {
  // put setup code here
  var w = 450;
  var h = 450;
  createCanvas(w,h);

  g_particleManager.SetScreenSize(w,h);
  g_particleManager.SetOrigin(0, 0);

  //var e = EffectsLibrary.GetEffect("Stylised/Stylised 4");



  var e = EffectsLibrary.GetEffect("Fireballs/FireBall1");

  e.CompileAll();

//  var e = EffectsLibrary.GetEffect("Stylised/Stylised 4");
  console.log("cloning");
  var eCopy = new Effect(e,g_particleManager);


  g_particleManager.AddEffect(eCopy);

//  var eCopy = e.clone();

  //e.SetParticleManager(g_particleManager);

//  g_particleManager.AddEffect(e);

  //var copy = new TLFX::Effect(*eff, gPM);

    //  copy->SetPosition(0.0f, 0.0f);
    //gPM->AddEffect(copy);

//  console.log(eff);

//  console.log(pm);
//  imageMode(CENTER);
}

// fix up bool/ints when parsing xml
function DrawSprite(sprite, px, py, tv, x, y, rotation, scaleX, scaleY, r, g, b, a, blend)
{
    translate(px,py);
    image(sprite.m_image,0,0);

    console.log(sprite);
    console.log(r);
//  console.log(x);
//  console.log(y);
}

var g_rotation = 0;
function draw() {

  background(0);
  console.log("Update-------->");
  g_particleManager.Update();
  g_particleManager.DrawParticles();

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
