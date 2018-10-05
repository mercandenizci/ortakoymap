import React, { Component } from "react";
import LocationList from "./LocationList";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      alllocations: require("./places.json"),
      map: "",
      infowindow: "",
      prevmarker: ""
    };

    // conserve object instances
    this.initMap = this.initMap.bind(this);
    this.openInfoWindow = this.openInfoWindow.bind(this);
    this.closeInfoWindow = this.closeInfoWindow.bind(this);
  }

  componentDidMount() {
    // Globally invoke the initMap() function 
    window.initMap = this.initMap;
    // Asynchronously load the Google Maps script
    loadMapJS("https://maps.googleapis.com/maps/api/js?libraries=geometry,drawing&key=AIzaSyBdHpuho-ppseX5rK16Wvoq2D7S7hM1Fbw&v=3&callback=initMap"
      );
  }

  //Init the map when the google map script is loaded
  initMap() {
    var self = this;
    //Set the initial view of map to Ortakoy
    var mapview = document.getElementById("map");
    mapview.style.height = window.innerHeight + "px";
    var map = new window.google.maps.Map(mapview, {
      center: {
        lat: 41.054030,
        lng: 29.028460
      },
      zoom: 15,
      mapTypeControl: false
    });
    var InfoWindow = new window.google.maps.InfoWindow({});
    //Close info window when clicked
    window.google.maps.event.addListener(InfoWindow, "closeclick", function() {
      self.closeInfoWindow();
    });
    this.setState({
      map: map,
      infowindow: InfoWindow
    });
    window.google.maps.event.addDomListener(window, "resize", function() {
      var center = map.getCenter();
      window.google.maps.event.trigger(map, "resize");
      self.state.map.setCenter(center);
    });
    window.google.maps.event.addListener(map, "click", function() {
      self.closeInfoWindow();
    });
    //Add marker to locations
    var alllocations = [];
    this.state.alllocations.forEach(function(location) {
      var longname = location.name;
      var marker = new window.google.maps.Marker({
        position: new window.google.maps.LatLng(location.latitude, location.longitude),
        animation: window.google.maps.Animation.DROP,
        map: map
      });
      //Open info window when clcked on the marker
      marker.addListener("click", function() {
        self.openInfoWindow(marker);
      });
      location.longname = longname;
      location.marker = marker;
      location.display = true;
      alllocations.push(location);
    });
    this.setState({
      alllocations: alllocations
    });   
  }

  //Open the infowindow for the marker
  openInfoWindow(marker) {
    this.closeInfoWindow();
    this.state.infowindow.open(this.state.map, marker);
    marker.setAnimation(window.google.maps.Animation.BOUNCE);
    this.setState({
      prevmarker: marker
    });
    this.state.infowindow.setContent("Loading Data...");
    this.state.map.setCenter(marker.getPosition());
    this.state.map.panBy(0, -200);
    this.getMarkerInfo(marker);
  }
  
  closeInfoWindow() {
    if (this.state.prevmarker) {
      this.state.prevmarker.setAnimation(null);
    }
    this.setState({
      prevmarker: ""
    });
    this.state.infowindow.close();
  }
  //Get info from the foursquare api  
  getMarkerInfo(marker) {
    var self = this;
    // Add the api keys for foursquare
    var clientId = "TEUTEPLS53TI2RKOKGEYBJVGU0R010UVPZVHV1TWCVVTG4T1";
    var clientSecret = "D2PBI1VY0P1JUE4LX2AGM0CKS3UISZCLQT0YLMGKUKJCYX5O";
    // Build the api endpoint
    var url = "https://api.foursquare.com/v2/venues/search?client_id=" + clientId + "&client_secret=" + clientSecret + "&v=20130815&ll=" + marker.getPosition().lat() + "," + marker.getPosition().lng() + "&limit=1";
    fetch(url).then(function(response) {
      if (response.status !== 200) {
        self.state.infowindow.setContent("Sorry data can't be loaded");
        return;
      }
      // Get the text in the response
      response.json().then(function(data) {
        console.log(data);
        var location_data = data.response.venues[0];
        var place = `<h3>${location_data.name}</h3>`;
        var street = `<p>${location_data.location.formattedAddress[0]}</p>`;
        var contact = "";
        if (location_data.contact.phone) contact = `<p><small>${location_data.contact.phone}</small></p>`;
        var checkinsCount = "<b>Number of CheckIn: </b>" + location_data.stats.checkinsCount + "<br>";
        var readMore = '<a href="https://foursquare.com/v/' + location_data.id + '" target="_blank">Read More on <b>Foursquare Website</b></a>';
        self.state.infowindow.setContent(place + street + contact + checkinsCount + readMore);
      });
    }).catch(function(err) {
      self.state.infowindow.setContent("Sorry data can't be loaded");
    });
  }
  //Show list of locations
  render() {
    return ( < div > 
      <LocationList 
      key = "100"
      alllocations = {
        this.state.alllocations
      }
      openInfoWindow = {
        this.openInfoWindow
      }
      closeInfoWindow = {
        this.closeInfoWindow
      }
      /> < div id = "map" aria-label="neighbourhood-map" role="map" tabindex="2"/ > < /div>);
  }
}
export default App;

function loadMapJS(src) {
  var ref = window.document.getElementsByTagName("script")[0];
  var script = window.document.createElement("script");
  script.src = src;
  script.async = true;
  script.defer = true
  script.onerror = function() {
    document.write("Google Maps can't be loaded");
  };
  ref.parentNode.insertBefore(script, ref);
}

