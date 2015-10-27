/*global document*/
// This file is taken from GeoExt3
(function(doc, global){
    var specPath = './spec/',
        dependencies = [
            'basics.test.js',
            'plugin/Hover.test.js',
            'plugin/WfsCluster.test.js',
            'util/Animate.test.js',
            'util/Application.test.js',
            'util/ConfigParser.test.js',
            'util/Controller.test.js',
            'util/Layer.test.js',
            'util/Map.test.js',
            'util/Url.test.js',
            'ux/ContextSensitiveHelp.test.js',
            'ux/RowExpanderWithComponents.test.js',
            'view/button/AddWms.test.js',
            'view/button/CoordinateTransform.test.js',
            'view/button/Help.test.js',
            'view/button/Hsi.test.js',
            'view/button/Measure.test.js',
            'view/button/Permalink.test.js',
            'view/button/ToggleLegend.test.js',
            'view/button/ZoomIn.test.js',
            'view/button/ZoomOut.test.js',
            'view/button/ZoomToExtent.test.js',
            'view/combo/ScaleCombo.test.js',
            'view/component/Map.test.js',
            'view/container/LayerSlider.test.js',
            'view/container/NominatimSearch.test.js',
            'view/container/OverpassSearch.test.js',
            'view/container/WfsSearch.test.js',
            'view/form/AddWms.test.js',
            'view/form/CoordinateTransform.test.js',
            'view/form/CsvImport.test.js',
            'view/form/Permalink.test.js',
            'view/form/Print.test.js',
            'view/grid/FeaturePropertyGrid.test.js',
            'view/panel/Header.test.js',
            'view/panel/LayerSetChooser.test.js',
            'view/panel/LegendTree.test.js',
            'view/panel/MapContainer.test.js',
            'view/panel/Menu.test.js',
            'view/view/LayerSet.test.js'
        ],
        getScriptTag = global.TestUtil.getExternalScriptTag,
        dependencyCnt = dependencies.length,
        i = 0;

    for(; i < dependencyCnt; i++) {
        doc.write(getScriptTag(specPath + dependencies[i]));
    }
}(document, this));
