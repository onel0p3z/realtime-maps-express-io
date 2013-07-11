$(document).ready(function(){
    // Ins. s-io on client
    var socket = io.connect(window.location.href),
        name = prompt('What\'s your name?');
    // Let the server know we are ready to dance
    socket.emit('ready', { to: 'server' }, function(data){
        console.log('Status: '+ data.status);
    });

    // Initialize map
    var map = L.map('map', {
                               center: [ 25.790, -80.336 ],
                               zoom: 16 
                           }
              ),

    // Everything in Leaflet is a tile
    // Satelite-like tile
        tiles = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');

    // Monochromatic tile
    //var tiles = L.tileLayer('http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png');
    
    // Adding tile to map
    map.addLayer(tiles);
    
    // Attemp to geolocate user
    // Not always good for it requires higher load time
    // and permission from user
    map.locate({
        enableHighAccuracy: true
    });
    
    // Location acquired !
    // map.on('lcoationfound', function(){ ... });
    // why doesn't it work ??
    map.on('locationfound', onLocationFound);
    function onLocationFound(pos){
        //console.log(pos);
        console.log('Your location is lat: '+pos.latlng.lat+' and lng: '+pos.latlng.lng);

        var marker = L.marker([ pos.latlng.lat, pos.latlng.lng ]);
        map.addLayer(marker);
        marker.bindPopup("You are HERE!").openPopup();

        // Send location to server 
        socket.emit('myLoc', { latlng: pos.latlng });

    }
    
    // Error while attemping GeoLoc
    map.on('locationerror', onLocationError);
    function onLocationError(err){
        console.log('Error !');
        console.log(err);
        //console.log('Error!\nCode:'+err.code+'\nMsg: '+err.message);
    }

    socket.on('usrsLoc', function(data){
        console.log('usrsLoc received!!');
        //alert('Welcome ' + name + ' - ' + data.id);
        var usrsMarker = L.marker([ data.data.latlng.lat, data.data.latlng.lng ]);
        map.addLayer(usrsMarker);
        var msg = '<strong><em>' + data.id + '</em></strong><br>From: ' + data.address;
        usrsMarker.bindPopup(msg).openPopup();
    });
});
