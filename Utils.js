
function GetDefaultArg(arg, def) {
 return (typeof arg == 'undefined' ? def : arg);
}

function RemoveFromList(array,elem)
{
  var index = array.indexOf(elem);
  if (index > -1) {
    array.splice(index, 1);
  }
}

function TLFXLOG(mask,msg){}

var M_PI = 3.14159265358979323846;

function stripFilePath(filename)
{
  var index = Math.max(filename.lastIndexOf('/'),filename.lastIndexOf('\\'));
  return filename.substring(index + 1);
}


var XMLHelper = Class({
 constructor: function(xml) {
    this.m_xml = xml;
    this.m_attr = xml.attributes;
  },
  GetAttr:function(attrName)
  {
    return this.m_attr.getNamedItem(attrName).nodeValue;
  }
});

function GetNodeAttrValue(elem,attrName)
{
  return elem.attributes.getNamedItem(attrName).nodeValue;
}

function ForEachInXMLNodeList(nodelist,fn)
{
  for(var i=0;i<nodelist.length;i++)
  {
    fn(nodelist[i]);
  }
}

function GetXMLAttrSafe(xmlNode,attrName,defaultResult /* ="" */)
{
  var attr = xmlNode.attributes ? xmlNode.attributes.getNamedItem(attrName) : null;
  return attr ? attr.nodeValue : GetDefaultArg(defaultResult,"");
}
