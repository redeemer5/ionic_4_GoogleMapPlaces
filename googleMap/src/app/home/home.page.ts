//import { Component, OnInit } from '@angular/core';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Geolocation, GeolocationOptions, Geoposition, PositionError } from '@ionic-native/geolocation/ngx';
import { NavController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';//import { start } from 'repl';

import { LaunchNavigator, LaunchNavigatorOptions } from '@ionic-native/launch-navigator/ngx';



// --- google local variable ---
declare var google;
let position;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  // position members
  options: GeolocationOptions;
  currentPos: Geoposition;

  // --- array to hold places ---
  places: Array<any>;
  @ViewChild('map') mapElement: ElementRef;
  @ViewChild('directionsPanel') directionsPanel: ElementRef;

  // --- map variable ---
  map: any;
  
  end : any;
  start :any;

  constructor(private modalController:ModalController,private geolocation: Geolocation, public navCtrl: NavController, private launchNavigator: LaunchNavigator) { }

  async closeModal(){
    await this.modalController.dismiss();
  }

  doRefresh(event) {
    this.ionViewDidEnter();
 
    console.log('Begin async operation');
 
    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 1000);
  }
  
  ngOnInit() {
    this.ionViewDidEnter();
  }


  // method to get user position
  getUserPosition() {
    this.options = {
      enableHighAccuracy: false
    };
    this.geolocation.getCurrentPosition(this.options).then((pos: Geoposition) => {

      position = pos;
      this.currentPos = position;

      console.log(pos);
      this.start = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
      this.addMap(pos.coords.latitude, pos.coords.longitude);

    }, (err: PositionError) => {
      console.log("error : " + err.message);
      ;
    })

  }


  // loading page methods
  ionViewDidEnter() {
    this.getUserPosition();
  }

  // method to create the map
  addMap(lat, long) {

    let latLng = new google.maps.LatLng(lat, long);

    let mapOptions = {
      center: latLng,
      zoom: 17,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    this.getBanks(latLng).then((results: Array<any>) => {
      this.places = results;
      for (let i = 0; i < results.length; i++) {
        this.createMarker(results[i]);
      }
    }, (status) => console.log(status));

    this.addMarker();

  }

  // method to add a marker
  addMarker() {

    let marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: this.map.getCenter(),
      icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
      }
    });

    let content = "<h5> Your here ! </h5>";
    let infoWindow = new google.maps.InfoWindow({
      content: content
    });

    google.maps.event.addListener(marker, 'click', () => {
      infoWindow.open(this.map, marker);
    });

  }

  // get the list of banks
  getBanks(latLng) {
    var service = new google.maps.places.PlacesService(this.map);
    let request = {
      location: latLng,
      radius: 500,
      keyword: ["restaurants"],
      types: ["restaurant"]
    };
    return new Promise((resolve, reject) => {
      service.nearbySearch(request, function (results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          resolve(results);

        } else {
          reject(status);
        }

      });

    });
  }

  // method to mark returned places
  createMarker(place) {
    let marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: place.geometry.location,
      icon: { url: 'assets/download.png', scaledSize: new google.maps.Size(50, 50) }

    });


    // --- method to create marker on the located branches ---
    this.end = place.vicinity;
    let content = '<h5>restaurant</h5>' + place.name +  place.vicinity ;
    let infoWindow = new google.maps.InfoWindow({
      content: content, 
    });

    
  

    google.maps.event.addListener(marker, 'click', () => {
      infoWindow.open(this.map, marker);
      this.launchNav(place.vicinity);
      function initMap() {
        var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 7,
        });

        var marker = new google.maps.Marker({
          map: map,
          title: 'Click to zoom'
        });

        map.addListener('center_changed', function () {
          // 3 seconds after the center of the map has changed, pan back to the marker.
          window.setTimeout(function () {
            map.panTo(marker.getPosition());
          }, 3000);
        });

        marker.addListener('click', function () {
          map.setZoom(8);
          map.setCenter(marker.getPosition());
        });
      }
    });
  }


launchNav(address)
{
      // launch navigation 
      let options: LaunchNavigatorOptions = {
        start: "" + this.start,
        app: LaunchNavigator.APPS
      }
      
      this.launchNavigator.navigate(address, options)
        .then(
          success => console.log('Launched navigator'),
          error => console.log('Error launching navigator', error)
        );
}

}
