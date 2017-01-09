(function () {

    /**
     * https://github.com/jmperez/spotify-web-api-js
     */

    var app = {};
    var spotifyApi = new SpotifyWebApi();

    var listOlder, listNewer;

    /*****************************************************************************
     *
     * Event listeners for UI elements
     *
     ****************************************************************************/

    document.getElementById("debug").addEventListener("click", function(event){
        event.preventDefault();
        listOlder = document.getElementById('2015').innerText;
        listNewer = document.getElementById('2016').innerText;
        app.comparePlaylists(listOlder, listNewer);
    });

    document.getElementById("mainSubmit").addEventListener("click", function(event){
        event.preventDefault();
        // @todo: Get the form values and pass them to app.comparePlaylists()
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
     * @todo validate spotify URL via regex and extract track ids
     * @param list
     */
    app.validateList = function (list) {

    };

    app.transformTracklist = function (trackList, delta) {
        var transformedTracklist = [], artists = [];
        for (var i = 0; i < trackList.length; i++) { //Newer List
            artists = trackList[i].artists.map(function(a) { return a.name; });
            transformedTracklist[i] = {
                'artists' : artists,
                'name' : trackList[i].name,
                'delta' : delta[i],
                'image' : trackList[i].album.images[2].url
            }
        }
        return transformedTracklist;
    };

    app.getTracksFromList = function (list) {
        var separator = " "; // TODO be prepared this may change
        list = list.split(separator);
        return list.map(function(url) { return url.substr(31,22); });
    };

    app.comparePlaylists = function (listOlder, listNewer) {

        listOlder = app.getTracksFromList(listOlder);
        listNewer = app.getTracksFromList(listNewer);

        // Define separately to avoid reference issues
        var results = {
            'older' : [],
            'newer' : []
        };
        var trackIds = {
            'older' : [],
            'newer' : []
        };
        var diff = {
            'older' : []
        };

        var match, shift;
        // Work out the diff based on the newer list
        for (var i = 0; i < listNewer.length; i++) {
            match = shift = 0;

            for (var j = 0; j < listOlder.length; j++) {

                if (listNewer[i] === listOlder[j]) {
                    // We have a match, work out the shift
                    match = 1;
                    shift = j - i;
                    break;
                }
            }

            results.newer[i] = match ? shift : 'New';
            //results.newer[i] = match ? shift : 'New';
            // The reciprocal results
            results.older[listNewer[i]] = typeof results.newer[listNewer[i]] != 'string' ? results.newer[i] : 'New'; //TODO
        }

        for (i = 0; i < listOlder.length; i++) {
            diff.older[i] = results.older[listOlder[i]];
        }
        delete results.older;
        results.older = diff.older;

        app.getTrackDataAndUpdate(createGroupedArray(listNewer, 36), results.newer, 'tableNewer');
        app.getTrackDataAndUpdate(createGroupedArray(listOlder, 36), results.older, 'tableOlder');
    };

    app.getArtistOccurrancesFromTransformedTracks = function (transformedTrackList) {
        var artistOccurances = {};
        for (var i = 0; i < transformedTrackList.length; i++) {
            var artists = transformedTrackList[i].artists;
            for (var j = 0; j < artists.length; j++) {
                // @todo weight rankings via exponential function
                if (artistOccurances[artists[j]] > 0) {
                    artistOccurances[artists[j]]++;
                }
                else {
                    artistOccurances[artists[j]] = 1;
                }
            }
        }
        return artistOccurances;
    };

    app.getTopArtists = function (artistOccurances, count) {
        var sortedArtistOccurances = Object.keys(artistOccurances).sort(function(a,b){return artistOccurances[b]-artistOccurances[a]});
        var topTracks = [];
        for (var i = 0; i < count; i++) {
            topTracks[i] = {
                'name' : sortedArtistOccurances[i],
                'count' : artistOccurances[sortedArtistOccurances[i]]
            }
        }
        return topTracks;
    };

    /**
     *
     */
    app.getTrackDataAndUpdate = function (chunkedArray, diff, tableId) {
        var trackList = [];
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
            .then(function(trackList){
                //console.log(trackList);
                return app.transformTracklist(trackList, diff);
            })
            .then(function(transformedTrackList){
                console.log(transformedTrackList);
                var artistOccurrances = app.getArtistOccurrancesFromTransformedTracks(transformedTrackList);
                console.log(app.getTopArtists(artistOccurrances, 10));

                app.updateTable(transformedTrackList, tableId);
            });
    };

    app.updateTable = function (transformedTrackList, tableId) {

        var table = document.getElementById(tableId);
        if (table.innerHTML == "") {
            var tableColumnNames = ['#', 'Song', 'Artist', '&Delta;'];
            var header = table.createTHead();
            var headerRow = header.insertRow(0);
            for (var i = 0; i < tableColumnNames.length; i++) {
                headerRow.insertCell(i).innerHTML = tableColumnNames[i];
            }

            // To avoid the rows being added to the table header
            table.appendChild(document.createElement('tbody').appendChild(document.createElement('tr')));

            var position = 0;
            for (i = 0; i < transformedTrackList.length; i++) {
                // Add row to table
                position = i + 1;
                var image = '<img src="' + transformedTrackList[i].image + '"> ';
                var row = table.insertRow();
                row.insertCell(0).outerHTML = '<th scope="row">' + position.toString() + '</th>';
                row.insertCell(1).innerHTML = image + transformedTrackList[i].name;
                row.insertCell(2).innerHTML = transformedTrackList[i].artists.join(', ');
                row.insertCell(3).innerHTML = transformedTrackList[i].delta;
            }
        } else {
            table.innerHTML = "";
            app.updateTable(transformedTrackList, tableId);
        }
    };

    // Example track response
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




