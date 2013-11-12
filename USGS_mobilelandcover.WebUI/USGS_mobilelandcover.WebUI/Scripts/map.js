$(function () {

  "use strict";
  var map;

  var $linkDown = $("#info-linkDown");
  function initmap() {

    // set up the map
    map = new L.Map("map").setView(new L.LatLng(42.378327327538315, -71.10530853504315), 12);

    var landCover = new L.TileLayer.Functional(function (view) {
      var bbox = getTileExtent(view.zoom, view.tile.row, view.tile.column);
      var url = "http://gis1.usgs.gov/arcgis/rest/services/gap/GAP_Land_Cover_NVC_Class_Landuse/MapServer/export?bbox={bbox}&size=256,256&format=png24&dpi=96&transparent=true&f=image"
          .replace('{bbox}', bbox);
      return url;


    });

    // create the tile layer with correct attribution
    var osmUrl = "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    var osmAttrib = "Map data © OpenStreetMap contributors";
    var osm = new L.TileLayer(osmUrl,
      {
        layer: "osm",
        minZoom: 1,
        maxZoom: 18,
        attribution: osmAttrib
      }).addTo(map);

    var mqOrthoorthoUrl = "http://otile{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg";
    var mqOrthoAttrib = "Tiles from <a href='http://www.mapquest.com/'>MapQuest</a>, portions courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency";
    var mqOrtho = new L.TileLayer(mqOrthoorthoUrl,
      {
        layer: "mqOrtho",
        minZoom: 1,
        maxZoom: 18,
        subdomains: "1234",
        attribution: mqOrthoAttrib
      });

    $("#landcover").on("click", function () {
      map.addLayer(landCover);
      map.removeLayer(osm);
      map.removeLayer(mqOrtho);
    });

    //AJAX request to map services-----------------------------------------

        //console.log(bboxExtentString);
        map.on("viewreset moveend", identifyLandcover);
        identifyLandcover();

        function identifyLandcover() {
          // Project coordinates and prepare data for map service query.
          var center = L.CRS.EPSG3857.project(map.getCenter());
          var min = L.CRS.EPSG3857.project(map.getBounds().getNorthWest());
          var max = L.CRS.EPSG3857.project(map.getBounds().getSouthEast());
          var bounds = [min.x, min.y, max.x, max.y];
          var dimensions = [$('#map').width(), $('#map').height()];

          identify(center, bounds, dimensions).done(function (data) {
            if (data.results && data.results.length) {
              var result = data.results[0];
              var area = result.attributes.nvc_class;
              updateLandcoverArea(area);
            }
          });
        }

        function identify(point, bounds, dimensions) {
          var baseUrl = "http://gis1.usgs.gov/arcgis/rest/services/gap/GAP_Land_Cover_NVC_Class_Landuse/MapServer/identify";
          var geometry = [point.x, point.y].join(',');
          var bboxExtent = bounds.join(',');
          var imageDisplay = dimensions.join(',') + ',96';

         return $.ajax({
            url: baseUrl,
            data: {
              f: "json",
              geometry: geometry,
              tolerance: 1,
              returnGeometry: false,
              mapExtent: bboxExtent,
              imageDisplay: imageDisplay,
              geometryType: "esriGeometryPoint",
              layers: "all :0,1,2",
              sr: "3785"
            },
            dataType: "jsonp",
            success: function (response) {
              $("#name").append(response.results[0].attributes.nvc_class);
            }
          });
        }

        function updateLandcoverArea(name) {
          $("#name").text(name);
        }

    $("#basemap").on("click", function () {
      map.addLayer(osm);
      map.removeLayer(mqOrtho);
      map.removeLayer(landCover);
    });

    $("#ortho").on("click", function () {
      map.addLayer(mqOrtho);
      map.removeLayer(osm);
      map.removeLayer(landCover);
    });
  }
  initmap();
  initGPS();

  $linkDown.hide();

  //$("#info-linkUp").on("click", function () {

  //  var $linkUp = $("#info-linkUp");
  //  var drawer = $("#info-drawer");
  //  var isOpen = drawer.hasClass("drawer-open");

  //  if (isOpen) {
  //    $linkUp.removeClass("drawer-open");
  //    $linkUp.addClass("drawer-closed");
  //    $linkUp.removeClass("drawer-open");
  //    drawer.addClass("drawer-closed");
  //  }
  //  else {
  //    $linkUp.addClass("drawer-open");
  //    $linkUp.removeClass("drawer-closed");
  //    drawer.addClass("drawer-open");
  //    drawer.removeClass("drawer-closed");

  //  }

  //});

  var $layersButton = $("#layer-button");

  $layersButton.on("click", function () {
    $("#layer-control").slideToggle({});
  });

  $("#map-change").on("click", function () {
    $("#layer-control").slideToggle({});
  });

  //$layersButton.hover(
  //  function () {
  //    $(this).append($("<span>Select a Basemap</span>"));
  //  }, function () {
  //    $(this).find("span:last").remove();
  //  }
  //);

  function initGPS() {
    map.addControl(new L.Control.Gps());//inizialize control
  }

  function getTileExtent(level, row, col) {
    var tileSize = 256 * 156543.03392800014 * Math.pow(2, -level);
    var x = -20037508.342787 + (col * tileSize);
    var y = 20037508.342787 - (row * tileSize);
    return [x, y - tileSize, x + tileSize, y].join(",");
  }

});