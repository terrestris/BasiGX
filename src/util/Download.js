/* Copyright (c) 2018-present terrestris GmbH & Co. KG
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * @class BasiGX.util.Download
 */
Ext.define('BasiGX.util.Download', {

    statics: {

        /**
         * Download a vector layer from memory, in EPSG:4326. For IE you'll need
         * a polyfill from https://developer.mozilla.org/en-US/docs
         * /Web/JavaScript/Reference/Global_Objects/TypedArray/from
         * @param  {ol.layer.Vector} layer  the layer to download
         * @param  {ol.Map} map    the map the layer is contained in
         * @param  {String} format geojson or zip (shapefile)
         */
        downloadLayer: function(layer, map, format) {
            var name = layer.get('name');
            var json = BasiGX.util.Download.layerToGeoJson(layer, map);
            var result;
            switch (format) {
                case 'zip': {
                    result = BasiGX.util.Download.geoJsonToShpBytes(json, name);
                    break;
                }
                default: {
                    result = btoa(JSON.stringify(json));
                    break;
                }
            }
            if (typeof result === 'string') {
                var a = document.createElement('a');
                a.href = 'data:application/json;base64,' + result;
                a.target = '_blank';
                a.download = name + '.' + format;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } else if (window.navigator.msSaveOrOpenBlob) {
                result = Uint8Array.from(atob(result), function(c) {
                    return c.charCodeAt(0);
                });
                var blob = new Blob([result]);
                window.navigator.msSaveBlob(blob, name + '.' + format);
            } else {
                a = document.createElement('a');
                result.then(function(data) {
                    var reader = new FileReader();
                    reader.onload = function(event) {
                        a.href = event.target.result;
                        a.target = '_blank';
                        a.download = name + '.' + format;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                    };
                    reader.readAsDataURL(data);
                });
            }
        },

        /**
         * Return a layer's features as a geojson object.
         * @param  {ol.layer.Vector} layer the layer
         * @param  {ol.Map} map   the map the layer is contained in
         * @return {Object}       a geojson feature collection
         */
        layerToGeoJson: function(layer, map) {
            var features = layer.getSource().getFeatures();
            var fmt = new ol.format.GeoJSON();
            var proj = map.getView().getProjection().getCode();
            return fmt.writeFeaturesObject(features, {
                dataProjection: 'EPSG:4326',
                featureProjection: proj
            });
        },

        /**
         * Convert a geojson object or string to a zip containing shapefile(s).
         * Multiple shape files will be generated in case of mixed geometry
         * types. Needs https://github.com/mapbox/shp-write/pull/65 in order to
         * work.
         * @param  {String | Object} geojson the geojson to convert
         * @param  {String} name    the layer name
         * @return {String}         a byte string
         */
        geoJsonToShpBytes: function(geojson, name) {
            return shpwrite.zip(geojson, {
                types: {
                    polygon: name + '_polygons',
                    line: name + '_lines',
                    point: name + '_points'
                }
            });
        }

    }
});
