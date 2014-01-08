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
        "dojo/_base/lang",
        "dojo/on",
        "dojo/text!./templates/settings.html",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dojo/query",
        "dojo/dom-class",
        "dojo/dom-construct"
    ],
    function (declare, lang, on, template, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, query, domClass, domConstruct) {

        //========================================================================================================================//

        return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
            templateString: template,
            postCreate: function () {
                this.own(on(this.settingsIcon, "click", lang.hitch(this, function () {
                    if ((query(".esriCTSortByContainer")[0].children.length <= 0) && (query(".esriCTSortByTitle")[0])) {
                        domConstruct.place(query(".esriCTSortByTitle")[0], query(".esriCTSortByContainer")[0]);
                    }
                    this._slideLeftPanel();
                })));
            },

            _slideLeftPanel: function () {
                if (query(".esriCTMenuTab")[0]) {
                    domClass.toggle(query(".esriCTMenuTab")[0], "esriCTShiftRight");
                }
                if (query(".esriCTInnerLeftPanelTop")[0]) {
                    domClass.toggle(query(".esriCTInnerLeftPanelTop")[0], "esriCTShiftRight");
                }
                if (query(".esriCTInnerLeftPanelBottom")[0]) {
                    domClass.remove(query(".esriCTInnerLeftPanelBottom")[0], "displayNone");
                    domClass.toggle(query(".esriCTInnerLeftPanelBottom")[0], "esriCTInnerLeftPanelBottomShift");
                }
                if (query(".esriCTSearchIcon")[0]) {
                    domClass.toggle(query(".esriCTSearchIcon")[0], "displayNone");
                    domClass.toggle(query(".esriCTSearchItemInput")[0], "displayNone");
                }
                if (query(".esriCTInfoIcon")[0]) {
                    domClass.toggle(query(".esriCTInfoIcon")[0], "displayNone");
                }
                if (query(".esriCTRightPanel")[0]) {
                    domClass.toggle(query(".esriCTRightPanel")[0], "esriCTShiftRight");
                    domClass.toggle(query(".esriCTRightPanel")[0], "esriCTShiftRightPanel");
                }

                if (query(".esriCTMenuTabLeft")[0]) {
                    if (domClass.contains(query(".esriCTMenuTabLeft")[0], "displayBlock")) {
                        domClass.replace(query(".esriCTMenuTabLeft")[0], "displayNone", "displayBlock");
                        domClass.replace(query(".esriCTSignIn")[0], "displayNone", "displayBlock");
                        domClass.add(query(".esriCTInnerRightPanel")[0], "displayNone");
                    } else {
                        domClass.replace(query(".esriCTMenuTabLeft")[0], "displayBlock", "displayNone");
                        domClass.replace(query(".esriCTSignIn")[0], "displayBlock", "displayNone");
                        domClass.remove(query(".esriCTInnerRightPanel")[0], "displayNone");
                    }
                }
            }
        });
    });