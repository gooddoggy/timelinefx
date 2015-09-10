document.addEventListener( "DOMContentLoaded", Init, false );

var g_particleManager = new ParticleManager( 1000, 1 );
g_particleManager.onParticleSpawnCB = OnParticleSpawned;
g_particleManager.onParticleKilledCB = OnParticleKilled;
var g_xml = null;
var g_stage = null;
var g_renderer = null;
var g_loadingTextures = [];
//var g_path = "data/single_dust/";
var g_path = "data/Explosions/";

var g_currentEffect = null;
var g_restarting = false;
var g_autoLoop = true;
var g_seenSprites = [];

var g_uniqueEffects = [];
var g_effectIndex = 0;

function IsEnabled(p)
{
//  return p._emitter._name !== "Copy of fire";
  return true;
}

function OnTextureLoaded( animImage )
{
//  console.log( animImage.m_pixiTexture.baseTexture.width );

  var totalWidth = animImage.m_pixiTexture.baseTexture.width;

  animImage._horizCells = totalWidth / animImage._width;

  var numFrames = animImage.GetFramesCount();
  animImage.m_pixiFrames = [];

  if ( numFrames == 1 )
  {
    animImage.m_pixiFrames[ 0 ] = animImage.m_pixiTexture;
  }
  else
  {
    for ( var f = 0; f < numFrames; f++ )
    {
      var x = animImage.GetFrameX( f );
      var y = animImage.GetFrameY( f );
      // Weird that it needs -1
      var rect = new PIXI.Rectangle( x, y, animImage.GetWidth()-1, animImage.GetHeight()-1 );

  //    console.log(animImage._imageSourceName);
  //    console.log( rect );
      animImage.m_pixiFrames[ f ] = new PIXI.Texture( animImage.m_pixiTexture, rect );
    }
  }
}

function CreateEffect()
{
//  var e = EffectsLibrary.GetEffect( "Fireballs/FireBall1" );

//var e = EffectsLibrary.GetEffect( "Stylised 4" );

//
//var e = EffectsLibrary.GetEffect( "Fireballs/FireBall Explosion Area" );
//  var e = EffectsLibrary.GetEffect( "Fireballs/FireBall Explosion Quick Area" );
  //var e = EffectsLibrary.GetEffect("Stylised/Stylised Ground");
//  var e = EffectsLibrary.GetEffect( "Stylised/Stylised 4" );
  //  var e = EffectsLibrary.GetEffect("Multi Stage Explosions/Multi Stage Explosion 7");

//  var e = EffectsLibrary.GetEffect("Ground Explosions/Mushroom 2");

//var e = EffectsLibrary.GetEffect("Ground Explosions/DustBlast1");


  var e = g_uniqueEffects[g_effectIndex];
  console.log("Create Effect: " + e._name);
  console.log("Create Effect: " + g_effectIndex);

  console.log(e);

  var requiredImages = [];
  e.GetImages( requiredImages );

//  console.log(requiredImages);
  for ( var imageIndex in requiredImages )
  {
    var animImage = requiredImages[ imageIndex ];

    if ( !animImage.m_pixiTexture )
    {
      var filename = g_path + stripFilePath( animImage.GetFilename() );

      animImage.m_pixiTexture = PIXI.Texture.fromImage( filename );

//      console.log( filename );
//      console.log( animImage );

      g_loadingTextures.push( animImage );
    }
  }

  e.CompileAll();

  g_currentEffect = new Effect( e, g_particleManager );
  g_particleManager.AddEffect( g_currentEffect );
}

function Init()
{
  var w = 800;
  var h = 600;
  g_renderer = PIXI.autoDetectRenderer( w, h );
  document.body.appendChild( g_renderer.view );

  g_stage = new PIXI.Container();

  //g_xml = loadXMLDoc( g_path + "DATA.XML" );
  //g_xml = loadXMLDoc( g_path + "blast_wave_sub.xml" );
  g_xml = loadXMLDoc( g_path + "DATA.XML" );

  g_particleManager.SetScreenSize( w, h );
  EffectsLibrary.Init();
  EffectsLibrary.Load( g_xml );

//  console.log(EffectsLibrary._effects);
console.log("--");

  for(eName in EffectsLibrary._effects)
  {
      var e = EffectsLibrary._effects[eName];
      if( !e.GetParentEmitter() )
      {
        g_uniqueEffects.push(e);
      }
      //  console.log(eName.split("/"));
  }

  CreateEffect();

  requestAnimationFrame( animate );
}

var g_spawnKillCnt = 0;

function OnParticleSpawned( p )
{
  if(!IsEnabled(p)) return;

  var animImage = p.GetAvatar();

  //debugTrack(animImage, "OnParticleSpawned");

  //console.log(p._emitter._name);

  if ( p.m_pixiSprite )
  {
    //if(animImage._imageSourceName === "Z:\\PartcleShapes\\Explosions\\Smoke\\ExplosionCloud.png")
    //Z:\\PartcleShapes\\Explosions\Smoke\Smoke1.png
  //  if( stripFilePath( animImage.GetFilename() ) !== "Smoke1.png" )
    {
      g_stage.addChild( p.m_pixiSprite );
    //  console.log("adding to stage");
    }
  }
  else
  {
    p.m_pixiSprite = new PIXI.Sprite( animImage.m_pixiFrames[ 0 ] );

    var emit = p.GetEmitter();
    if ( p.GetEmitter().IsHandleCenter() )
    {
      p.m_pixiSprite.anchor.set( 0.5 );
    }
    else
    {
      p.m_pixiSprite.anchor.x = p.GetHandleX() / animImage._width;
      p.m_pixiSprite.anchor.y = p.GetHandleY() / animImage._height;
    }
  }

  p.m_pixiSprite.visible = false;

  g_spawnKillCnt++;
//    console.log("OnParticleSpawned:"+g_spawnKillCnt);
}

function OnParticleKilled( p )
{
  if(!IsEnabled(p)) return;

  g_spawnKillCnt--;

  g_stage.removeChild( p.m_pixiSprite );
  // p.m_pixiSprite.visible = false;
  //   console.log("OnParticleKilled:"+g_spawnKillCnt);
}

function toHex( r, g, b )
{
  return ( ( r << 16 ) + ( g << 8 ) + b );
}

var g_renderCnt = 0;
function DrawSprite( p, sprite, px, py, tv, x, y, rotation, scaleX, scaleY, r, g, b, a, blendMode )
{
  if(!IsEnabled(p)) return;

p.m_pixiSprite.visible = true;

//  debugTrack(sprite, "DrawSprite");

//    if( stripFilePath( sprite.GetFilename() ) !== "Smoke1.png" )
    {
//      debugTrack(sprite, "DrawSprite");
    }
  //    return;

    //console.log(blendMode);

 g_renderCnt++;
  p.m_pixiSprite.texture = sprite.m_pixiFrames[ tv ];
  p.m_pixiSprite.position.x = px;
  p.m_pixiSprite.position.y = py;

  p.m_pixiSprite.alpha = a;
  p.m_pixiSprite.tint = toHex( r, g, b );

  p.m_pixiSprite.rotation = Math.radians( rotation );
  p.m_pixiSprite.scale.x = scaleX;
  p.m_pixiSprite.scale.y = scaleY;

// looks best for explosions anyway..
// These are the closest equivalent blend modes currently available in WebGL (I think), and give the closest appearance for most effects tested.
  p.m_pixiSprite.blendMode = PIXI.BLEND_MODES.NORMAL;  // or should the default be something else?
  if ( blendMode == Blend.BMLightBlend )
      p.m_pixiSprite.blendMode = PIXI.BLEND_MODES.SCREEN;
/*
      p.m_pixiSprite.blendMode = PIXI.BLEND_MODES.NORMAL;  // or should the default be something else?
      if ( blendMode == Blend.BMLightBlend )
          p.m_pixiSprite.blendMode = PIXI.BLEND_MODES.SCREEN;
*/
}



function animate()
{
  while ( g_loadingTextures.length > 0 )
  {
    var animImage = g_loadingTextures[ g_loadingTextures.length - 1 ];
    if ( animImage.m_pixiTexture.baseTexture.hasLoaded )
    {
      OnTextureLoaded( animImage );
      g_loadingTextures.pop();
    }
    else
    {
      requestAnimationFrame( animate );
      return;
    }
  }

  g_renderCnt = 0;
  g_particleManager.Update();
  g_particleManager.DrawParticles();

  //console.log(g_renderCnt);
  //dude.texture = frame[tick % 4];

  //  dude.visible = (tick != 2);

  // time to render the stage!
  g_renderer.render( g_stage );
  // request another animation frame...
  requestAnimationFrame( animate );

  if ( g_particleManager.GetParticlesInUse() == 0 && ( g_autoLoop || g_restarting ) )
  {
    CreateEffect();
    g_restarting = false;
  }

  //tick++;
}

window.onkeydown = function( e )
{
  console.log("Killing");
  g_currentEffect.SoftKill();

// g_currentEffect.HardKill();
 //g_particleManager.RemoveEffect(g_currentEffect);
 //g_particleManager.Destroy();
 //g_particleManager.ClearInUse();
 //g_particleManager.ClearAll();


  g_effectIndex = (g_effectIndex + 1) % g_uniqueEffects.length;

  g_restarting = true;
  //CreateEffect();
  //  console.log( g_loadingTextures );
};



/*
var frame = [];
function run()
{
  var renderer = PIXI.autoDetectRenderer( 800, 600 );
  document.body.appendChild( renderer.view );
  // create the root of the scene graph
  var stage = new PIXI.Container();

  // create a new Sprite that uses the image name that we just generated as its source

  var t = PIXI.Texture.fromImage('./data/explosions/Fog-Group.png');
  frame[0] = new PIXI.Texture(t, new PIXI.Rectangle(0, 0, 256, 256));
  frame[1] = new PIXI.Texture(t, new PIXI.Rectangle(256, 0, 256, 256));
  frame[2] = new PIXI.Texture(t, new PIXI.Rectangle(0, 256, 256, 256));
  frame[3] = new PIXI.Texture(t, new PIXI.Rectangle(256, 256, 256, 256));

  //var dude = PIXI.Sprite.fromImage('./data/explosions/Fog-Group.png');
  var dude = new PIXI.Sprite(frame[1]);

//  var dude = PIXI.Sprite.fromImage('./data/explosions/fire3.png' );

  // set the anchor point so the texture is centerd on the sprite
  dude.anchor.set( 0.5 );
  // set a random scale for the dude - no point them all being the same size!
  dude.scale.set( 0.8 + Math.random() * 0.3 );
  dude.position.x = Math.random() * renderer.width;
  dude.position.y = Math.random() * renderer.height;
  dude.tint = Math.random() * 0xFFFFFF;

  stage.addChild( dude );

  requestAnimationFrame( animate );

  var tick = 0;
  function animate()
  {
    dude.texture = frame[tick % 4];

  //  dude.visible = (tick != 2);

    // time to render the stage!
    renderer.render( stage );
    // request another animation frame...
    requestAnimationFrame( animate );

    //tick++;
  }

  window.onkeydown = function( e )
  {
//    stage.removeChild( dude );
    tick++;
  };
}
*/
