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
        "dojo/text!./templates/layout.html",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dojo/i18n!nls/localizedStrings",
        "dojo/_base/lang",
        "dojo/Deferred",
        "dojo/dom-class",
        "dojo/dom-style",
        "dojo/topic",
        "dojo/query",
        "dojo/dom-attr",
        "dojo/dom-geometry",
        "dojo/on",
        "dojo/dom-construct"
    ],
    function (declare, template, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, nls, lang, Deferred, domClass, domStyle, topic, query, domAttr, domGeom, on, domConstruct) {

        //========================================================================================================================//

        return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
            templateString: template,
            nls: nls,

            postCreate: function () {
                domAttr.set(this.layoutLabel, "innerHTML", nls.layoutText);
                if (dojo.configData.AGOLItemSettings.defaultLayout.toLowerCase() == "list") {
                    domClass.add(this.layoutTitle, "icon-grid");
                } else {
                    domClass.add(this.layoutTitle, "icon-list");
                }
                this.own(on(this.toggleLayout, "click", lang.hitch(this, function () {
                    topic.publish("showProgressIndicator");
                    if (!dojo.gridView) {
                        dojo.gridView = true;
                        domAttr.set(this.layoutTitle, "title", nls.listViewTitle);
                        domClass.replace(this.layoutTitle, "icon-list", "icon-grid");
                    } else {
                        dojo.gridView = false;
                        domAttr.set(this.layoutTitle, "title", nls.gridViewTitle);
                        domClass.replace(this.layoutTitle, "icon-grid", "icon-list");
                    }
                    topic.publish("createPods", dojo.results, true);
                    topic.publish("hideProgressIndicator");
                })));
            }
        });
    });