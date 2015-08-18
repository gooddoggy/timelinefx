var Blend =
{
  BMAlphaBlend:0,
  BMLightBlend:1
};

var Entity = Class({
  $const: {

    MIN_AGE: 1,
    MAX_AGE: 150
  },

  constructor: function() {

    this._x = 0;
    this._y = 0;

    this._oldX = 0;
    this._oldY = 0;
    this._wx = 0;
    this._wy = 0;
    this._oldWX = 0;
    this._oldWY = 0;
    this._z = 1.0;
    this._oldZ = 1.0;
    this._relative = true;

    this._r = 0;
    this._g = 0;
    this._b = 0;
    this._red = 255;
    this._green = 255;
    this._blue = 255;
    this._oldRed = 255;
    this._oldGreen = 255;
    this._oldBlue = 255;

    this._width = 0;
    this._height = 0;
    this._weight = 0;
    this._gravity = 0;
    this._baseWeight = 0;
    this._oldWeight = 0;
    this._scaleX = 1.0;
    this._scaleY = 1.0;
    this._sizeX = 1.0;
    this._sizeY = 1.0;
    this._oldScaleX = 1.0;
    this._oldScaleY = 1.0;

    this._speed = 0;
    this._baseSpeed = 0;
    this._oldSpeed = 0;
    this._updateSpeed = true;

    this._direction = 0;
    this._directionLocked = false;
    this._angle = 0;
    this._oldAngle = 0;
    this._relativeAngle = 0;
    this._oldRelativeAngle = 0;

    this._avatar = null;
    this._frameOffset = 0;
    this._framerate = 1.0;
    this._currentFrame = 0;
    this._oldCurrentFrame = 0;
    this._animating = false;
    this._animateOnce = false;
    this._animAction = 0;
    this._handleX = 0;
    this._handleY = 0;
    this._autoCenter = true;
    this._okToRender = true;

    this._dob = 0;
    this._age = 0;
    this._rptAgeA = 0;
    this._rptAgeC = 0;
    this._aCycles = 0;
    this._cCycles = 0;
    this._oldAge = 0;
    this._dead = 0;
    this._destroyed = false;
    this._lifeTime = 0;
    this._timediff = 0;

    this._AABB_Calculate = true;
    this._collisionXMin = 0;
    this._collisionYMin = 0;
    this._collisionXMax = 0;
    this._collisionYMax = 0;
    this._AABB_XMin = 0;
    this._AABB_YMin = 0;
    this._AABB_XMax = 0;
    this._AABB_YMax = 0;
    this._AABB_MaxWidth = 0;
    this._AABB_MaxHeight = 0;
    this._AABB_MinWidth = 0;
    this._AABB_MinHeight = 0;
    this._radiusCalculate = true;
    this._imageRadius = 0;
    this._entityRadius = 0;
    this._imageDiameter = 0;

    this._parent = null;
    this._rootParent = null;

    this._childrenOwner = true;

    this._blendMode = Blend.BMAlphaBlend;

    this._alpha = 1.0;
    this._oldAlpha = 0;

    this._runChildren = false;
    this._pixelsPerSecond = 0;

    this._children = [];
  },

  IsDestroyed:function(){ return this._destroyed; },
  GetName:function(){ return this._name; },
  SetName:function(name){ this._name = name; },

  SetX:function(x){ this._x = x; },
  SetY:function(y){ this._y = y; },
  SetZ:function(z){ this._z = z; },

  GetX:function(){ return this._x; },
  GetY:function(){ return this._y; },
  GetZ:function(){ return this._z; },

  Capture:function()
  {
      this._oldZ = this._z;
      this._oldWX = this._wx;
      this._oldWY = this._wy;
      this._oldX = this._x;
      this._oldY = this._y;
      this._oldAngle = this._angle;
      this._oldRelativeAngle = this._relativeAngle;
      this._oldScaleX = this._scaleX;
      this._oldScaleY = this._scaleY;
      this._oldCurrentFrame = this._currentFrame;
  },

  CaptureAll:function()
  {
      this.Capture();
      for (var i=0;i<this._children.length;i++)
      {
          this._children[i].Capture();
      }
  },

  SetOKtoRender: function(ok){ this._okToRender = ok; },

  Destroy:function()
   {
       this._parent = NULL;
       this._avatar = NULL;
       this._rootParent = NULL;
       this.ClearChildren();
       this._destroyed = true;
   },

   RemoveChild:function( e )
   {
       RemoveFromList(this._children,e);
       e._parent = null;
   },

  ClearChildren:function()
  {
    for (var i=0;i<this._children.length;i++)
    {
        this._children[i].Destroy();
    }
    this._children = [];
  },

  GetChildren:function()
  {
    return this._children;
  },

});
