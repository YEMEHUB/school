/* Compact THREE.STLLoader-compatible ASCII/Binary STL parser for offline project use. */
(function(){
  function STLLoader(manager){this.manager=manager||THREE.DefaultLoadingManager;}
  STLLoader.prototype.load=function(url,onLoad,onProgress,onError){
    fetch(url).then(function(r){if(!r.ok)throw new Error(r.status+' '+r.statusText);return r.arrayBuffer();})
    .then(function(b){onLoad(new STLLoader().parse(b));}).catch(function(e){if(onError)onError(e);else console.error(e);});
  };
  STLLoader.prototype.parse=function(data){
    var bin=data instanceof ArrayBuffer?data:data.buffer;
    var dv=new DataView(bin), isBinary=false;
    if(bin.byteLength>=84){var n=dv.getUint32(80,true);isBinary=(84+n*50===bin.byteLength);}
    var pos=[];
    if(isBinary){
      var faces=dv.getUint32(80,true),off=84;
      for(var i=0;i<faces;i++,off+=50){for(var v=0;v<3;v++){var p=off+12+v*12;pos.push(dv.getFloat32(p,true),dv.getFloat32(p+4,true),dv.getFloat32(p+8,true));}}
    }else{
      var text=new TextDecoder().decode(new Uint8Array(bin)),re=/vertex\s+([\-+eE\d\.]+)\s+([\-+eE\d\.]+)\s+([\-+eE\d\.]+)/g,m;
      while((m=re.exec(text)))pos.push(+m[1],+m[2],+m[3]);
    }
    var g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();return g;
  };
  THREE.STLLoader=STLLoader;
})();
