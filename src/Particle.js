var Particle = Class( Entity,
{
  constructor: function()
  {
    Particle.$super.call( this ); // Call parent's constructor

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

  Update: function()
  {
    this.Capture();

    if ( this._emitter.IsDying() || this._emitter.IsOneShot() || this._dead )
      this._releaseSingleParticle = true;

    if ( this._emitter.IsSingleParticle() && !this._releaseSingleParticle )
    {
      this._age = this._particleManager.GetCurrentTime() - this._dob;
      if ( this._age > this._lifeTime )
      {
        this._age = 0;
        this._dob = this._particleManager.GetCurrentTime();
      }
    }
    else
    {
      this._age = this._particleManager.GetCurrentTime() - this._dob;
    }

    Particle.$superp.Update.call( this );

    if ( this._age > this._lifeTime || this._dead == 2 ) // if dead=2 then that means its reached the end of the line (in kill mode) for line traversal effects
    {
      this._dead = 1;
      if ( this._children.length === 0 )
      {
        this._particleManager.ReleaseParticle( this );
        if ( this._emitter.IsGroupParticles() )
          this._emitter.GetParentEffect().RemoveInUse( this._layer, this );

        this.Reset();
        return false; // RemoveChild
      }
      else
      {
        this._emitter.ControlParticle( this );
        this.KillChildren();
      }

      return true;
    }

    this._emitter.ControlParticle( this );
    return true;
  },

  Destroy: function( releaseChildren )
  {
    this._particleManager.ReleaseParticle( this );
    Particle.$superp.Destroy();
    this.Reset();
  },
  SetX: function( x )
  {
    this._oldX = ( this._age > 0 ) ? this._x : x;
    this._x = x;
  },
  SetY: function( y )
  {
    this._oldY = ( this._age > 0 ) ? this._y : y;
    this._y = y;
  },
  SetZ: function( z )
  {
    this._oldZ = ( this._age > 0 ) ? this._z : z;
    this._z = z;
  },

  SetGroupParticles: function( value )
  {
    this._groupParticles = value;
  },
  IsGroupParticles: function()
  {
    return this._groupParticles;
  },

  SetLayer: function( layer )
  {
    this._layer = layer;
  },
  GetLayer: function()
  {
    return this._layer;
  },

  SetEmitter: function( e )
  {
    this._emitter = e;
  },
  GetEmitter: function()
  {
    return this._emitter;
  },

  GetEffectLayer: function()
  {
    return this._effectLayer;
  },

  SetParticleManager: function( pm )
  {
    this._particleManager = pm;
  },

  SetEffectLayer: function( layer )
  {
    this._effectLayer = layer;
  },

  SetVelVariation: function( velVariation )
  {
    this._velVariation = velVariation;
  },

  GetVelVariation: function()
  {
    return this._velVariation;
  },

  SetGSizeX: function( gSizeX )
  {
    this._gSizeX = gSizeX;
  },

  SetGSizeY: function( gSizeY )
  {
    this._gSizeY = gSizeY;
  },

  GetGSizeX: function()
  {
    return this._gSizeX;
  },

  GetGSizeY: function()
  {
    return this._gSizeY;
  },

  SetScaleVariationX: function( scaleVarX )
  {
    this._scaleVariationX = scaleVarX;
  },
  GetScaleVariationX: function()
  {
    return this._scaleVariationX;
  },

  SetScaleVariationY: function( scaleVarY )
  {
    this._scaleVariationY = scaleVarY;
  },

  GetScaleVariationY: function()
  {
    return this._scaleVariationY;
  },

  SetEmissionAngle: function( emissionAngle )
  {
    this._emissionAngle = emissionAngle;
  },

  GetEmissionAngle: function()
  {
    return this._emissionAngle;
  },

  SetDirectionVairation: function( dirVar )
  {
    this._directionVariation = dirVar;
  },

  GetDirectionVariation: function()
  {
    return this._directionVariation;
  },

  SetSpinVariation: function( spinVar )
  {
    this._spinVariation = spinVar;
  },

  GetSpinVariation: function()
  {
    return this._spinVariation;
  },

  SetWeightVariation: function( weightVar )
  {
    this._weightVariation = weightVar;
  },

  GetWeightVariation: function()
  {
    return this._weightVariation;
  },


} );
