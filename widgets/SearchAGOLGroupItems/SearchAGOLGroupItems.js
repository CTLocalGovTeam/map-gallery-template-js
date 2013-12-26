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
        "dojo/dom",
        "dijit/_WidgetBase",
        "dojo/i18n!nls/localizedStrings",
        "esri/arcgis/Portal",
        "dojo/_base/connect",
        "dojo/Deferred",
        "esri/request",
        "widgets/leftPanel/leftPanel",
        "dojo/query",
        "dojo/topic",
        "dojo/on",
        "dojo/dom-class",
        "dojo/dom-attr"
    ],
    function (declare, lang, dom, _WidgetBase, nls, portal, connect, Deferred, esriRequest, leftPanelContent, query, topic, on, domClass, domAttr) {

        //========================================================================================================================//

        return declare([_WidgetBase], {
            nls: nls,
            postCreate: function () {
                var _self = this;
                _self.createPortal().then(function () {
                    _self.queryGroup().then(function () {
                        topic.subscribe("queryGroupItem", dojo.hitch(_self._portal, _self.queryGroupForItems));
                        topic.subscribe("queryItemInfo", dojo.hitch(_self._portal, _self.queryItemInfo));

                        topic.subscribe("signIn", lang.hitch(_self, _self.portalSignIn));
                        var leftPanelObj = new leftPanelCollection();
                    });
                });
            },

            createPortal: function () {
                var def = new Deferred();
                // create portal
                this._portal = new portal.Portal(dojo.configData.ApplicationSettings.portalURL);
                // portal loaded
                this.own(on(this._portal, "Load", function () {
                    def.resolve();
                }));
                return def;
            },

            queryGroup: function () {
                var _self = this;
                var def = new Deferred();
                // query group info
                _self.queryAGOLGroupInfo({
                    // Settings
                    id_group: dojo.configData.ApplicationSettings.group
                }).then(function (data) {
                    if (data.results.length > 0) {
                        // set group content
                        _self.setGroupContent(data.results[0]);
                        def.resolve();
                    } else {
                        alert(nls.errorMessages.emptyGroup);
                        def.resolve();
                    }
                });
                return def;
            },

            setGroupContent: function (groupInfo) {
                // set group id
                if (!dojo.configData.group) {
                    dojo.configData.group = groupInfo.id;
                }
                // Set owner
                if (!dojo.configData.groupOwner) {
                    dojo.configData.groupOwner = groupInfo.owner || "";
                }
                // Set group title
                if (!dojo.configData.groupName) {
                    dojo.configData.groupName = groupInfo.title || "";
                }
                // Set group title
                if (!dojo.configData.groupTitle) {
                    dojo.configData.groupTitle = groupInfo.title || "";
                }
                // Set home snippet
                if (!dojo.configData.homeSnippet) {
                    dojo.configData.homeSnippet = groupInfo.snippet || "";
                }
                // Set home side content
                if (!dojo.configData.homeSideContent) {
                    dojo.configData.homeSideContent = groupInfo.description || "";
                }
                // set footer image
                if (!dojo.configData.groupIcon) {
                    dojo.configData.groupIcon = groupInfo.thumbnailUrl || dojoConfig.baseURL + "/themes/images/group-no-image.png";
                }
            },
            /*------------------------------------*/
            // query arcgis group info
            /*------------------------------------*/
            queryAGOLGroupInfo: function (obj) {
                var _self = this;
                var def = new Deferred();
                // default values
                var settings = {
                    // set group id for web maps
                    id_group: '',
                    // format
                    dataType: 'json'
                };
                // If options exist, lets merge them with our default settings
                if (obj) {
                    lang.mixin(settings, obj);
                }
                setTimeout(function () {
                    if (query(".dijitDialogPaneContentArea")[0]) {
                        query(".dijitDialogPaneContentArea")[0].childNodes[0].innerHTML = nls.signInDialogText;
                    }
                }, 1000);
                topic.publish("hideProgressIndicator");
                // first, request the group to see if it's public or private
                esriRequest({
                    // group rest URL
                    url: dojo.configData.ApplicationSettings.portalURL + '/sharing/rest/community/groups/' + settings.id_group,
                    content: {
                        'f': settings.dataType
                    },
                    callbackParamName: 'callback',
                    load: function (response) {
                        // sign-in flag
                        //clearTimeout(stagedSearch);
                        var signInRequired = (response.access !== 'public') ? true : false;
                        // if sign-in is required
                        if (signInRequired) {
                            _self.portalSignIn().then(function () {
                                // query
                                var q = 'id:"' + settings.id_group + '"';
                                var params = {
                                    q: q,
                                    v: dojo.configData.arcgisRestVersion,
                                    f: settings.dataType
                                };
                                _self._portal.queryGroups(params).then(function (data) {
                                    def.resolve(data);
                                });
                            });
                        } else {
                            // query
                            var q = 'id:"' + settings.id_group + '"';
                            var params = {
                                q: q,
                                v: 1,
                                f: settings.dataType
                            };
                            _self._portal.queryGroups(params).then(function (data) {
                                def.resolve(data);
                            });
                        }
                    },
                    error: function (response) {
                        var error = response.message;
                        alert(error);
                        def.resolve();
                    }
                });
                return def;
            },

            queryGroupForItems: function (queryString, sortfields, sortorder, deferedObj, NextQuery) {
                var params;
                if (!NextQuery) {
                    params = {
                        q: queryString,
                        num: 100, //should be in number format ex: 100
                        sortField: sortfields, //should be in string format with comma separated values ex: "created"
                        sortOrder: sortorder //should be in string format ex: desc
                    }
                }
                else {
                    params = NextQuery;
                }
                this.queryItems(params).then(function (data) {
                    deferedObj.resolve(data);
                });
                return deferedObj;
            },

            queryItemInfo: function (itemURL, defObj) {
                esriRequest({
                    url: itemURL,
                    callbackParamName: "callback",
                    timeout:20000,
                    load: function (data) {
                        defObj.resolve(data);
                    },
                    error: function (e) {
                        defObj.resolve();
                        topic.publish("hideProgressIndicator");
                    }
                });
                return defObj;
            },

            portalSignIn: function (def) {
                var _self = this;
                if (!def) {
                    def = new Deferred();
                }
                if (query(".signin")[0].innerHTML == nls.signInText) {
                    _self._portal.signIn().then(function (loggedInUser) {
                        if (loggedInUser) {
                            if (!dojo.configData.ApplicationSettings.token) {
                                dojo.configData.ApplicationSettings.token = loggedInUser.credential.token;
                            }
                            domAttr.set(query(".signin")[0], "innerHTML", nls.signOutText);
                            domClass.replace(query(".esriCTSignInIcon")[0], "icon-logout", "icon-login");
                            _self.globalUser = loggedInUser;
                            def.resolve();
                        }
                    });
                }
                else {
                    _self._portal.signOut().then(function (loggedInUser) {
                        if (dojo.configData.ApplicationSettings.token) {
                            dojo.configData.ApplicationSettings.token = null;
                        }
                        domAttr.set(query(".signin")[0], "innerHTML", nls.signInText);
                        domClass.replace(query(".esriCTSignInIcon")[0], "icon-login", "icon-logout");
                        _self.globalUser = null;
                        var queryString = 'group:("' + dojo.configData.ApplicationSettings.group + '")' + ' AND (access: ("' + "public" + '"))';
                        topic.publish("queryGroupItems", null, queryString);
                        def.resolve();
                    });
                }
                setTimeout(function () {
                    if (query(".dijitDialogPaneContentArea")[0]) {
                        query(".dijitDialogPaneContentArea")[0].childNodes[0].innerHTML = nls.signInDialogText;
                    }
                }, 1000);
                return def;
            }
        });
    });