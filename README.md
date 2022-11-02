# Deepgram Coding Project

This is built in [Meteor](https://www.meteor.com/), where the Meteor server handles all the API requests. Currently only supports .wav files.

## 1. Send an audio file

Usage:

    curl -X POST -H "Content-Disposition: attachment; name='yourAudioFile.wav'" --data-binary @yourAudioFile.wav localhost:3000/post

Possible Responses:

1. `yourAudioFile.wav` saved.

2. `yourAudioFile.wav` already exists, please rename.

3. ERROR: Unable to save file: `<reason for error>`

## 2. Get (download) a stored file

Usage:
    
    curl -X GET localhost:3000/download?name=X --output fileNameToSaveAs.wav

Query Parameters:

1. REQUIRED: `?name=X` for some filename X (including file extension)

Possible Responses:

1. Raw binary of the requested file, which will be saved to `fileNameToSaveAs.wav` as specified in the `curl` command.

2. ERROR: File does not exist.

## 3. Get a list of all stored files

Usage:
    
    curl -X GET localhost:3000/list

Query Parameters:

1. `?minduration=X` for some numerical value X representing duration in seconds
2. `?maxduration=X` for some numerical value X representing duration in seconds
3. `?sort=X` for any X in ["la", "ld", "da", "dd"] where:
    - "la" = "lexicographical ascending"
    - "ld" = "lexicographical descending"
    - "da" = "duration ascending"
    - "dd" = "duration descending"

Note: To chain parameters in a `curl` command correctly, the URL must be enclosed in "" so that the & is escaped correctly (ie: `localhost:3000/list?sort=ld&minduration=50"`).

Possible Responses:

1. JSON object of the form:

        {
            files: [
                {
                    filename: "file1.wav",
                    duration: X
                },
                .
                .
                .
                ,{
                    filename: "fileN.wav",
                    duration: X
                }
            ]
        }

Where files is empty if there are no files stored. Defaults to lexicographical ascending.

2. ERROR: Unable to get files: `<reason for error>`

## 4. Get metadata of stored files

Usage:
    
    curl -X GET localhost:3000/info?name=X

Query Parameters:

1. REQUIRED: `?name=X` for some filename X (including file extension)

Possible Responses:

1. JSON object of the form:

        {
            "riff_head": "RIFF",
            "chunk_size": 1323036,
            "wave_identifier": "WAVE",
            "fmt_identifier": "fmt ",
            "subchunk_size": 16,
            "audio_format": 1,
            "num_channels": 1,
            "sample_rate": 22050,
            "byte_rate": 44100,
            "block_align": 2,
            "bits_per_sample": 16,
            "data_identifier": "data",
            "duration": 30
        }

Includes .wav file metadata from the [canonical WAVE file format](http://soundfile.sapp.org/doc/WaveFormat/) including duration of the audio in seconds.

2. ERROR: No filename provided.

3. ERROR: `yourFile.wav` does not exist.


Done by Ajay Pillay, University of Michigan.