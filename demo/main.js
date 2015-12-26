document.addEventListener( "DOMContentLoaded", Init, false );

var g_particleManager = new ParticleManager( 1000, 1 );
g_particleManager.onParticleSpawnCB = OnParticleSpawned;
g_particleManager.onParticleKilledCB = OnParticleKilled;
var g_xml = null;
var g_stage = null;
var g_renderer = null;
var g_loadingTextures = [];
var g_path = "../data/demo/";
var g_currentEffectPrototype = null;
var g_currentEffectInstance = null;

function StartEffect()
{
  if ( g_currentEffectInstance )
    g_particleManager.RemoveEffect( g_currentEffectInstance );

  if ( g_currentEffectPrototype )
  {
    g_currentEffectInstance = new Effect( g_currentEffectPrototype, g_particleManager );
    g_particleManager.AddEffect( g_currentEffectInstance );
  }
}

function PlayEffect( name )
{
  HideHome();

  if ( g_currentEffectInstance )
    g_currentEffectInstance.SoftKill();

  g_currentEffectPrototype = EffectsLibrary.GetEffect( name );
  g_currentEffectPrototype.CompileAll();

  console.log( "PlayEffect:" + name );
}

function RegisterEffect( e, name )
{
  var menu = document.getElementById( "fxMenu" );

  var li = document.createElement( "li" );
  li.className = "pure-menu-item";

  //  presumably can set an onCLick handler via js? on textNode perhaps?
  // then pass the actuall effect instead of the name around?
  var str = "<a href=\"#\" class=\"pure-menu-link\" onClick=\"PlayEffect('";
  str += name;
  str += "')\">";
  str += name;
  str += "</a>";

  li.appendChild( document.createTextNode( "" ) );
  li.innerHTML = str;
  menu.appendChild( li );

  // Start pre-loading all required images
  var requiredImages = [];
  e.GetImages( requiredImages );
  for ( var imageIndex in requiredImages )
  {
    var animImage = requiredImages[ imageIndex ];

    if ( !animImage.m_pixiTexture )
    {
      var filename = g_path + stripFilePath( animImage.GetFilename() );
      animImage.m_pixiTexture = PIXI.Texture.fromImage( filename );
      g_loadingTextures.push( animImage );
    }
  }
}

var g_particleCountText;

function Init()
{
  var w = window.innerWidth - 250;
  var h = window.innerHeight-4;
  g_renderer = PIXI.autoDetectRenderer( w, h );

  var fxdiv = document.getElementById('fxdiv');
  fxdiv.appendChild( g_renderer.view );

  g_stage = new PIXI.Container();

  // create some white text using the Snippet webfont
  		g_particleCountText = new PIXI.Text("Active Particles:", {font: "12px Courier New", fill: "white", align: "center"});
  		g_particleCountText.position.x = 0.8 * w;
  		g_particleCountText.position.y = 0.95 * h;
      g_stage.addChild(g_particleCountText);


  g_xml = loadXMLDoc( g_path + "data.xml" );

  g_particleManager.SetScreenSize( w, h );
  EffectsLibrary.Init();
  EffectsLibrary.Load( g_xml );

  for ( var eName in EffectsLibrary._effects )
  {
    var e = EffectsLibrary._effects[ eName ];
    if ( !e.GetParentEmitter() )
    {
      RegisterEffect( e, eName );
    }
  }

  requestAnimationFrame( Animate );
}

function OnTextureLoaded( animImage )
{
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
      var rect = new PIXI.Rectangle( x, y, animImage.GetWidth() - 1, animImage.GetHeight() - 1 );

      animImage.m_pixiFrames[ f ] = new PIXI.Texture( animImage.m_pixiTexture, rect );
    }
  }
}


function OnParticleSpawned( p )
{
  var animImage = p.GetAvatar();

  if ( p.m_pixiSprite )
  {
    p.m_pixiSprite.texture = animImage.m_pixiFrames[ 0 ];
  }
  else
  {
    p.m_pixiSprite = new PIXI.Sprite( animImage.m_pixiFrames[ 0 ] );
  }

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

  p.m_pixiSprite.visible = false;
  g_stage.addChild( p.m_pixiSprite );
}

function OnParticleKilled( p )
{
  g_stage.removeChild( p.m_pixiSprite );
}

function DrawSprite( p, sprite, px, py, tv, x, y, rotation, scaleX, scaleY, r, g, b, a, blendMode )
{
  p.m_pixiSprite.visible = true;

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
  p.m_pixiSprite.blendMode = PIXI.BLEND_MODES.NORMAL; // or should the default be something else?
  if ( blendMode == Blend.BMLightBlend )
    p.m_pixiSprite.blendMode = PIXI.BLEND_MODES.SCREEN;
}


function Animate()
{
  while ( g_loadingTextures.length > 0 )
  {

    var animImage = g_loadingTextures[ g_loadingTextures.length - 1 ];
    if ( animImage.m_pixiTexture.baseTexture.hasLoaded )
    {
      OnTextureLoaded( animImage );
      g_loadingTextures.pop();

      if ( g_loadingTextures.length === 0 )
      {
        console.log( "All textures loaded" );
      }
    }
    else
    {
      // Show loading state if not all loaded?
      requestAnimationFrame( Animate );
      return;
    }
  }

  g_renderCnt = 0;
  g_particleManager.Update();
  g_particleManager.DrawParticles();

  //console.log(g_renderCnt);

  g_renderer.render( g_stage );
  // request another animation frame...
  requestAnimationFrame( Animate );

  g_particleCountText.setText("Active Particles:" + g_particleManager.GetParticlesInUse());

  if ( g_particleManager.GetParticlesInUse() === 0 )
  {
    StartEffect();
  }

}
