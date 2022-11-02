# Deepgram Coding Project

This is built in Meteor, where the Meteor server handles all the API requests.

1. Send an audio file

Usage: `curl -X POST -H "Content-Disposition: attachment; name='yourAudioFile.wav'" --data-binary @yourAudioFile.wav`

Possible Responses:
    1. `yourAudioFile.wav` saved.
    2. `yourAudioFile.wav` already exists, please rename.
    3. ERROR: Unable to save file: `reason for error`

2. Get a list of all stored files



Done by Ajay Pillay, University of Michigan.