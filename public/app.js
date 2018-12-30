'use strict';

const ALL_BANDS_LIST = '/bands';
const ADD_AN_ALBUM = '/albums';

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

// creates an option in the band select list for
// each band that is returned from the /bands endpoint
function displayBandList(band) {
    band.sort();
    $.each(band, function(i, p) {
        $('.band-list').append($('<option></option>').val(p).html(p));
    });
}

// function that calls the /bands endpoint
// and then on call back loads the select list
// with the data
function getAndDisplayBandList() {
    getBandList(displayBandList);
}

//  on page load call the api and load data 
//  into the dropdown list
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
    return `/band/${bandChosen}`;
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
        <ul class="${result.id}">
            <li class="band-name">${result.bandName}</li>
            <li class="album-name">${result.albumName}</li>
            <li class="release-year">${result.releaseYear}</li>
            <li class="format">${result.format}</li>
            <li class="notes">${result.notes}</li>         
            <li class="remove-update-buttons"><button class="remove-album" value="${result.id}">Remove</button></li>
            <li class="remove-update-buttons"><button class="update-album" value="${result.id}">Update</button></li>
        </ul>
    `;
}

// function to take selected band and hit end point to return
// all albums from that band in the db
function deleteAnAlbum(albumToRemove) {
    return `/albums/${albumToRemove}`;
}

// Watches for any clicks on a Remove button
$(document).on('click','.remove-album',function(){
    event.preventDefault();
    var albumIdToRemove = this.value;
    albumToDelete(albumIdToRemove);
});

// Calls function to delete an album end point and on
// success re-loads the bands list of albums that remain
function albumToDelete(albumToRemove) {
    const deletedAlbums = {
        url: deleteAnAlbum(albumToRemove),
        dataType: 'json',
        type: 'DELETE',
        success: function(){
            getAlbumsFromSelectedBand($('.band-list').val())
        } 
    };
    $.ajax(deletedAlbums);
}

// Watches for any clicks on Add New Album Toggle button
$(document).ready(
    watchAddAlbumToggleButton()
);

function watchAddAlbumToggleButton() {
    $('.add-new-album-toggle').click(event => {
        $(".add-album-fieldset").toggle();
    });
}

// collects new album info from form and calls function to post
function watchAddAlbumButton() {
    $('.js-add-album-button').click(event => {
        event.preventDefault();
        var newAlbumArray = $('.newAlbumInfo').map(function() {
            return $(this).val();
        })
    postNewAlbum(newAlbumArray)
    });
}

// Watches for any clicks on Add An Album button
$(document).ready(
    watchAddAlbumButton()
);

// posts new album info to db
function postNewAlbum(newAlbumArray) {
    $.ajax({
        type: 'POST',
        url: ADD_AN_ALBUM,
        data: JSON.stringify({
            "bandName": newAlbumArray[0],
            "albumName" : newAlbumArray[1],
            "releaseYear" : newAlbumArray[2],
            "format" : newAlbumArray[3],
            "notes" : newAlbumArray[4]
        }),
        success: function(){
            getAlbumsFromSelectedBand(newAlbumArray[0])
        },         
        error: function(e) {
            console.log(e);
        },
        dataType: "json",
        contentType: "application/json"
    });
}

// Watches for any clicks on any update album button
$(document).on('click','.update-album',function(){
    event.preventDefault();
    var albumIdToUpdate = this.value;
    getAlbumToUpdate(albumIdToUpdate);
});

// Calls function to get album to be updated end point
function getAlbumToUpdate(albumIdToUpdate) {
    const selectedAlbum = {
        url: getAlbumToBeUpdated(albumIdToUpdate),
        dataType: 'json',
        type: 'GET',
        success: function(data) { 
            let selectedAlbumToUpdate = Object.values(data);
            displayAlbumToBeUpdated(selectedAlbumToUpdate); 
        }
    };
    $.ajax(selectedAlbum);
}    

// function to pass album to be updated id to the 
// get specific album end point
function getAlbumToBeUpdated(albumIdToUpdate) {
    return `/albums/${albumIdToUpdate}`;
}

// Takes album list and maps results through renderAlbums function, 
// then displays each on page
function displayAlbumToBeUpdated(data) {
    let albumId = data[0];
    const results = renderAlbum(data);
    $('.'+ albumId).append(results);
}  

// this function stays the same when we connect
// to real API later
function renderAlbum(result) {
    return `
        <ul class="update-album-list">
            <input type="hidden" class="update-album-info" value="${result[0]}" />
            <li class="band-name"><input type="text" class="update-album-info" id="update-bandName" value="${result[1]}"/></li>
            <li class="album-name"><input type="text" class="update-album-info" id="update-albumName" value="${result[2]}"/></li>
            <li class="release-year"><input type="text" class="update-album-info" id="update-release-year" value="${result[3]}"/></li>
            <li class="format"><input type="text" class="update-album-info" id="update-format" value="${result[4]}"/></li>
            <li class="notes"><input type="text" class="update-album-info" id="update-notes" value="${result[5]}"/></li>
            <li class="save-button"><button class="save-album" value="${result[0]}">SAVE</button></li>
        </ul>
    `;
}

// Watches for any clicks on save button
$(document).on('click','.save-album',function(){
    event.preventDefault();
    var updatedAlbumArray = $('.update-album-info').map(function() {
        return $(this).val();
    })
    putUpdatedAlbum(updatedAlbumArray)
});

// updates specific album info
function putUpdatedAlbum(updatedAlbumArray) {
    $.ajax({
        type: 'PUT',
        url: getAlbumToBeUpdated(updatedAlbumArray[0]),
        data: JSON.stringify({
            "id" : updatedAlbumArray[0],
            "bandName": updatedAlbumArray[1],
            "albumName" : updatedAlbumArray[2],
            "releaseYear" : updatedAlbumArray[3],
            "format" : updatedAlbumArray[4],
            "notes" : updatedAlbumArray[5]
        }),
        success: function(){
            getAlbumsFromSelectedBand(updatedAlbumArray[1])
        },         
        error: function(e) {
            console.log(e);
        },
        dataType: "json",
        contentType: "application/json"
    });
}