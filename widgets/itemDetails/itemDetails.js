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
        "esri/dijit/Popup"
    ],
    function (declare, domConstruct, lang, array, domAttr, dom, template, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, nls, query, domClass, on, Deferred, number, topic, utils, legend, esriMap, esriBasemapGallery, esriPopUp) {
        return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
            templateString: template,
            nls: nls,
            postCreate: function () {
                domClass.add(query(".esriCTContentdiv")[0], "displayNoneAll");
                var applicationHeaderDiv = dom.byId("esriCTParentDivContainer");
                this.itemIcon.src = this.data.thumbnailUrl;
                var itemDetailsPanel = domConstruct.place(this.itemDetailsLeftPanel, applicationHeaderDiv);
                domAttr.set(this.itemTitle, "innerHTML", this.data.title);
                domAttr.set(this.numberOfViews, "innerHTML", (this.data.numViews) ? ("(" + number.format(parseInt(this.data.numViews, 10)) + ")") : (nls.showNullValue));
                this._createMapLayers(this.data);
            },

            _createMapLayers: function (data) {
                mapId = data.id;
                var _self = this;
                if (mapId) {
                    if (data) {
                        if (data.type == "KML") {
                            _self.addLayerToMap(mapId, data.url, data.title, data.type);
                        } else if (data.type == "Web Map") {
                            _self.addWebMap(mapId);
                        } else if (data.type == "Feature Service") {
                            var layerType = data.url.substring(((data.url.lastIndexOf("/")) + 1), (data.url.length));
                            if (!isNaN(layerType)) {
                                _self.addLayerToMap(mapId, data.url, data.title, data.type);
                            } else {
                                var url1 = data.url + "?f=json";
                                esri.request({
                                    url: url1,
                                    handleAs: "json",
                                    load: function (jsondata) {
                                        if (jsondata.layers.length > 0) {
                                            for (var j = 0; j < jsondata.layers.length; j++) {
                                                var layerUrl = data.url + "/" + jsondata.layers[j].id;
                                                _self.addLayerToMap(mapId, layerUrl, data.title, data.type);
                                            }
                                        }
                                    },
                                    error: function (err) {
                                        alert(err.message);
                                    }
                                });
                                                            }
                        } else if (data.type == "Map Service") {
                            var layerType = data.url.substring(((data.url.lastIndexOf("/")) + 1), (data.url.length));
                            if (!isNaN(layerType)) {
                                _self.addLayerToMap(mapId, data.url, data.title, "Feature Service");
                            } else {
                                _self.addLayerToMap(mapId, data.url, data.title, data.type);
                            }
                        } else if (data.type == "WMS") {
                            _self.addLayerToMap(mapId, data.url, data.title, data.type, data);
                        }
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
                    _self.createLegend(layerInfo, response.map, _self.legendDiv);
                    domAttr.set(_self.layerDetails, "innerHTML", "");
                }, function (err) {
                    alert(err.message);
                });
            },

            addLayerToMap: function (mapId, url, title, type, data) {
                var _self = this;
                var popup = new esriPopUp({
                    titleInBody: false
                }, domConstruct.create("div"));
                var map = new esriMap(this.itemMap, {
                    center: [19.461, 53.914],
                    zoom: 5,
                    infoWindow: popup
                });

                dojo.connect(map, "onLoad", function () {
                    if (type == "KML") {
                        _self._addKMLLayer(map, mapId, url, title);
                    } else if (type == "Feature Service") {
                        _self._addFeatureLayer(map, mapId, url, title);
                    } else if (type == "Map Service") {
                        _self._addCachedAndDynamicService(map, mapId, url, title);
                    } else if (data.type == "WMS") {
                    }
                });
            },

            _addKMLLayer: function (map, mapId, url, title) {
                var kml = new esri.layers.KMLLayer(url);
                kml.id = mapId;
                map.addLayer(kml);
                var layerInfo = [];
                layerInfo.push({
                    layer: kml,
                    title: title
                });
                this.createLegend(layerInfo, map, this.legendDiv);
            },

            _addFeatureLayer: function (map, id, url, title) {
                var infoTemplate = new esri.InfoTemplate("Attributes", "${*}");
                var featureLayer = new esri.layers.FeatureLayer(url, {
                    mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
                    id: id,
                    infoTemplate: infoTemplate,
                    outFields: ["*"]
                });

                map.addLayer(featureLayer);
                map.getLayer(featureLayer.id).show();
                var layerInfo = [];
                layerInfo.push({
                    layer: featureLayer,
                    title: title
                });
                this.createLegend(layerInfo, map, this.legendDiv);
                this._setExtentForLayer(map, url);
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
                            _self._setExtentForLayer(map, url, true)
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
                            _self._setExtentForLayer(map, url, true)
                        }
                    }
                    else {
                        alert(nls.errorMessages.layerNotFound);
                    }
                }, function (err) {
                    alert(err.message);
                });
                topic.publish("queryItemInfo", url1, defObj);
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
                var projExtent;
                if (ext.spatialReference.wkid) {
                    projExtent = new esri.geometry.Extent({
                        "xmin": ext.xmin,
                        "ymin": ext.ymin,
                        "xmax": ext.xmax,
                        "ymax": ext.ymax,
                        "spatialReference": {
                            "wkid": ext.spatialReference.wkid
                        }
                    });
                } else {
                    projExtent = new esri.geometry.Extent({
                        "xmin": ext.xmin,
                        "ymin": ext.ymin,
                        "xmax": ext.xmax,
                        "ymax": ext.ymax,
                        "spatialReference": {
                            "wkid": ext.spatialReference.wkt
                        }
                    });
                }
                return projExtent;
            }
        });
    });