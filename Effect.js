
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


var Effect = Class(Entity,{
  constructor: function() {

    this._class = TypePoint;
    this._currentEffectFrame = 0;
    this._handleCenter = false;
    this._source = null;
    this._lockAspect = true;
    this._particlesCreated = false;
    this._suspendTime = 0;
    this._gx = 0;
    this._gy = 0;
    this._mgx = 0;
    this._mgy = 0;
    this._emitAtPoints = false;
    this._emissionType = EmInwards;
    this._effectLength = 0;
    this._parentEmitter = null;
    this._spawnAge = 0;
    this._index = 0;
    this._particleCount = 0;
    this._idleTime = 0;
    this._traverseEdge = false;
    this._endBehavior = EndKill;
    this._distanceSetByLife = false;
    this._reverseSpawn = false;
    this._spawnDirection = 1;
    this._dying = false;
    this._allowSpawning = true;
    this._ellipseArc = 360.0;
    this._ellipseOffset = 0;
    this._effectLayer = 0;
    this._doesNotTimeout = false;

    this._particleManager = null;

    this._frames = 32;
    this._animWidth = 128;
    this._animHeight = 128;
    this._looped = false;
    this._animX = 0;
    this._animY = 0;
    this._seed = 0;
    this._zoom = 1.0;
    this._frameOffset = 0;

    this._currentLife = 0;
    this._currentAmount = 0;
    this._currentSizeX = 0;
    this._currentSizeY = 0;
    this._currentVelocity = 0;
    this._currentSpin = 0;
    this._currentWeight = 0;
    this._currentWidth = 0;
    this._currentHeight = 0;
    this._currentAlpha = 0;
    this._currentEmissionAngle = 0;
    this._currentEmissionRange = 0;
    this._currentStretch = 0;
    this._currentGlobalZ = 0;

    this._overrideSize = false;
    this._overrideEmissionAngle = false;
    this._overrideEmissionRange = false;
    this._overrideAngle = false;
    this._overrideLife = false;
    this._overrideAmount = false;
    this._overrideVelocity = false;
    this._overrideSpin = false;
    this._overrideSizeX = false;
    this._overrideSizeY = false;
    this._overrideWeight = false;
    this._overrideAlpha = false;
    this._overrideStretch = false;
    this._overrideGlobalZ = false;

    this._bypassWeight = false;

    this._arrayOwner = true;

    this._cAmount = new EmitterArray(EffectsLibrary.globalPercentMin, EffectsLibrary.globalPercentMax);
    this._cLife = new EmitterArray(EffectsLibrary.globalPercentMin, EffectsLibrary.globalPercentMax);
    this._cSizeX = new EmitterArray(EffectsLibrary.globalPercentMin, EffectsLibrary.globalPercentMax);
    this._cSizeY = new EmitterArray(EffectsLibrary.globalPercentMin, EffectsLibrary.globalPercentMax);
    this._cVelocity = new EmitterArray(EffectsLibrary.globalPercentMin, EffectsLibrary.globalPercentMax);
    this._cWeight = new EmitterArray(EffectsLibrary.globalPercentMin, EffectsLibrary.globalPercentMax);
    this._cSpin = new EmitterArray(EffectsLibrary.globalPercentMin, EffectsLibrary.globalPercentMax);
    this._cAlpha = new EmitterArray(0, 1.0);
    this._cEmissionAngle = new EmitterArray(EffectsLibrary.angleMin, EffectsLibrary.angleMax);
    this._cEmissionRange = new EmitterArray(EffectsLibrary.emissionRangeMin, EffectsLibrary.emissionRangeMax);
    this._cWidth = new EmitterArray(EffectsLibrary.dimensionsMin, EffectsLibrary.dimensionsMax);
    this._cHeight = new EmitterArray(EffectsLibrary.dimensionsMin, EffectsLibrary.dimensionsMax);
    this._cEffectAngle = new EmitterArray(EffectsLibrary.angleMin, EffectsLibrary.angleMax);
    this._cStretch = new EmitterArray(EffectsLibrary.globalPercentMin, EffectsLibrary.globalPercentMax);
    this._cGlobalZ = new EmitterArray(EffectsLibrary.globalPercentMin, EffectsLibrary.globalPercentMax);

    Effect.$super.call(this);        // Call parent's constructor
  },

  HideAll:function()
  {
      for (var i=0;i<this._children.length;i++)
      {
          this._children[i].HideAll();
      }
  },

  ShowOne:function( e )
  {
    for (var i=0;i<this._children.length;i++)
    {
        this._children[i].SetVisible(false);
    }
    e.SetVisible(true);
  },

  EmitterCount:function()
  {
      return this._children.length;
  },

  SetParticleManager:function( particleManager )
  {
      this._particleManager = particleManager;
  },

  CompileAll:function()
  {
    /*
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
*/

      for (var i=0;i<this._children.length;i++)
      {
          this._children[i].CompileAll();
      }
  },


  LoadFromXML:function(xml)
  {
    var x = new XMLHelper(xml);
    this._class  = x.GetAttr("TYPE");
    this._emitAtPoints = x.GetAttr("EMITATPOINTS");
    this._mgx = x.GetAttr("MAXGX");
    this._mgy = x.GetAttr("MAXGY");

    this._emissionType = x.GetAttr("EMISSION_TYPE");
    this._effectLength = x.GetAttr("EFFECT_LENGTH");
    this._ellipseArc = x.GetAttr("ELLIPSE_ARC");

    this._handleX = x.GetAttr("HANDLE_X");
    this._handleY = x.GetAttr("HANDLE_Y");

    this._lockAspect = x.GetAttr("UNIFORM");
    this._handleCenter = x.GetAttr("HANDLE_CENTER");
    this._traverseEdge = x.GetAttr("TRAVERSE_EDGE");

    this._name = x.GetAttr("NAME");
    this._endBehavior = x.GetAttr("END_BEHAVIOUR");
    this._distanceSetByLife = x.GetAttr("DISTANCE_SET_BY_LIFE");
    this._reverseSpawn = x.GetAttr("REVERSE_SPAWN_DIRECTION");

    // Build path
    this._path = this._name;
    var p = xml.parentNode;
    while(p)
    {
      var parentName = GetXMLAttrSafe(p,"NAME");
      if(parentName !== "")
        this._path = parentName + "/" + this._path;

      p = p.parentNode;
    }

    console.log(this._path);

    var animProps = xml.getElementsByTagName("ANIMATION_PROPERTIES")[0];
    if(animProps)
    {
      var a = new XMLHelper(animProps);
      this._frames = a.GetAttr("FRAMES");
      this._animWidth = a.GetAttr("WIDTH");
      this._animHeight = a.GetAttr("HEIGHT");
      this._animX = a.GetAttr("X");
      this._animY = a.GetAttr("Y");
      this._seed = a.GetAttr("SEED");
      this._looped = a.GetAttr("LOOPED");
      this._zoom = a.GetAttr("ZOOM");
      this._frameOffset = a.GetAttr("FRAME_OFFSET");
    }




  },

  GetPath:function()
  {
      return this._path;
  },
});
