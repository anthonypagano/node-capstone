'use strict';

const ALL_BANDS_LIST = '/bands';
const ADD_AN_ALBUM = '/albums';
const RECENT_UPDATES = '/recent';

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

// calls the get endpoint to get all the albums by 
// the selected band name from the dropdown list
function watchBandSelection() {
    $('.band-list').change(function(){
        const bandChosen = this.value;
        getAlbumsFromSelectedBand(bandChosen);
    });
}

// initital load of recently updates albums upon landing on the app
function getRecentUpdates(callback) {
    const recentUpdates = {
        url: RECENT_UPDATES,
        dataType: 'json',
        type: 'GET',
        success: function(data) { 
            let recentUpdateList = Object.values(data);
            displayRecentUpdates(recentUpdateList);
        }
    };
 
    $.ajax(recentUpdates);
}

function getAndDisplayRecentUpdates() {
    getRecentUpdates();
}

// takes list of 5 recently updated or added albums and maps 
// results through displayRecentUpdates function to the page
function displayRecentUpdates(data) {
    const results = data.map((item, index) => renderRecentUpdates(item));
    $('.js-most-recent').append($('<h2>Here are the 5 most recent additions to the collection</h2>'));
    $('.js-most-recent').append(results);
}

// takes each album and displays the info 
function renderRecentUpdates(result) {
    return `
        <section>
            <ul>
                <li class="band-name">${result.bandName}</li>
                <li class="album-name">${result.albumName}</li>
                <li class="release-year">${result.releaseYear}</li>
                <li class="format">${result.format}</li>
                <li class="notes">${result.notes}</li>
            </ul>
        </section>
    `;
}

// function to take selected band and hit end point to return
// all albums from that band in the db
function getAlbumsForDisplay(bandChosen) {
    return `/bands/${bandChosen}`;
}

// calls function to hit band specific album end point
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

// takes album list and maps results through renderAlbums function, 
// then displays each on page
function displayBandsAlbums(data) {
    const results = data.map((item, index) => renderAlbums(item));
    $('.js-search-results').html(results);
    $('.record-store').hide()
}

// takes each album and displays the info 
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

// watches for any clicks on a Remove button
$(document).on('click','.remove-album',function(){
    var albumIdToRemove = this.value;
    albumToDelete(albumIdToRemove);
});

// calls function to delete an album end point and on
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

// function to toggle open and close the add new album form
function watchAddAlbumToggleButton() {
    $('.add-new-album-toggle').click(event => {
        $(".add-album-fieldset").toggle();
        $(".error-messaging").hide();
    });
}

// collects new album info from form and calls function to post
function watchAddAlbumButton() {
    $('.js-add-album-button').click(event => {
        event.preventDefault();
        if (($('#bandName').val() === "") || ($('#albumName').val() === "") ||
            ($('#releaseYear').val() === "") || ($('#format').val() === "") ||
            ($('#notes').val() === "")) {
                $(".error-messaging").show();
        } else {
            $(".error-messaging").hide()
            var newAlbumArray = $('.newAlbumInfo').map(function() {
                return $(this).val();
            })
            postNewAlbum(newAlbumArray)
            $('#bandName').val("");
            $('#albumName').val("");
            $('#releaseYear').val("");
            $('#format').val("");
            $('#notes').val("");
            $(".add-album-fieldset").hide();
        }
    });
}

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

// watches for any clicks on any update album button
$(document).on('click','.update-album',function(){
    var albumIdToUpdate = this.value;
    getAlbumToUpdate(albumIdToUpdate);
    $(this).prop('disabled', true);
});

// calls function to get album to be updated end point
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

// takes album list and maps results through renderAlbums function, 
// then displays each on page
function displayAlbumToBeUpdated(data) {
    let albumId = data[0];
    const results = renderAlbum(data);
    $('.'+ albumId).append(results);
}

// displays form fields with specific album info to be updated
function renderAlbum(result) {
    return `
        <ul class="update-album-list">
            <input type="hidden" class="update-album-info" value="${result[0]}" />
            <li><input type="text" class="update-album-info" id="update-band-name" value="${result[1]}" aria-label="update band name input" /></li>
            <li><input type="text" class="update-album-info" id="update-album-name" value="${result[2]}" aria-label="update album name input" /></li>
            <li><input type="text" class="update-album-info" id="update-release-year" value="${result[3]}" aria-label="update release year input" /></li>
            <li><input type="text" class="update-album-info" id="update-format" value="${result[4]}" aria-label="update format input" /></li>
            <li><input type="text" class="update-album-info" id="update-notes" value="${result[5]}" aria-label="update notes input"/></li>
            <li class="save-button"><button class="save-album" value="${result[0]}">Save</button></li>
            <li class="cancel-button"><button class="cancel-album" value="${result[0]}">Cancel</button></li>
        </ul>
    `;
}

// watches for any clicks on save button and sends
// updated info to put end point function
$(document).on('click','.save-album',function(){
    if (($('#update-band-name').val() === "") || ($('#update-album-name').val() === "") ||
        ($('#update-release-year').val() === "") || ($('#update-format').val() === "") ||
        ($('#update-notes').val() === "")) {
            $(".error-messaging").show();
    } else {
        $(".error-messaging").hide()
        var updatedAlbumArray = $('.update-album-info').map(function() {
            return $(this).val();
        })
        putUpdatedAlbum(updatedAlbumArray)
    }
});

// watches for any clicks on cancel button
$(document).on('click','.cancel-album',function(){
    $('.update-album-list').hide();
    $(".error-messaging").hide();
    getAlbumsFromSelectedBand($('.band-list').val())
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

$(function() {
    getAndDisplayBandList();
    getAndDisplayRecentUpdates();
    watchBandSelection();
    watchAddAlbumToggleButton();
    watchAddAlbumButton();
  });