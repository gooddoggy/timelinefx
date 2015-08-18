
var Particle = Class(Entity,{
  $const: {
    MIN_AGE: 1,
    MAX_AGE: 150
  },

  constructor: function() {
    Particle.$super.call(this);        // Call parent's constructor

    this._emitter = null;

    this._weightVariation = 0;
    this._scaleVariationX = 0;
    this._scaleVariationY = 0;
    this._gSizeX = 0;
    this._gSizeY = 0;

    this._velVariation = 0;
    this._spinVariation = 0;

    this._directionVariation = 0;
    this._timeTracker = 0;
    this._randomDirection = 0;
    this._randomSpeed = 0;
    this._emissionAngle = 0;
    this._releaseSingleParticle = false;

    this._particleManager = null;
    this._layer = 0;
    this._groupParticles = false;
    this._effectLayer = 0;

  },

  Reset: function()
  {
      this._age = 0;
      this._wx = 0;
      this._wy = 0;

      this._z = 1.0;

      this._avatar = null;
      this._dead = 0;
      this.ClearChildren();
      this._directionVariation = 0;
      this._direction = 0;
      this._directionLocked = false;
      this._randomSpeed = 0;
      this._randomDirection = 0;
      this._parent = null;
      this._rootParent = null;
      this._aCycles = 0;
      this._cCycles = 0;
      this._rptAgeA = 0;
      this._rptAgeC = 0;
      this._releaseSingleParticle = false;
      this._gravity = 0;
      this._weight = 0;
      this._emitter = null;
  },

  Destroy:function(releaseChildren)
  {
      this._particleManager.ReleaseParticle(this);
      Particle.$superp.Destroy();
      this.Reset();
  },
  SetX:function( x )
  {
    this._oldX = (_age > 0) ? _x : x;
    this._x = x;
  },
  SetY:function( y )
  {
    this._oldY = (_age > 0) ? _y : y;
    this._y = y;
  },
  SetZ:function( z )
  {
    this._oldZ = (_age > 0) ? _z : z;
    this._z = z;
  },

  SetGroupParticles:function( value ){ this._groupParticles = value; },
  GetGroupParticles:function(){ return this._groupParticles; },

  SetLayer:function( layer ){ this._layer = layer; },
  GetLayer:function(){ return this._layer; },

  SetEmitter:function( e ){ this._emitter = e; },
  GetEmitter:function(){ return this._emitter; },

  GetEffectLayer:function(){ return this._effectLayer; },

});
