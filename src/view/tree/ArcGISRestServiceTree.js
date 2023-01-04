/* Copyright (c) 2022-present terrestris GmbH & Co. KG
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
 * Used to add an ArcGIS REST layer to the map
 *
 * @class BasiGX.view.tree.ArcGISRestServiceTree
 */
Ext.define('BasiGX.view.tree.ArcGISRestServiceTree', {
    extend: 'Ext.tree.Panel',
    xtype: 'basigx-tree-arcgisrestservicetree',

    requires: [
        'GeoExt.data.model.ArcGISRestServiceLayer',
        'BasiGX.util.ArcGISRest',
        'Ext.tree.Column'
    ],

    config: {
        /**
         * Whether we will send the `X-Requested-With` header when fetching the
         * document from the URL. The `X-Requested-With` header is
         * usually added for XHR, but adding it should lead to a preflight
         * request (see https://goo.gl/6JzdUI), which some servers fail.
         *
         * @type {Boolean}
         */
        useDefaultXhrHeader: false
    },

    arcGISLayerConfig: null,


    listeners: {
       itemclick: function(view, record){
         // toggle visibility of sublayer
         var currentVisibility = record.get('visibility');
         record.set('visibility', !currentVisibility);
       }
    },

    columns: {
        header: false,
        items: [{
            xtype: 'treecolumn',
            renderer: function(v, metaData, record) {
                if (!record.isRoot()) {
                    var eyeGlyph = 'xf06e@FontAwesome';
                    var eyeSlashGlyph = 'xf070@FontAwesome';
                    if (record.get('visibility')) {
                        metaData.glyph = eyeGlyph;
                    } else {
                        metaData.glyph = eyeSlashGlyph;
                    }
                }
                return record.get('name');
            }
        }],
        defaults: {
            flex: 1
        }
    },

    initComponent: function() {
        var me = this;
        me.callParent();

        var rootLabel = me.arcGISLayerConfig.service.name;
        if (me.arcGISLayerConfig.service.type === 'FeatureServer') {
            rootLabel += '/' + me.arcGISLayerConfig.layer.name;
        }

        me.setStore({
            model: 'GeoExt.data.model.ArcGISRestServiceLayer',
            root: {
                name: rootLabel,
                checked: true,
                children: []
            },
            listeners: {
                'nodeexpand': me.onNodeExpand.bind(me)
            }
        });
    },

    onNodeExpand: function(expandedNode) {
        var me = this;
        if (expandedNode.hasChildNodes()) {
            return;
        }
        var serviceUrl = BasiGX.util.ArcGISRest.createMapServerUrl(
            this.arcGISLayerConfig.url,
            this.arcGISLayerConfig.service.name,
            'json'
        );
        // TODO requesting service and populating store should
        // be done by parent component. We should only fire an event
        this.requestService(serviceUrl)
            .then(
                function(response) {
                    return me.onRequestServiceSuccess(response, expandedNode);
                },
                this.onRequestServiceFailure.bind(this)
            );
    },

    requestService: function(serviceUrl) {
        var me = this;
        return new Ext.Promise(function (resolve, reject) {
            Ext.Ajax.request({
                url: serviceUrl,
                method: 'GET',
                useDefaultXhrHeader: me.getUseDefaultXhrHeader(),
                success: function (response) {
                    var respJson = Ext.decode(response.responseText);
                    resolve(respJson);
                },
                failure: function (response) {
                    reject(response.status);
                }
            });
        });
    },

    onRequestServiceSuccess: function(response, expandedNode) {
        var layers = Ext.Array.map(response.layers, function(layer) {
            return Ext.create('GeoExt.data.model.ArcGISRestServiceLayer',{
                layerId: layer.id,
                name: layer.name,
                // TODO remove this line as soon as we use our custom leaf item
                text: layer.name + layer.defaultVisibility,
                defaultVisibility: layer.defaultVisibility,
                visibility: layer.defaultVisibility,
                leaf: true
            });
        });
        expandedNode.appendChild(layers);
    },

    onRequestServiceFailure: function(status) {
        // TODO give feedback
        console.log('failed to request service');
    }

});
