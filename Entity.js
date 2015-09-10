var Blend = {
  BMAlphaBlend: 3,
  BMLightBlend: 4
    // check loading values are one of these
};

var g_defaultEntity = {
  _x: 0,
  _y: 0,
  _name: "",

  _oldX: 0,
  _oldY: 0,
  _wx: 0,
  _wy: 0,
  _oldWX: 0,
  _oldWY: 0,
  _z: 1.0,
  _oldZ: 1.0,
  _relative: true,

  _r: 0,
  _g: 0,
  _b: 0,
  _red: 255,
  _green: 255,
  _blue: 255,
  _oldRed: 255,
  _oldGreen: 255,
  _oldBlue: 255,

  _width: 0,
  _height: 0,
  _weight: 0,
  _gravity: 0,
  _baseWeight: 0,
  _oldWeight: 0,
  _scaleX: 1.0,
  _scaleY: 1.0,
  _sizeX: 1.0,
  _sizeY: 1.0,
  _oldScaleX: 1.0,
  _oldScaleY: 1.0,

  _speed: 0,
  _baseSpeed: 0,
  _oldSpeed: 0,
  _updateSpeed: true,

  _direction: 0,
  _directionLocked: false,
  _angle: 0,
  _oldAngle: 0,
  _relativeAngle: 0,
  _oldRelativeAngle: 0,

  _avatar: null,
  _frameOffset: 0,
  _framerate: 1.0,
  _currentFrame: 0,
  _oldCurrentFrame: 0,
  _animating: false,
  _animateOnce: false,
  _animAction: 0,
  _handleX: 0,
  _handleY: 0,
  _autoCenter: true,
  _okToRender: true,

  _dob: 0,
  _age: 0,
  _rptAgeA: 0,
  _rptAgeC: 0,
  _aCycles: 0,
  _cCycles: 0,
  _oldAge: 0,
  _dead: 0,
  _destroyed: false,
  _lifeTime: 0,
  _timediff: 0,

  _AABB_Calculate: true,
  _collisionXMin: 0,
  _collisionYMin: 0,
  _collisionXMax: 0,
  _collisionYMax: 0,
  _AABB_XMin: 0,
  _AABB_YMin: 0,
  _AABB_XMax: 0,
  _AABB_YMax: 0,
  _AABB_MaxWidth: 0,
  _AABB_MaxHeight: 0,
  _AABB_MinWidth: 0,
  _AABB_MinHeight: 0,
  _radiusCalculate: true,
  _imageRadius: 0,
  _entityRadius: 0,
  _imageDiameter: 0,

  _parent: null,
  _rootParent: null,

  _childrenOwner: true,

  _blendMode: Blend.BMAlphaBlend,

  _alpha: 1.0,
  _oldAlpha: 0,

  _runChildren: false,
  _pixelsPerSecond: 0
};

var Entity = Class(
{

  constructor: function( other )
  {

    if ( other )
    {
      for ( var key in g_defaultEntity )
        this[ key ] = other[ key ];
    }
    else
    {
      for ( var key in g_defaultEntity )
        this[ key ] = g_defaultEntity[ key ];
    }

    this._matrix = new Matrix2();
    this._speedVec = new Vector2();

    this._children = [];
  },

  IsDestroyed: function()
  {
    return this._destroyed;
  },
  GetName: function()
  {
    return this._name;
  },
  SetName: function( name )
  {
    this._name = name;
  },

  SetX: function( x )
  {
    this._x = x;
  },
  SetY: function( y )
  {
    this._y = y;
  },
  SetZ: function( z )
  {
    this._z = z;
  },

  GetX: function()
  {
    return this._x;
  },
  GetY: function()
  {
    return this._y;
  },
  GetZ: function()
  {
    return this._z;
  },

  Capture: function()
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

  CaptureAll: function()
  {
    this.Capture();
    for ( var i = 0; i < this._children.length; i++ )
    {
      this._children[ i ].Capture();
    }
  },

  SetOKtoRender: function( ok )
  {
    this._okToRender = ok;
  },

  Destroy: function()
  {
    this._parent = null;
    this._avatar = null;
    this._rootParent = null;
    this.ClearChildren();
    this._destroyed = true;
  },

  RemoveChild: function( e )
  {
    RemoveFromList( this._children, e );
    e._parent = null;
  },

  ClearChildren: function()
  {
    if ( this._children )
    {
      for ( var i = 0; i < this._children.length; i++ )
      {
        this._children[ i ].Destroy();
      }
    }
    this._children = [];
  },

  KillChildren: function()
  {
    for ( var i = 0; i < this._children.length; i++ )
    {
      this._children[ i ].KillChildren();
      this._children[ i ]._dead = true;
    }
  },

  GetChildren: function()
  {
    return this._children;
  },

  Update: function()
  {
    var currentUpdateTime = EffectsLibrary.GetCurrentUpdateTime();

    // Update speed in pixels per second
    if ( this._updateSpeed && this._speed )
    {
      this._pixelsPerSecond = this._speed / currentUpdateTime;
      this._speedVec.x = Math.sin( this._direction / 180.0 * M_PI ) * this._pixelsPerSecond;
      this._speedVec.y = Math.cos( this._direction / 180.0 * M_PI ) * this._pixelsPerSecond;

      this._x += this._speedVec.x * this._z;
      this._y -= this._speedVec.y * this._z;
    }

    // update the gravity
    if ( this._weight !== 0 )
    {
      this._gravity += this._weight / currentUpdateTime;
      this._y += ( this._gravity / currentUpdateTime ) * this._z;
    }

    // set the matrix if it is relative to the parent
    if ( this._relative )
    {
      var radians = this._angle / 180 * M_PI;
      this._matrix.Set( Math.cos( radians ), Math.sin( radians ), -Math.sin( radians ), Math.cos( radians ) );
    }
    // calculate where the entity is in the world
    if ( this._parent && this._relative )
    {
      this._z = this._parent._z;
      this._matrix.TransformSelf( this._parent._matrix );
      var rotVec = this._parent._matrix.TransformVector( this._x, this._y );

      this._wx = this._parent._wx + rotVec.x * this._z;
      this._wy = this._parent._wy + rotVec.y * this._z;

      this._relativeAngle = this._parent._relativeAngle + this._angle;
    }
    else
    {
      // If parent setz(parent.z)
      this._wx = this._x;
      this._wy = this._y;
    }

    if ( !this._parent )
      this._relativeAngle = this._angle;

    // update animation frame
    if ( this._avatar && this._animating )
    {
      this._currentFrame += this._framerate / currentUpdateTime;
      if ( this._animateOnce )
      {
        if ( this._currentFrame > this._avatar.GetFramesCount() - 1 )
        {
          this._currentFrame = ( this._avatar.GetFramesCount() - 1 );
        }
        else if ( this._currentFrame <= 0 )
        {
          this._currentFrame = 0;
        }
      }
    }

    // update the Axis Aligned Bounding Box
    if ( this._AABB_Calculate )
      this.UpdateBoundingBox();

    // update the radius of influence
    if ( this._radiusCalculate )
      this.UpdateEntityRadius();

    // update the children
    this.UpdateChildren();

    return true;
  },

  UpdateChildren: function()
  {
    for ( var i = 0; i < this._children.length; i++ )
    {
      if ( !this._children[ i ].Update() )
      {
        this._children.splice( i, 1 );
        i--;
      }
    }
  },

  MiniUpdate: function()
  {
    var radians = this._angle / 180.0 * M_PI;

  if(isNaN(this._angle))
  {
    console.log("MiniUpdate NaN");
  }

    this._matrix.Set( Math.cos( radians ), Math.sin( radians ), -Math.sin( radians ), Math.cos( radians ) );

    if ( this._parent && this._relative )
    {
      this._z = this._parent._z;
      this._matrix.TransformSelf( this._parent._matrix );
      var rotVec = this._parent._matrix.TransformVector( this._x, this._y );

      this._wx = this._parent._wx + rotVec.x * this._z;
      this._wy = this._parent._wy + rotVec.y * this._z;
    }
    else
    {
      if ( this._parent )
        this._z = this._parent._z;
      this._wx = this._x;
      this._wy = this._y;
    }
  },


  GetChildCount: function()
  {
    return this._children.length;
  },

  UpdateBoundingBox: function()
  {
    this._collisionXMin = this._AABB_MinWidth * this._scaleX * this._z;
    this._collisionYMin = this._AABB_MinHeight * this._scaleY * this._z;
    this._collisionXMax = this._AABB_MaxWidth * this._scaleX * this._z;
    this._collisionYMax = this._AABB_MaxHeight * this._scaleY * this._z;

    this._AABB_XMin = this._collisionXMin;
    this._AABB_YMin = this._collisionYMin;
    this._AABB_XMax = this._collisionXMax;
    this._AABB_YMax = this._collisionYMax;

    if ( this._children.length === 0 )
      this.UpdateParentBoundingBox();
  },

  UpdateEntityRadius: function()
  {
    if ( this._autoCenter )
    {
      if ( this._avatar )
      {
        var aMaxRadius = this._avatar.GetMaxRadius();
        var aWidth = this._avatar.GetWidth();
        var aHeight = this._avatar.GetHeight();

        if ( aMaxRadius !== 0 )
          this._imageRadius = Math.max( aMaxRadius * this._scaleX * this._z, aMaxRadius * this._scaleY * this._z );
        else
          this._imageRadius = GetDistance2D( aWidth / 2.0 * this._scaleX * this._z, aHeight / 2.0 * this._scaleY * this._z, aWidth * this._scaleX * this._z, aHeight * this._scaleY * this._z );
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

      if ( aMaxRadius !== 0 )
        this._imageRadius = GetDistance2D( this._handleX * this._scaleX * this._z, this._handleY * this._scaleY * this._z, aWidth / 2.0 * this._scaleX * this._z, aHeight / 2.0 * this._scaleY * this._z ) + Math.max( aMaxRadius * this._scaleX * this._z, aMaxRadius * this._scaleY * this._z );
      else
        this._imageRadius = GetDistance2D( this._handleX * this._scaleX * this._z, this._handleY * this._scaleY * this._z, aWidth * this._scaleX * this._z, aHeight * this._scaleY * this._z );
    }

    this._entityRadius = this._imageRadius;
    this._imageDiameter = this._imageRadius * 2.0;

    if ( this._rootParent )
      this.UpdateRootParentEntityRadius();
  },

  UpdateParentEntityRadius: function()
  {
    if ( this._parent )
    {
      if ( this._children.length > 0 )
        this._parent._entityRadius += Math.max( 0.0, GetDistance2D( this._wx, this._wy, this._parent._wx, this._parent._wy ) + this._entityRadius - this._parent._entityRadius );
      else
        this._parent._entityRadius += Math.max( 0.0, GetDistance2D( this._wx, this._wy, this._parent._wx, this._parent._wy ) + this._imageRadius - this._parent._entityRadius );
      // DebugLog name + " - Radius: " + entity_Radius + " | Distance to Parent: " + getdistance(wx, wy, parent.wx, parent.wy)
      this._parent.UpdateParentEntityRadius();
    }
  },

  UpdateRootParentEntityRadius: function()
  {
    if ( this._rootParent )
    {
      if ( this._alpha !== 0 )
        this._rootParent._entityRadius += Math.max( 0.0, GetDistance2D( this._wx, this._wy, this._rootParent._wx, this._rootParent._wy ) + this._imageRadius - this._rootParent._entityRadius );
      // DebugLog name + " - Radius: " + entity_Radius + " | Distance to Parent: " + getdistance(wx, wy, rootparent.wx, rootparent.wy)
    }
  },

  UpdateParentBoundingBox: function()
  {
    if ( this._parent )
    {
      var parent = this._parent;
      parent._AABB_XMax += Math.max( 0.0, this._wx - parent._wx + this._AABB_XMax - parent._AABB_XMax );
      parent._AABB_YMax += Math.max( 0.0, this._wy - parent._wx + this._AABB_YMax - parent._AABB_YMax );
      parent._AABB_XMin += Math.max( 0.0, this._wx - parent._wx + this._AABB_XMin - parent._AABB_XMin );
      parent._AABB_YMin += Math.max( 0.0, this._wy - parent._wy + this._AABB_YMin - parent._AABB_YMin );
    }
  },

  AssignRootParent: function( e )
  {
    if ( this._parent )
      this._parent.AssignRootParent( e );
    else
      e._rootParent = this;
  },

  SetHandleX: function( x )
  {
    this._handleX = x;
  },

  SetHandleY: function( y )
  {
    this._handleY = y;
  },

  SetParent: function( e )
  {
    e.AddChild( this );
  },

  SetRelative: function( value )
  {
    this._relative = value;
  },

  SetEntityScale: function( sx, sy )
  {
    this._scaleX = sx;
    this._scaleY = sy;
  },

  SetSpeed: function( speed )
  {
    this._speed = speed;
  },

  GetSpeed: function()
  {
    return this._speed;
  },

  SetBlendMode: function( mode )
  {
    this._blendMode = mode;
  },

  GetCurrentFrame: function()
  {
    return this._currentFrame;
  },

  SetCurrentFrame: function( frame )
  {
    this._currentFrame = frame;
  },

  AddChild: function( e )
  {
    this._children.push( e );
    e._parent = this;
    e._radiusCalculate = this._radiusCalculate;
    e.AssignRootParent( e );
  },

  GetMatrix: function()
  {
    return this._matrix;
  },

  GetWX: function()
  {
    return this._wx;
  },

  GetWY: function()
  {
    return this._wy;
  },


  GetRelativeAngle: function()
  {
    return this._relativeAngle;
  },

  SetDoB: function( dob )
  {
    this._dob = dob;
  },

  GetOldCurrentFrame: function()
  {
    return this._oldCurrentFrame;
  },

  SetAvatar: function( avatar )
  {
    this._avatar = avatar;
    this._AABB_MaxWidth = this._avatar.GetWidth() * 0.5;
    this._AABB_MaxHeight = this._avatar.GetHeight() * 0.5;
    this._AABB_MinWidth = this._avatar.GetWidth() * -0.5;
    this._AABB_MinHeight = this._avatar.GetHeight() * -0.5;
  },

  SetAutocenter: function( value )
  {
    this._autoCenter = value;
  },

  GetLifeTime: function()
  {
    return this._lifeTime;
  },

  SetLifeTime: function( lifeTime )
  {
    this._lifeTime = lifeTime;
  },

  SetSpeedVecX: function( x )
  {
    this._speedVec.x = x;
  },

  SetSpeedVecY: function( y )
  {
    this._speedVec.y = y;
  },

  SetBaseSpeed: function( speed )
  {
    this._baseSpeed = speed;
  },

  GetBaseSpeed: function()
  {
    return this._baseSpeed;
  },

  SetWidth: function( width )
  {
    this._width = width;
  },

  GetWidth: function()
  {
    return this._width;
  },

  SetScaleX: function( scaleX )
  {
    this._scaleX = scaleX;
  },

  SetScaleY: function( scaleY )
  {
    this._scaleY = scaleY;
  },

  GetScaleX: function()
  {
    return this._scaleX;
  },

  GetScaleY: function()
  {
    return this._scaleY;
  },

  SetWidthHeightAABB: function( minWidth, minHeight, maxWidth, maxHeight )
  {
    this._AABB_MaxWidth = maxWidth;
    this._AABB_MaxHeight = maxHeight;
    this._AABB_MinWidth = minWidth;
    this._AABB_MinHeight = minHeight;
  },

  SetDirectionLocked: function( value )
  {


    this._directionLocked = value;
  },

  IsDirectionLocked: function()
  {
    return this._directionLocked;
  },

  GetEntityDirection: function()
  {
    return this._direction;
  },

  SetEntityDirection: function( direction )
  {
    if(isNaN(direction))
    {
      console.log("SetEntityDirection NaN");
    }

    this._direction = direction;
  },

  SetWeight: function( weight )
  {
    this._weight = weight;
  },

  GetWeight: function()
  {
    return this._weight;
  },

  SetBaseWeight: function( weight )
  {
    this._baseWeight = weight;
  },

  GetBaseWeight: function()
  {
    return this._weight;
  },


  GetRed: function()
  {
    return this._red;
  },

  SetRed: function( r )
  {
    this._red = r;
  },

  GetGreen: function()
  {
    return this._green;
  },

  SetGreen: function( g )
  {
    this._green = g;
  },

  GetBlue: function()
  {
    return this._blue;
  },

  SetBlue: function( b )
  {
    this._blue = b;
  },

  GetAge: function()
  {
    return this._age;
  },

  SetAge: function( age )
  {
    this._age = age;
  },

  SetEntityAlpha: function( alpha )
  {
    this._alpha = alpha;
  },

  GetOldWX: function()
  {
    return this._oldWX;
  },

  GetOldWY: function()
  {
    return this._oldWY;
  },

  GetImageDiameter: function()
  {
    return this._imageDiameter;
  },

  GetOldAngle: function()
  {
    return this._oldAngle;
  },

  GetOldRelativeAngle: function()
  {
    return this._oldRelativeAngle;
  },

  GetAvatar: function()
  {
    return this._avatar;
  },


  GetHandleX: function()
  {
    return this._handleX;
  },

  GetHandleY: function()
  {
    return this._handleY;
  },

  GetBlendMode: function()
  {
    return this._blendMode;
  },

  GetAngle: function()
  {
    return this._angle;
  },

  GetOldScaleX: function()
  {
    return this._oldScaleX;
  },

  GetOldScaleY: function()
  {
    return this._oldScaleY;
  },

  GetOldZ: function()
  {
    return this._oldZ;
  },

  SetEntityColor: function( r, g, b )
  {
    this._red = r;
    this._green = g;
    this._blue = b;
  },

  GetEntityAlpha: function()
  {
    return this._alpha;
  },

  GetImageRadius: function()
  {
    return this._imageRadius;
  },

  GetFramerate: function()
  {
    return this._framerate;
  },

  SetFramerate: function( framerate )
  {
    this._framerate = framerate;
  },

  IsAnimating: function()
  {
    return this._animating;
  },

  SetAnimating: function( value )
  {
    this._animating = value;
  },
  IsRelative: function()
  {
    return this._relative;
  },

  SetWX: function( wx )
  {
    this._wx = wx;
  },

  SetWY: function( wy )
  {
    this._wy = wy;
  },

  SetAngle: function( degrees )
  {
    if(isNaN(degrees))
    {
      console.log("SetAngle NaN");
    }

    this._angle = degrees;
  },

  SetHeight: function( height )
  {
    this._height = height;
  },

  GetHeight: function()
  {
    return this._height;
  },

  GetParent: function()
  {
    return this._parent;
  },

  Move: function( xamount, yamount )
  {
    this._x += xamount;
    this._y += yamount;
  },

} );
