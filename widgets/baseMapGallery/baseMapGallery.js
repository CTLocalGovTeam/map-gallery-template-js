﻿/*global dojo,define,document */
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
    "dojo/dom-style",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/dom-attr",
    "dojo/on",
    "dojo/dom",
    "dojo/dom-class",
    "dojo/dom-geometry",
    "dojo/string",
    "dojo/_base/html",
    "dojo/text!./templates/baseMapGalleryTemplate.html",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/i18n!nls/localizedStrings",
    "dojo/query",
    "dojo/topic"
  ],
function (declare, domConstruct, domStyle, lang, array, domAttr, on, dom, domClass, domGeom, string, html, template, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, nls, query, topic) {

    //========================================================================================================================//

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,
        nls: nls,

        postCreate: function () {
            var baseMapUrl = 0;
            var baseMapUrlCount = 0;
            var baseMapLayers = dojo.configData.BaseMapLayers;
            for (var i = 0; i < baseMapLayers.length; i++) {
                if (baseMapLayers[i].MapURL) {
                    this.map.addLayer(this._createBaseMapLayer(baseMapLayers[i].MapURL, baseMapLayers[i].Key, (i === 0) ? true : false));
                    if (baseMapUrlCount == 0) {
                        baseMapUrl = i;
                    }
                    baseMapUrlCount++;
                }
            }
            var basemapContainer = domConstruct.create("div", {}, query(".esriCTRightPanelMap")[0]);
            basemapContainer.appendChild(this.esriCTDivLayerContainer);
            this.layerList.appendChild(this._createBaseMapElement(baseMapUrl, baseMapUrlCount));

            if (baseMapUrlCount >= 1) {
                var layer = this.map.getLayer(baseMapLayers[baseMapUrl].Key);
                layer.show();

            }
        },

        _createBaseMapLayer: function (layerURL, layerId, isVisible) {
            var layer = new esri.layers.ArcGISTiledMapServiceLayer(layerURL, { id: layerId, visible: isVisible });
            return layer;

        },

        _createBaseMapElement: function (baseMapUrl, baseMapUrlCount) {
            var presentThumbNail;
            var divContainer = domConstruct.create("div", { "class": "esriCTbaseMapContainerNode" });
            var imgThumbnail = domConstruct.create("img", { "class": "esriCTBasemapThumbnail", "src": dojo.configData.BaseMapLayers[baseMapUrl + 1].ThumbnailSource }, null);
            var presentBaseMap = baseMapUrl + 1;
            presentThumbNail = baseMapUrl + 2;
            on(imgThumbnail, "click", lang.hitch(this, function () {
                imgThumbnail.src = dojo.configData.BaseMapLayers[presentThumbNail].ThumbnailSource;
                this._changeBaseMap(presentBaseMap);
                if (baseMapUrlCount - 1 == presentThumbNail) {
                    presentThumbNail = baseMapUrl;
                }
                else {
                    presentThumbNail++;
                }
                if (baseMapUrlCount - 1 == presentBaseMap) {
                    presentBaseMap = baseMapUrl;
                } else {
                    presentBaseMap++;
                }

            }));
            divContainer.appendChild(imgThumbnail);
            return divContainer;
        },

        _changeBaseMap: function (spanControl) {
            this._hideMapLayers();
            var layer = this.map.getLayer(dojo.configData.BaseMapLayers[spanControl].Key);
            layer.show();
        },

        _hideMapLayers: function () {
            for (var i = 0; i < dojo.configData.BaseMapLayers.length; i++) {
                if (dojo.configData.BaseMapLayers[i].MapURL) {
                    var layer = this.map.getLayer(dojo.configData.BaseMapLayers[i].Key);
                    if (layer) {
                        layer.hide();
                    }
                }
            }
        }
    });
});