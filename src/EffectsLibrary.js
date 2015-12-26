var EffectsLibrary = Class(
{
  $singleton: true, // or is it

  $const: {
    c_particleLimit: 5000,

    globalPercentMin        : 0,
    globalPercentMax        : 20.0,
    globalPercentSteps      : 100.0,

    globalPercentVMin       : 0,
    globalPercentVMax       : 10.0,
    globalPercentVSteps     : 200.0,

    angleMin                : 0,
    angleMax                : 1080.0,
    angleSteps              : 54.0,

    emissionRangeMin        : 0,
    emissionRangeMax        : 180.0,
    emissionRangeSteps      : 30.0,

    dimensionsMin           : 0,
    dimensionsMax           : 200.0,
    dimensionsSteps         : 40.0,

    lifeMin                 : 0,
    lifeMax                 : 100000.0,
    lifeSteps               : 200.0,

    amountMin               : 0,
    amountMax               : 2000,
    amountSteps             : 100,

    velocityMin             : 0,
    velocityMax             : 10000.0,
    velocitySteps           : 100.0,

    velocityOverTimeMin     : -20.0,
    velocityOverTimeMax     : 20.0,
    velocityOverTimeSteps   : 200,

    weightMin               : -2500.0,
    weightMax               : 2500.0,
    weightSteps             : 200.0,

    weightVariationMin      : 0,
    weightVariationMax      : 2500.0,
    weightVariationSteps    : 250.0,

    spinMin                 : -2000.0,
    spinMax                 : 2000.0,
    spinSteps               : 100.0,

    spinVariationMin        : 0,
    spinVariationMax        : 2000.0,
    spinVariationSteps      : 100.0,

    spinOverTimeMin         : -20.0,
    spinOverTimeMax         : 20.0,
    spinOverTimeSteps       : 200.0,

    directionOverTimeMin    : 0,
    directionOverTimeMax    : 4320.0,
    directionOverTimeSteps  : 216.0,

    framerateMin            : 0,
    framerateMax            : 200.0,
    framerateSteps          : 100.0,

    maxDirectionVariation   : 22.5,
    maxVelocityVariation    : 30.0,
    motionVariationInterval : 30
  },

  Init:function()
  {
    this.SetUpdateFrequency( 30.0 );
    this._lookupFrequency = this._updateTime;
    this._lookupFrequencyOverTime = 1.0;

    this.ClearAll();
  },

  Load:function(xml)
  {
  //  console.log(xml);

    // Only allow loading one library
    this.ClearAll();

    var shapes = xml.getElementsByTagName("SHAPES")[0];
    shapes = shapes.getElementsByTagName("IMAGE");

    for (var i=0;i<shapes.length;i++)
    {
  //    console.log(shapes[i].attributes.getNamedItem("URL").nodeValue);
      var img = new AnimImage();
      img.LoadFromXML(shapes[i]);
      this._shapeList.push(img);
    }

    // Traverse top down
    this.m_currentFolder = null;
    this.LoadEffectElements( xml.getElementsByTagName("EFFECTS")[0].children );
  },

  LoadEffectElements:function(effects)
  {
    for (var i=0;i<effects.length;i++)
    {
      if( effects[i].tagName === "FOLDER" )
      {
        this.LoadEffectElements(effects[i].children);
      }
      else if( effects[i].tagName === "EFFECT" )
      {
        var e = new Effect();
        e.LoadFromXML(effects[i]);

        this.AddEffect(e);
      }
        //console.log(effects[i].tagName);
      //console.log(effects[i].attributes.getNamedItem("NAME").nodeValue);
    }
  },

  ClearAll:function()
  {
    this._name = "";

    this._effects = []; // indexed by name
    this._emitters = [];// indexed by name
    this._shapeList = [];
  },

  GetShapes:function()
  {
      return this._shapeList;
  },

  GetImage:function(index)
  {
    return this._shapeList[index];
  },

  GetEffect:function(name)
  {
    return this._effects[name];
  },

  GetEmitter:function(name)
  {
    return this._emitters[name];
  },

  AddEffect:function( e )
  {
      var name = e.GetPath();

      this._effects[name] = e;

      var emitters = e.GetChildren();

      for (var i=0;i<e.EmitterCount();i++)
      {
        this.AddEmitter(emitters[i]);
      }
  },

  AddEmitter:function( e )
  {
      var name = e.GetPath();

      this._emitters[name] = e;

      var effects = e.GetEffects();
      for (var i=0;i<effects.length;i++)
      {
        this.AddEffect(effects[i]);
      }
  },

  SetUpdateFrequency: function( freq )
  {
    this._updateFrequency = freq; //  fps
    this._updateTime = 1000.0 / this._updateFrequency;
    this._currentUpdateTime = this._updateFrequency;
  },

  SetLookupFrequency: function( freq )
  {
    this._lookupFrequency = freq;
  },
  SetLookupFrequencyOverTime: function( freq )
  {
    this._lookupFrequencyOverTime = freq;
  },

  GetUpdateFrequency: function(){ return this._updateFrequency; },
  GetUpdateTime:  function(){ return this._updateTime; },
  GetCurrentUpdateTime: function(){ return this._currentUpdateTime; },
  GetLookupFrequency: function(){ return this._lookupFrequency; },
  GetLookupFrequencyOverTime: function(){ return this._lookupFrequencyOverTime; },

} );
