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

    this._matrix = new Matrix2();

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
       this._parent = null;
       this._avatar = null;
       this._rootParent = null;
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

  Update:function()
   {
       var currentUpdateTime = EffectsLibrary.GetCurrentUpdateTime();

       // Update speed in pixels per second
       if (this._updateSpeed && this._speed)
       {
           this._pixelsPerSecond = this._speed / currentUpdateTime;
           this._speedVec.x = sin(this._direction / 180.0 * M_PI) * this._pixelsPerSecond;
           this._speedVec.y = cos(this._direction / 180.0 * M_PI) * this._pixelsPerSecond;

           this._x += this._speedVec.x * this._z;
           this._y -= this._speedVec.y * this._z;
       }

       // update the gravity
       if (this._weight !== 0)
       {
           this._gravity += this._weight / currentUpdateTime;
           this._y += (this._gravity / currentUpdateTime) * this._z;
       }

       // set the matrix if it is relative to the parent
       if (this._relative)
           this._matrix.Set(cos(this._angle / 180 * M_PI), sin(this._angle / 180.0 * M_PI), -sin(this._angle / 180.0 * M_PI), cos(this._angle / 180.0 * M_PI));

       // calculate where the entity is in the world
       if (this._parent && this._relative)
       {
           this._z = this._parent._z;
           this._matrix = this._matrix.Transform(this._parent._matrix);
           var rotVec = this._parent._matrix.TransformVector(new Vector2(this._x, this._y));
           if (this._z !== 1.0)
           {
               this._wx = this._parent._wx + rotVec.x * this._z;
               this._wy = this._parent._wy + rotVec.y * this._z;
           }
           else
           {
               this._wx = this._parent._wx + rotVec.x;
               this._wy = this._parent._wy + rotVec.y;
           }
           this._relativeAngle = this._parent._relativeAngle + this._angle;
       }
       else
       {
           // If parent setz(parent.z)
           this._wx = this._x;
           this._wy = this._y;
       }

       if (!this._parent)
           this._relativeAngle = this._angle;

       // update animation frame
       if (this._avatar && this._animating)
       {
           this._currentFrame += this._framerate / currentUpdateTime;
           if (this._animateOnce)
           {
               if (this._currentFrame > this._avatar.GetFramesCount() - 1)
               {
                   this._currentFrame = (this._avatar.GetFramesCount() - 1);
               }
               else if (this._currentFrame <= 0)
               {
                   this._currentFrame = 0;
               }
           }
       }

       // update the Axis Aligned Bounding Box
       if (this._AABB_Calculate)
           this.UpdateBoundingBox();

       // update the radius of influence
       if (this._radiusCalculate)
           this.UpdateEntityRadius();

       // update the children
       this.UpdateChildren();

       return true;
   },

   UpdateChildren:function()
   {
     for (var i=0;i<this._children.length;i++)
     {
         if(!this._children[i].Update())
         {
           this._children.splice(i, 1);
           i--;
         }
     }
   },

   GetChildCount:function()
    {
        return this._children.length;
    },

    UpdateBoundingBox:function()
    {
        if (this._z !== 1.0)
        {
            this._collisionXMin = this._AABB_MinWidth * this._scaleX * this._z;
            this._collisionYMin = this._AABB_MinHeight * this._scaleY * this._z;
            this._collisionXMax = this._AABB_MaxWidth * this._scaleX * this._z;
            this._collisionYMax = this._AABB_MaxHeight * this._scaleY * this._z;
        }
        else
        {
            this._collisionXMin = this._AABB_MinWidth * this._scaleX;
            this._collisionYMin = this._AABB_MinHeight * this._scaleY;
            this._collisionXMax = this._AABB_MaxWidth * this._scaleX;
            this._collisionYMax = this._AABB_MaxHeight * this._scaleY;
        }

        this._AABB_XMin = this._collisionXMin;
        this._AABB_YMin = this._collisionYMin;
        this._AABB_XMax = this._collisionXMax;
        this._AABB_YMax = this._collisionYMax;

        if (this._children.length === 0)
            this.UpdateParentBoundingBox();
    },

    UpdateEntityRadius:function()
    {
        if (this._autoCenter)
        {
            if (this._avatar)
            {
                var aMaxRadius = this._avatar.GetMaxRadius();
                var aWidth = this._avatar.GetWidth();
                var aHeight = this._avatar.GetHeight();

                if (aMaxRadius !== 0)
                    this._imageRadius = Math.Max(aMaxRadius * this._scaleX * this._z, aMaxRadius * this._scaleY * this._z);
                else
                    this._imageRadius = Vector2.GetDistance(aWidth / 2.0 * this._scaleX * this._z, aHeight / 2.0 * this._scaleY * this._z, aWidth * this._scaleX * this._z, aHeight * this._scaleY * this._z);
            }
            else
            {
                this._imageRadius = 0;
            }
        }
        else
        {
            var aMaxRadius = this._avatar.GetMaxRadius();
            var aWidth = this._avatar.GetWidth();
            var aHeight = this._avatar.GetHeight();

            if (aMaxRadius !== 0)
                this._imageRadius = Vector2.GetDistance(this._handleX * this._scaleX * this._z, this._handleY * this._scaleY * this._z, aWidth / 2.0 * this._scaleX * this._z, aHeight / 2.0 * this._scaleY * this._z)
                               + Math.Max(aMaxRadius * this._scaleX * this._z, aMaxRadius * this._scaleY * this._z);
            else
                this._imageRadius = Vector2.GetDistance(this._handleX * this._scaleX * this._z, this._handleY * this._scaleY * this._z, aWidth * this._scaleX * this._z, aHeight * this._scaleY * this._z);
        }

        this._entityRadius = this._imageRadius;
        this._imageDiameter = this._imageRadius * 2.0;

        if (this._rootParent)
            UpdateRootParentEntityRadius();
    },

    UpdateParentEntityRadius:function()
    {
        if (this._parent)
        {
            if (this._children.length > 0)
                this._parent._entityRadius += Math.Max(0.0, Vector2.GetDistance(this._wx, this._wy, this._parent._wx, this._parent._wy) + this._entityRadius - this._parent._entityRadius);
            else
                this._parent._entityRadius += Math.Max(0.0, Vector2.GetDistance(this._wx, this._wy, this._parent._wx, this._parent._wy) + this._imageRadius - this._parent._entityRadius);
            // DebugLog name + " - Radius: " + entity_Radius + " | Distance to Parent: " + getdistance(wx, wy, parent.wx, parent.wy)
            this._parent.UpdateParentEntityRadius();
        }
    },

    UpdateRootParentEntityRadius:function()
    {
        if (this._rootParent)
        {
            if (this._alpha !== 0)
                this._rootParent._entityRadius += Math.Max(0.0, Vector2.GetDistance(this._wx, this._wy, this._rootParent._wx, this._rootParent._wy) + this._imageRadius - this._rootParent._entityRadius);
            // DebugLog name + " - Radius: " + entity_Radius + " | Distance to Parent: " + getdistance(wx, wy, rootparent.wx, rootparent.wy)
        }
    },

    UpdateParentBoundingBox:function()
    {
        if (this._parent)
        {
            var parent = this._parent;
            parent._AABB_XMax += Math.Max(0.0, this._wx - parent._wx + this._AABB_XMax - parent._AABB_XMax);
            parent._AABB_YMax += Math.Max(0.0, this._wy - parent._wx + this._AABB_YMax - parent._AABB_YMax);
            parent._AABB_XMin += Math.Max(0.0, this._wx - parent._wx + this._AABB_XMin - parent._AABB_XMin);
            parent._AABB_YMin += Math.Max(0.0, this._wy - parent._wy + this._AABB_YMin - parent._AABB_YMin);
        }
    },

    AssignRootParent:function( e )
    {
        if (this._parent)
            this._parent.AssignRootParent(e);
        else
            e._rootParent = this;
    }


});
