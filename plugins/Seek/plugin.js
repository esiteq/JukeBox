/*
Name: Seek Plugin
Version: 1.0
Author: Alex Raven
URL: http://www.esiteq.com/projects/JukeBox/
*/

var seek_time = 10; // seek 10 seconds

// Seek by clicking on Progress bar
$('.progress').css('cursor', 'pointer').click(function(e)
{
    e.preventDefault();
    if (!jb.playing)
    {
        return;
    }
    var x = e.offsetX;
    var width = $(this).width();
    var percent = x / width;
    var duration = jb.audio.duration;
    var current = jb.audio.currentTime;
    var newtime = percent * duration;
    jb.audio.currentTime = newtime;
});

// Seek with Left & Right cursor keys
$(document).keydown(function(e)
{
    if (e.which == 37) // left
    {
        if (jb.audio.currentTime - seek_time >=0)
        {
            jb.audio.currentTime -= seek_time;
        }
        e.preventDefault();
    }
    if (e.which == 39) // right
    {
        if (jb.audio.currentTime + seek_time < jb.audio.duration)
        {
            jb.audio.currentTime += seek_time;
        }
        e.preventDefault();
    }
    if (e.which == 35) // end
    {
        jb.audio.pause();
        jb.playlist.length = 0;
        jb.renderPlaylist();
        e.preventDefault();
    }
});

// Remove songs from playlist by double clicking them
$('#playlist-select').on('dblclick', function()
{
    if (jb.playlist.length == 0)
    {
        return;
    }
    var n = $(this).val();
    jb.playlist.splice(n, 1);
    jb.renderPlaylist();
});

// Immediately clear playlist & stop playing
