L.Control.Gps = L.Control.extend({

  _accuracyCircle: null,
  _locationset: false,

  includes: L.Mixin.Events,

  options: {
    position: "topright",
    //TODO add gpsLayer
    autoActive: false,
    autoTracking: false,
    //TODO LayersMaxzoom
    //TODO autozoom
    //TODO timeout autoTracking
    marker: false, //using a marker
    title: "Center map on your location",
    style: { radius: 16, weight: 3, color: "#e03", fill: false }
  },

  initialize: function (options) {
    if (options && options.style)
      options.style = L.Util.extend({}, this.options.style, options.style);
    L.Util.setOptions(this, options);
    this._errorFunc = this.options.callErr || this.showAlert;
    this._isActive = false;//global state of gps
    this._currentLocation = null;	//store last location
  },

  onAdd: function (map) {

    this._map = map;

    var container = L.DomUtil.create("div", "leaflet-control-gps");

    this._button = L.DomUtil.create("a", "gps-button", container);
    this._button.href = "#";
    this._button.title = this.options.title;
    L.DomEvent
      .on(this._button, "click", L.DomEvent.stop, this)
      .on(this._button, "click", this._switchGps, this);

    this._alert = L.DomUtil.create("div", "gps-alert", container);
    this._alert.style.display = "none";

    this._map
      .on("locationfound", this._drawGps, this)
      .on("locationerror", this._errorGps, this);

    if (this.options.autoActive)
      this.activate();

    return container;
  },

  onRemove: function (map) {
    this.deactivate();
  },

  _switchGps: function () {
    if (this._isActive)
      this.deactivate();
    else
      this.activate();
  },

  getLocation: function () {	//get last location
    return this._currentLocation;
  },

  activate: function () {
    this._isActive = true;
    this._map.locate({
      enableHighAccuracy: true,
      watch: this.options.autoTracking,
      //maximumAge:s
      setView: false,	//automatically sets the map view to the user location
      maxZoom: this.options.maxZoom
    });
  },

  deactivate: function () {
    this._isActive = false;
    this._map.stopLocate();
    L.DomUtil.removeClass(this._button, "active");
    //this._gpsMarker.setLatLng([-90, 0]);  //move to antarctica!
    //TODO make method .hide() using _icon.style.display = "none"
    if (!this._locationset) {
      this._map.locate({ setView: true });
    } else {
      this._map.removeLayer(this._accuracyCircle);
      this._locationset = false;
    }
  },

  _drawGps: function (e) {
    //TODO use e.accuracy for gps circle radius/color
    var radius = e.accuracy / 2;

    this._accuracyCircle = new L.Circle(e.latlng, radius, {
      color: "#B94A48",
      opacity: 1,
      weight: 2
    });
    if (!this._locationset) {
      this._locationset = true;
      this._map.addLayer(this._accuracyCircle);
    }

    this._currentLocation = e.latlng;

    if (this.options.autoTracking || this._isActive)
      this._moveTo(e.latlng);

    //this._gpsMarker.setLatLng(e.latlng);

    //this.fire("gpslocated", { latlng: e.latlng, marker: this._gpsMarker });

    L.DomUtil.addClass(this._button, "active");
  },

  _moveTo: function (latlng) {
    if (this.options.maxZoom)
      this._map.setView(latlng, Math.min(this._map.getZoom(), this.options.maxZoom));
    else
      this._map.panTo(latlng);
  },

  _errorGps: function (e) {
    this.deactivate();
    this._errorFunc.call(this, this.options.textErr || e.message);
  },

  showAlert: function (text) {
    this._alert.style.display = "block";
    this._alert.innerHTML = text;
    var that = this;
    clearTimeout(this.timerAlert);
    this.timerAlert = setTimeout(function () {
      that._alert.style.display = "none";
    }, 2000);
  }
});

L.control.gps = function (options) {
  return new L.Control.Gps(options);
};