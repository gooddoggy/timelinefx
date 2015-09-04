document.addEventListener( "DOMContentLoaded", run, false );

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
