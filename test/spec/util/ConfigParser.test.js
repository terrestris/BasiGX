Ext.Loader.syncRequire(['BasiGX.util.ConfigParser']);

describe('BasiGX.util.ConfigParser', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.util.ConfigParser).to.not.be(undefined);
        });
    });
    describe('Usage of static Methods', function() {
        var div;
        var layer;
        var map;
        var appContext = {
            data: {
                merge: {
                    startCenter: [983487, 6998170],
                    startZoom: 13,
                    mapLayers: [
                        {
                            name: "Hintergrundkarten",
                            type: "Folder",
                            layers: [
                                {
                                    name: "OSM WMS Grau",
                                    type: "TileWMS",
                                    treeColor: "rgba(41, 213, 4, 0.26)",
                                    url: "http://ows.terrestris.de/osm-gray/" +
                                        "service?",
                                    layers: "OSM-WMS",
                                    legendUrl: "http://ows.terrestris.de/" +
                                        "osm-gray/service?SERVICE=WMS&VERSION" +
                                        "=1.3.0&REQUEST=GetMap&FORMAT=image" +
                                        "%2Fpng&TRANSPARENT=true&LAYERS=OSM" +
                                        "-WMS&TILED=true&WIDTH=256&HEIGHT=256" +
                                        "&CRS=EPSG%3A3857&STYLES=&BBOX=978393" +
                                        ".9620502554%2C7000408.798469583%2C98" +
                                        "3285.9318605067%2C7005300.768279834",
                                    topic: false
                                },
                                {
                                    name: "OSM WMS Farbig",
                                    type: "TileWMS",
                                    treeColor: "rgba(41, 213, 4, 0.26)",
                                    url: "http://ows.terrestris.de/osm/" +
                                        "service?",
                                    layers: "OSM-WMS",
                                    legendUrl: "http://ows.terrestris.de/osm/" +
                                        "service?SERVICE=WMS&VERSION=1.3.0&RE" +
                                        "QUEST=GetMap&FORMAT=image%2Fpng&TRAN" +
                                        "SPARENT=true&LAYERS=OSM-WMS&TILED=tr" +
                                        "ue&WIDTH=256&HEIGHT=256&CRS=EPSG%3A3" +
                                        "857&STYLES=&BBOX=978393.9620502554%2" +
                                        "C7000408.798469583%2C983285.93186050" +
                                        "67%2C7005300.768279834",
                                    topic: false,
                                    visibility: false
                                },
                                {
                                    name: 'Subfolder',
                                    type: "Folder",
                                    layers: [
                                        {
                                            name: "OSM WMS Farbig",
                                            type: "TileWMS",
                                            treeColor: "rgba(41, 213, 4, 0.26)",
                                            url: "http://ows.terrestris.de/" +
                                                "osm/service?",
                                            layers: "OSM-WMS",
                                            legendUrl: "http://ows.terrestris" +
                                                ".de/osm/service?SERVICE=WMS&" +
                                                "VERSION=1.3.0&REQUEST=GetMap" +
                                                "&FORMAT=image%2Fpng&TRANSPAR" +
                                                "ENT=true&LAYERS=OSM-WMS&TILE" +
                                                "D=true&WIDTH=256&HEIGHT=256&" +
                                                "CRS=EPSG%3A3857&STYLES=&BBOX" +
                                                "=978393.9620502554%2C7000408" +
                                                ".798469583%2C983285.93186050" +
                                                "67%2C7005300.768279834",
                                            topic: false,
                                            visibility: false
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            name: 'OSM POIs',
                            type: "Folder",
                            layers: [
                                {
                                    name: "Tankstellen",
                                    type: "WMS",
                                    treeColor: "rgba(161, 177, 228, 0.53)",
                                    url: "http://ows.terrestris.de/geoserver/" +
                                        "osm/wms?",
                                    legendHeight: 40,
                                    legendUrl: "http://ows.terrestris.de/" +
                                        "geoserver/osm/wms?SERVICE=WMS&VERSIO" +
                                        "N=1.3.0&REQUEST=GetLegendGraphic&FOR" +
                                        "MAT=image%2Fpng&TRANSPARENT=true&LAY" +
                                        "ER=osm%3Aosm-fuel&HEIGHT=40&WIDTH=40",
                                    layers: "osm:osm-fuel",
                                    topic: true,
                                    transparent: true,
                                    crossOrigin: "Anonymous"
                                },
                                {
                                    name: "Bushaltestellen",
                                    type: "WMS",
                                    treeColor: "rgba(161, 177, 228, 0.53)",
                                    url: "http://ows.terrestris.de/" +
                                        "osm-haltestellen?",
                                    legendHeight: 30,
                                    legendUrl: "http://ows.terrestris.de/osm-" +
                                        "haltestellen?SERVICE=WMS&VERSION=1.1" +
                                        ".0&REQUEST=GetLegendGraphic&FORMAT=i" +
                                        "mage%2Fpng&TRANSPARENT=true&LAYER=OS" +
                                        "M-Bushaltestellen&HEIGHT=40&WIDTH=40",
                                    layers: "OSM-Bushaltestellen",
                                    topic: true,
                                    transparent: true,
                                    crossOrigin: "Anonymous"
                                }
                            ]
                        }
                    ],
                    mapConfig: {
                        projection: "EPSG:3857",
                        resolutions: [
                            156543.03390625,
                            78271.516953125,
                            39135.7584765625,
                            19567.87923828125,
                            9783.939619140625,
                            4891.9698095703125,
                            2445.9849047851562,
                            1222.9924523925781,
                            611.4962261962891,
                            305.74811309814453,
                            152.87405654907226,
                            76.43702827453613,
                            38.218514137268066,
                            19.109257068634033,
                            9.554628534317017,
                            4.777314267158508,
                            2.388657133579254,
                            1.194328566789627,
                            0.5971642833948135
                        ],
                        zoom: 0
                    }
                }
            }
        };
        beforeEach(function() {
            div = document.createElement('div');
            document.body.appendChild(div);
            map = BasiGX.util.ConfigParser.setupMap(appContext);
            layer = BasiGX.util.ConfigParser.createLayer({
                name: "OSM WMS Farbig",
                type: "TileWMS",
                treeColor: "rgba(41, 213, 4, 0.26)",
                url: "http://ows.terrestris.de/osm/service?",
                layers: "OSM-WMS",
                legendUrl: "http://ows.terrestris.de/osm/service?SERVICE=WMS&" +
                    "VERSION=1.3.0&REQUEST=GetMap&FORMAT=image%2Fpng&TRANSPAR" +
                    "ENT=true&LAYERS=OSM-WMS&TILED=true&WIDTH=256&HEIGHT=256&" +
                    "CRS=EPSG%3A3857&STYLES=&BBOX=978393.9620502554%2C7000408" +
                    ".798469583%2C983285.9318605067%2C7005300.768279834",
                topic: false,
                visibility: false
            });
        });
        afterEach(function() {
            document.body.removeChild(div);
            div = null;
            map = null;
            layer = null;
        });
        it('does not throw on setupMap method call', function() {
            var retVal = BasiGX.util.ConfigParser.setupMap();
            expect(retVal).to.be(null);
            var retVal2 = BasiGX.util.ConfigParser.setupMap(appContext);
            expect(retVal2).not.to.be(null);
        });
        it('returns an ol-map on setupMap method call', function() {
            expect(map).to.be.an(ol.Map);
        });
        it('added correct number of layers to map on ' +
           'setupMap method call', function() {
            expect(map.getLayers().getLength()).to.be(8);
        });
        it('assigned correct projection to map on ' +
           'setupMap method call', function() {
            expect(map.getView().getProjection().getCode()).
                to.be('EPSG:3857');
        });
        it('assigned correct zoom to map on setupMap method call', function() {
            expect(map.getView().getZoom()).to.be(13);
        });
        it('assigned correct center to map on ' +
           'setupMap method call', function() {
            expect(map.getView().getCenter()).
                to.eql([983487, 6998170]);
        });

        it('does not throw on createLayer method call', function() {
            expect(layer).not.to.be(null);
        });
        it('instanciates correct layertype on ' +
           'createLayer method call', function() {
            expect(layer).to.be.an(ol.layer.Tile);
        });
        it('instanciates correct sourcetype on ' +
           'createLayer method call', function() {
            expect(layer.getSource()).to.be.an(ol.source.Tile);
        });
        it('converts number string to array on ' +
           'convertStringToNumericArray method call', function() {
            var retVal = BasiGX.util.ConfigParser.
                convertStringToNumericArray("int", "3 , 2,1");
            expect(retVal).to.be.eql([3,2,1]);
        });
        it('converts float string to array on ' +
           'convertStringToNumericArray method call', function() {
            var retVal = BasiGX.util.ConfigParser.
                convertStringToNumericArray("float", "3.1415,2.00124,1.512172");
            expect(retVal).to.be.eql([3.1415,2.00124,1.512172]);
        });
    });
});
