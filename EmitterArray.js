
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
     if (frame >= 0 && frame < this._changes.size())
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

          this._changes.resize(frame+1);
          frame = 0;
          var age = 0;
          while (age < lastec.frame)
          {
              this.SetCompiled(frame, Interpolate(age));
              ++frame;
              age = frame * lookupFrequency;
          }

          this.SetCompiled(frame, lastec.value);
      }
      else
      {
          this._changes.resize(1);
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

          this._changes.resize(frame+1);
          frame = 0;
          var age = 0;
          while (age < longestLife)
          {
              this.SetCompiled(frame, InterpolateOT(age, longestLife));
              ++frame;
              age = frame * lookupFrequency;
          }
          SetLife(longestLife);
          this.this.SetCompiled(frame, lastec.value);
      }
      else
      {
          this._changes.resize(1);
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

});
