﻿{
    "configurationSettings": [
        {
            "category": "<b>General Settings</b>",
            "fields": [
                {
                    "type": "group",
                    "label": "Select a group"
                },
                {
                    "type": "string",
                    "fieldName": "applicationName",
                    "label": "Application name:",
                    "tooltip": "Application name.",
                    "placeHolder": "My Maps"
                },
                {
                    "type": "paragraph",
                    "value": "The text above will set the application title."
                },
                {
                    "type": "string",
                    "fieldName": "applicationIcon",
                    "label": "Application logo:",
                    "tooltip": "URL for the application logo image.",
                    "placeHolder": "/themes/images/logo.png"
                },
                {
                    "type": "paragraph",
                    "value": "Specify the URL of the image to be used as application logo. It will be displayed leftmost on title bar."
                },
                {
                    "type": "string",
                    "fieldName": "applicationFavicon",
                    "label": "Application favicon:",
                    "tooltip": "URL for the favicon logo image.",
                    "placeHolder": "/themes/images/favicon.ico"
                },
                {
                    "type": "paragraph",
                    "value": "Specify the URL for shortcut icon, web site icon, tab icon or bookmark icon."
                },
                {
                    "type": "string",
                    "fieldName": "customLogoUrl",
                    "label": "Custom logo URL:",
                    "tooltip": "URL for the custom logo image.",
                    "placeHolder": "/themes/images/logo.png"
                },
                {
                    "type": "paragraph",
                    "value": "Set custom map logo path."
                }
            ]
        },
        {
            "category": "<b>Application Settings</b>",
            "fields": [
                {
                    "type": "string",
                    "fieldName": "itemSearchDefaultValue",
                    "label": "Item search default value:",
                    "tooltip": "Default value to search.",
                    "placeHolder": "Web Map"
                },
                {
                    "type": "paragraph",
                    "value": "Above text will be shown in text box for item search."
                },
                {
                    "type": "string",
                    "fieldName": "theme",
                    "label": "Color theme:",
                    "tooltip": "Color theme to use.",
                    "options": [
                        {
                            "label": "Blue",
                            "value": "blueTheme"
                        },
                        {
                            "label": "Red",
                            "value": "redTheme"
                        },
                        {
                            "label": "Green",
                            "value": "greenTheme"
                        }
                    ]
                },
                {
                    "type": "paragraph",
                    "value": "Set the application theme."
                },
                {
                    "type": "boolean",
                    "fieldName": "showCategoriesTagCloud",
                    "label": "Show category tag cloud",
                    "tooltip": "Enable or disable category tag cloud."
                },
                {
                    "type": "paragraph",
                    "value": "Check to view category tag cloud. Uncheck to hide category tag cloud."
                },
                {
                    "type": "boolean",
                    "fieldName": "showGeographiesTagCloud",
                    "label": "Show geography tag cloud",
                    "tooltip": "Enable or disable geography tag cloud."
                },
                {
                    "type": "paragraph",
                    "value": "Check to view geography tag cloud. Uncheck to hide geography tag cloud."
                },
                {
                    "type": "string",
                    "fieldName": "geographiesTagText",
                    "label": "Geography tag text:",
                    "tooltip": "Search text to search tags in geography tag cloud.",
                    "placeHolder": ""
                },
                {
                    "type": "paragraph",
                    "value": "The above mentioned text will be used to identify geography tag. If left blank then geography tag cloud will not be displayed even if the application is configured to display geography tag cloud."
                },
                {
                    "type": "string",
                    "fieldName": "geographiesPrefixText",
                    "label": "Geography prefix Text:",
                    "tooltip": "Trim text from geography tag cloud.",
                    "placeHolder": ""
                },
                {
                    "type": "paragraph",
                    "value": "Prefix text to be removed while displaying geography tags. This tag is case sensitive. If left blank then geography tags will be displayed as is."
                },
                {
                    "type": "paragraph",
                    "value": "Tag cloud font range:"
                },
                {
                    "type": "number",
                    "fieldName": "tagCloudFontMinValue",
                    "label": "Minimum value:",
                    "tooltip": "Minimum value of the tag cloud font.",
                    "placeHolder": "15"
                },
                {
                    "type": "number",
                    "fieldName": "tagCloudFontMaxValue",
                    "label": "Maximum value:",
                    "tooltip": "Maximum value of the tag cloud font.",
                    "placeHolder": "20"
                },
                {
                    "type": "string",
                    "fieldName": "tagCloudFontUnits",
                    "label": "Units:",
                    "tooltip": "Units for text in tag cloud.",
                    "placeHolder": "px"
                },
                {
                    "type": "paragraph",
                    "value": "The above font range will be used to display the tag cloud. Maximum value will be assigned to tags with maximum score. Set the units for the text in tag cloud. UI will be distorted if font sizes have inappropriate values."
                },
                {
                    "type": "number",
                    "fieldName": "showMaxTopTags",
                    "label": "Show maximum top tags:",
                    "tooltip": "Maximum number of results to be displayed in geography and category tag clouds.",
                    "placeHolder": "10"
                },
                {
                    "type": "paragraph",
                    "value": "The number of tags displayed will be limited to above specified number if maximum number of distinct tags is more."
                },
                {
                    "type": "boolean",
                    "fieldName": "enableAutoComplete",
                    "label": "Enable autocomplete",
                    "tooltip": "Enable or disable autocomplete for search."
                },
                 {
                    "type": "paragraph",
                    "value": "This flag will enable or disable autocomplete for search."
                },
                {
                    "type": "boolean",
                    "fieldName": "displaySharingAttribute",
                    "label": "Display sharing attribute",
                    "tooltip": "Show or hide sharing attributes."
                },
                {
                    "type": "paragraph",
                    "value": "This flag will control display of sharing attributes ('ALL', 'GRP' or 'ORG') for the items. The sharing attribute will be displayed on item thumbnail."
                },
                {
                    "type": "boolean",
                    "fieldName": "useItemPage",
                    "label": "Use Item Page",
                    "tooltip": "Enable or disable item page."
                },
                {
                    "type": "paragraph",
                    "value": "Item will be loaded / downloaded if the application is configured for not using the item page. Item Page will be opened if application is configured to use item page."
                },
                {
                    "type": "string",
                    "fieldName": "portalURL",
                    "label": "Portal URL:",
                    "tooltip": "Set portal URL.",
                    "placeHolder": "http://www.arcgis.com"
                },
                {
                    "type": "paragraph",
                    "value": "Set the ArcGIS portal URL for selected group."
                },
                {
                    "type": "string",
                    "fieldName": "geometryService",
                    "label": "Geometry Service:",
                    "tooltip": "Set geometry service URL.",
                    "placeHolder": "http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer"
                },
                {
                    "type": "paragraph",
                    "value": "Set the URL for geometry service."
                }
            ]
        },
        {
            "category": "<b>ArcGIS Online Item Settings</b>",
            "fields": [
                {
                    "type": "string",
                    "fieldName": "groupDescription",
                    "label": "Group description:",
                    "stringFieldOption": "textarea",
                    "tooltip": "Displayed on the left panel of the index page.",
                    "placeHolder": ""
                },
                {
                    "type": "paragraph",
                    "value": "Specify custom group description if you do not want to display group description from ArcGIS.com."
                },
                {
                    "type": "string",
                    "fieldName": "mapTitle",
                    "label": "Map title:",
                    "tooltip": "Title of map",
                    "placeHolder": ""
                },
                {
                    "type": "paragraph",
                    "value": "If not specified, title for ArcGIS item will be displayed."
                },
                {
                    "type": "string",
                    "fieldName": "mapSnippet",
                    "label": "Map snippet:",
                    "tooltip": "Map Snippet.",
                    "placeHolder": ""
                },
                {
                    "type": "paragraph",
                    "value": "If not specified, Item Summary for ArcGIS item will be displayed."
                },
                {
                    "type": "string",
                    "fieldName": "mapItemDescription",
                    "label": "Map Item description:",
                    "tooltip": "Map Description.",
                    "placeHolder": ""
                },
                {
                    "type": "paragraph",
                    "value": "If not specified, Description for ArcGIS item will be displayed."
                },
                {
                    "type": "string",
                    "fieldName": "mapLicenseInfo",
                    "label": "License Info:",
                    "tooltip": "Map License Information.",
                    "placeHolder": ""
                },
                {
                    "type": "paragraph",
                    "value": "If not specified, License Info for ArcGIS item will be displayed."
                },
                {
                    "type": "string",
                    "fieldName": "defaultLayout",
                    "tooltip": "Whether to use grid view or list view as the default layout.",
                    "label": "Default layout:",
                    "options": [
                        {
                            "label": "Grid",
                            "value": "grid"
                        },
                        {
                            "label": "List",
                            "value": "list"
                        }
                    ]
                },
                {
                    "type": "string",
                    "fieldName": "sortField",
                    "tooltip": "Field to sort the group items by.",
                    "label": "Group sort field:",
                    "options": [
                        {
                            "label": "Modified Date",
                            "value": "modified"
                        },
                        {
                            "label": "Number of views",
                            "value": "numViews"
                        }
                    ]
                },
                {
                    "type": "string",
                    "fieldName": "sortOrder",
                    "tooltip": "Order to sort the group field.",
                    "label": "Group sort order:",
                    "options": [
                        {
                            "label": "Descending",
                            "value": "desc"
                        },
                        {
                            "label": "Ascending",
                            "value": "asc"
                        }
                    ]
                },
                {
                    "type": "string",
                    "fieldName": "mapViewer",
                    "tooltip": "Open maps with this viewer.",
                    "label": "Open maps with:",
                    "options": [
                        {
                            "label": "Simple Viewer",
                            "value": "simple"
                        },
                        {
                            "label": "Map Viewer",
                            "value": "arcgis"
                        }
                    ]
                },
                {
                    "type": "string",
                    "fieldName": "searchString",
                    "label": "Search string:",
                    "tooltip": "Default search string for group query.",
                    "placeHolder": ""
                },
                {
                    "type": "paragraph",
                    "value": "After loading the application, the items will be filtered for above mentioned search string."
                },
                {
                    "type": "string",
                    "fieldName": "searchType",
                    "label": "Search type:",
                    "tooltip": "Default search type for group query.",
                    "placeHolder": ""
                },
                {
                    "type": "paragraph",
                    "value": "After loading the application, the items will be filtered for above mentioned Item Type."
                },
                {
                    "type": "boolean",
                    "fieldName": "showBasemapGallery",
                    "label": "Show Basemap Gallery",
                    "tooltip": "Show basemap gallery on map: true or false."
                },
                {
                    "type": "paragraph",
                    "value": "If checked, basemap gallery widget will be displayed when the item of type map is opened."
                },
                {
                    "type": "boolean",
                    "fieldName": "showMapSearch",
                    "label": "Show Map Search",
                    "tooltip": "Show textbox for address search on map: true or false."
                },
                {
                    "type": "paragraph",
                    "value": "If checked, textbox for address search will be displayed on map."
                },
                {
                    "type": "boolean",
                    "fieldName": "showOverviewMap",
                    "label": "Show Overview Map",
                    "tooltip": " Show overview on map: true or false."
                },
                {
                    "type": "paragraph",
                    "value": "If checked, overview map widget will be displayed on the bottom left corner of the map."
                },
                {
                    "type": "boolean",
                    "fieldName": "showMoreInfo",
                    "label": "Show more info link",
                    "tooltip": "Displays More information links to the ArcGIS Online item page."
                },
                {
                    "type": "paragraph",
                    "value": "If checked, 'Item Details' link will be displayed to allow user to open ArcGIS Online item page."
                },
                {
                    "type": "boolean",
                    "fieldName": "showRatings",
                    "label": "Show ratings",
                    "tooltip": "Displays item ratings."
                },
                {
                    "type": "paragraph",
                    "value": "If checked, Item ratings will be displayed on item info page."
                },
                {
                    "type": "boolean",
                    "fieldName": "showViews",
                    "label": "Show Views",
                    "tooltip": "Displays view counts for maps"
                },
                {
                    "type": "paragraph",
                    "value": "If checked, number of times the item is viewed will be displayed on item info page."
                },
                {
                    "type": "boolean",
                    "fieldName": "showLicenseInfo",
                    "label": "Show constraints.",
                    "tooltip": "Displays constraints on the map page."
                },
                {
                    "type": "paragraph",
                    "value": "If checked, Item Access and Use Constraints will be displayed on the item info page."
                },
                {
                    "type": "boolean",
                    "fieldName": "showAttribution",
                    "label": "Show attribution.",
                    "tooltip": "Displays credits on the map page."
                },
                {
                    "type": "paragraph",
                    "value": "If checked, Credits are displayed on the map page."
                },
                {
                    "type": "boolean",
                    "fieldName": "showComments",
                    "label": "Show comments",
                    "tooltip": "Shows comments for items."
                },
                {
                    "type": "paragraph",
                    "value": "If checked, Comments for items will be displayed."
                }
            ]
        },
        {
            "category": "<b>Locator Settings</b>",
            "fields": [
                {
                    "type": "string",
                    "fieldName": "defaultLocatorSymbol",
                    "label": "Pushpin image:",
                    "tooltip": "URL for the pushpin image.",
                    "placeHolder": ""
                },
                {
                    "type": "paragraph",
                    "value": "Pushpin will be displayed on map for searched address. Set URL for the pushpin image."
                },
                {
                    "type": "number",
                    "fieldName": "markupSymbolWidth",
                    "tooltip": "Default Markup symbol width.",
                    "placeHolder": "",
                    "label": "Pushpin Symbol Width:"
                },
                {
                    "type": "paragraph",
                    "value": "Set the image width in pixels for pushpin image."
                },
                {
                    "type": "number",
                    "fieldName": "markupSymbolHeight",
                    "tooltip": "Default Markup symbol height.",
                    "placeHolder": "",
                    "label": "Pushpin Symbol Height:"
                },
                {
                    "type": "paragraph",
                    "value": "Set the image height in pixels for pushpin image."
                },
                {
                    "type": "number",
                    "fieldName": "zoomLevel",
                    "label": "Zoom Level:",
                    "tooltip": "Zoom level for the map.",
                    "placeHolder": ""
                },
                {
                    "type": "paragraph",
                    "value": "Map will zoom to above configured zoom level upon searching an address."
                },
                {
                    "type": "string",
                    "fieldName": "locatorDefaultAddress",
                    "label": "Default Address:",
                    "tooltip": "Default address to search.",
                    "placeHolder": ""
                },
                {
                    "type": "paragraph",
                    "value": "Set the default address to search on map."
                }
            ]
        }
    ],
    "values": {
        "group": "801cffe54b004008a8c316469c1e8326",
        "applicationName": "Map Gallery",
        "applicationIcon": "/themes/images/logo.png",
        "applicationFavicon": "/themes/images/favicon.ico",
        "customLogoUrl": "",
        "itemSearchDefaultValue": "Web Map",
        "theme": "",
        "showCategoriesTagCloud": true,
        "showGeographiesTagCloud": true,
        "geographiesTagText": "arcgis.",
        "geographiesPrefixText": "",
        "enableAutoComplete": true,
        "tagCloudFontMinValue": 15,
        "tagCloudFontMaxValue": 20,
        "tagCloudFontUnits": "px",
        "showMaxTopTags": "10",
        "displaySharingAttribute": false,
        "useItemPage": false,
        "portalURL": "http://www.arcgis.com",
        "geometryService": "http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
        "groupDescription": "",
        "mapTitle": "",
        "mapSnippet": "",
        "mapItemDescription": "",
        "mapLicenseInfo": "",
        "defaultLayout": "list",
        "sortField": "numViews",
        "sortOrder": "desc",
        "mapViewer": "",
        "searchString": "",
        "searchType": "",
        "showBasemapGallery": true,
        "showMapSearch": true,
        "showOverviewMap": false,
        "showMoreInfo": true,
        "showRatings": true,
        "showViews": true,
        "showLicenseInfo": true,
        "showAttribution": false,
        "showComments": true,
        "defaultLocatorSymbol": "/themes/images/redpushpin.png",
        "markupSymbolWidth": "35",
        "markupSymbolHeight": "35",
        "zoomLevel": "12",
        "locatorDefaultAddress": "Lake Echo Rd Tracy City TN 37387"
    }
}