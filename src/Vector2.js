
var Vector2 = Class({
 constructor: function(x,y) {
    this.Set(x,y);
  },

  Create:function( x, y )
  {
      return new Vector2(x,y);
  },

  Set:function( vx, vy )
  {
      this.x = vx;
      this.y = vy;
  },

  Move1:function( other )
  {
    return this.Move2(other.x,other.y);
  },

  Move2:function( vx, vy )
  {
      this.x += vx;
      this.y += vy;
  },

  Subtract:function( v )
  {
      return new Vector2(x - v.x, y - v.y);
  },

  Add:function( v )
  {
      return new Vector2(x + v.x, y + v.y);
  },

  Multiply:function( v )
  {
      return new Vector2(x * v.x, y * v.y);
  },

  Scale:function( scale )
  {
      return new Vector2(x * scale, y * scale);
  },

  Length:function()
  {
      return Math.sqrt(x * x + y * y);
  },

  Unit:function()
  {
      var length = Length();

      if (length > 0)
      {
        return new Vector2(v.x = x / length, v.y = y / length);
      }
      return new Vector2(0,0);
  },

  Normal:function()
  {
      return new Vector2(-y, x);
  },

  LeftNormal:function()
  {
      return new Vector2(y, -x);
  },

  Normalize:function()
  {
      var length = Length();
      if (length > 0)
      {
          this.x /= length;
          this.y /= length;
      }
  },

  DotProduct:function( v )
  {
      return x * v.x + y * v.y;
  },



});
