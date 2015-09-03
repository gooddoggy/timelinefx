

var g_particleManager = new ParticleManager( 1000, 1 );
var g_xml = null;
var g_images = [];
var g_loadedImageCnt = 0;
var g_canvas = null;
var g_context = null;

function CreateTintBuffer(index)
{
  var animImage = EffectsLibrary.GetShapes()[index];

  var w = animImage._width;
  var h = animImage._height;

  var c = document.createElement("canvas");
  c.width = w;
  c.height = h;

  animImage.m_tintCanvas = c;
  animImage.m_tintContext = c.getContext("2d");
}

function SplitChannels(index)
{
  var animImage = EffectsLibrary.GetShapes()[index];
//  g_images[i]

  animImage.m_rgbbk = [];
  //console.log(index);

  var img = g_images[index];
  var w = img.width;
  var h = img.height;

  var canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;

  var ctx = canvas.getContext("2d");
  ctx.drawImage( img, 0, 0 );

  var pixels = ctx.getImageData( 0, 0, w, h ).data;

  // 4 is used to ask for 3 images: red, green, blue and
  // black in that order.
  for ( var rgbI = 0; rgbI < 4; rgbI++ ) {
      var canvas = document.createElement("canvas");
      canvas.width  = w;
      canvas.height = h;

      var ctx = canvas.getContext('2d');
      ctx.drawImage( img, 0, 0 );
      var to = ctx.getImageData( 0, 0, w, h );
      var toData = to.data;

      for (
              var i = 0, len = pixels.length;
              i < len;
              i += 4
      ) {
          toData[i  ] = (rgbI === 0) ? pixels[i  ] : 0;
          toData[i+1] = (rgbI === 1) ? pixels[i+1] : 0;
          toData[i+2] = (rgbI === 2) ? pixels[i+2] : 0;
          toData[i+3] =                pixels[i+3]     ;
      }

      ctx.putImageData( to, 0, 0 );

      // image is _slightly_ faster then canvas for this, so convert
      var imgComp = new Image();
      imgComp.src = canvas.toDataURL();

      animImage.m_rgbbk.push( imgComp );
  }
}

function OnImageLoaded(imageIndex)
{

//    console.log(imageIndex);
//  SplitChannels(imageIndex);
  if(++g_loadedImageCnt >= g_images.length)
    OnAllLoaded();

}

function Init()
{
  var path = "data/Explosions/";
  //g_xml = loadXMLDoc( path + "Test_DATA2.XML" );
g_xml = loadXMLDoc( path + "DATA.XML" );

  EffectsLibrary.Init();
  EffectsLibrary.Load( g_xml );
  var images = EffectsLibrary.GetShapes();

  var imgFilenames = [];
  for ( var i = 0; i < images.length; i++ )
  {
    var filename = path + stripFilePath( images[ i ].GetFilename() );
    g_images[i] = new Image();
    g_images[i].onload = OnImageLoaded.bind(null,i);
    g_images[i].src = filename;

    // Intrusively adding our render image
    images[i].m_image = g_images[i];
  }

  var w = 800;
  var h = 600;
  g_canvas = document.getElementById( "rendercanvas" );
  g_canvas.width = w;
  g_canvas.height = h;
  g_context = g_canvas.getContext( "2d" );

  g_particleManager.SetScreenSize(w,h);
  g_particleManager.SetOrigin(0, 0);
}

function OnAllLoaded()
{
  var e = EffectsLibrary.GetEffect("Fireballs/FireBall1");

//var e = EffectsLibrary.GetEffect("Fireballs/FireBall Explosion Variation Debrie");


//  var e = EffectsLibrary.GetEffect("Stylised/Stylised Ground");
//  var e = EffectsLibrary.GetEffect("Stylised/Stylised 4");
//var e = EffectsLibrary.GetEffect("Multi Stage Explosions/Multi Stage Explosion 7");

//var e = EffectsLibrary.GetEffect("Ground Explosions/Mushroom 2");

var requiredImages = [];
e.GetImages(requiredImages);

console.log(requiredImages);
for( var imageIndex in requiredImages )
{
  CreateTintBuffer(imageIndex);
  SplitChannels(imageIndex);
  //console.log(imageIndex);
}

// Now tint all if required.

  e.CompileAll();

  var eCopy = new Effect(e,g_particleManager);
  g_particleManager.AddEffect(eCopy);

  console.log(eCopy);


  mainLoop();
}

var g_drawSpriteCalls = 0;
var g_drawStats = [];
function DrawSprite(sprite, px, py, tv, x, y, rotation, scaleX, scaleY, r, g, b, a, blendMode)
{
  //console.log(a);

//  console.log(rotation);

  // attempting tint
/*
  var tintContext = sprite.m_tintContext;
  sprite.m_tintContext.fillStyle = '#EE4411';
  sprite.m_tintContext.fillRect(0,0,sprite._width, sprite._height);
  sprite.m_tintContext.globalCompositeOperation = "destination-atop";
  sprite.m_tintContext.drawImage( sprite.m_image, sprite.GetFrameX(tv), sprite.GetFrameY(tv), sprite._width, sprite._height, 0,0, sprite._width, sprite._height );

//  g_context.globalCompositeOperation = 'lighter';

  g_context.globalAlpha = a;
  //g_context.drawImage( sprite.m_image, sprite.GetFrameX(tv), sprite.GetFrameY(tv), sprite._width, sprite._height, screenPosX, screenPosY, sprite._width * scaleX, sprite._height * scaleY );

  // Basic render greyscale
//  g_context.globalAlpha = a;
//  g_context.drawImage( sprite.m_image, sprite.GetFrameX(tv), sprite.GetFrameY(tv), sprite._width, sprite._height, screenPosX, screenPosY, sprite._width * scaleX, sprite._height * scaleY );

  g_context.drawImage( sprite.m_tintCanvas, 0, 0, sprite._width, sprite._height, screenPosX, screenPosY, sprite._width * scaleX, sprite._height * scaleY );
*/

/*
console.log("a= " + a);

console.log("r= " + r);
console.log("g= " + g);
console.log("b= " + b);
*/

g_context.save();

// argh, have to correctly figure out where to rotate around.. oh


var screenPosX = - x * scaleX;
var screenPosY = - y * scaleY;

g_context.translate(px,py);
g_context.rotate(rotation / 180 * M_PI);

if(blendMode === Blend.BMLightBlend)
  g_context.globalCompositeOperation = 'lighter';
else
  g_context.globalCompositeOperation = 'source-over';

  g_drawStats[sprite._imageSourceName] = blendMode;


r = r / 255;
g = g / 255;
b = b / 255;

//g_context.globalCompositeOperation = 'source-over';

//g_context.globalAlpha = a;
//g_context.globalAlpha = a;
//g_context.drawImage( sprite.m_rgbbk[3], sprite.GetFrameX(tv), sprite.GetFrameY(tv), sprite._width, sprite._height, screenPosX, screenPosY, sprite._width * scaleX, sprite._height * scaleY );

//a = a * 0.2;
//g_context.globalCompositeOperation = 'screen';

g_context.globalAlpha =  a * r;
g_context.drawImage( sprite.m_rgbbk[0], sprite.GetFrameX(tv), sprite.GetFrameY(tv), sprite._width, sprite._height, screenPosX, screenPosY, sprite._width * scaleX, sprite._height * scaleY );

g_context.globalAlpha =  a * g;
g_context.drawImage( sprite.m_rgbbk[1], sprite.GetFrameX(tv), sprite.GetFrameY(tv), sprite._width, sprite._height, screenPosX, screenPosY, sprite._width * scaleX, sprite._height * scaleY );

g_context.globalAlpha =  a * b;
g_context.drawImage( sprite.m_rgbbk[2], sprite.GetFrameX(tv), sprite.GetFrameY(tv), sprite._width, sprite._height, screenPosX, screenPosY, sprite._width * scaleX, sprite._height * scaleY );

g_context.restore();

    g_drawSpriteCalls++;
}


function mainLoop()
{
  window.requestAnimationFrame( mainLoop );
  g_particleManager.Update();

  g_context.clearRect( 0, 0, g_canvas.width, g_canvas.height );

  g_drawSpriteCalls = 0;
  g_drawStats = [];
  g_particleManager.DrawParticles();
  console.log(g_drawStats);

//  console.log(g_drawSpriteCalls);


// Tint testing

/*
        // fill offscreen buffer with the tint color
        g_context.fillStyle = '#FF0000';
        g_context.fillRect(0,0,g_canvas.width, g_canvas.height);

        g_context.globalCompositeOperation = "destination-atop";

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
