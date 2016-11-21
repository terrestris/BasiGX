
var __cov_VMqmf_mHdNzYMqmOOCzvhQ = (Function('return this'))();
if (!__cov_VMqmf_mHdNzYMqmOOCzvhQ.__coverage__) { __cov_VMqmf_mHdNzYMqmOOCzvhQ.__coverage__ = {}; }
__cov_VMqmf_mHdNzYMqmOOCzvhQ = __cov_VMqmf_mHdNzYMqmOOCzvhQ.__coverage__;
if (!(__cov_VMqmf_mHdNzYMqmOOCzvhQ['/home/travis/build/terrestris/BasiGX/src/store/GazetteerSearch.js'])) {
   __cov_VMqmf_mHdNzYMqmOOCzvhQ['/home/travis/build/terrestris/BasiGX/src/store/GazetteerSearch.js'] = {"path":"/home/travis/build/terrestris/BasiGX/src/store/GazetteerSearch.js","s":{"1":0},"b":{},"f":{},"fnMap":{},"statementMap":{"1":{"start":{"line":21,"column":0},"end":{"line":95,"column":3}}},"branchMap":{}};
}
__cov_VMqmf_mHdNzYMqmOOCzvhQ = __cov_VMqmf_mHdNzYMqmOOCzvhQ['/home/travis/build/terrestris/BasiGX/src/store/GazetteerSearch.js'];
__cov_VMqmf_mHdNzYMqmOOCzvhQ.s['1']++;Ext.define('BasiGX.store.GazetteerSearch',{extend:'Ext.data.Store',alias:'store.basigx-gazetteersearch',requires:['BasiGX.util.Layer'],_lastRequest:null,proxy:{url:'http://nominatim.openstreetmap.org',method:'GET',type:'ajax',extraParams:{q:null,format:'json',limit:100,viewboxlbrt:'-180,90,180,-90',bounded:1,polygon_text:1},limitParam:'maxFeatures',reader:{type:'json',rootProperty:'features'}},fields:[{name:'place_id',type:'string'},{name:'licence',type:'string'},{name:'osm_type',type:'string'},{name:'osm_id',type:'number'},{name:'boundingbox',type:'auto'},{name:'lat',type:'number'},{name:'lon',type:'number'},{name:'geotext',type:'auto'},{name:'icon',type:'string'},{name:'class',type:'string'},{name:'type',type:'string'},{name:'importance',type:'number'},{name:'icon',type:'string'}]});
