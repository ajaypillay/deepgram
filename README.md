# Deepgram Coding Project

This is built in [Meteor](https://www.meteor.com/), where the Meteor server handles all the API requests.

1. Send an audio file

Usage: `curl -X POST -H "Content-Disposition: attachment; name='yourAudioFile.wav'" --data-binary @yourAudioFile.wav localhost:3000/post`

Possible Responses:

    1. `yourAudioFile.wav` saved.

    2. `yourAudioFile.wav` already exists, please rename.

    3. ERROR: Unable to save file: `reason for error`

2. Get (download) a stored file

Usage: `curl -X GET localhost:3000/download?name=X --output fileNameToSaveAs.wav`

Query Parameters:

    1. REQUIRED: `?name=X` for some filename X (including file extension)

Possible Responses:

    1. JSON object of the form:

    `{
        name: "filename.wav",
        duration: XXX,
        bitrate: XXX,
        etc
    }`

    2. ERROR: File does not exist.

3. Get a list of all stored files

Usage: `curl -X GET localhost:3000/list`

Query Parameters:

    1. `?minduration=X` for some integer X
    2. `?maxduration=X` for some integer X
    3. `?sort=X` for any X in ["la", "ld", "da", "dd"] where "la" = "lexicographical ascending", "ld" = "lexicographical descending", "da" = "duration ascending", "dd" = "duration descending".

Possible Responses:

    1. JSON object of the form:

    `{
        files: ["file1.wav",...,"fileN.wav"]
    }`

    Where files is empty if there are no files stored. Defaults to lexicographical ascending.

    2. ERROR: Unable to get files: `reason for error`


4. Get metadata of stored files

Usage: `curl -X GET localhost:3000/info?name=X`

Query Parameters:

    1. REQUIRED: `?name=X` for some filename X (including file extension)

Possible Responses:

    1. JSON object of the form:

    `{
        name: "filename.wav",
        duration: XXX,
        bitrate: XXX,
        etc
    }`

    2. ERROR: File does not exist.


Done by Ajay Pillay, University of Michigan.