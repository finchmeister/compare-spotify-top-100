(function () {

    /**
     * https://github.com/jmperez/spotify-web-api-js
     */

    var app = {};
    var spotifyApi = new SpotifyWebApi();
    var alreadyDone = 0;

    var listOlder, listNewer;

    /*****************************************************************************
     *
     * Event listeners for UI elements
     *
     ****************************************************************************/

    document.getElementById("btn-demo").addEventListener("click", function(event){
        event.preventDefault();
        listOlder = top2015; // Obtained from demo-data'js
        listNewer = top2016;
        app.comparePlaylists(listOlder, listNewer);
    });

    document.getElementById("compareTop100").addEventListener("submit", function(event){
        event.preventDefault();
        listOlder = document.getElementById('list2').value; // Obtained from the form
        listNewer = document.getElementById('list1').value;
        app.comparePlaylists(listOlder, listNewer);
       });

    /*****************************************************************************
     *
     * Helper functions
     *
     ****************************************************************************/

    /**
     * Array chunk dat shit
     * @link http://www.frontcoded.com/splitting-javascript-array-into-chunks.html
     * @param arr
     * @param chunkSize
     * @returns {Array}
     */
    var createGroupedArray = function(arr, chunkSize) {
        var groups = [], i;
        for (i = 0; i < arr.length; i += chunkSize) {
            groups.push(arr.slice(i, i + chunkSize));
        }
        return groups;
    };

    /*****************************************************************************
     *
     * Main Methods
     *
     ****************************************************************************/


    /**
     * Splits the pasted list into an array of track ids
     * @param list
     * @returns {Array}
     */
    app.getTracksFromList = function (list) {
        list = list.trim().split(/\s+/);
        return list.map(function(url) { return url.substr(31,22); });
    };

    /**
     * Validates the track list ids
     * @param list
     * @returns {*}
     */
    app.validateTracksFromList = function (list) {
        list = app.getTracksFromList(list);
        let response = {
            success : 1,
            list : list,
            error : ''
        };
        let trackIdRegex = new RegExp("^[a-zA-Z0-9]{22}$"); // 22 alpha numeric characters

        if (list.length == 1) {
            return {
                success : 0,
                error : 'Please copy your playlists into the fields'
            };
        }
        else if (list.length < 90 || list.length > 105) {
            return {
                success : 0,
                error : 'Incorrect track list size'
            };
        }
        for (let i = 0; i < list.length; i++) {
            if (!trackIdRegex.test(list[i])) {
                return {
                    success : 0,
                    error : 'Url formatting'
                }
            }
        }
        return response;
    };

    /**
     * Updates the error text box with the error
     * @param errorText
     */
    app.displayError = function (errorText) {
        document.getElementById('error-message').className = '';
        document.getElementById('validation-warning').innerText = ' ' + errorText;
    };

    /**
     * Receives lists from the form or demo data, then does the comparison of ids to work out the main track diffs
     * Passes off the results to another method getTrackDataAndUpdate which does the lifting
     * @param listOlder
     * @param listNewer
     */
    app.comparePlaylists = function (listOlder, listNewer) {

        if (alreadyDone) {
            // Already done, don't do shit
            console.log("You've already done this, reset the page");
            return;
        }

        let listOlderResponse = app.validateTracksFromList(listOlder);
        let listNewerResponse = app.validateTracksFromList(listNewer);

        if (!listOlderResponse.success) {
            app.displayError(listOlderResponse.error);
            return;
        }
        else if (!listNewerResponse.success) {
            app.displayError(listNewerResponse.error);
            return;
        }

        listOlder = listOlderResponse.list;
        listNewer = listNewerResponse.list;

        // Define separately to avoid reference issues
        var results = {
            'older' : [],
            'newer' : []
        };

        var match, shift;
        // Work out the diff based on the newer list

        for (var i = 0; i < listNewer.length; i++) {
            match = shift = 0;

            for (var j = 0; j < listOlder.length; j++) {

                if (listNewer[i] == listOlder[j]) {
                    // We have a match, work out the shift
                    match = 1;
                    shift = j - i;
                    results.older[j] = i + 1;
                    break;
                }

            }
            results.newer[i] = match ? j + 1 : 'New';
        }
        // Bit spaghetti
        app.getTrackDataAndUpdate(createGroupedArray(listNewer, 36), results.newer, 'tableNewer');
        app.getTrackDataAndUpdate(createGroupedArray(listOlder, 36), results.older, 'tableOlder');
    };

    /**
     * Once we've got our chunked array this calls the spotify api to get the data, then updates the tables accordingly
     * @param chunkedArray
     * @param diff
     * @param tableId
     */
    app.getTrackDataAndUpdate = function (chunkedArray, diff, tableId) {
        var trackList = [];
        // Query the api in chunks asynchronously, using promises to preserve ordering. It would be much nicer to call
        // this recursively so that we're not constrained by the tracklist
        spotifyApi.getTracks(chunkedArray[0])
            .then(function(data) {
                trackList = trackList.concat(data.tracks);
                return spotifyApi.getTracks(chunkedArray[1]);
            })
            .then(function(data) {
                trackList = trackList.concat(data.tracks);
                return spotifyApi.getTracks(chunkedArray[2]);
            })
            .then(function(data) {
                trackList = trackList.concat(data.tracks);
                return trackList;
            })
            // Now we have all the track data from spotify
            .then(function(trackList){
                return app.transformTracklist(trackList, diff);
            })
            // With the transformed track data, do all the html shit
            .then(function(transformedTrackList){
                app.updatePageWithSpotifyData(transformedTrackList, tableId);
            })
            .then(function(){
                // Scroll it, forced to use jquery here
                let hash = '#results-scroll-point';
                $('html, body').animate({
                    scrollTop: $(hash).offset().top
                }, 800, function(){
                    // Add hash (#) to URL when done scrolling (default click behavior)
                    window.location.hash = hash;
                });

                alreadyDone = 1; // Update the complete flag
            });
    };

    /**
     * Transforms the spotify api response into a simpler object for processing
     * @param trackList
     * @param delta
     * @returns {Array}
     */
    app.transformTracklist = function (trackList, delta) {
        let transformedTracklist = [], artists = [];
        for (let i = 0; i < trackList.length; i++) { //Newer List
            artists = trackList[i].artists.map(function(a) { return a.name; });
            transformedTracklist[i] = {
                'artists' : artists,
                'name' : trackList[i].name,
                'delta' : delta[i],
                'image' : trackList[i].album.images[2].url,
                'albumName' : trackList[i].album.name
            }
        }
        return transformedTracklist;
    };

    /**
     * Applies an exponentially decaying ranking for each track in the top 100 to get an accurate ranking of artist
     * popularity in the list.
     * @param transformedTrackList
     * @returns {{}}
     */
    app.getArtistOccurrancesFromTransformedTracks = function (transformedTrackList) {
        let artistOccurances = {};
        let tracklistLen = transformedTrackList.length;
        for (var i = 0; i < tracklistLen; i++) {
            var artists = transformedTrackList[i].artists;
            for (var j = 0; j < artists.length; j++) {
                let power = (tracklistLen - i)/tracklistLen;
                let modifier = Math.exp(power); // Exponential ranking
                //let modifier = power; // Linear ranking
                if (typeof artistOccurances[artists[j]] !== 'undefined') {
                    if (artistOccurances[artists[j]]['count'] > 0) {
                        artistOccurances[artists[j]]['weighted'] += modifier;
                        artistOccurances[artists[j]]['count']++;
                        artistOccurances[artists[j]]['songs'].push(transformedTrackList[i].name);
                    }
                }
                else {
                    artistOccurances[artists[j]] = {
                        weighted : modifier,
                        count : 1,
                        songs : [transformedTrackList[i].name],
                        albumArt : transformedTrackList[i].image
                    };
                }
                break; // Decided not to factor in supporting artists
            }
        }
        return artistOccurances;
    };

    /**
     * See above but for albums
     * @param transformedTrackList
     * @returns {{}}
     */
    app.getAlbumOccurrancesFromTransformedTracks = function (transformedTrackList) {
        let albumOccurances = {};
        let tracklistLen = transformedTrackList.length;
        for (let i = 0; i < tracklistLen; i++) {
            let albumName = transformedTrackList[i].albumName;
            let power = (tracklistLen - i)/tracklistLen;
            let modifier = Math.exp(power); // Exponential ranking
            //let modifier = power; // Linear ranking
            if (typeof albumOccurances[albumName] !== 'undefined') {
                if (albumOccurances[albumName]['count'] > 0) {
                    albumOccurances[albumName]['weighted'] += modifier;
                    albumOccurances[albumName]['count']++;
                    albumOccurances[albumName]['songs'].push(transformedTrackList[i].name);
                }
            }
            else {
                albumOccurances[albumName] = {
                    weighted : modifier,
                    count : 1,
                    artist : transformedTrackList[i].artists[0],
                    album : transformedTrackList[i].albumName,
                    albumArt : transformedTrackList[i].image,
                    songs : [transformedTrackList[i].name]
                };
            }
        }
        return albumOccurances;
    };

    /**
     * Originally built to get the top artists, then hacked for laziness to support albums.
     * Real bait
     * @param occurances
     * @param count
     * @param albums
     * @returns {Array}
     */
    app.getTopArtistsOrAlbums = function (occurances, count, albums=false) {
        var sortedOccurances = Object.keys(occurances).sort(function(a,b){return occurances[b].weighted-occurances[a].weighted});
        var topTracks = [];
        for (var i = 0; i < count; i++) {
            topTracks[i] = {
                'name' : sortedOccurances[i],
                'songs' : occurances[sortedOccurances[i]].songs,
                'albumArt' : occurances[sortedOccurances[i]].albumArt,
                'count' : occurances[sortedOccurances[i]].count,
                'weighted' : occurances[sortedOccurances[i]].weighted
            };
            if (albums) {
                topTracks[i]['artist'] = occurances[sortedOccurances[i]].artist;
            }
        }
        return topTracks;
    };

    /**
     * Calculates the number of unique artists
     * @param artistOccurrances
     * @param tableId
     */
    app.doUnqiueArtists = function (artistOccurrances, tableId) {
        document.getElementById(tableId + '-artist-diversity').innerText = Object.keys(artistOccurrances).length;
    };

    /**
     * Updates the top 100 track table
     * @param transformedTrackList
     * @param tableId
     */
    app.updateTable = function (transformedTrackList, tableId) {

        let table = document.getElementById(tableId);
        let newer = tableId == 'tableNewer';
        if (table.innerHTML == "") {

            let position = 0;
            for (let i = 0; i < transformedTrackList.length; i++) {
                // Add row to table
                position = i + 1;
                let row = table.insertRow();
                row.insertCell(0).outerHTML = '<td class="track-position">' + position.toString() + '</td>';
                row.insertCell(1).outerHTML = '<td class="track-art"><img src="' + transformedTrackList[i].image + '"></td>';
                row.insertCell(2).innerHTML = '<div class="track-name">' + transformedTrackList[i].name + '</div>' + '<div class="track-artist">' + transformedTrackList[i].artists.join(', ') + '</div>';
                row.insertCell(3).innerHTML = (function(position, oppositePos, newer = true) {
                    let icons = '';
                    let cellHTML = '';
                    if (typeof oppositePos == 'number') {
                        let delta = oppositePos - position;
                        delta = newer ? delta : delta * -1;
                        let relative = newer ? 'LY' : 'NY';
                        if (delta > 0) {
                            icons = '<i class="fa fa-arrow-up" aria-hidden="true"></i>';
                        }
                        else if (delta == 0) {
                            icons = '';
                        }
                        else if (delta < 0) {
                            icons = '<i class="fa fa-arrow-down" aria-hidden="true"></i>';
                        }
                        cellHTML = '<span class="relative-year">' + relative + '</span> ' + oppositePos + ' ' + icons;
                    }
                    else {
                        if (newer) {
                            cellHTML = '<i class="fa fa-star" aria-hidden="true">';
                        }
                        else {
                            cellHTML = '<span class="relative-year">NY</span> 100+ <i class="fa fa-arrow-down" aria-hidden="true"></i>';
                        }
                    }
                    return cellHTML;
                } (position, transformedTrackList[i].delta, newer));
            }
        } else {
            table.innerHTML = "";
            app.updateTable(transformedTrackList, tableId);
        }
    };

    /**
     * @param topArtists
     * @param tableId
     */
    app.updateTopArtistsTable = function(topArtists, tableId) {
        let table = document.getElementById(tableId + '-topArtists');
        let position = 0;
        for (let i = 0; i < topArtists.length; i++) {
            position = i + 1;
            let row = table.insertRow();
            row.insertCell(0).innerText = position.toString();
            row.insertCell(1).outerHTML = '<td class="track-art"><img src="' + topArtists[i].albumArt + '"></td>';
            let artistAndTrackDataHTML = '<div class="top-artist-name">' + topArtists[i].name + '</div>' +
                '<div class="top-artist-tracks">' +
                '<ul class="top-artist-tracklist">';
            for (let j = 0; j < topArtists[i].songs.length; j++) {
                artistAndTrackDataHTML += '<li>' + topArtists[i].songs[j] + '</li>';
            }
            artistAndTrackDataHTML += '</ul></div>';
            row.insertCell(2).innerHTML = artistAndTrackDataHTML;
            row.insertCell(3).outerHTML ='<td class="track-position">'+ topArtists[i].count +'</td>';
        }
    };

    /**
     * @param topAlbums
     * @param tableId
     */
    app.updateTopAlbumsTable = function(topAlbums, tableId) {
        let table = document.getElementById(tableId + '-topAlbums');
        let position = 0;
        for (let i = 0; i < topAlbums.length; i++) {
            position = i + 1;
            let row = table.insertRow();
            row.insertCell(0).innerText = position.toString();
            row.insertCell(1).outerHTML = '<td class="track-art"><img src="' + topAlbums[i].albumArt + '"></td>';
            let artistAndTrackDataHTML = '<div class="top-album-name">' + topAlbums[i].name + '</div>' +
                '<div class="top-album-artist-name">' + topAlbums[i].artist + '</div>';
            row.insertCell(2).innerHTML = artistAndTrackDataHTML;
            row.insertCell(3).outerHTML ='<td class="track-position">'+ topAlbums[i].count +'</td>';
        }
    };

    /**
     * Given a nice transformed tracklist, this updates all the markup with the data
     * @param transformedTrackList
     * @param tableId
     */
    app.updatePageWithSpotifyData = function (transformedTrackList, tableId) {
        app.updateTable(transformedTrackList, tableId);

        let artistOccurrances = app.getArtistOccurrancesFromTransformedTracks(transformedTrackList);
        let topArtists = app.getTopArtistsOrAlbums(artistOccurrances, 10);
        app.updateTopArtistsTable(topArtists, tableId);

        let albumOccurrances = app.getAlbumOccurrancesFromTransformedTracks(transformedTrackList);
        let topAlbums = app.getTopArtistsOrAlbums(albumOccurrances, 10, true);
        app.updateTopAlbumsTable(topAlbums, tableId);

        app.doUnqiueArtists(artistOccurrances, tableId);
        document.getElementById('results').className = ''; // Reveal the section
    };

    /**
     * Example track response
     * @type {{album: {album_type: string, artists: [*], available_markets: [*], external_urls: {spotify: string}, href: string, id: string, images: [*], name: string, type: string, uri: string}, artists: [*], available_markets: [*], disc_number: number, duration_ms: number, explicit: boolean, external_ids: {isrc: string}, external_urls: {spotify: string}, href: string, id: string, name: string, popularity: number, preview_url: string, track_number: number, type: string, uri: string}}
     */
    var track = {
        album : {
            album_type : "album",
            artists : [ {
                external_urls : {
                    spotify : "https://open.spotify.com/artist/0C0XlULifJtAgn6ZNCW2eu"
                },
                href : "https://api.spotify.com/v1/artists/0C0XlULifJtAgn6ZNCW2eu",
                id : "0C0XlULifJtAgn6ZNCW2eu",
                name : "The Killers",
                type : "artist",
                uri : "spotify:artist:0C0XlULifJtAgn6ZNCW2eu"
            } ],
            available_markets : [ "AD", "AR", "AT", "AU", "BE", "BG", "BO", "BR", "CH", "CL", "CO", "CR", "CY", "CZ", "DE", "DK", "DO", "EC", "EE", "ES", "FI", "FR", "GB", "GR", "GT", "HK", "HN", "HU", "ID", "IE", "IS", "IT", "JP", "LI", "LT", "LU", "LV", "MC", "MT", "MY", "NI", "NL", "NO", "NZ", "PA", "PE", "PH", "PL", "PT", "PY", "SE", "SG", "SK", "SV", "TR", "TW", "UY" ],
            external_urls : {
                spotify : "https://open.spotify.com/album/4OHNH3sDzIxnmUADXzv2kT"
            },
            href : "https://api.spotify.com/v1/albums/4OHNH3sDzIxnmUADXzv2kT",
            id : "4OHNH3sDzIxnmUADXzv2kT",
            images : [ {
                height : 640,
                url : "https://i.scdn.co/image/ac68a9e4a867ec3ce8249cd90a2d7c73755fb487",
                width : 629
            }, {
                height : 300,
                url : "https://i.scdn.co/image/d0186ad64df7d6fc5f65c20c7d16f4279ffeb815",
                width : 295
            }, {
                height : 64,
                url : "https://i.scdn.co/image/7c3ec33d478f5f517eeb5339c2f75f150e4d601e",
                width : 63
            } ],
            name : "Hot Fuss (Deluxe Version)",
            type : "album",
            uri : "spotify:album:4OHNH3sDzIxnmUADXzv2kT"
        },
        artists : [ {
            external_urls : {
                spotify : "https://open.spotify.com/artist/0C0XlULifJtAgn6ZNCW2eu"
            },
            href : "https://api.spotify.com/v1/artists/0C0XlULifJtAgn6ZNCW2eu",
            id : "0C0XlULifJtAgn6ZNCW2eu",
            name : "The Killers",
            type : "artist",
            uri : "spotify:artist:0C0XlULifJtAgn6ZNCW2eu"
        } ],
        available_markets : [ "AD", "AR", "AT", "AU", "BE", "BG", "BO", "BR", "CH", "CL", "CO", "CR", "CY", "CZ", "DE", "DK", "DO", "EC", "EE", "ES", "FI", "FR", "GB", "GR", "GT", "HK", "HN", "HU", "ID", "IE", "IS", "IT", "JP", "LI", "LT", "LU", "LV", "MC", "MT", "MY", "NI", "NL", "NO", "NZ", "PA", "PE", "PH", "PL", "PT", "PY", "SE", "SG", "SK", "SV", "TR", "TW", "UY" ],
        disc_number : 1,
        duration_ms : 222200,
        explicit : false,
        external_ids : {isrc : "GBFFP0300052"
        },
        external_urls : {
            spotify : "https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp"
        },
        href : "https://api.spotify.com/v1/tracks/3n3Ppam7vgaVa1iaRUc9Lp",
        id : "3n3Ppam7vgaVa1iaRUc9Lp",
        name : "Mr. Brightside",
        popularity : 73,
        preview_url : "https://p.scdn.co/mp3-preview/4839b070015ab7d6de9fec1756e1f3096d908fba",
        track_number : 2,
        type : "track",
        uri : "spotify:track:3n3Ppam7vgaVa1iaRUc9Lp"
    };

})();