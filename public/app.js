// this is mock data, but when we create our API
// we'll have it return data that looks like this
var MOCK_ALBUM_DATA = {
	"albumData": [
        {
            "id": "1111111",
            "bandName" : "Motorhead",
            "albumName" : "Bomber",
            "releaseYear" : "1979",
            "format": "CD",
            "notes": "my favorite Motorhead album",
            "publishedAt": 1470016976609
        },
        {
            "id": "2222222",
            "bandName" : "Anthrax",
            "albumName" : "Persistence Of Time",
            "releaseYear" : "1990",
            "format": "CD",            
            "notes": "a crime this album was not rated higher",
            "publishedAt": 1470012976609
        },
        {
            "id": "333333",
            "bandName" : "AC-DC",
            "albumName" : "Powerage",
            "releaseYear" : "1978",
            "format": "CD",            
            "notes": "a favorite Bon Scott era AC-DC album",
            "publishedAt": 1470011976609
        },
        {
            "id": "4444444",
            "bandName": "Thundermother",
            "albumName": "Thundermother",
            "releaseYear": "2018",
            "format": "CD",
            "notes": "an energetic and upbeat female AC-DC Bon Scott era sounding rockin machine from Sweden",
            "publishedAt": 1470009976609
        }
    ]
};

// this function's name and argument can stay the
// same after we have a live API, but its internal
// implementation will change. Instead of using a
// timeout function that returns mock data, it will
// use jQuery's AJAX functionality to make a call
// to the server and then run the callbackFn
function getRecentAlbumData(callbackFn) {
    // we use a `setTimeout` to make this asynchronous
    // as it would be with a real AJAX call.
	setTimeout(function(){ callbackFn(MOCK_ALBUM_DATA)}, 1);
}

// this function stays the same when we connect
// to real API later
function displayAlbumData(data) {
    for (index in data.albumData) {
	   $('body').append('<ul>',
        '<li>' + data.albumData[index].bandName + '</li>',
        '<li>' + data.albumData[index].albumName + '</li>',
        '<li>' + data.albumData[index].releaseYear + '</li>',
        '<li>' + data.albumData[index].format + '</li>',
        '<li>' + data.albumData[index].notes + '</li>',
        '</ul>');
    }
}

// this function can stay the same even when we
// are connecting to real API
function getAndDisplayAlbumData() {
	getRecentAlbumData(displayAlbumData);
}

//  on page load do this
$(function() {
	getAndDisplayAlbumData();
})