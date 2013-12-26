/*global dojo,define,document */
/*jslint sloppy:true */
/** @license
| Version 10.2
| Copyright 2013 Esri
|
| Licensed under the Apache License, Version 2.0 (the "License");
| you may not use this file except in compliance with the License.
| You may obtain a copy of the License at
|
|    http://www.apache.org/licenses/LICENSE-2.0
|
| Unless required by applicable law or agreed to in writing, software
| distributed under the License is distributed on an "AS IS" BASIS,
| WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
| See the License for the specific language governing permissions and
| limitations under the License.
*/
//============================================================================================================================//
define([
        "dojo/_base/declare",
        "dojo/dom-construct",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/dom-attr",
        "dojo/dom",
        "dojo/text!./templates/itemDetails.html",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dojo/i18n!nls/localizedStrings",
        "dojo/query",
        "dojo/dom-class",
        "dojo/on",
        "dojo/Deferred",
        "dojo/number",
        "dojo/topic",
        "esri/arcgis/utils",
        "esri/dijit/Legend",
        "esri/map",
        "esri/dijit/BasemapGallery",
        "esri/dijit/Popup",
        "widgets/geoLocation/geoLocation",
        "widgets/baseMapGallery/baseMapGallery",
        "esri/tasks/locator",
        "dojo/string",
        "esri/layers/GraphicsLayer",
        "esri/dijit/HomeButton",
        "dojo/dom-style"
    ],
    function (declare, domConstruct, lang, array, domAttr, dom, template, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, nls, query, domClass, on, Deferred, number, topic, utils, legend, esriMap, esriBasemapGallery, esriPopUp, geoLocation, baseMapGallery, Locator, string, GraphicsLayer, HomeButton, domStyle) {
        return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
            templateString: template,
            nls: nls,
            basemapLayer: null,
            lastSearchString: null,
            stagedSearch: null,
            mapPoint: null,
            map: null,
            defaultExtent: null,
            tempGraphicsLayerId: "esriGraphicsLayerMapSettings",

            postCreate: function () {
                domClass.add(query(".esriCTContentdiv")[0], "displayNoneAll");
                var applicationHeaderDiv = dom.byId("esriCTParentDivContainer");
                domClass.replace(query(".esriCTMenuTabRight")[0], "displayNoneAll", "displayBlockAll");
                this.itemIcon.src = this.data.thumbnailUrl;
                var itemDetailsPanel = domConstruct.place(this.itemDetailsLeftPanel, applicationHeaderDiv);
                domAttr.set(this.itemTitle, "innerHTML", this.data.title);
                this._createMapLayers(this.data);

                this.own(on(query(".esriCTFullScreen")[0], "click", lang.hitch(this, function () {
                    this._toggleFullScreen();
                })));
                domAttr.set(this.txtAddressSearch, "defaultAddress", dojo.configData.LocatorSettings.itemsLocator[0].LocatorDefaultAddress);
                domAttr.set(this.txtAddressSearch, "value", domAttr.get(this.txtAddressSearch, "defaultAddress"));
                this.own(on(this.divLegendLayer, "click", lang.hitch(this, function () {
                    this._toggleLayout();
                })));
                this.own(on(this.divBackToMap, "click", lang.hitch(this, function () {
                    this._toggleLayout();
                })));
            },

            _toggleLayout: function () {
                if (query(".esriRightControlPanel")[0]) {
                    domClass.toggle(query(".esriCTBackToMapPosition")[0], "displayNoneAll");
                }
                if (domClass.contains(query(".esriRightControlPanel")[0], "esriRightControlPanelMap")) {
                    domClass.replace(query(".esriRightControlPanel")[0], "esriRightControlPanelLegend", "esriRightControlPanelMap");
                    domClass.replace(this.divBackToMapContainer, "esriCTBackToMapBtn", "esriCTBackToMapBtnLegend");
                } else {
                    domClass.replace(query(".esriRightControlPanel")[0], "esriRightControlPanelMap", "esriRightControlPanelLegend");
                    domClass.replace(this.divBackToMapContainer, "esriCTBackToMapBtnLegend", "esriCTBackToMapBtn");
                }
                if (domClass.contains(query(".esriCTlegendLayer")[0], "esriCTlegendLayerMargin")) {
                    domClass.replace(query(".esriCTlegendLayer")[0], "esriCTlegendLayer2", "esriCTlegendLayerMargin");
                } else {
                    domClass.add(query(".esriCTlegendLayer")[0], "esriCTlegendLayerMargin", "esriCTlegendLayer2");
                }
                if (query(".esriCTRightPanelmap")[0]) {
                    domClass.toggle(query(".esriCTRightPanelmap")[0], "esriCTShiftLeft");
                }
                if (query(".esriCTMenuTabLeft")[0]) {
                    if (domClass.contains(query(".esriCTMenuTabLeft")[0], "displayBlock")) {
                        domClass.replace(query(".esriCTMenuTabLeft")[0], "displayNone", "displayBlock");
                    } else {
                        domClass.replace(query(".esriCTMenuTabLeft")[0], "displayBlock", "displayNone");
                    }
                }
                if (query(".esriCTlegendLayer")[0]) {
                    domClass.toggle(query(".esriCTlegendLayer")[0], "esriCTLegendPanelShift");
                    domClass.toggle(query(".esriCTlegendLayer")[0], "displayBlock");
                    domClass.toggle(query(".esriCTRightPanelmap")[0], "esriCTMapPanelShift");
                    if (domClass.contains(query(".esriCTMapInfoIcon")[0], "esriMapGeoInfo")) {
                        domClass.remove(query(".esriCTMapInfoIcon")[0], "esriMapGeoInfo icon-info-circled-alt");
                    } else {
                        domClass.add(query(".esriCTMapInfoIcon")[0], "esriMapGeoInfo icon-info-circled-alt");
                    }
                    domClass.toggle(query(".esriMapGeoLocation")[0], "displayNone");
                }
                domClass.toggle(this.itemMap, "displayNone");
                if (this.map) {
                    this.map.reposition();
                    this.map.resize();
                }
            },

            _toggleFullScreen: function () {
                var element = document.documentElement;
                var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;
                // Not supported by Internet Explorer
                if (requestMethod) { // Native full screen.
                    requestMethod.call(element);
                }
            },

            _createMapLayers: function (data) {
                mapId = data.id;
                var _self = this;
                if (mapId) {
                    if (data) {
                        var dataType = data.type.toLowerCase();
                        if (dataType == ("KML").toLowerCase()) {
                            this.addLayerToMap(mapId, data.url, data.title, dataType);
                        } else if (dataType == ("Web Map").toLowerCase()) {
                            this.addWebMap(mapId);
                        } else if (dataType == ("Feature Service").toLowerCase()) {
                            var layerType = data.url.substring(((data.url.lastIndexOf("/")) + 1), (data.url.length));
                            if (!isNaN(layerType)) {
                                this.addLayerToMap(mapId, data.url, data.title, dataType);
                            } else {
                                var url1 = data.url + "?f=json";
                                esri.request({
                                    url: url1,
                                    handleAs: "json",
                                    load: function (jsondata) {
                                        if (jsondata.layers.length > 0) {
                                            for (var j = 0; j < jsondata.layers.length; j++) {
                                                var layerUrl = data.url + "/" + jsondata.layers[j].id;
                                                _self.addLayerToMap(mapId, layerUrl, data.title, dataType);
                                            }
                                        }
                                    },
                                    error: function (err) {
                                        alert(err.message);
                                    }
                                });
                            }
                        } else if (dataType == ("Map Service").toLowerCase()) {
                            var layerType = data.url.substring(((data.url.lastIndexOf("/")) + 1), (data.url.length));
                            if (!isNaN(layerType)) {
                                this.addLayerToMap(mapId, data.url, data.title, "Feature Service");
                            } else {
                                this.addLayerToMap(mapId, data.url, data.title, dataType);
                            }
                        } else if (dataType == ("WMS").toLowerCase()) {
                            this.addLayerToMap(mapId, data.url, data.title, dataType);
                        }
                        this._createItemDescriptionContent(data);
                    }
                }
            },

            createLegend: function (layerObj, itemMap, legendDiv) {
                var legendDijit = new legend({
                    map: itemMap,
                    layerInfos: layerObj
                }, legendDiv);
                legendDijit.startup();
            },

            addWebMap: function (mapId) {
                topic.publish("showProgressIndicator");
                var _self = this;
                utils.createMap(mapId, this.itemMap, {
                    mapOptions: {
                        slider: true
                    }
                }).then(function (response) {
                    var layerInfo = [];
                    array.forEach(response.itemInfo.itemData.operationalLayers, function (layer) {
                        if ((!layer.featureCollection) && (layer.layerObject)) {
                            layerInfo.push({
                                layer: layer.layerObject,
                                title: layer.title
                            });
                        }
                    });
                    _self.map = response.map;
                    _self.basemapLayer = response.itemInfo.itemData.baseMap.baseMapLayers[0].id;
                    graphicsLayer = new GraphicsLayer();
                    graphicsLayer.id = _self.tempGraphicsLayerId;
                    _self.map.addLayer(graphicsLayer);
                    _self.createLegend(layerInfo, response.map, _self.legendDiv);
                    _self._createLayerInfoContent(_self, layerInfo);
                    var home = _self._addHomeButton();
                    domConstruct.place(home.domNode, query(".esriSimpleSliderIncrementButton")[0], "after");
                    home.startup();

                    var geoLocationWidget = new geoLocation({
                        map: response.map,
                        basemap: response.itemInfo.itemData.baseMap.baseMapLayers[0].id,
                        graphicsLayer: graphicsLayer
                    });
                    topic.publish("hideProgressIndicator");
                }, function (err) {
                    alert(err.message);
                    topic.publish("hideProgressIndicator");
                });
            },

            addLayerToMap: function (mapId, url, title, type, data) {
                topic.publish("showProgressIndicator");
                var _self = this;
                var popup = new esriPopUp({
                    titleInBody: false
                }, domConstruct.create("div"));
                this.map = new esriMap(this.itemMap, {
                    zoom: 2,
                    autoResize: true,
                    infoWindow: popup
                });
                dojo.connect(window, "onresize", function () {
                    if (_self.map) {
                        _self.map.reposition();
                        _self.map.resize();
                    }
                });
                var home = this._addHomeButton();
                var baseMapGalleryWidget = new baseMapGallery({
                    map: this.map
                }, domConstruct.create("div", {}, null));
                this.map.on("load", lang.hitch(this, function () {
                    domConstruct.place(home.domNode, query(".esriSimpleSliderIncrementButton")[0], "after");
                    home.startup();
                    graphicsLayer = new GraphicsLayer();
                    graphicsLayer.id = this.tempGraphicsLayerId;
                    this.map.addLayer(graphicsLayer);
                    for (var i in this.map._layers) {
                        if (this.map._layers[i].visibleLayers) {
                            this.basemapLayer = this.map._layers[i].id;
                        }
                    }
                    var geoLocationWidget = new geoLocation({
                        map: this.map,
                        basemap: this.basemapLayer,
                        graphicsLayer: graphicsLayer
                    });

                    if (type == ("KML").toLowerCase()) {
                    } else if (type == ("Feature Service").toLowerCase()) {
                        this._addFeatureLayer(this.map, mapId, url, title);
                    } else if (type == ("Map Service").toLowerCase()) {
                        this._addCachedAndDynamicService(this.map, mapId, url, title);
                    } else if (type == ("WMS").toLowerCase()) {
                    }
                }));
            },

            _addHomeButton: function () {
                this.home = new HomeButton({
                    map: this.map
                }, domConstruct.create("div", {}, null));
                return this.home;
            },

            _addFeatureLayer: function (map, id, url, title) {
                var _self = this;
                var layerInfo = [];
                var lastIndex = url.lastIndexOf('/');
                var dynamicLayerId = url.substr(lastIndex + 1);
                if (isNaN(dynamicLayerId) || dynamicLayerId == "") {
                    if (isNaN(dynamicLayerId)) {
                        var dynamicLayer = url + "/";
                        _self._fetchFeaturelayerDetails(map, id, dynamicLayer, layerInfo);
                    } else if (dynamicLayerId == "") {
                        var dynamicLayer = url;
                        _self._fetchFeaturelayerDetails(map, id, dynamicLayer, layerInfo);
                    }
                } else {
                    this._addFeaturelayerToMap(map, id, url, title, layerInfo, true);
                }
            },

            _fetchFeaturelayerDetails: function (map, id, url, layerInfo) {
                var _self = this;
                esri.request({
                    url: url + "?f=json",
                    load: function (data) {
                        for (var p = 0; p < data.layers.length; p++) {
                            var lyr = url + data.layers[p].id;
                            _self._addFeaturelayerToMap(map, data.layers[p].id, lyr, data.layers[p].name, layerInfo, false);
                        }
                        _self.createLegend(layerInfo, map, _self.legendDiv);
                        _self._setExtentForLayer(map, url, true);
                        _self._createLayerInfoContent(_self, layerInfo);
                    },
                    error: function (err) {
                        alert(err.message);
                    }
                });
            },

            _addFeaturelayerToMap: function (map, id, url, title, layerInfo, layerFlag) {
                var infoTemplate = new esri.InfoTemplate("Attributes", "${*}");
                var featureLayer = new esri.layers.FeatureLayer(url, {
                    mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
                    id: id,
                    infoTemplate: infoTemplate,
                    outFields: ["*"]
                });

                map.addLayer(featureLayer);
                map.getLayer(featureLayer.id).show();

                layerInfo.push({
                    layer: featureLayer,
                    title: title
                });
                if (layerFlag) {
                    this.createLegend(layerInfo, map, this.legendDiv);
                    this._setExtentForLayer(map, url, false);
                    this._createLayerInfoContent(this, layerInfo);
                }
                topic.publish("hideProgressIndicator");
            },

            _addCachedAndDynamicService: function (map, id, url, title) {
                var _self = this;
                var url1 = url + "?f=json";
                var defObj = new Deferred();
                defObj.then(function (data) {
                    if (data) {
                        if (data.singleFusedMapCache) {
                            var overlaymap = new esri.layers.ArcGISTiledMapServiceLayer(url, {
                                "id": id
                            });
                            map.addLayer(overlaymap);
                            var layerInfo = [];
                            layerInfo.push({
                                layer: overlaymap,
                                title: title
                            });
                            _self.createLegend(layerInfo, map, _self.legendDiv);
                            _self._setExtentForLayer(map, url, true);
                            _self._createLayerInfoContent(_self, layerInfo);
                        } else {
                            var imageParameters = new esri.layers.ImageParameters();
                            var overlaymap = new esri.layers.ArcGISDynamicMapServiceLayer(url, {
                                "imageParameters": imageParameters,
                                "id": id
                            });
                            map.addLayer(overlaymap);
                            var layerInfo = [];
                            layerInfo.push({
                                layer: overlaymap,
                                title: title
                            });
                            _self.createLegend(layerInfo, map, _self.legendDiv);
                            _self._setExtentForLayer(map, url, true);
                            _self._createLayerInfoContent(_self, layerInfo);
                        }
                    } else {
                        alert(nls.errorMessages.layerNotFound);
                    }
                    topic.publish("hideProgressIndicator");
                }, function (err) {
                    alert(err.message);
                    topic.publish("hideProgressIndicator");
                });
                topic.publish("queryItemInfo", url1, defObj);
            },

            _createLayerInfoContent: function (_self, layerInfo) {
                var layerContainer = domConstruct.create("div", {}, _self.layerDetails);
                for (var i = 0; i < layerInfo.length; i++) {
                    var self = this;
                    this.layerContent = domConstruct.create("div", { "class": "esriCTLayerInfo breakWord", "innerHTML": layerInfo[i].title }, layerContainer);
                    domAttr.set(this.layerContent, "index", i);
                    _self.own(on(this.layerContent, "click", function () {
                        var index = domAttr.get(this, "index");
                        window.open(layerInfo[index].layer.url);
                    }));
                }
            },

            _createItemDescriptionContent: function (data) {
                domAttr.set(this.layerDescription, "innerHTML", (data.description) ? (data.description) : (nls.showNullValue));
            },

            _setExtentForLayer: function (map, url, type) {
                var _self = this;
                var url1 = url + "?f=json";
                esri.request({
                    url: url1,
                    load: function (data) {
                        geometryService = new esri.tasks.GeometryService(dojo.configData.ApplicationSettings.geometryService);
                        var layerExtent;
                        if (type) {
                            layerExtent = _self._createExtent(data.fullExtent);
                        } else {
                            layerExtent = _self._createExtent(data.extent);
                        }

                        if (layerExtent.spatialReference.wkid == map.spatialReference.wkid) {
                            map.setExtent(layerExtent);
                            _self.home.extent = layerExtent;
                            _self.defaultExtent = map.extent;
                        } else {
                            var project = geometryService.project([layerExtent], map.spatialReference);
                            project.then(Success, Failure);
                        }
                    },
                    error: function (err) {
                        alert(err.message);
                    }
                });
            },

            _createExtent: function (ext) {
                var projExtent = new esri.geometry.Extent({
                    "xmin": ext.xmin,
                    "ymin": ext.ymin,
                    "xmax": ext.xmax,
                    "ymax": ext.ymax,
                    "spatialReference": {
                        "wkid": ext.spatialReference.wkid ? ext.spatialReference.wkid : ext.spatialReference.wkt
                    }
                });
                return projExtent;
            }
        });
    });