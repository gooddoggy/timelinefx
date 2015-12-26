
var AnimImage = Class({
 constructor: function() {
   // width/height are *frame* width/height
    this._width = 0;
    this._height = 0;
    this._maxRadius = 0;
    this._index = 0;
    this._frames = 1;
    this._imageSourceName = "";
    this._horizCells = 1;
  },

  LoadFromXML:function(xml)
  {
    var attr = xml.attributes;
    this._imageSourceName = attr.getNamedItem("URL").nodeValue;
    this._width = attr.getNamedItem("WIDTH").nodeValue;
    this._height = attr.getNamedItem("HEIGHT").nodeValue;
    this._frames = attr.getNamedItem("FRAMES").nodeValue;
    this._index = attr.getNamedItem("INDEX").nodeValue;

    // Note that we don't actually know this until we load the image, as we don't have the total image dimensions
    // i.e. we have the size of each cell/frame, and the number of cells, but we don't know the arrangement (e.g. 2x4 or 1x8)
    // Must be set once the image is loaded if we have sprite sheets with different horizontal/vertical number of cells/frames
    this._horizCells = Math.sqrt(this._frames);
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
    return this._width * (frameIndex % this._horizCells);
  },

  GetFrameY:function(frameIndex)
  {
    return this._height * Math.floor(frameIndex / this._horizCells);
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
