/*
Name: CrossFade plugin
Version: 1.0
Author: Alex Raven
URL: http://www.esiteq.com/projects/JukeBox/
*/

console.log('CrossFade plugin loaded');
jb.audio_n = 0;
jb.audio1 = new Audio();

jb.playSong = function(path)
{
    console.log('CrossFade Playing '+path);
    var that = jb;
    var caudio;
    if (jb.audio_n == 0) { caudio = that.audio; } else { caudio = that.audio1; } 
    caudio.src = 'media/' + path;
    caudio.play();
};

jb.playNext = function()
{
    console.log('CrossFade playNext');
    var that = jb;
    var caudio;
    if (jb.audio_n == 0) { caudio = that.audio; } else { caudio = that.audio1; }

    jb.playing = false;
    caudio.pause();
    caudio.currentTime = 0;
    if (jb.playlist.length == 0)
    {
        $.notify('Плейлист кончился!');
        return false;
    }
    jb.playlist.shift();
    jb.renderPlaylist();
    jb.playPlaylist();
    console.log('Ended ' + jb.audio.src);
};

jb.timeUpdate = function()
{
    console.log('CrossFade timeupdate');
    var that = jb;
    var caudio;
    if (jb.audio_n == 0) { caudio = that.audio; } else { caudio = that.audio1; }
    var time_left = caudio.duration - caudio.currentTime;
    if (time_left < 1)
    {
        console.log()
    }
    var percent = (caudio.currentTime / caudio.duration) * 100;
    $('#current-sec').html(caudio.currentTime);
    $('#total-sec').html(caudio.duration + ' (' + percent + '%) ' + that.minSec(caudio.currentTime));
    $('#play-progress').css('width', percent+'%');
    $('#current-time').html(that.minSec(caudio.currentTime, false, false));
    $('#time-playing').html(that.minSec(caudio.currentTime, false, false));
    $('#time-total').html(that.minSec(caudio.duration, false, false));
};