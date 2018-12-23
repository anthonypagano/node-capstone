
const ALL_BANDS_LIST = 'http://localhost:8080/bands';
  
// this function's name and argument can stay the
// same after we have a live API, but its internal
// implementation will change. Instead of using a
// timeout function that returns mock data, it will
// use jQuery's AJAX functionality to make a call
// to the server and then run the callbackFn
// initial call to /bands endpoint which returns
// names of all bands in the db that I have an 
// album for
function getBandList(callback) {
    const bandList = {
        url: ALL_BANDS_LIST,
        dataType: 'json',
        type: 'GET',
        success: callback
    };
    
    $.ajax(bandList);
}

// this function stays the same when we connect
// to real API later
// creates an option in the band select list for
// each band that is returned from the /bands endpoint
function displayBandList(band) {
    band.sort();
    $.each(band, function(i, p) {
        $('.band-list').append($('<option></option>').val(p).html(p));
    });
}

// this function can stay the same even when we
// are connecting to real API
// function that calls the /bands endpoint
// and then on call back loads the select list
// with the data
function getAndDisplayBandList() {
	getBandList(displayBandList);
}

//  on page load do this
//  when the page loads execute the function to
//  call the api and load data into the dropdown
//  list
$(function() {
	getAndDisplayBandList();
})

// listens to the band select list for a selection and
// calls the get endpoint to get all the albums by 
// the selected band name
function watchBandSelection() {
    $('.band-list').change(function(){
      event.preventDefault();
      const bandChosen = this.value;
      getAlbumsFromSelectedBand(bandChosen);
    });
  }
  
  $(document).ready(
    watchBandSelection()
  );
  
// function to take selected band and hit end point to return
// all albums from that band in the db
function getAlbumsForDisplay(bandChosen) {
    return `http://localhost:8080/band/${bandChosen}`;
  }

// Calls function to hit band specific album end point
function getAlbumsFromSelectedBand(bandChosen) {
    const selectedBandsAlbums = {
      url: getAlbumsForDisplay(bandChosen),
      dataType: 'json',
      type: 'GET',
      success: function(data) { 
        let selectedBandsAlbumsList = Object.values(data);
        displayBandsAlbums(selectedBandsAlbumsList); 
      }
    };
    $.ajax(selectedBandsAlbums);
}

// Takes album list and maps results through renderAlbums function, 
// then displays each on page
function displayBandsAlbums(data) {
    const results = data.map((item, index) => renderAlbums(item));
    $('.js-search-results').html(results);
  }
  
  //Takes each album and display the info 
  function renderAlbums(result) {
    return `
    <ul>
    <li>${result.bandName}</li>
    <li>${result.albumName}</li>
    <li>${result.releaseYear}</li>
    <li>${result.format}</li>
    <li>${result.notes}</li>         
    <li></li>
    </ul>
    `;
  }
