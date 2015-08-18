
var AnimImage = Class({
 constructor: function() {
    this._width = 0;
    this._height = 0;
    this._maxRadius = 0;
    this._index = 0;
    this._frames = 1;
    this._imageSourceName = "";
  },

  LoadFromXML:function(xml)
  {
    var attr = xml.attributes;
    this._imageSourceName = attr.getNamedItem("URL").nodeValue;
    this._width = attr.getNamedItem("WIDTH").nodeValue;
    this._height = attr.getNamedItem("HEIGHT").nodeValue;
    this._frames = attr.getNamedItem("FRAMES").nodeValue;
    this._index = attr.getNamedItem("INDEX").nodeValue;
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

  SetFramesCount:function( frames )
  {
      this._frames = frames;
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

  SetFilename:function( filename )
  {
      this._filename = filename;
  },

  GetFilename:function()
  {
      return this._filename;
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
