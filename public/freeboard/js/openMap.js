(function()
{
    freeboard.loadWidgetPlugin({

        type_name   : "openMap_with_Markers",
        display_name: "openMap with Markers",
        description : "Some sort of description <strong>openMap with Markers</strong>",

        external_scripts: [
            "js/leaflet.js", "js/Leaflet.MakiMarkers.js", "https://www.mapquestapi.com/sdk/leaflet/v2.s/mq-map.js?key=PUT_KEY_HERE"
        ],
 
        fill_size   : true,
        settings    : [
            {
                name: "marker_latlon_0",
                display_name: "Marker 1 Latitude and Longitude",
                type: "calculated",
                description: "You must enter 2 values. The first value will be latitude of the marker, the second will be longitude",
                multi_input: "true"
            },
            {
                name: "color_value_0",
                display_name: "Marker 1 Color",
                type: "calculated",
                description: "If one of the colors equal to the string \"1\" it will be red, otherwise - green",
                multi_input: "true"
            },
            {
                name: "marker_text_0",
                display_name: "Marker 1 Popup text",
                type: "text",
                description: "If not blank, the marker will have a popup with the that text"
            },
            {
                name: "marker_latlon_1",
                display_name: "Marker 2 Latitude and Longitude",
                type: "calculated",
                description: "You must enter 2 values. The first value will be latitude of the marker, the second will be longitude",
                multi_input: "true"
            },
            {
                name: "color_value_1",
                display_name: "Marker 2 Color",
                type: "calculated",
                description: "If one of the colors equal to the string \"1\" it will be red, otherwise - green",
                multi_input: "true"
            },
            {
                name: "marker_text_1",
                display_name: "Marker 2 Popup text",
                type: "text",
                description: "If not blank, the marker will have a popup with the that text"
            },
            {
                name: "marker_latlon_2",
                display_name: "Marker 3 Latitude and Longitude",
                type: "calculated",
                description: "You must enter 2 values. The first value will be latitude of the marker, the second will be longitude",
                multi_input: "true"
            },
            {
                name: "color_value_2",
                display_name: "Marker 3 Color",
                type: "calculated",
                description: "If one of the colors equal to the string \"1\" it will be red, otherwise - green",
                multi_input: "true"
            },
            {
                name: "marker_text_2",
                display_name: "Marker 3 Popup text",
                type: "text",
                description: "If not blank, the marker will have a popup with the that text"
            },
            {
                name        : "center_lat",
                display_name: "Center Lat",
                type        : "text",

            },
            {
                name        : "center_lon",
                display_name: "Center Lon",
                type        : "text"
            },
            {
                name        : "map_zoom",
                display_name: "Map Zoom",
                type        : "text"
            },
            {
                name    : "popup_opened",
                display_name: "Auto Open Popups",
                type        : "boolean"
            }
        ],

        
        newInstance   : function(settings, newInstanceCallback)
        {
            newInstanceCallback(new openMapPlugin(settings));
        }
    });



    var openMapPlugin = function(settings)
    {
        // CONSTANTS 
        var TEMP_MARKER_COLOR = "e3db1f";
        var ATTRIBUTION = 'Data, imagery and map information provided by <a href="http://open.mapquest.co.uk" target="_blank">MapQuest</a>,' +
                          '<a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> and contributors,' +
                          '<a href="http://creativecommons.org/licenses/by-sa/2.0/" target="_blank">CC-BY-SA</a>';
        //var TILE_LAYER =     'http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png'
        
        var self = this;
        var currentSettings = settings;
        
        var overlayMarkers = [];
        var markers = [];
        var iconsColor = [TEMP_MARKER_COLOR, TEMP_MARKER_COLOR, TEMP_MARKER_COLOR];

        var mapName = function() {
            for (i = 0 ; i < Number.MAX_VALUE ; i++) {
                if (document.getElementById("_main_" + i) == null) {
                    return "main_" + i;
                }
            }
        }();
        
        var mapElement = $("<div id='" + mapName + "' style='width: 100%; height: 100%'></div>");
                
        var mapLayer = MQ.satelliteLayer(), map;

        var updateMap = function() {
            map = L.map(mapName, {
                layers: mapLayer,
                center: [ currentSettings.center_lat, currentSettings.center_lon ],
                zoom: currentSettings.map_zoom
            });

            // L.tileLayer(mapLayer, {
            //     subdomains: ['otile1','otile2','otile3','otile4'],
            //     maxZoom: 18,
            //     attribution: ATTRIBUTION 
            // }).addTo(map);
            

            for (i = 0 ; i<3 ; i++) {
                if (!isNaN(currentSettings["marker_latlon_" + i])) {
                    markers.push(currentSettings["marker_latlon_" + i]);
                }
            }

            //clean the map
            while (overlayMarkers.length != 0) {
                map.removeLayer(overlayMarkers[overlayMarkers.length - 1]);
                overlayMarkers.pop();
            }


            for (index = 0 ; index<markers.length ; index++) {
                if (typeof markers[index] == "object" && !isNaN(markers[index][0])) { 
                    var icon = L.MakiMarkers.icon({icon: null, color: iconsColor[index], size: "l"});
                    overlayMarkers.push(L.marker(markers[index], {icon: icon}));
                    map.addLayer(overlayMarkers[overlayMarkers.length -1]);
                    
                    // adding popup if needed
                    if (currentSettings["marker_text_" + index] != "") { 
                        if (currentSettings.popup_opened) {
                            overlayMarkers[overlayMarkers.length -1]
                                .bindPopup(currentSettings["marker_text_" + index]).openPopup();
                        } else {
                            overlayMarkers[overlayMarkers.length -1]
                                .bindPopup(currentSettings["marker_text_" + index]);
                        }
                    }

                }
            }
        }    
 
        self.render = function(containerElement)
        {
            // notifing that we are using the mapName
            $(containerElement).append("<div id='_"+mapName+"' style='width: 0px; height: 0px'></div>");
            
            setTimeout(function(){
                $(containerElement).append(mapElement);
                updateMap();
            }, 800);
        }

 
        self.getHeight = function()
        {
            return 4;
        }
 
        self.onSettingsChanged = function(newSettings)
        {
            currentSettings = newSettings;
            
            map.remove();
            updateMap(currentSettings);
        }

 
        self.onCalculatedValueChanged = function(settingName, newValue) {
            var settings = settingName.split("_");
            var marker_idx = settings.pop();
            var setting_type = settings.pop();


            switch (setting_type) {
                case "value":
                    if (newValue = []) { break;}
                    if (typeof overlayMarkers[marker_idx] ==  "undefined") { return ; }
                    iconsColor[marker_idx] = ($.inArray("1",newValue) != -1 ? "b72121" : "21b721");
                    var icon = L.MakiMarkers.icon({icon: null, color: iconsColor[marker_idx], size: "l"});
                    overlayMarkers[marker_idx].setIcon(icon); 
                    break;
                case "latlon":
                    //clean the map
                    if (typeof overlayMarkers[marker_idx] !=  "undefined") {
                        map.removeLayer(overlayMarkers[marker_idx]);
                    }
                    
                    markers[marker_idx] = newValue;
                    var icon = L.MakiMarkers.icon({icon: null, color: iconsColor[marker_idx], size: "l"});
                    if (typeof map != "undefined") {
                        overlayMarkers[marker_idx] = L.marker(newValue, {icon: icon});
                        map.addLayer(overlayMarkers[marker_idx]);
                        // adding popup if needed
                        if (currentSettings["marker_text_" + marker_idx] != "") { 
                            if (currentSettings.popup_opened) {
                                overlayMarkers[overlayMarkers.length -1]
                                    .bindPopup(currentSettings["marker_text_" + marker_idx]).openPopup();
                            } else {
                                overlayMarkers[overlayMarkers.length -1]
                                    .bindPopup(currentSettings["marker_text_" + marker_idx]);
                            }
                        }
                    }
                    break;
            }

        }

        self.onDispose = function()
        {
        }
    }
}());
