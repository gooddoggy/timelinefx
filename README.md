# timelinefx
JavaScript port of TimelineFX particle system

Allows particle system effects created in the standalone TimelineFX tool to be loaded and run within a browser.

Basic usage:
------------
```
// Create particle manager and fx library
var particleManager = new ParticleManager( /* particle limit = */ 1000, /* layers = */ 1 );
EffectsLibrary.Init();
EffectsLibrary.Load( xml );
  
// Grab an effect prototype
var effectPrototype = EffectsLibrary.GetEffect( "explosion" );
effectPrototype.CompileAll();
  
// Create/spawn an effect instance
var currentEffectInstance = new Effect( effectPrototype, particleManager );
particleManager.AddEffect( currentEffectInstance );``
```
A complete demo can be found here: http://factor43.com/projects/tfx/demo
