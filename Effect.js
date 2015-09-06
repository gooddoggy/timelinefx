TypePoint = 0;
TypeArea = 1;
TypeLine = 2;
TypeEllipse = 3;

EmInwards = 0;
EmOutwards = 1;
EmSpecified = 2;
EmInAndOut = 3;

EndKill = 0;
EndLoopAround = 1;
EndLetFree = 2;


var g_defaultEffect = {
  _class: TypePoint,
  _currentEffectFrame: 0,
  _handleCenter: false,
  _source: null,
  _lockAspect: true,
  _particlesCreated: false,
  _suspendTime: 0,
  _gx: 0,
  _gy: 0,
  _mgx: 0,
  _mgy: 0,
  _emitAtPoints: false,
  _emissionType: EmInwards,
  _effectLength: 0,
  _parentEmitter: null,
  _spawnAge: 0,
  _index: 0,
  _particleCount: 0,
  _idleTime: 0,
  _traverseEdge: false,
  _endBehavior: EndKill,
  _distanceSetByLife: false,
  _reverseSpawn: false,
  _spawnDirection: 1,
  _dying: false,
  _allowSpawning: true,
  _ellipseArc: 360.0,
  _ellipseOffset: 0,
  _effectLayer: 0,
  _doesNotTimeout: false,

  _particleManager: null,

  _frames: 32,
  _animWidth: 128,
  _animHeight: 128,
  _looped: false,
  _animX: 0,
  _animY: 0,
  _seed: 0,
  _zoom: 1.0,
  _frameOffset: 0,

  _currentLife: 0,
  _currentAmount: 0,
  _currentSizeX: 0,
  _currentSizeY: 0,
  _currentVelocity: 0,
  _currentSpin: 0,
  _currentWeight: 0,
  _currentWidth: 0,
  _currentHeight: 0,
  _currentAlpha: 0,
  _currentEmissionAngle: 0,
  _currentEmissionRange: 0,
  _currentStretch: 0,
  _currentGlobalZ: 0,

  _overrideSize: false,
  _overrideEmissionAngle: false,
  _overrideEmissionRange: false,
  _overrideAngle: false,
  _overrideLife: false,
  _overrideAmount: false,
  _overrideVelocity: false,
  _overrideSpin: false,
  _overrideSizeX: false,
  _overrideSizeY: false,
  _overrideWeight: false,
  _overrideAlpha: false,
  _overrideStretch: false,
  _overrideGlobalZ: false,

  _bypassWeight: false,
  _isCompiled: false,
};

var Effect = Class( Entity,
{
  constructor: function( other, particleManager )
  {
    Effect.$super.call( this, other ); // Call parent's constructor

    if ( other === undefined )
    {
      for ( var key in g_defaultEffect )
        this[ key ] = g_defaultEffect[ key ];

      this._arrayOwner = true;

      this._inUse = [];
      for ( var i = 0; i < 10; i++ )
        this._inUse[ i ] = [];

      this._cAmount = new EmitterArray( EffectsLibrary.globalPercentMin, EffectsLibrary.globalPercentMax );
      this._cLife = new EmitterArray( EffectsLibrary.globalPercentMin, EffectsLibrary.globalPercentMax );
      this._cSizeX = new EmitterArray( EffectsLibrary.globalPercentMin, EffectsLibrary.globalPercentMax );
      this._cSizeY = new EmitterArray( EffectsLibrary.globalPercentMin, EffectsLibrary.globalPercentMax );
      this._cVelocity = new EmitterArray( EffectsLibrary.globalPercentMin, EffectsLibrary.globalPercentMax );
      this._cWeight = new EmitterArray( EffectsLibrary.globalPercentMin, EffectsLibrary.globalPercentMax );
      this._cSpin = new EmitterArray( EffectsLibrary.globalPercentMin, EffectsLibrary.globalPercentMax );
      this._cStretch = new EmitterArray( EffectsLibrary.globalPercentMin, EffectsLibrary.globalPercentMax );
      this._cGlobalZ = new EmitterArray( EffectsLibrary.globalPercentMin, EffectsLibrary.globalPercentMax );
      this._cAlpha = new EmitterArray( 0, 1.0 );
      this._cEmissionAngle = new EmitterArray( EffectsLibrary.angleMin, EffectsLibrary.angleMax );
      this._cEmissionRange = new EmitterArray( EffectsLibrary.emissionRangeMin, EffectsLibrary.emissionRangeMax );
      this._cWidth = new EmitterArray( EffectsLibrary.dimensionsMin, EffectsLibrary.dimensionsMax );
      this._cHeight = new EmitterArray( EffectsLibrary.dimensionsMin, EffectsLibrary.dimensionsMax );
      this._cEffectAngle = new EmitterArray( EffectsLibrary.angleMin, EffectsLibrary.angleMax );
    }
    else
    {
      for ( var key in g_defaultEffect )
        this[ key ] = other[ key ];

      this._particleManager = particleManager;
      this._arrayOwner = false;

      this._inUse = [];
      for ( var i = 0; i < 10; i++ )
        this._inUse[ i ] = [];

      this._cAmount = other._cAmount;
      this._cLife = other._cLife;
      this._cSizeX = other._cSizeX;
      this._cSizeY = other._cSizeY;
      this._cVelocity = other._cVelocity;
      this._cWeight = other._cWeight;
      this._cSpin = other._cSpin;
      this._cAlpha = other._cAlpha;
      this._cEmissionAngle = other._cEmissionAngle;
      this._cEmissionRange = other._cEmissionRange;
      this._cWidth = other._cWidth;
      this._cHeight = other._cHeight;
      this._cEffectAngle = other._cEffectAngle;
      this._cStretch = other._cStretch;
      this._cGlobalZ = other._cGlobalZ;

      this.SetEllipseArc( other._ellipseArc );

      this._dob = particleManager.GetCurrentTime();
      this.SetOKtoRender( false );

      for ( var i = 0; i < other._children.length; i++ )
      {
        var e = new Emitter( other._children[ i ], particleManager );
        e.SetParentEffect( this );
        e.SetParent( this );
      }
    }
  },

  HideAll: function()
  {
    for ( var i = 0; i < this._children.length; i++ )
    {
      this._children[ i ].HideAll();
    }
  },

  GetEffectLayer: function()
  {
    return this._effectLayer;
  },

  SetEffectLayer: function( layer )
  {
    this._effectLayer = layer;
  },

  ShowOne: function( e )
  {
    for ( var i = 0; i < this._children.length; i++ )
    {
      this._children[ i ].SetVisible( false );
    }
    e.SetVisible( true );
  },

  EmitterCount: function()
  {
    return this._children.length;
  },

  SetParticleManager: function( particleManager )
  {
    this._particleManager = particleManager;

    // todo: is this required?
    // for (var i=0;i<this._children.length;i++)
    // {
    //     this._children[i].SetParticleManagerOnEffects(particleManager);
    // }
  },

  Update: function()
  {
    this.Capture();

    this._age = this._particleManager.GetCurrentTime() - this._dob;

    if ( this._spawnAge < this._age )
      this._spawnAge = this._age;

    if ( this._effectLength > 0 && this._age > this._effectLength )
    {
      this._dob = this._particleManager.GetCurrentTime();
      this._age = 0;
    }

    this._currentEffectFrame = this._age / EffectsLibrary.GetLookupFrequency();

    if ( !this._overrideSize )
    {
      switch ( this._class )
      {
        case TypePoint:
          this._currentWidth = 0;
          this._currentHeight = 0;
          break;
        case TypeArea:
        case TypeEllipse:
          this._currentWidth = this.GetWidth( this._currentEffectFrame );
          this._currentHeight = this.GetHeight( this._currentEffectFrame );
          break;
        case TypeLine:
          this._currentWidth = this.GetWidth( this._currentEffectFrame );
          this._currentHeight = 0;
          break;
      }
    }

    // can be optimized
    if ( this._handleCenter && this._class !== TypePoint )
    {
      this._handleX = this._currentWidth * 0.5;
      this._handleY = this._currentHeight * 0.5;
    }
    else
    {
      this._handleX = 0;
      this._handleY = 0;
    }

    if ( this.HasParticles() || this._doesNotTimeout )
    {
      this._idleTime = 0;
    }
    else
    {
      ++this._idleTime;
    }

    if ( this._parentEmitter )
    {
      var parentEffect = this._parentEmitter.GetParentEffect();
      if ( !this._overrideLife ) this._currentLife = this.GetLife( this._currentEffectFrame ) * parentEffect._currentLife;
      if ( !this._overrideAmount ) this._currentAmount = this.GetAmount( this._currentEffectFrame ) * parentEffect._currentAmount;
      if ( this._lockAspect )
      {
        if ( !this._overrideSizeX ) this._currentSizeX = this.GetSizeX( this._currentEffectFrame ) * parentEffect._currentSizeX;
        if ( !this._overrideSizeY ) this._currentSizeY = this._currentSizeX * parentEffect._currentSizeY;
      }
      else
      {
        if ( !this._overrideSizeX ) this._currentSizeX = this.GetSizeX( this._currentEffectFrame ) * parentEffect._currentSizeX;
        if ( !this._overrideSizeY ) this._currentSizeY = this.GetSizeY( this._currentEffectFrame ) * parentEffect._currentSizeY;
      }
      if ( !this._overrideVelocity ) this._currentVelocity = this.GetVelocity( this._currentEffectFrame ) * parentEffect._currentVelocity;
      if ( !this._overrideWeight ) this._currentWeight = this.GetWeight( this._currentEffectFrame ) * parentEffect._currentWeight;
      if ( !this._overrideSpin ) this._currentSpin = this.GetSpin( this._currentEffectFrame ) * parentEffect._currentSpin;
      if ( !this._overrideAlpha ) this._currentAlpha = this.GetAlpha( this._currentEffectFrame ) * parentEffect._currentAlpha;
      if ( !this._overrideEmissionAngle ) this._currentEmissionAngle = this.GetEmissionAngle( this._currentEffectFrame );
      if ( !this._overrideEmissionRange ) this._currentEmissionRange = this.GetEmissionRange( this._currentEffectFrame );
      if ( !this._overrideAngle ) this._angle = this.GetEffectAngle( this._currentEffectFrame );
      if ( !this._overrideStretch ) this._currentStretch = this.GetStretch( this._currentEffectFrame ) * parentEffect._currentStretch;
      if ( !this._overrideGlobalZ ) this._currentGlobalZ = this.GetGlobalZ( this._currentEffectFrame ) * parentEffect._currentGlobalZ;
    }
    else
    {
      if ( !this._overrideLife ) this._currentLife = this.GetLife( this._currentEffectFrame );
      if ( !this._overrideAmount ) this._currentAmount = this.GetAmount( this._currentEffectFrame );
      if ( this._lockAspect )
      {
        if ( !this._overrideSizeX ) this._currentSizeX = this.GetSizeX( this._currentEffectFrame );
        if ( !this._overrideSizeY ) this._currentSizeY = this._currentSizeX;
      }
      else
      {
        if ( !this._overrideSizeX ) this._currentSizeX = this.GetSizeX( this._currentEffectFrame );
        if ( !this._overrideSizeY ) this._currentSizeY = this.GetSizeY( this._currentEffectFrame );
      }
      if ( !this._overrideVelocity ) this._currentVelocity = this.GetVelocity( this._currentEffectFrame );
      if ( !this._overrideWeight ) this._currentWeight = this.GetWeight( this._currentEffectFrame );
      if ( !this._overrideSpin ) this._currentSpin = this.GetSpin( this._currentEffectFrame );
      if ( !this._overrideAlpha ) this._currentAlpha = this.GetAlpha( this._currentEffectFrame );
      if ( !this._overrideEmissionAngle ) this._currentEmissionAngle = this.GetEmissionAngle( this._currentEffectFrame );
      if ( !this._overrideEmissionRange ) this._currentEmissionRange = this.GetEmissionRange( this._currentEffectFrame );
      if ( !this._overrideAngle ) this._angle = this.GetEffectAngle( this._currentEffectFrame );
      if ( !this._overrideStretch ) this._currentStretch = this.GetStretch( this._currentEffectFrame );
      if ( !this._overrideGlobalZ ) this._currentGlobalZ = this.GetGlobalZ( this._currentEffectFrame );
    }

    if ( !this._overrideGlobalZ )
      this._z = this._currentGlobalZ;

    if ( this._currentWeight === 0 )
      this._bypassWeight = true;

    if ( this._parentEmitter )
      this._dying = this._parentEmitter.IsDying();

    Effect.$superp.Update.call( this );

    if ( this._idleTime > this._particleManager.GetIdleTimeLimit() )
      this._dead = 1;

    if ( this._dead )
    {
      if ( this.GetChildCount() === 0 )
      {
        this.Destroy();
        return false;
      }
      else
      {
        this.KillChildren();
      }
    }

    return true;
  },

  HasParticles: function()
  {
    for ( var i = 0; i < this._children.length; i++ )
    {
      if ( this._children[ i ].GetChildCount() > 0 )
        return true;
    }

    return false;
  },

  GetParticleManager: function()
  {
    return this._particleManager;
  },

  GetParticles: function( layer )
  {
    return this._inUse[ layer ];
  },

  IsDying: function()
  {
    return this._dying;
  },

  SoftKill: function()
  {
    this._dying = true;
  },

  HardKill: function()
  {
    this._particleManager.RemoveEffect( this );
    this.Destroy();
  },

  Destroy: function( releaseChildren )
  {
    this._parentEmitter = null;
    this._directoryEffects = [];
    this._directoryEmitters = [];
    for ( var i = 0; i < this._inUse.length; i++ )
    {
      while ( this._inUse[ i ].length !== 0 )
      {
        var p = this._inUse[ i ].pop();
        p.Reset();
        this._particleManager.ReleaseParticle( p );
        this.RemoveInUse( i, p );
      }
      this._inUse[ i ] = [];
    }

    Effect.$superp.Destroy.call( this, releaseChildren );
  },

  SetEndBehavior: function( behavior )
  {
    this._endBehavior = behavior;
  },

  SetDistanceSetByLife: function( value )
  {
    this._distanceSetByLife = value;
  },

  SetHandleCenter: function( center )
  {
    this._handleCenter = center;
  },

  SetReverseSpawn: function( reverse )
  {
    this._reverseSpawn = reverse;
  },

  SetSpawnDirection: function()
  {
    if ( this._reverseSpawn )
      this._spawnDirection = -1;
    else
      this._spawnDirection = 1;
  },

  SetAreaSize: function( width, height )
  {
    this._overrideSize = true;
    this._currentWidth = width;
    this._currentHeight = height;
  },

  SetLineLength: function( length )
  {
    this._overrideSize = true;
    this._currentWidth = length;
  },

  SetEmissionAngle: function( angle )
  {
    this._overrideEmissionAngle = true;
    this._currentEmissionAngle = angle;
  },

  SetEffectAngle: function( angle )
  {
    this._overrideAngle = true;
    this._angle = angle;
  },

  SetLife: function( life )
  {
    this._overrideLife = true;
    this._currentLife = life;
  },

  SetAmount: function( amount )
  {
    this._overrideAmount = true;
    this._currentAmount = amount;
  },

  SetVelocity: function( velocity )
  {
    this._overrideVelocity = true;
    this._currentVelocity = velocity; // @todo dan _currentAmount
  },

  SetSpin: function( spin )
  {
    this._overrideSpin = true;
    this._currentSpin = spin;
  },

  SetWeight: function( weight )
  {
    this._overrideWeight = true;
    this._currentWeight = weight;
  },

  SetEffectParticleSize: function( sizeX, sizeY )
  {
    this._overrideSizeX = true;
    this._overrideSizeY = true;
    this._currentSizeX = sizeX;
    this._currentSizeY = sizeY;
  },

  SetSizeX: function( sizeX )
  {
    this._overrideSizeX = true;
    this._currentSizeX = sizeX;
  },

  SetSizeY: function( sizeY )
  {
    this._overrideSizeY = true;
    this._currentSizeY = sizeY;
  },

  SetEffectAlpha: function( alpha )
  {
    this._overrideAlpha = true;
    this._currentAlpha = alpha;
  },

  SetEffectEmissionRange: function( emissionRange )
  {
    this._overrideEmissionRange = true;
    this._currentEmissionRange = emissionRange;
  },

  SetEllipseArc: function( degrees )
  {
    this._ellipseArc = degrees;
    this._ellipseOffset = 90 - ( degrees / 2 );
  },

  SetZ: function( z )
  {
    this._overrideGlobalZ = true;
    this._z = z;
  },

  SetStretch: function( stretch )
  {
    this._overrideStretch = true;
    this._currentStretch = stretch;
  },

  SetGroupParticles: function( v )
  {
    for ( var i = 0; i < this._children.length; i++ )
    {
      var e = this._children[ i ];

      e.SetGroupParticles( v );

      var effects = e.GetEffects();
      for ( var j = 0; j < effects.length; j++ )
      {
        effects[ j ].SetGroupParticles( v );
      }
    }
  },

  AddInUse: function( layer, p )
  {
    // the particle is managed by this Effect
    this.SetGroupParticles( true );
    this._inUse[ layer ].push( p );
  },

  RemoveInUse: function( layer, p )
  {
    RemoveFromList( this._inUse[ layer ], p );
  },

  CompileAll: function()
  {
    if(this._isCompiled)
      return;
      
    this.CompileLife();
    this.CompileAmount();
    this.CompileSizeX();
    this.CompileSizeY();
    this.CompileVelocity();
    this.CompileWeight();
    this.CompileSpin();
    this.CompileAlpha();
    this.CompileEmissionAngle();
    this.CompileEmissionRange();
    this.CompileWidth();
    this.CompileHeight();
    this.CompileAngle();
    this.CompileStretch();
    this.CompileGlobalZ();

    for ( var i = 0; i < this._children.length; i++ )
    {
      this._children[ i ].CompileAll();
    }

    this._isCompiled = true;
  },

  CompileQuick: function()
  {
    for ( var i = 0; i < this._children.length; i++ )
    {
      var e = this._children[ i ];
      e.CompileQuick();
      e.ResetBypassers();
    }
  },

  CompileAmount: function()
  {
    this._cAmount.Compile();
  },

  CompileLife: function()
  {
    this._cLife.Compile();
  },

  CompileSizeX: function()
  {
    this._cSizeX.Compile();
  },

  CompileSizeY: function()
  {
    this._cSizeY.Compile();
  },

  CompileVelocity: function()
  {
    this._cVelocity.Compile();
  },

  CompileWeight: function()
  {
    this._cWeight.Compile();
  },

  CompileSpin: function()
  {
    this._cSpin.Compile();
  },

  CompileAlpha: function()
  {
    this._cAlpha.Compile();
  },

  CompileEmissionAngle: function()
  {
    this._cEmissionAngle.Compile();
  },

  CompileEmissionRange: function()
  {
    this._cEmissionRange.Compile();
  },

  CompileWidth: function()
  {
    this._cWidth.Compile();
  },

  CompileHeight: function()
  {
    this._cHeight.Compile();
  },

  CompileAngle: function()
  {
    this._cEffectAngle.Compile();
  },

  CompileStretch: function()
  {
    this._cStretch.Compile();
  },

  CompileGlobalZ: function()
  {
    this._cGlobalZ.Compile();
    this._cGlobalZ.SetCompiled( 0, 1.0 );
  },

  GetLife: function( frame )
  {
    return this._cLife.Get( frame );
  },

  GetAmount: function( frame )
  {
    return this._cAmount.Get( frame );
  },

  GetSizeX: function( frame )
  {
    return this._cSizeX.Get( frame );
  },

  GetSizeY: function( frame )
  {
    return this._cSizeY.Get( frame );
  },

  GetVelocity: function( frame )
  {
    return this._cVelocity.Get( frame );
  },

  GetWeight: function( frame )
  {
    return this._cWeight.Get( frame );
  },

  GetSpin: function( frame )
  {
    return this._cSpin.Get( frame );
  },

  GetAlpha: function( frame )
  {
    return this._cAlpha.Get( frame );
  },

  GetEmissionAngle: function( frame )
  {
    return this._cEmissionAngle.Get( frame );
  },

  GetEmissionRange: function( frame )
  {
    return this._cEmissionRange.Get( frame );
  },

  GetWidth: function( frame )
  {
    return this._cWidth.Get( frame );
  },

  GetHeight: function( frame )
  {
    return this._cHeight.Get( frame );
  },

  GetEffectAngle: function( frame )
  {
    return this._cEffectAngle.Get( frame );
  },

  GetStretch: function( frame )
  {
    return this._cStretch.Get( frame );
  },

  GetGlobalZ: function( frame )
  {
    return this._cGlobalZ.Get( frame );
  },

  LoadFromXML: function( xml )
  {
    var x = new XMLHelper( xml );
    this._class = x.GetAttrAsInt( "TYPE" );
    this._emitAtPoints = x.GetAttrAsBool( "EMITATPOINTS" );
    this._mgx = x.GetAttrAsInt( "MAXGX" );
    this._mgy = x.GetAttrAsInt( "MAXGY" );

    this._emissionType = x.GetAttrAsInt( "EMISSION_TYPE" );
    this._effectLength = x.GetAttrAsInt( "EFFECT_LENGTH" );
    this._ellipseArc = x.GetAttrAsFloat( "ELLIPSE_ARC" );

    this._handleX = x.GetAttrAsInt( "HANDLE_X" );
    this._handleY = x.GetAttrAsInt( "HANDLE_Y" );

    this._lockAspect = x.GetAttrAsBool( "UNIFORM" );
    this._handleCenter = x.GetAttrAsBool( "HANDLE_CENTER" );
    this._traverseEdge = x.GetAttrAsBool( "TRAVERSE_EDGE" );

    this._name = x.GetAttr( "NAME" );
    this._endBehavior = x.GetAttrAsInt( "END_BEHAVIOUR" );
    this._distanceSetByLife = x.GetAttrAsBool( "DISTANCE_SET_BY_LIFE" );
    this._reverseSpawn = x.GetAttrAsBool( "REVERSE_SPAWN_DIRECTION" );

    // Build path
    this._path = this._name;
    var p = xml.parentNode;
    while ( p )
    {
      var parentName = GetXMLAttrSafe( p, "NAME" );
      if ( parentName !== "" )
        this._path = parentName + "/" + this._path;

      p = p.parentNode;
    }

    var animProps = xml.getElementsByTagName( "ANIMATION_PROPERTIES" )[ 0 ];
    if ( animProps )
    {
      var a = new XMLHelper( animProps );
      this._frames = a.GetAttrAsInt( "FRAMES" );
      this._animWidth = a.GetAttrAsInt( "WIDTH" );
      this._animHeight = a.GetAttrAsInt( "HEIGHT" );
      this._animX = a.GetAttrAsInt( "X" );
      this._animY = a.GetAttrAsInt( "Y" );
      this._seed = a.GetAttrAsInt( "SEED" );
      this._looped = a.GetAttrAsBool( "LOOPED" );
      this._zoom = a.GetAttrAsFloat( "ZOOM" );
      this._frameOffset = a.GetAttrAsInt( "FRAME_OFFSET" );
    }

    // todo: pass in EmitterArray instend of bound function (and remove boilerplate functions)
    this.ReadAttribute( xml, this.AddAmount.bind( this ), "AMOUNT" );
    this.ReadAttribute( xml, this.AddLife.bind( this ), "LIFE" );
    this.ReadAttribute( xml, this.AddSizeX.bind( this ), "SIZEX" );
    this.ReadAttribute( xml, this.AddSizeY.bind( this ), "SIZEY" );
    this.ReadAttribute( xml, this.AddVelocity.bind( this ), "VELOCITY" );
    this.ReadAttribute( xml, this.AddWeight.bind( this ), "WEIGHT" );
    this.ReadAttribute( xml, this.AddSpin.bind( this ), "SPIN" );

    this.ReadAttribute( xml, this.AddAlpha.bind( this ), "ALPHA" );
    this.ReadAttribute( xml, this.AddEmissionAngle.bind( this ), "EMISSIONANGLE" );
    this.ReadAttribute( xml, this.AddEmissionRange.bind( this ), "EMISSIONRANGE" );
    this.ReadAttribute( xml, this.AddWidth.bind( this ), "AREA_WIDTH" );
    this.ReadAttribute( xml, this.AddHeight.bind( this ), "AREA_HEIGHT" );

    this.ReadAttribute( xml, this.AddAngle.bind( this ), "ANGLE" );
    this.ReadAttribute( xml, this.AddStretch.bind( this ), "STRETCH" );

    if ( xml.getElementsByTagName( "STRETCH" ).length === 0 )
    {
      this.AddStretch( 0, 1.0 );
    }

    this.ReadAttribute( xml, this.AddStretch.bind( this ), "GLOBAL_ZOOM" );

    var _this = this;
    ForEachInXMLNodeList( xml.getElementsByTagName( "PARTICLE" ), function( n )
    {
      var emit = new Emitter();
      emit.LoadFromXML( n, _this );
      _this.AddChild( emit );
    } );

  },

  ReadAttribute: function( xml, fn, tag )
  {
    var n = xml.getElementsByTagName( tag )[ 0 ];
    if ( n )
    {
      var attr = fn( parseFloat( GetNodeAttrValue( n, "FRAME" ) ), parseFloat( GetNodeAttrValue( n, "VALUE" ) ) );
      attr.LoadFromXML( n.getElementsByTagName( "CURVE" )[ 0 ] );
    }
  },

  AddAmount: function( f, v )
  {
    return this._cAmount.Add( f, v );
  },

  AddLife: function( f, v )
  {
    return this._cLife.Add( f, v );
  },

  AddSizeX: function( f, v )
  {
    return this._cSizeX.Add( f, v );
  },

  AddSizeY: function( f, v )
  {
    return this._cSizeY.Add( f, v );
  },

  AddVelocity: function( f, v )
  {
    return this._cVelocity.Add( f, v );
  },

  AddWeight: function( f, v )
  {
    return this._cWeight.Add( f, v );
  },

  AddSpin: function( f, v )
  {
    return this._cSpin.Add( f, v );
  },

  AddAlpha: function( f, v )
  {
    return this._cAlpha.Add( f, v );
  },

  AddEmissionAngle: function( f, v )
  {
    return this._cEmissionAngle.Add( f, v );
  },

  AddEmissionRange: function( f, v )
  {
    return this._cEmissionRange.Add( f, v );
  },

  AddWidth: function( f, v )
  {
    return this._cWidth.Add( f, v );
  },

  AddHeight: function( f, v )
  {
    return this._cHeight.Add( f, v );
  },

  AddAngle: function( f, v )
  {
    return this._cEffectAngle.Add( f, v );
  },

  AddStretch: function( f, v )
  {
    return this._cStretch.Add( f, v );
  },

  AddGlobalZ: function( f, v )
  {
    return this._cGlobalZ.Add( f, v );
  },

  GetPath: function()
  {
    return this._path;
  },

  GetLifeMaxValue: function()
  {
    return this._cLife.GetMaxValue();
  },


  GetCurrentAmount: function()
  {
    return this._currentAmount;
  },

  GetCurrentLife: function()
  {
    return this._currentLife;
  },

  GetCurrentEmissionAngle: function()
  {
    return this._currentEmissionAngle;
  },

  GetCurrentEmissionRange: function()
  {
    return this._currentEmissionRange;
  },

  GetClass: function()
  {
    return this._class;
  },

  SetCurrentEffectFrame: function( frame )
  {
    this._currentEffectFrame = frame;
  },

  GetCurrentEffectFrame: function()
  {
    return this._currentEffectFrame;
  },

  GetTraverseEdge: function()
  {
    return this._traverseEdge;
  },

  GetCurrentVelocity: function()
  {
    return this._currentVelocity;
  },

  GetCurrentSizeX: function()
  {
    return this._currentSizeX;
  },

  GetCurrentSizeY: function()
  {
    return this._currentSizeY;
  },

  GetCurrentStretch: function()
  {
    return this._currentStretch;
  },

  GetCurrentWeight: function()
  {
    return this._currentWeight;
  },

  IsBypassWeight: function()
  {
    return this._bypassWeight;
  },

  GetCurrentAlpha: function()
  {
    return this._currentAlpha;
  },

  SetParticlesCreated: function( value )
  {
    this._particlesCreated = value;
  },

  GetCurrentSpin: function()
  {
    return this._currentSpin;
  },

  GetLifeLastFrame: function()
  {
    return this._cLife.GetLastFrame();
  },

  SetEffectLength: function( length )
  {
    this._effectLength = length;
  },

  SetParentEmitter: function( emitter )
  {
    this._parentEmitter = emitter;
  },

  GetHandleCenter: function()
  {
    return this._handleCenter;
  },

  GetEmitAtPoints: function()
  {
    return this._emitAtPoints;
  },

  GetCurrentWidth: function()
  {
    return this._currentWidth;
  },

  GetCurrentHeight: function()
  {
    return this._currentHeight;
  },

  GetEllipseArc: function()
  {
    return this._ellipseArc;
  },

  GetEllipseOffset: function()
  {
    return this._ellipseOffset;
  },

  GetEmissionType: function()
  {
    return this._emissionType;
  },

  GetParentEmitter: function()
  {
    return this._parentEmitter;
  },

  GetMGX: function()
  {
    return this._mgx;
  },

  GetMGY: function()
  {
    return this._mgy;
  },

  GetImages: function( images )
  {
    for ( var i = 0; i < this._children.length; i++ )
    {
      this._children[ i ].GetImages( images );
    }
  },

  CollectEmitters: function( emitters )
  {
    for ( var i = 0; i < this._children.length; i++ )
    {
      emitters.push( this._children[ i ] );
    }
    // todo: recursive + sub effects
  },
} );
