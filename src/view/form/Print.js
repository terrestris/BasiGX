/* Copyright (c) 2015 terrestris GmbH & Co. KG
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
 * Print FormPanel
 *
 * Used to show an Mapfish Print v3 compatible print panel
 *
 * @class BasiGX.view.form.Print
 */
Ext.define("BasiGX.view.form.Print", {
    extend: "Ext.form.Panel",
    xtype: "basigx-form-print",

    requires: [
        "Ext.window.Toast",
        "Ext.app.ViewModel",
        "Ext.form.action.StandardSubmit",

        "BasiGX.util.Layer",
        "BasiGX.util.Map",
        "BasiGX.ol3.extension.TransformInteraction",

        "GeoExt.data.MapfishPrintProvider"
    ],
    statics: {
        LAYER_IDENTIFIER_KEY: '_basigx_printextent_layer_'
    },
    defaultListenerScope: true,

    viewModel: {
        data: {
            title: 'Drucken',
            labelDpi: 'DPI',
            printButtonSuffix: 'anfordern',
            downloadButtonPrefix: 'Download',
            printFormat: 'pdf',
            printAppFieldSetTitle: 'Vorlage',
            genericFieldSetTitle: 'Einstellungen',
            formatComboLabel: 'Format',
            layoutComboLabel: 'Layout',
            attributesTitle: 'Eigenschaften',
            mapTitleLabel: 'Kartentitel'
        }
    },

    bind: {
        title: '{title}'
    },

    maxHeight: 250,

    autoScroll: true,

    config: {
        url: null,
        store: null,
        printExtentAlwaysCentered: true,
        printExtentMovable: false,
        printExtentScalable: false
    },

    borderColors: [
        '#FF5050',
        '#00CCFF',
        '#FFFF99',
        '#CCFF66'
    ],

    layout: 'form',

    bodyPadding: '0 5px 0 0',

    extentLayer: null,

    provider: null,

    defaultType: 'textfield',

    /**
     * The store containing the apps of the print servlet. This is the base of
     * the store that actually is being used in the apps combo (#appsStore).
     *
     * @type {Ext.data.Store}
     */
    remotePrintAppsStore: null,

    /**
     * The store of the combobox to choose an application from. Is created from
     * the data in the #remotePrintAppsStore.
     *
     * @type {Ext.data.Store}
     */
    appsStore: null,

    /**
     * The transform interaction that we may have added to the map to manipulate
     * the extent feature via dragging edges etc. Currently only added if either
     * the config #printExtentMovable or #printExtentScalable is `true` and
     * added in the method #addExtentInteractions.
     *
     * @type {ol.interaction.Transform}
     */
    transformInteraction: null,

    /**
     * Fires after an `attributefields`-object was added to a fieldset of e.g.
     * the layout attributes.
     *
     * This event can be used to change the appearance of e.g. a textfield.
     *
     * @event attributefieldsadd
     * @param {BasiGX.view.form.Print} printForm The print form instance.
     * @param {Object} attributefields The `attributefields`-object, which was
     *     added.
     * @param {Ext.Component} The actually added component.
     */
    /**
     * Fires before an `attributefields`-object is added to the fieldset of e.g.
     * the layout attributes. If any handler for this event returns the boolean
     * value `false`, the `attributefields`-object will be skipped and not added
     * to the fieldset.
     *
     * This event can therefore be used to remove specific fields from the form
     * or to change the appearance of e.g. a textfield. You can manipulate the
     * passed `attributefields`-object and the changes will directly take
     * effect.
     *
     * @event beforeattributefieldsadd
     * @param {BasiGX.view.form.Print} printForm The print form instance.
     * @param {Object} attributefields An `attributefields`-object, which often
     *     are formfields like `textfields`, `combos` etc.
     */

    buttons: [{
        name: 'createPrint',
        bind: {
            text: '{printFormat:uppercase} {printButtonSuffix}'
        },
        formBind: true,
        handler: function(){
            this.up('form').createPrint();
        },
        disabled: true
    }, {
        name: 'downloadPrint',
        hidden: true,
        glyph: 'xf019@FontAwesome',
        bind: {
            text: '{downloadButtonPrefix} {printFormat:uppercase} '
        },
        link: null, // this has to be filled in application
        handler: function(btn){
            if(btn.link){
                window.open(btn.link);
            } else {
                Ext.raise('No downloadlink defined');
            }
        }
    }],

    listeners: {
        collapse: 'cleanupPrintExtent',
        resize: 'renderAllClientInfos'
    },

    /**
     * Initializes the print form.
     */
    initComponent: function(){
        var me = this;
        var url = me.getUrl();

        if(!url){
            me.html = 'No Url provided!';
            me.callParent();
            return;
        }

        me.callParent();

        me.createAppsStore();

        var printAppComponent = me.getPrintAppComponent();

        me.add({
            xtype: 'fieldcontainer',
            name: 'defaultFieldContainer',
            layout: 'form',
            items: printAppComponent
        });

        me.on('afterrender', me.addExtentLayer, me);
        me.on('afterrender', me.addExtentInteractions, me);

        me.on('afterrender', me.addParentCollapseExpandListeners, me);
        me.on('beforeDestroy', me.cleanupPrintExtent, me);

    },

    /**
     *
     */
    createAppsStore: function() {
        var me = this;
        var remoteAppsStore = Ext.create('Ext.data.Store', {
            autoLoad: true,
            proxy: {
                type: 'jsonp',
                url: me.getUrl() + 'apps.json',
                callbackKey: 'jsonp'
            },
            listeners: {
                // The real work is done in the callback below, make sure
                // to read the docs there
                load: me.onRemoteAppStoreLoad,
                scope: me
            }
        });
        me.remotePrintAppsStore = remoteAppsStore;
    },

    /**
     * This method looks stupid at first, but it actually serves a purpose and
     * it is the only way we found to make use of the returned json. The
     * Mapfish print servlet anwers like this:
     *
     *     dynamicExtCallback(["print-app-1", "print-app-2"])
     *
     * We cannot make use of that data directly in ExtJS it would at least
     * expect
     *
     *     dynamicExtCallback([["print-app-1"], ["print-app-2"]])
     *
     * In that case we could use an array reader and configure fields with
     * indices, but … as it doesn't we tackle this as follows:
     *
     * In the load callback, create a plain array of names, sort it and assign
     * it to the store.
     *
     * If you can come up with a different solution; I'd be very happy.
     *
     * @param {Ext.data.Store} store The stoire that has loaded.
     * @param {Array<Ext.data.Model>} store The records that were loaded.
     */
    onRemoteAppStoreLoad: function(store, records) {
        var me = this;
        var rawValues = [];
        var combo = me.down('combo[name=appCombo]');
        Ext.each(records, function(rec){
            rawValues.push(rec.data);
        });
        Ext.Array.sort(rawValues);

        combo.setStore(rawValues);
        me.appsStore = combo.getStore();
    },

    /**
     *
     */
    getPrintAppComponent: function() {
        var component = {
            xtype: 'fieldset',
            bind: {
                title: '{printAppFieldSetTitle}'
            },
            name: 'print-app-fieldset',
            layout: 'anchor',
            items: [{
                xtype: 'combo',
                anchor: '100%',
                name: 'appCombo',
                allowBlank: false,
                forceSelection: true,
                queryMode: 'local',
                displayField: 'id',
                valueField: 'id',
                store: this.remotePrintAppsStore,
                listeners: {
                    select: 'onAppSelected',
                    scope: this
                }
            }]
        };
        return component;
    },

    /**
     *
     */
    createPrint: function(){
        var view = this;
        var spec = {};
        var mapComponent = view.getMapComponent();
        var mapView = mapComponent.getMap().getView();
        var layout = view.down('combo[name="layout"]').getValue();
        var format = view.down('combo[name="format"]').getValue();
        var attributes = {};
        var projection = mapView.getProjection().getCode();
        var rotation = mapView.getRotation();

        var gxPrintProvider = GeoExt.data.MapfishPrintProvider;

        var serializedLayers = gxPrintProvider.getSerializedLayers(
            mapComponent, this.layerFilter, this
        );

        var fieldsets =
            view.query('fieldset[name=attributes] fieldset');

        Ext.each(fieldsets, function(fs){
            var name = fs.name;
            // TODO double check when rotated
            var featureBbox = fs.extentFeature.getGeometry().getExtent();
            var dpi = fs.down('[name="dpi"]').getValue();

            attributes[name] = {
                bbox: featureBbox,
                dpi: dpi,
                // TODO Order of Layers in print seems to be reversed.
                layers: serializedLayers.reverse(),
                projection: projection,
                rotation: rotation
            };

        }, this);
        // Get all Fields except the DPI Field
        // TODO This query should be optimized or changed into some
        // different kind of logic
        var additionalFields = view.query(
            'fieldset[name=attributes]>field[name!=dpi]'
        );
        Ext.each(additionalFields, function(field){

            if(field.getName() === 'legend') {
                attributes.legend = view.getLegendObject();
            } else if (field.getName() === 'scalebar') {
                attributes.scalebar = view.getScaleBarObject();
            } else if (field.getName() === 'northArrowDef') {
                attributes.northArrowDef = view.getNorthArrowObject();
            } else {
                attributes[field.getName()] = field.getValue();
            }
        }, this);

        var url = view.getUrl();
        var app = view.down('combo[name=appCombo]').getValue();
        spec.attributes = attributes;
        spec.layout = layout;
        var submitForm = Ext.create('Ext.form.Panel', {
            standardSubmit: true,
            url: url + app + '/buildreport.' + format,
            method: 'POST',
            items: [
                {
                    xtype: 'textfield',
                    name: 'spec',
                    value: Ext.encode(spec)
                }
            ]
        });
        submitForm.submit();
    },

    /**
     *
     */
    addParentCollapseExpandListeners: function(){
        var parent = this.up();
        parent.on({
            collapse: 'cleanupPrintExtent',
            expand: 'renderAllClientInfos',
            scope: this
        });
    },

    /**
     *
     */
    addExtentLayer: function(){
        var targetMap = BasiGX.util.Map.getMapComponent().getMap();

        // TODO MJ: the lines below are possible better suited at the
        //          cleanupPrintExtent method, but tzhat may currently
        //          be called to often.
        var existingLayer = null;
        var isPrintExtentLayerKey = this.self.LAYER_IDENTIFIER_KEY;
        targetMap.getLayers().forEach(function(maplayer) {
            if (maplayer.get(isPrintExtentLayerKey) === true) {
                existingLayer = maplayer;
            }
        });
        if (existingLayer) {
            targetMap.removeLayer(existingLayer);
        }
        // TODO MJ: he lines above are possible better suited ...

        var layer = new ol.layer.Vector({
            source: new ol.source.Vector()
        });
        // Set our flag to identify this layer as printextentlayer
        layer.set(isPrintExtentLayerKey, true);

        // Set our internal flag to filter this layer out of the tree / legend
        var displayInLayerSwitcherKey = BasiGX.util.Layer.KEY_DISPLAY_IN_LAYERSWITCHER;
        layer.set(displayInLayerSwitcherKey, false);

        targetMap.addLayer(layer);
        this.extentLayer = layer;
    },

    /**
     * Adds an instance of `ol.interaction.Transform` to the map which will
     * allow to modify the print extent dynamically. Look up the property
     * named #transformInteraction for the actually created instance.
     */
    addExtentInteractions: function() {
        var me = this;
        var extentLayer = me.extentLayer;
        var needed = me.getPrintExtentMovable() || me.getPrintExtentScalable();
        if (!extentLayer || !needed) {
            return;
        }
        me.cleanupTransformInteraction();

        // TODO remove this wild guessing everywhere
        var targetMap = BasiGX.util.Map.getMapComponent().getMap();
        me.transformInteraction = new ol.interaction.Transform({
            layers: [extentLayer],
            fixedScaleRatio: true,
            translate: me.getPrintExtentMovable(),
            scale: me.getPrintExtentScalable(),
            stretch: me.getPrintExtentScalable(),
            rotate: false
        });

        me.transformInteraction.setActive(true);
        targetMap.addInteraction(me.transformInteraction);
    },

    /**
     * Filters the layer by properties or params. Used in createPrint.
     * This method can/should be overridden in the application.
     *
     * @param ol.layer
     */
    layerFilter: function(layer) {
        var isChecked = !!layer.checked;
        var hasName = isChecked && !!layer.get('name');
        var nonOpaque = hasName && (layer.get('opacity') > 0);
        var inTree = nonOpaque && (layer.get(
            BasiGX.util.Layer.KEY_DISPLAY_IN_LAYERSWITCHER
        ) !== false); // may be undefined for certain layers

        if (isChecked && hasName && nonOpaque && inTree) {
            if(layer instanceof ol.layer.Vector &&
                layer.getSource().getFeatures().length < 1){
                return false;
            }
            return true;
        } else {
            return false;
        }
    },

    /**
     * Filters the layer by properties or params. Used in getLegendObject.
     * This method can/should be overriden in the application.
     *
     * @param ol.layer
     */
    legendLayerFilter: function(layer) {
        if (layer.checked && layer.get('name') &&
            layer.get('name') !== "Hintergrundkarte" &&
            layer.get('opacity') > 0) {
            return true;
        } else {
            return false;
        }
    },

    /**
     *
     */
    getMapComponent: function(){
        return Ext.ComponentQuery.query('gx_component_map')[0];
    },

    /**
     *
     */
    onPrintProviderReady: function(provider){
        this.addGenericFieldset(provider);
    },

    /**
     *
     */
    onAppSelected: function(appCombo){
        this.provider = Ext.create('GeoExt.data.MapfishPrintProvider', {
            url: this.getUrl() + appCombo.getValue() + '/capabilities.json',
            listeners: {
                ready: 'onPrintProviderReady',
                scope: this
            }
         });
    },

    /**
     *
     */
    removeGenericFieldset: function(){
        var view = this;
        var fs = view.down('[name="generic-fieldset"]');
        if (fs) {
            view.remove(fs);
        }
    },

    /**
     *
     */
    addGenericFieldset: function(provider){
        var view = this;
        var fs = view.down('[name="generic-fieldset"]');
        var defaultFieldContainer = view.down(
            'fieldcontainer[name=defaultFieldContainer]');

        if (fs) {
            fs.removeAll();
        } else {
            defaultFieldContainer.add({
                xtype: 'fieldset',
                bind: {
                    title: '{genericFieldSetTitle}'
                },
                name: 'generic-fieldset',
                layout: 'anchor',
                defaults: {
                    anchor: '100%'
                }
            });
        }
        this.addLayoutCombo(provider);
        this.addFormatCombo(provider);

        this.fireEvent('genericfieldsetadded');
    },

    /**
     *
     */
    addFormatCombo: function(provider){
        var fs = this.down('fieldset[name=generic-fieldset]');
        var formatStore = provider.capabilityRec.get('formats');
        Ext.Array.sort(formatStore);
        var formatCombo = {
            xtype: 'combo',
            name: 'format',
            displayField: 'name',
            editable: false,
            forceSelection: true,
            queryMode: 'local',
            valueField: 'name',
            store: formatStore,
            bind: {
                fieldLabel: '{formatComboLabel}',
                value: '{printFormat}'
            }
        };
        fs.add(formatCombo);
    },

    /**
     *
     */
    addLayoutCombo: function(provider){
        var fs = this.down('fieldset[name=generic-fieldset]');
        var layoutStore = provider.capabilityRec.layouts();
        layoutStore.sort('name', 'ASC');
        var layoutCombo = {
            xtype: 'combo',
            name: 'layout',
            displayField: 'name',
            editable: false,
            forceSelection: true,
            queryMode: 'local',
            valueField: 'name',
            store: layoutStore,
            bind: {
                fieldLabel: '{layoutComboLabel}'
            },
            listeners: {
                change: this.onLayoutSelect,
                scope: this
            }
        };
        layoutCombo = fs.add(layoutCombo);
        layoutCombo.select(layoutStore.getAt(0));
    },

    /**
     * TODO REMOVE EXTENT
     */
    onLayoutSelect: function(combo, layoutname){
        var view = this,
            attributesFieldset = view.down('fieldset[name=attributes]'),
            layoutRec = combo.findRecordByValue(layoutname),
            attributeFieldset,
            defaultFieldContainer = view.down(
                'fieldcontainer[name=defaultFieldContainer]');

        view.remove(attributesFieldset);

        // add the layout attributes fieldset:
        if(defaultFieldContainer && attributesFieldset){
            defaultFieldContainer.remove(attributesFieldset);
        }
        attributeFieldset = defaultFieldContainer.add({
            xtype: 'fieldset',
            bind: {
                title: '{attributesTitle}'
            },
            name: 'attributes',
            layout: 'anchor',
            defaults: {
                anchor: '100%'
            }
        });

        layoutRec.attributes().each(function(attribute){
            this.addAttributeFields(attribute, attributeFieldset);
        }, this);

        this.renderAllClientInfos();
        view.down('button[name="createPrint"]').enable();
    },

    /**
     *
     */
    getMapAttributeFields: function (attributeRec) {
        var clientInfo = attributeRec.get('clientInfo');
        var mapTitle = attributeRec.get('name') + ' (' +
            clientInfo.width + ' × ' +
            clientInfo.height + ')';
        var fs = {
            xtype: 'fieldset',
            clientInfo: Ext.clone(clientInfo),
            title: mapTitle,
            name: attributeRec.get('name'),
            items: {
                xtype: 'combo',
                name: 'dpi',
                editable: false,
                forceSelection: true,
                bind: {
                    fieldLabel: '{labelDpi}'
                },
                queryMode: 'local',
                labelWidth: 40,
                width: 150,
                value: clientInfo.dpiSuggestions[0],
                store: clientInfo.dpiSuggestions
            }
        };
        return fs;
    },

    /**
     *
     */
    getCheckBoxAttributeFields: function (attributeRec) {
        return {
            xtype: 'checkbox',
            name: attributeRec.get('name'),
            checked: true,
            fieldLabel: attributeRec.get('name'),
            boxLabel: '…verwenden?'
        };
    },

    /**
     *
     */
    getNorthArrowAttributeFields: function (attributeRec) {
        return this.getCheckBoxAttributeFields(attributeRec);
    },

    /**
     *
     */
    getLegendAttributeFields: function (attributeRec) {
        return this.getCheckBoxAttributeFields(attributeRec);
    },

    /**
     *
     */
    getScalebarAttributeFields: function (attributeRec) {
        return this.getCheckBoxAttributeFields(attributeRec);
    },

    /**
     * Returns a text field based on given attribute record. Depending on record
     * name the field label can be bound dynamically via view model.
     * At the moment only `title` attribute is translatable. For all possible
     * further attributes the name of the record will be taken as field label.
     *
     * @param {Object} attributeRec Record with attribute properties.
     * @return {Object} A configuration object for a textfield.
     */
    getStringField: function (attributeRec) {
        var fl = '';
        var value = attributeRec.get('default');
        var name = attributeRec.get('name');

        if (attributeRec.get('name') === 'title') {
            fl = '{mapTitleLabel}';
        } else {
            fl = name;
        }

        if (!Ext.isEmpty(fl)) {
            return {
                xtype: 'textfield',
                name: name,
                bind: {
                    fieldLabel: fl
                },
                value: value,
                allowBlank: true
            };
        }
    },

    /**
     *
     */
    addAttributeFields: function(attributeRec, fieldset){
        var me = this;
        var map = me.getMapComponent().getMap();

        var attributeFields;
        switch (attributeRec.get('type')) {
            case "MapAttributeValues":
                attributeFields = me.getMapAttributeFields(attributeRec);
                if (me.getPrintExtentAlwaysCentered()) {
                    map.on('moveend', me.renderAllClientInfos, me);
                }
                break;
            case "NorthArrowAttributeValues":
                attributeFields = me.getNorthArrowAttributeFields(attributeRec);
                break;
            case "ScalebarAttributeValues":
                attributeFields = me.getScalebarAttributeFields(attributeRec);
                break;
            case "LegendAttributeValue":
                attributeFields = me.getLegendAttributeFields(attributeRec);
                break;
            case "String":
                attributeFields = me.getStringField(attributeRec);
                break;
            case "DataSourceAttributeValue":
                Ext.toast('Data Source not yet supported');
                attributeFields = me.getStringField(attributeRec);
                break;
            default:
                break;
        }

        if (attributeFields) {
            var doContinue = me.fireEvent(
                    'beforeattributefieldsadd', me, attributeFields
                );
            // a beforeattributefieldsadd handler may have cancelled the adding
            if (doContinue !== false) {
                var added = fieldset.add(attributeFields);
                me.fireEvent('attributefieldsadd', me, attributeFields, added);
            }
        }
    },

    /**
     * Method is used to adjust a print infos (e.g. dimensions or extent
     * rectangle on the map) after print layout was changed or map was zoomed
     * or paned
     */
    renderAllClientInfos: function(){

        var view = this;

        if (view._renderingClientExtents || view.getCollapsed() !== false) {
            return;
        }
        view._renderingClientExtents = true;

        view.extentLayer.getSource().clear();

        view.resetExtentInteraction();

        if (view && view.items) {
            var fieldsets = view.query(
                    'fieldset[name=attributes] fieldset[name=map]'
            );
        }

        Ext.each(fieldsets, function(fieldset){
            if (this.getMapComponent() && view.extentLayer &&
                    fieldset.clientInfo) {
                var feat = GeoExt.data.MapfishPrintProvider.renderPrintExtent(
                        this.getMapComponent(), view.extentLayer,
                        fieldset.clientInfo
                );
            }
            fieldset.extentFeature = feat;
        }, this);
        delete view._renderingClientExtents;
    },

    /**
     * Toggles the extent interaction to effectovely remove any handles (etc.)
     * that might have been added.
     */
    resetExtentInteraction: function() {
        var interaction = this.transformInteraction;
        if (interaction && interaction.getActive) {
            var currentActive = interaction.getActive();
            interaction.setActive(!currentActive);
            interaction.setActive(currentActive);
        }
    },

    /**
     * This method removes the print extent rectangle from client after print
     * window was closed. Additionally `moveend` event on the map will
     * be unregistered here.
     */
    cleanupPrintExtent: function(){
        var view = this;
        var map = view.getMapComponent().getMap();
        view.cleanupTransformInteraction();
        view.extentLayer.getSource().clear();
        map.un('moveend', view.renderAllClientInfos, view);
    },

    /**
     * This method effectively removes a #transformInteraction if we had one.
     */
    cleanupTransformInteraction: function() {
        var me = this;
        var interaction = me.transformInteraction;
        if (interaction) {
            interaction.setActive(false);
            var map = interaction.getMap();
            if (map) {
                map.removeInteraction(interaction);
            }
        }
        me.transformInteraction = null;
    },

    /**
     *
     */
    getLegendObject: function() {
        var classes = [];
        var url;
        var iconString;
        var printLayers = GeoExt.data.MapfishPrintProvider.getLayerArray(
                this.getMapComponent().getLayers().getArray()
        );

        var filteredLayers = Ext.Array.filter(printLayers,
            this.legendLayerFilter);

        Ext.each(filteredLayers, function(layer){
            if(layer.get("legendUrl")){
                classes.push({
                    icons: [layer.get("legendUrl")],
                    name: layer.get('name')
                });
            } else {
                if (layer.getSource() instanceof ol.source.TileWMS) {
                    url = layer.getSource().getUrls()[0];
                    iconString = url + "?" +
                        "TRANSPARENT=TRUE&" +
                        "VERSION=1.1.1&" +
                        "SERVICE=WMS&" +
                        "REQUEST=GetLegendGraphic&" +
                        "EXCEPTIONS=application%2Fvnd.ogc.se_xml&" +
                        "FORMAT=image%2Fgif&" +
                        "SCALE=6933504.262556662&" + // TODO excuse me, what ?!
                        "LAYER=";
                        iconString += layer.getSource().getParams().LAYERS;
                    classes.push({
                        icons: [iconString],
                        name: layer.get('name')
                    });
                } else if (layer.getSource() instanceof ol.source.ImageWMS){
                    url = layer.getSource().getUrl();
                    iconString = url + "?" +
                        "TRANSPARENT=TRUE&" +
                        "VERSION=1.1.1&" +
                        "SERVICE=WMS&" +
                        "REQUEST=GetLegendGraphic&" +
                        "EXCEPTIONS=application%2Fvnd.ogc.se_xml&" +
                        "FORMAT=image%2Fgif&" +
                        "SCALE=6933504.262556662&" + // TODO excuse me, what ?!
                        "LAYER=";
                        iconString += layer.getSource().getParams().LAYERS;
                    classes.push({
                        icons: [iconString],
                        name: layer.get('name')
                    });
                }
            }
        });

        var legendObj = {
                classes: classes,
                name: ""
        };

        return legendObj;
    },

    /**
     * Creates a NorthArrow-Object
     */
    getNorthArrowObject: function() {
        var northArrowObject = {};
        // This file is located right beneath the config.yaml
        northArrowObject.graphic = "file://NorthArrow_10.svg";
        northArrowObject.backgroundColor = "rgba(0, 0, 0, 0)";
        return northArrowObject;
    },

    /**
     * Creates a ScaleBar-Object
     */
    getScaleBarObject: function() {
        var scaleBarObj = {};
        scaleBarObj.color = "black";
        scaleBarObj.backgroundColor = "rgba(255, 255, 255, 0)";
        scaleBarObj.barBgColor = "white";
        scaleBarObj.fontColor = "black";
        scaleBarObj.align = "right";
        scaleBarObj.intervals = 2;
        scaleBarObj.fontSize = 10;
        scaleBarObj.renderAsSvg = true;
        return scaleBarObj;
    },

    /**
     *
     */
    getLayoutRec: function(){
        var combo = this.down('combo[name="layout"]');
        var value = combo.getValue();
        var rec = combo.findRecordByValue(value);
        return rec;
    }
});
