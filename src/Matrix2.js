
var Matrix2 = Class({
  constructor: function() {
    this.Set(1,0,0,1);
  },

  Create:function( aa_ /*= 1.0*/, ab_ /*= 0*/, ba_ /*= 0*/, bb_ /*= 1.0*/ )
  {
      var m = new Matrix2();
      m.Set(aa_,ab_,ba_,bb_);
      return m;
  },

  Set:function( aa_ /*= 1.0*/, ab_ /*= 0*/, ba_ /*= 0*/, bb_ /*= 1.0*/ )
  {
      this.aa = GetDefaultArg(aa_,1);
      this.ab = GetDefaultArg(ab_,0);
      this.ba = GetDefaultArg(ba_,0);
      this.bb = GetDefaultArg(bb_,1);
  },

  Scale:function( s )
  {
      this.aa *= s;
      this.ab *= s;
      this.ba *= s;
      this.bb *= s;
  },
  Transpose:function( s )
  {
    var abt = this.ab;
    this.ab = this.ba;
    this.ba = abt;
  },

  TransformSelf:function( m )
  {
      var r_aa = this.aa * m.aa + this.ab * m.ba;
      var r_ab = this.aa * m.ab + this.ab * m.bb;
      var r_ba = this.ba * m.aa + this.bb * m.ba;
      var r_bb = this.ba * m.ab + this.bb * m.bb;

      this.Set(r_aa,r_ab,r_ba,r_bb);
  },

  TransformVector:function( x, y )
  {
      var tv = new Vector2();
      tv.x = x * this.aa + y * this.ba;
      tv.y = x * this.ab + y * this.bb;
      return tv;
  },

});
