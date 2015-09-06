document.addEventListener( "DOMContentLoaded", Init, false );

var g_particleManager = new ParticleManager( 1000, 1 );
g_particleManager.onParticleSpawnCB = OnParticleSpawned;
g_particleManager.onParticleKilledCB = OnParticleKilled;
var g_xml = null;
var g_stage = null;
var g_renderer = null;
var g_loadingTextures = [];
var g_path = "data/Explosions/";
var g_currentEffect = null;
var g_restarting = false;
var g_autoLoop = true;

function OnTextureLoaded( animImage )
{
  console.log( animImage.m_pixiTexture.baseTexture.width );

  animImage._horizCells = animImage.m_pixiTexture.baseTexture.width / animImage.width;

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
      var rect = new PIXI.Rectangle( x, y, animImage.GetWidth(), animImage.GetHeight() );

      //    console.log(filename);
      console.log( rect );
      animImage.m_pixiFrames[ f ] = new PIXI.Texture( animImage.m_pixiTexture, rect );
    }
  }
}

function CreateEffect()
{
  var e = EffectsLibrary.GetEffect( "Fireballs/FireBall1" );
  //var e = EffectsLibrary.GetEffect("Stylised/Stylised Ground");
  //var e = EffectsLibrary.GetEffect( "Stylised/Stylised 4" );
  //  var e = EffectsLibrary.GetEffect("Multi Stage Explosions/Multi Stage Explosion 7");

  //var e = EffectsLibrary.GetEffect("Ground Explosions/Mushroom 2");

  var requiredImages = [];
  e.GetImages( requiredImages );

  //console.log(requiredImages);
  for ( var imageIndex in requiredImages )
  {
    var animImage = requiredImages[ imageIndex ];
    var filename = g_path + stripFilePath( animImage.GetFilename() );

    if ( !animImage.m_pixiTexture )
    {
      animImage.m_pixiTexture = PIXI.Texture.fromImage( filename );

      console.log( filename );
      console.log( animImage );

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

  g_xml = loadXMLDoc( g_path + "DATA.XML" );

  g_particleManager.SetScreenSize( w, h );
  EffectsLibrary.Init();
  EffectsLibrary.Load( g_xml );

  CreateEffect();

  requestAnimationFrame( animate );
}

var g_spawnKillCnt = 0;

function OnParticleSpawned( p )
{
  var animImage = p.GetAvatar();

  if ( p.m_pixiSprite )
  {
    g_stage.addChild( p.m_pixiSprite );
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
      p.m_pixiSprite.anchor.x = p.GetHandleX() / animImage.width;
      p.m_pixiSprite.anchor.y = p.GetHandleY() / animImage.height;
    }
  }

  g_spawnKillCnt++;
  //  console.log("OnParticleSpawned:"+g_spawnKillCnt);
}

function OnParticleKilled( p )
{
  g_spawnKillCnt--;

  g_stage.removeChild( p.m_pixiSprite );
  // p.m_pixiSprite.visible = false;
  //   console.log("OnParticleSpawned:"+g_spawnKillCnt);
}

function toHex( r, g, b )
{
  return ( ( r << 16 ) + ( g << 8 ) + b );
};

function DrawSprite( p, sprite, px, py, tv, x, y, rotation, scaleX, scaleY, r, g, b, a, blendMode )
{
  p.m_pixiSprite.texture = sprite.m_pixiFrames[ tv ];
  p.m_pixiSprite.position.x = px;
  p.m_pixiSprite.position.y = py;

  p.m_pixiSprite.alpha = a;
  p.m_pixiSprite.tint = toHex( r, g, b );

  p.m_pixiSprite.rotation = Math.radians( rotation );
  p.m_pixiSprite.scale.x = scaleX;
  p.m_pixiSprite.scale.y = scaleY;

  p.m_pixiSprite.blendMode = PIXI.BLEND_MODES.ADD;
  if ( blendMode == Blend.BMLightBlend )
    p.m_pixiSprite.blendMode = PIXI.BLEND_MODES.LIGHTEN;
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

  g_particleManager.Update();

  g_particleManager.DrawParticles();

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
  g_currentEffect.SoftKill();

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
