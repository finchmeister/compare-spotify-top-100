(function () {

    /**
     * Array chunk that
     * src: http://www.frontcoded.com/splitting-javascript-array-into-chunks.html
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


    var spotifyApi = new SpotifyWebApi();
    var separator = " "; // TODO be prepared this may change
    var listA = document.getElementById('2015').innerText;
    var listB = document.getElementById('2016').innerText;

    listA = listA.split(separator);
    listB = listB.split(separator);

    var results = [];
    var trackIds  = [];

    var match, shift;
    for (var i = 0; i < listB.length; i++) { //Newer List
        match = shift = 0;
        trackIds[i] = listB[i].substr(31,22);

        for (var j = 0; j < listA.length; j++) {

            if (listB[i] === listA[j]) {
                // We have a match, work out the shift
                match = 1;
                shift = j - i;
                break;
            }
        }
        //if (i > 20) break;

        results[i] = match ? shift : 'New';
    }


    // The request gets too big after about 40 Ids
    var chunkedArray = createGroupedArray(trackIds, 40);
    var trackList = [];
    var tracks = [];

    for (i = 0; i < chunkedArray.length; i++) {
        /*// TOdo, how to get this back in order
        spotifyApi.getTracks(chunkedArray[i], function(err, data) {
            if (err) console.error(err);
            else console.log('Tracks', data);
        });*/

        trackList[i] = spotifyApi.getTracks(chunkedArray[i]);
    }

    // ???
    for (i = 0; i < trackList.length; i++) {
        trackList[i].then(function(data) {
            //console.log('Artist albums', data);
            tracks = data;
        }, function(err) {
            console.error(err);
        })
    }



    console.log('TrackList', trackList);
    console.log('tracks', tracks);


})();




