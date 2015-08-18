

var ParticleManager = Class({
  $const: {
    c_particleLimit: 5000
  },

  constructor: function(particles /*= c_particleLimit*/, layers /*= 1*/) {

    particles = GetDefaultArg(particles,ParticleManager.c_particleLimit);
    layers = GetDefaultArg(layers,1);

    this._effectLayers = layers;

    this._originX = 0;
    this._originY = 0;
    this._originZ = 1.0;
    this._oldOriginX = 0;
    this._oldOriginY = 0;
    this._oldOriginZ = 1.0;

    this._angle= 0;
    this._oldAngle= 0;

    this._vpW = 0;
    this._vpH = 0;
    this._vpX = 0;
    this._vpY = 0;
    this._centerX = 0;
    this._centerY = 0;

    this._tv = 0;
    this._tx = 0;
    this._ty = 0;
    this._tz = 0;
    this._px = 0;
    this._py = 0;

    this._angleTweened = 0;
    this._globalAmountScale = 1.0;

    this._camtx = 0;
    this._camty = 0;
    this._camtz = 0;

    this._spawningAllowed = true;
    this._testCount = 0;

    this._paused = false;

    this._currentTime = 0;
    this._currentTick = 0;
    this._idleTimeLimit = 100;

    this._renderCount = 0;
    this._currentTween = 0;

    this._effectLayers = 0;
    this._inUseCount= 0;

    this._inUse = [];
    this._effects = [];

    for (var el = 0; el < layers; ++el)
    {
        this._inUse[el] = [];
    }

    this._unused = [];
    for (var c = 0; c < particles; ++c)
    {
        var p = new Particle();
        p.SetOKtoRender(false);
        this._unused.push(p);
    }
  },

  Update:function()
  {
      if (!this._paused)
      {
          this._currentTime += EffectsLibrary.GetUpdateTime();
          this._currentTick++;
          //TLFXLOG(PARTICLES, ("tick: %d time: %f", this._currentTick, this.GetCurrentTime()));
          for (var i = 0; i < this._effectLayers; i++)
          {
            var list = this._effects[i];
            for (var j = 0; j < list.length; j++)
            {
              if (!list[j].Update())
              {
                list.splice(j, 1);
                j--;
              }
            }
          }

          this._oldOriginX = this._originX;
          this._oldOriginY = this._originY;
          this._oldOriginZ = this._originZ;
      }
  },

  GrabParticle: function( effect, pool, layer /*= 0*/ )
  {
    layer = GetDefaultArg(layer,0);
    if (!_unused.empty())
    {
       var p = this._unused.pop();

       p.SetLayer(layer);
       p.SetGroupParticles(pool);

       if (pool)
           effect.AddInUse(layer, p);
       else
           this._inUse[effect.GetEffectLayer()][layer].push(p);   // CHECK

       this._inUseCount++;

       return p;
    }

    return null;
  },

  ReleaseParticle : function( p )
  {
      this._inUseCount--;
      this._unused.push(p);
      if (!p.IsGroupParticles())
      {
          var pList = this._inUse[p.GetEffectLayer()][p.GetLayer()];
          RemoveFromList(pList,p);
      }
  },

  DrawParticles : function( tween /*= 1.0*/, layer /*= -1*/ )
  {
    tween = GetDefaultArg(tween,1.0);
    layer = GetDefaultArg(layer,-1);

    // tween origin
    this._currentTween = tween;
    this._camtx = -TweenValues(this._oldOriginX, this._originX, tween);
    this._camty = -TweenValues(this._oldOriginY, this._originY, tween);
    this._camtz =  TweenValues(this._oldOriginZ, this._originZ, tween);

    if (this._angle !== 0)
    {
        this._angleTweened = TweenValues(_oldAngle, _angle, tween);
        var a = this._angleTweened / 180.0 * M_PI;
      //  this._matrix.Set(cos(a), sin(a), -sin(a), cos(a));  // CHECK
    }

    var layers = 0;
    var startLayer = 0;
    if (layer == -1 || layer >= _effectLayers)
    {
        layers = this._effectLayers - 1;
    }
    else
    {
        layers = layer;
        startLayer = layer;
    }

    for (var el = startLayer; el <= layers; ++el)
    {
        for (var i = 0; i < 10; ++i)  // wtf
        {
            var plist = this._inUse[el][i];
            for (var j = 0; j < plist.length; j++)
            {
                this.DrawParticle(plist[j]);
            }
        }
    }
    this.DrawEffects();
  },

  DrawBoundingBoxes:function()
  {
      for (var el = 0; el < this._effectLayers; ++el)
      {
          var list = this._effects[el];
          for (var j = 0; j < list.length; j++)
              list[j].DrawBoundingBox();
      }
  },

  SetOrigin : function( x, y, z /*= 1.0*/ )
  {
      this.SetOriginX(x);
      this.SetOriginY(y);
      this.SetOriginZ(GetDefaultArg(z,1.0));
  },

  SetOriginX:function( x )
  {
      this._oldOriginX = this._originX;
      this._originX = x;
  },

  SetOriginY:function( y )
  {
      this._oldOriginY = this._originY;
      this._originY = y;
  },

  SetOriginZ:function( z )
  {
      this._oldOriginZ = this._originZ;
      this._originZ = z;
  },

  SetAngle:function( angle )
  {
      this._oldAngle = this._angle;
      this._angle = angle;
  },

  SetScreenSize:function( w, h )
  {
      this._vpW = w;
      this._vpH = h;
      this._centerX = this._vpW / 2;
      this._centerY = this._vpH / 2;
  },

  SetScreenPosition:function( x, y )
  {
      this._vpX = x;
      this._vpY = y;
  },

  SetIdleTimeLimit:function( limit ){ this._idleTimeLimit = limit; },

  GetOriginX:function(){ return this._originX; },
  GetOriginY:function(){ return this._originY; },
  GetOriginZ:function(){ return this._originZ; },

  GetGlobalAmountScale:function(){ return this._globalAmountScale; },
  SetGlobalAmountScale:function(scale){ this._globalAmountScale = scale; },

  GetParticlesInUse:function(){ return this._inUseCount; },
  GetParticlesUnused:function(){ return this._unused.length; },

  AddPreLoadedEffect:function( e, frames, layer /*= 0*/ )
  {
      layer = GetDefaultArg(layer,0);
      if (layer >= this._effectLayers)
          layer = 0;

      var tempTime = this._currentTime;
      this._currentTime -= frames * EffectsLibrary.GetUpdateTime();
      e.ChangeDoB(this._currentTime);

      for (var i = 0; i < frames; ++i)
      {
          this._currentTime = (frames + 1) * EffectsLibrary.GetUpdateTime();
          e.Update();
          if (e.IsDestroyed())
              RemoveEffect(e);
      }
      this._currentTime = tempTime;
      e.SetEffectLayer(layer);
      this._effects[layer].push(e);
  },

  AddEffect:function( e, layer /*= 0*/ )
  {
      if (layer >= _effectLayers)
          layer = 0;
      e.SetEffectLayer(layer);
      _effects[layer].insert(e);
  },

  RemoveEffect:function( e )
  {
      RemoveFromList(this._effects[e.GetEffectLayer()],e);
  },

  ClearInUse:function()
  {
     for (var el = 0; el < this._effectLayers; ++el)
     {
         for (var i = 0; i < 10; ++i)
         {
             var plist = this._inUse[el][i];

             for (var j = 0; j < plist.length; j++)
             {
               var p = plist[j];
               this._unused.push(p);
               this._inUseCount--;
               p.GetEmitter().GetParentEffect().RemoveInUse(p.GetLayer(), p);
               p.Reset();
             }

             this._inUse[el][i] = [];
         }
     }
  },

  Destroy:function()
  {
      this.ClearAll();
      this.ClearInUse();
  },

  ClearAll:function()
  {
      for (var el = 0; el < this._effectLayers; ++el)
      {
          var elist = this._effects[el];
          for (var j = 0; j < elist.length; j++)
          {
            elist[j].Destroy();
          }
          this._effects[el] = [];
      }
  },

  ClearLayer:function( layer )
  {
    var list = this._effects[layer];

    for (var i = 0; i < list.length; i++)
      list[i].Destroy();

     this._effects[layer] = [];
  },

  ReleaseSingleParticles:function()
  {
    for (var i = 0; i < this._inUse.length; i++)
    {
      var list = this._inUse[i];
      for (var j = 0; j < list.length; j++)
      {
        for (var k = 0; k < list[j].length; k++)
          list[j][k].SetReleaseSingleParticles(true);
      }
    }
  },

  TogglePause:function()
  {
     this._paused = !this._paused;
  },

   TweenValues:function( oldValue, value, tween )
   {
       return oldValue + (value - oldValue) * tween;
   },

   DrawEffects:function()
   {
     for (var el = 0; el < this._effects.length; ++el)
     {
       var elist = this._effects[el];
       for (var j = 0; j < elist.length; j++)
          DrawEffect(elist[j]);
     }
   },

  DrawEffect:function( e )
  {
      for (var i = 0; i < 10; ++i)
      {
          // particle
          var plist = e.GetParticles(i);
          for (var j = 0; j < plist.length; j++)
          {
              DrawParticle(plist[j]);
              // effect
              var subeffects = plist[j].GetChildren();
              for (var k = 0; k < subeffects.length; k++)
                DrawEffect(subeffects[k]);
          }
      }
  },

  DrawParticle:function( p )
   {
       if (p.GetAge() !== 0 || p.GetEmitter().IsSingleParticle())
       {
           var _px = TweenValues(p.GetOldWX(), p.GetWX(), this._currentTween);
           var _py = TweenValues(p.GetOldWY(), p.GetWY(), this._currentTween);

           if (this._angle !== 0)
           {
              // Vector2 rotVec = _matrix.TransformVector(Vector2(this._px, this._py));
               _px = (rotVec.x * this._camtz) + this._centerX + (this._camtz * this._camtx);
               _py = (rotVec.y * this._camtz) + this._centerY + (this._camtz * this._camty);
           }
           else
           {
               _px = (_px * this._camtz) + this._centerX + (this._camtz * this._camtx);
               _py = (_py * this._camtz) + this._centerY + (this._camtz * this._camty);
           }

           if (_px > _vpX - p.GetImageDiameter() && _px < _vpX + _vpW + p.GetImageDiameter() && _py > _vpY - p.GetImageDiameter() && _py < _vpY + _vpH + p.GetImageDiameter())
           {
               if (p.GetAvatar())
               {
                   var sprite;
                   var x, y;

                   if (p.GetEmitter().IsHandleCenter())
                   {
                       if (p.GetAvatar().GetFramesCount() == 1)
                       {
                           //MidHandleImage(p.GetAvatar()->GetImage());
                           sprite = p.GetAvatar();
                           x = sprite.GetWidth() / 2.0;
                           y = sprite.GetHeight() / 2.0;
                       }
                       else
                       {
                           //SetImageHandle(p.GetAvatar()->GetImage(), p.GetAvatar()->GetWidth() / 2.f, p.GetAvatar()->GetHeight() / 2.f);
                           sprite = p.GetAvatar();
                           x = sprite.GetWidth() / 2.0;
                           y = sprite.GetHeight() / 2.0;
                       }
                   }
                   else
                   {
                       //SetImageHandle(p.GetAvatar()->GetImage(), p.GetHandleX(), p.GetHandleY());
                       sprite = p.GetAvatar();
                       x = p.GetHandleX();
                       y = p.GetHandleY();
                   }

                   //SetBlend(p.GetEmitter()->GetBlendMode());
                   var blend = p.GetEmitter().GetBlendMode();

                   var rotation;

                   _tv = TweenValues(p.GetOldAngle(), p.GetAngle(), _currentTween);
                   if (p.GetEmitter().IsAngleRelative())
                   {
                       if (fabsf(p.GetOldRelativeAngle() - p.GetRelativeAngle()) > 180)
                           _tx = TweenValues(p.GetOldRelativeAngle() - 360, p.GetRelativeAngle(), _currentTween);
                       else
                           _tx = TweenValues(p.GetOldRelativeAngle(), p.GetRelativeAngle(), _currentTween);
                       //SetRotation(_tv + _tx + _angleTweened);
                       rotation = _tv + _tx + _angleTweened;
                   }
                   else
                   {
                       //SetRotation(_tv + _angleTweened);
                       rotation = _tv + _angleTweened;
                   }

                   var scaleX, scaleY;

                   _tx = TweenValues(p.GetOldScaleX(), p.GetScaleX(), _currentTween);
                   _ty = TweenValues(p.GetOldScaleY(), p.GetScaleY(), _currentTween);
                   _tz = TweenValues(p.GetOldZ(), p.GetZ(), _currentTween);
                   if (_tz !== 1.0)
                   {
                       //SetScale(_tx * _tz * _camtz, _ty * _tz * _camtz);
                       scaleX = this._tx * this._tz * this._camtz;
                       scaleY = this._ty * this._tz * this._camtz;
                   }
                   else
                   {
                       //SetScale(_tx * _camtz, _ty * _camtz);
                       scaleX = this._tx * this._camtz;
                       scaleY = this._ty * this._camtz;
                   }

                   var r, g, b;
                   var a;
                   //SetAlpha(p.GetAlpha());
                   //SetColor(p.GetRed(), p.GetGreen(), p.GetBlue());
                   a = p.GetEntityAlpha();
                   r = p.GetRed();
                   g = p.GetGreen();
                   b = p.GetBlue();

                   if (p.IsAnimating())
                   {
                       _tv = TweenValues(p.GetOldCurrentFrame(), p.GetCurrentFrame(), _currentTween);
                       if (_tv < 0)
                       {
                           this._tv = p.GetAvatar().GetFramesCount() + (fmod(this._tv, p.GetAvatar().GetFramesCount()));
                           if (_tv == p.GetAvatar().GetFramesCount())
                               _tv = 0;
                       }
                       else
                       {
                           this._tv = fmodf(_tv, p.GetAvatar().GetFramesCount());
                       }
                   }
                   else
                   {
                       this._tv = p.GetCurrentFrame();
                   }
                   DrawSprite(sprite, this._px, this._py, this._tv, x, y, rotation, scaleX, scaleY, r, g, b, a, blend === Blend.BMLightBlend);
                   // ++rendercount
               }
           }
       }
   },

  GetIdleTimeLimit:function(){ return this._idleTimeLimit; },
  IsSpawningAllowed:function(){ return this._spawningAllowed; },

  GetCurrentTime: function()
  {
     return this._currentTick * EffectsLibrary.GetUpdateTime();
  }
});
