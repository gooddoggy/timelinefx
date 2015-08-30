
var AnimImage = Class({
 constructor: function() {
   // width/height are *frame* width/height
    this._width = 0;
    this._height = 0;
    this._maxRadius = 0;
    this._index = 0;
    this._frames = 1;
    this._imageSourceName = "";
    this._sqrtFrames = 1;
  },

  LoadFromXML:function(xml)
  {
    var attr = xml.attributes;
    this._imageSourceName = attr.getNamedItem("URL").nodeValue;
    this._width = attr.getNamedItem("WIDTH").nodeValue;
    this._height = attr.getNamedItem("HEIGHT").nodeValue;
    this._frames = attr.getNamedItem("FRAMES").nodeValue;
    this._index = attr.getNamedItem("INDEX").nodeValue;
    this._sqrtFrames = Math.sqrt(this._frames);

  //  console.log(this);
  },

  SetMaxRadius:function( radius )
  {
      this._maxRadius = radius;
  },

  GetMaxRadius:function()
  {
      return this._maxRadius;
  },

  SetWidth:function( width )
  {
      this._width = width;
  },

  GetWidth:function()
  {
      return this._width;
  },

  SetHeight:function( height )
  {
      this._height = height;
  },

  GetHeight:function()
  {
      return this._height;
  },

  GetFramesCount:function()
  {
      return this._frames;
  },

  SetIndex:function( index )
  {
      this._index = index;
  },

  GetIndex:function()
  {
      return this._index;
  },

  GetFrameX:function(frameIndex)
  {
    return this._width * (frameIndex % this._sqrtFrames);
  },

  GetFrameY:function(frameIndex)
  {
    return this._height * Math.floor(frameIndex / this._sqrtFrames);
  },

  SetFilename:function( filename )
  {
      this._imageSourceName = filename;
  },

  GetFilename:function()
  {
      return this._imageSourceName;
  },

  SetName:function( name )
  {
      this._name = name;
  },

  GetName:function()
  {
      return this._name;
  }

});
