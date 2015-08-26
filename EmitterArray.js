
var EmitterArray = Class({
  constructor: function(min,max) {
    this._life = 0;
    this._compiled = false;
    this._min = min;
    this._max = max;
    this._changes = [];
    this._attributes = [];
  },

  GetLastFrame:function()
  {
      return this._changes.length - 1;
  },

  GetCompiled:function( frame )
  {
     var lastFrame = this.GetLastFrame();
     if (frame <= lastFrame)
     {
         return this._changes[frame];
     }

     return this._changes[lastFrame];
  },

  SetCompiled:function( frame, value )
  {
  //   if (frame >= 0 && frame < this._changes.length)
         this._changes[frame] = value;
  },

  GetLife:function()
  {
      return this._life;
  },

  SetLife:function( life )
  {
      this._life = life;
  },

  GetLastAtrribute:function()
  {
    return this._attributes[ this._attributes.length - 1 ];
  },

  Compile:function()
  {
      if (this._attributes.length > 0)
      {
          var lastec = this.GetLastAtrribute();
          var lookupFrequency = EffectsLibrary.GetLookupFrequency();
          var frame = Math.ceil(lastec.frame / lookupFrequency);

          this._changes = new Array(frame+1);
          frame = 0;
          var age = 0;
          while (age < lastec.frame)
          {
              this.SetCompiled(frame, this.Interpolate(age));
              ++frame;
              age = frame * lookupFrequency;
          }

          this.SetCompiled(frame, lastec.value);
      }
      else
      {
          this._changes = new Array(1);
      }

      this._compiled = true;
  },

  CompileOT:function(longestLife /* = this.GetLastAtrribute().frame */)
  {
      if (this._attributes.length > 0)
      {
          longestLife = GetDefaultArg(longestLife, this.GetLastAtrribute().frame);

          var lastec = this.GetLastAtrribute();
          var lookupFrequency = EffectsLibrary.GetLookupFrequencyOverTime();
          var frame = Math.ceil(longestLife / lookupFrequency);

          this._changes = new Array(frame+1);
          frame = 0;
          var age = 0;
          while (age < longestLife)
          {
              this.SetCompiled(frame, this.InterpolateOT(age, longestLife));
              ++frame;
              age = frame * lookupFrequency;
          }
          this.SetLife(longestLife);
          this.SetCompiled(frame, lastec.value);
      }
      else
      {
          this._changes = new Array(1);
      }
      this._compiled = true;
  },

  Add:function( frame, value )
  {
      this._compiled = false;

      var e = new AttributeNode();
      e.frame = frame;
      e.value = value;
      this._attributes.push(e);
      return e;
  },

  Get:function( frame, bezier /*= true*/ )
  {
      if (this._compiled)
          return this.GetCompiled(frame);
      else
          return this.Interpolate(frame, GetDefaultArg(bezier,true));
  },

  GetBezierValue:function( lastec, a, t, yMin, yMax )
  {
      if (a.isCurve)
      {
          var p0x = lastec.frame;
          var p0y = lastec.value;

          if (lastec.isCurve)
          {
              var p1x = lastec.c1x;
              var p1y = lastec.c1y;
              var p2x = a.c0x;
              var p2y = a.c0y;
              var p3x = a.frame;
              var p3y = a.value;

              return this.GetCubicBezier(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y, t, yMin, yMax).y;
          }
          else
          {
              var p1x = a.c0x;
              var p1y = a.c0y;
              var p2x = a.frame;
              var p2y = a.value;

              return this.GetQuadBezier(p0x, p0y, p1x, p1y, p2x, p2y, t, yMin, yMax).y;
          }
      }
      else if (lastec.isCurve)
      {
          var p0x = lastec.frame;
          var p0y = lastec.value;
          var p1x = lastec.c1x;
          var p1y = lastec.c1y;
          var p2x = a.frame;
          var p2y = a.value;

          return this.GetQuadBezier(p0x, p0y, p1x, p1y, p2x, p2y, t, yMin, yMax).y;
      }
      else
      {
          return 0;
      }
  },

  GetQuadBezier:function( p0x,  p0y,  p1x,  p1y,  p2x,  p2y,  t,  yMin,  yMax, clamp /*= true*/ )
  {
      var x = (1 - t) * (1 - t) * p0x + 2 * t * (1 - t) * p1x + t * t * p2x;
      var y = (1 - t) * (1 - t) * p0y + 2 * t * (1 - t) * p1y + t * t * p2y;

      if (x < p0x) x = p0x;
      if (x > p2x) x = p2x;

      if (GetDefaultArg(clamp,true))
      {
          if (y < yMin) y = yMin;
          if (y > yMax) y = yMax;
      }
      return {x:x,y:y};
  },

  GetCubicBezier:function( p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y, t, yMin, yMax, clamp /*= true*/ )
  {
      var x = (1 - t) * (1 - t) * (1 - t) * p0x + 3 * t * (1 - t) * (1 - t) * p1x + 3 * t * t * (1 - t) * p2x + t * t * t * p3x;
      var y = (1 - t) * (1 - t) * (1 - t) * p0y + 3 * t * (1 - t) * (1 - t) * p1y + 3 * t * t * (1 - t) * p2y + t * t * t * p3y;

      if (x < p0x) x = p0x;
      if (x > p3x) x = p3x;

      if (GetDefaultArg(clamp,true))
      {
          if (y < yMin) y = yMin;
          if (y > yMax) y = yMax;
      }

      return {x:x,y:y};
  },

  Interpolate:function( frame )
  {
      return this.InterpolateOT(frame, 1.0);
  },

  InterpolateOT:function( age, lifetime, bezier /*= true*/ )
  {
      var lasty = 0;
      var lastf = 0;
      var lastec = null;
      bezier = GetDefaultArg(bezier,true);

      for (var i=0;i<this._attributes.length;i++)
      {
          var it = this._attributes[i];
          var frame = it.frame * lifetime;
          if (age < frame)
          {
              var p = (age - lastf) / (frame - lastf);
              if (bezier)
              {
                  var bezierValue = this.GetBezierValue(lastec, it, p, this._min, this._max);
                  if (bezierValue !== 0)
                  {
                      return bezierValue;
                  }
              }
              return lasty - p * (lasty - it.value);
          }
          lasty = it.value;
          lastf = frame/* - 1*/;
          if (bezier) lastec = it;
      }
      return lasty;
  },

  GetOT:function( age, lifetime )
  {
      var frame = 0;
      if (lifetime > 0)
      {
          frame = age / lifetime * this._life / EffectsLibrary.GetLookupFrequencyOverTime();
      }
      return this.Get(frame);
  },

  GetAttributesCount:function()
  {
      return this._attributes.length;
  },

  GetMaxValue:function()
  {
      var max = 0;
      for (var i=0;i<this._attributes.length;i++)
      {
          var val = this._attributes[i].value;
          if (val > max)
              max = val;
      }

      return max;
  }


});
