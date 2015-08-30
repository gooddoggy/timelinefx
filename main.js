function loadXMLDoc( filename )
{
  if ( window.XMLHttpRequest )
  {
    xhttp = new XMLHttpRequest();
  }
  else // code for IE5 and IE6
  {
    xhttp = new ActiveXObject( "Microsoft.XMLHTTP" );
  }
  xhttp.open( "GET", filename, false );
  xhttp.send();
  return xhttp.responseXML;
}

var g_particleManager = new ParticleManager( 1000, 1 );
var g_xml = null;
var g_images = [];
var g_loadedImageCnt = 0;
var g_canvas = null;
var g_context = null;

function OnImageLoaded()
{
  if(++g_loadedImageCnt >= g_images.length)
    mainLoop();
}

function Init()
{
  var path = "data/Explosions/";
  g_xml = loadXMLDoc( path + "DATA.XML" );
  EffectsLibrary.Init();
  EffectsLibrary.Load( g_xml );
  var images = EffectsLibrary.GetShapes();

  var imgFilenames = [];
  for ( var i = 0; i < images.length; i++ )
  {
    var filename = path + stripFilePath( images[ i ].GetFilename() );
    g_images[i] = new Image();
    g_images[i].onload = OnImageLoaded;
    g_images[i].src = filename;

    // Intrusively adding our render image
    images[i].m_image = g_images[i];
  }

  var w = 600;
  var h = 400;
  g_canvas = document.getElementById( "rendercanvas" );
  g_canvas.width = w;
  g_canvas.height = h;
  g_context = g_canvas.getContext( "2d" );

  g_particleManager.SetScreenSize(w,h);
  g_particleManager.SetOrigin(0, 0);

  var e = EffectsLibrary.GetEffect("Fireballs/FireBall1");
  //var e = EffectsLibrary.GetEffect("Stylised/Stylised Ground");
//  var e = EffectsLibrary.GetEffect("Stylised/Stylised 4");
//var e = EffectsLibrary.GetEffect("Multi Stage Explosions/Multi Stage Explosion 7");

//var e = EffectsLibrary.GetEffect("Ground Explosions/Mushroom 2");

  e.CompileAll();

  var eCopy = new Effect(e,g_particleManager);
  g_particleManager.AddEffect(eCopy);
}

var g_drawSpriteCalls = 0;
function DrawSprite(sprite, px, py, tv, x, y, rotation, scaleX, scaleY, r, g, b, a, blend)
{
  //console.log(a);
  var screenPosX = px - x * scaleX;
  var screenPosY = py - y * scaleY;

  g_context.globalAlpha = a;
  g_context.drawImage( sprite.m_image, sprite.GetFrameX(tv), sprite.GetFrameY(tv), sprite._width, sprite._height, screenPosX, screenPosY, sprite._width * scaleX, sprite._height * scaleY );

    g_drawSpriteCalls++;
}


function mainLoop()
{
  window.requestAnimationFrame( mainLoop );
  g_particleManager.Update();

  g_context.clearRect( 0, 0, g_canvas.width, g_canvas.height );

  g_drawSpriteCalls = 0;
  g_particleManager.DrawParticles();
//  console.log(g_drawSpriteCalls);


// Tint testing
/*
var images = EffectsLibrary.GetShapes();
var sprite = images[5];
var tv = 0;
var scaleX = 1;
var scaleY = 1;
var screenPosX = 100;
var screenPosY = 100;
g_context.drawImage( sprite.m_image, sprite.GetFrameX(tv), sprite.GetFrameY(tv), sprite._width, sprite._height, screenPosX, screenPosY, sprite._width * scaleX, sprite._height * scaleY );
*/

}

document.addEventListener( "DOMContentLoaded", Init, false );
