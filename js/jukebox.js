/*
JukeBox v1.1
Author: Alex Bugrov
URL: https://github.com/esiteq/JukeBox/
*/

var JukeBox = function()
{
    var albums = null;
    var album_up;
    var album_down;
    var song_up;
    var song_down;
    var song_select;
    var coin_insert;
    var song_play;
    var song_next;
    var coins;
    var display_help= true;
    var audio       = null;
    var playlist    = null;
    var playing     = false;
    var footer_height;
    var plugins     = null;
    var box_margin_bottom;
    var afterInitFired = false;
    
    this.albums     = {};
    this.audio      = new Audio();
    this.playlist   = new Array();
    this.box_margin_bottom = 20;
    this.footer_height = 10;
    this.coins = 0;
    this.album_down  = 'a'; // a
    this.album_up    = 'q'; // q
    this.song_up     = 'p'; // p
    this.song_down   = 'l'; // l
    this.song_select = ' '; // space
    this.coin_insert = '+'; // gray +
    this.song_play   = "\n";// enter
    this.song_next   = ']'; // ]
    
    this.plugins = {
        Help:     {name: 'Help', enabled: true},
        //Spectrum: {name: 'Spectrum', enabled: true}
    }
}
//
function str_pad_left(string, pad, length)
{
    return (new Array(length+1).join(pad)+string).slice(-length);
}
//
function baseName(str)
{
    var base = new String(str).substring(str.lastIndexOf('/') + 1); 
    if(base.lastIndexOf('.') != -1)
    {       
        base = base.substring(0, base.lastIndexOf('.'));
    }
    return base;
}
//
JukeBox.prototype =
{
    //--- Redefinable functions
    jbAlbumUp: function()
    {
        $('#albums-select').focus();
        if (parseInt($('#albums-select').val())>0)
        {
            $('#albums-select').val(parseInt($('#albums-select').val())-1);
        }
    },
    //
    jbAlbumDown: function()
    {
        $('#albums-select').focus();
        if (parseInt($('#albums-select').val()) < $("#albums-select option").length-1)
        {
            $('#albums-select').val(parseInt($('#albums-select').val())+1);
        }
    },
    //
    jbSongUp: function()
    {
        $('#songs-select').focus();
        if (parseInt($('#songs-select').val())>0)
        {
            $('#songs-select').val(parseInt($('#songs-select').val())-1);
        }
    },
    //
    jbSongDown: function()
    {
        $('#songs-select').focus();
        if (parseInt($('#songs-select').val()) < $("#songs-select option").length-1)
        {
            $('#songs-select').val(parseInt($('#songs-select').val())+1);
        }
    },
    //
    playSong: function(path)
    {
        console.log('Playing '+path); 
        this.audio.src = 'media/' + path;
        this.audio.play();
    },
    //
    playPlaylist: function()
    {
        if (this.playlist.length == 0)
        {
            console.log('Playlist is empty');
            return false;
            this.playing = false;
        }
        var el = this.playlist.shift();
        this.playlist.unshift(el);
        console.log(el);
        this.renderPlaylist();
        this.playSong(el.path);
        $.notify('Проигрывается ' + el.song_title, 'warn');
        $('#stats-current').html(el.song_title);
        this.playing = true;
        var event = new CustomEvent('jbAfterPlayPlaylist', { });
        document.dispatchEvent(event);
    },
    //
    playNext: function()
    {
        this.playing = false;
        this.audio.pause();
        this.audio.currentTime = 0;
        if (this.playlist.length == 0)
        {
            $.notify('Плейлист кончился!');
            return false;
        }
        this.playlist.shift();
        this.renderPlaylist();
        this.playPlaylist();
        console.log('Ended ' + this.audio.src);
    },
    //
    renderPlaylist: function()
    {
        var that = this;
        var total_duration = 0;
        $pl = $('#playlist-select');
        $pl.empty();
        $.each(this.playlist, function(i,v)
        {
            $pl.append($('<option></option>').attr('value', i).text(v.album_title + ' / ' + v.song_title));
            total_duration += that.minSecToSec(v.duration);
        });
        $pl.val(0).focus();
        $('#total-playlist').html(this.playlist.length);
        $('#total-playlist-time').html(this.minSec(total_duration, true, true));
    },
    //
    renderAlbums: function()
    {
        var that = this;
        $.get('ajax/?action=get-playlist', { }, function(data)
        {
            console.log(data);
            if (Array.isArray(data))
            {
                that.albums = data;
                var $as = $('#albums-select');
                $as.empty();
                $.each(that.albums, function(i,v)
                {
                    album_name = '[' + str_pad_left(v.songs.length, '0', 3) + '] ' +baseName(v.album_name);
                    $as.append( $('<option></option>').attr('value', i).text(album_name) );
                });
                $as.val(0).focus();
                that.renderSongs();
                that.animateHeader();
                $('#loading-layer').css('display', 'none');
            }
            else
            {
                $.notify('Ошибка загрузки списка песен :-(');
            }
        }, 'json');
    },
    //
    renderSongs: function()
    {
        var sid = $('#albums-select').val();
        if (sid == null)
        {
            return false;
        }
        var songs = this.albums[sid].songs;
        $so = $('#songs-select');
        $so.empty();
        $.each(songs, function(i,v)
        {
            var song_name = '[' + v.duration + '] ' + baseName(v.url);
            $so.append($('<option></option>').attr('value', i).text(song_name));
        });
        $so.val(0).focus();
    },
    //
    animateHeader: function()
    {
        $('#the-title').rainbow(
        { 
            colors: [
            '#FF0000',
            '#f26522',
            '#fff200',
            '#00a651',
            '#28abe2',
            '#2e3192',
            '#6868ff'
            ],
            animate: true,
            animateInterval: 300,
            pad: false,
            pauseLength: 300,
        });
    },
    //
    getSong: function()
    {
        var album_id = $('#albums-select').val();
        var song_id = $('#songs-select').val();
        var album = this.albums[album_id];
        var song = album.songs[song_id];
        if (this.coins <= 0)
        {
            $.notify('Нужно больше золота!');
            return false;
        }
        if (song_id == null)
        {
            console.log('no songs');
        }
        else
        {
            var song = album.songs[song_id].url;
            var duration = album.songs[song_id].duration;
            var tmp = song.split('/');
            tmp.reverse();
            var song_title = baseName(song);
            var album_title = tmp[1];
            this.playlist.push(
            {
                album_id:album_id,
                album_title: album_title,
                song_id:song_id,
                song_title:song_title,
                path:song,
                duration:duration
            });
            this.renderPlaylist();
            $.notify('Добавлено ' + song_title, 'success');
            this.coins--;
            $('#total-coins').html(this.coins);
            if (!this.playing)
            {
                this.playPlaylist();
            }
        }
    },
    //
    minSecToSec: function(minsec)
    {
        var tmp = minsec.split(':');
        if (!Array.isArray(tmp) || tmp.length!=2)
        {
            return 0;
        }
        return parseInt(tmp[0])*60 + parseInt(tmp[1]);
    },
    //
    minSec: function(time, minpad, hour)
    {
        var ctime = Math.round(time);
        var hours = Math.floor(ctime / 3600);
        ctime = ctime - hours * 3600;
        var minutes = Math.floor(ctime / 60);
        var seconds = ctime - minutes * 60;
        var mnt = minutes;
        if (minpad == true)
        {
            mnt = str_pad_left(minutes, '0', 2);
        }
        var hrs = '';
        if (hour == true)
        {
            hrs = str_pad_left(hours, '0', 2) + ':';
        }
        return hrs + mnt + ':' + str_pad_left(seconds, '0', 2);
    },
    //
    insertCoin: function()
    {
        this.coins++;
        $('#total-coins').html(this.coins);
    },
    //
    windowResize: function()
    {
        // Albums
        $('#albums-outer').height($('#albums-box').height()-$('#albums-title').height());
        $('#albums-select').height($('#albums-outer').height()-this.box_margin_bottom);
        // Songs
        $('#songs-outer').height($('#songs-box').height()-$('#songs-title').height());
        $('#songs-select').height($('#songs-outer').height()-this.box_margin_bottom);
        // Playlist
        $('#playlist-outer').height($('#playlist-box').height()-$('#playlist-title').height());
        $('#playlist-select').height($('#playlist-outer').height()-this.box_margin_bottom-this.footer_height);
        // Stats
        $('#stats-table').height($('#stats-box').height()-this.box_margin_bottom*2-this.footer_height);
    },
    //
    jbAfterInit: function()
    {
        // function placeholder
    },
    //
    jbBoxTitle: function(box_id, title)
    {
        $('#'+box_id).find('th').html(title);
    },
    //
    Init: function()
    {
        var that = this;
        $('#albums-select').on('change', function(e)
        {
            that.renderSongs();
        });
        //
        $('#songs-select').on('dblclick', function(e)
        {
            that.getSong();
        });
        //
        this.audio.addEventListener('ended', function()
        {
            that.playNext();
        });
        //
        this.audio.addEventListener('timeupdate', function()
        {
            var percent = (that.audio.currentTime / that.audio.duration) * 100;
            $('#current-sec').html(that.audio.currentTime);
            $('#total-sec').html(that.audio.duration + ' (' + percent + '%) ' + that.minSec(that.audio.currentTime));
            $('#play-progress').css('width', percent+'%');
            $('#current-time').html(that.minSec(that.audio.currentTime, false, false));
            $('#time-playing').html(that.minSec(that.audio.currentTime, false, false));
            $('#time-total').html(that.minSec(that.audio.duration, false, false));
        });
        //
        $('#songs-select').on('change', function(e)
        {
            //getSong();
        });
        //
        $(document).keypress(function(e)
        {
            var code = e.which;
            if (code == that.album_up.charCodeAt(0))
            {
                that.jbAlbumUp();
                that.renderSongs();
                e.preventDefault();
            }
            if (code == that.album_down.charCodeAt(0))
            {
                that.jbAlbumDown();
                that.renderSongs();
                e.preventDefault();
            }
            if (code == that.song_up.charCodeAt(0))
            {
                that.jbSongUp();
                e.preventDefault();
            }
            if (code == that.song_down.charCodeAt(0))
            {
                that.jbSongDown();
                e.preventDefault();
            }
            if (code == that.song_select.charCodeAt(0))
            {
                that.getSong();
            }
            if (code == that.coin_insert.charCodeAt(0))
            {
                that.insertCoin();
            }
            if (code == that.song_play.charCodeAt(0))
            {
                that.playPlaylist();
            }
            if (code == that.song_next.charCodeAt(0))
            {
                that.playNext();
            }
            console.log(e.which);
        });
        $(window).resize(function()
        {
            that.windowResize();
        });
        that.windowResize();
        that.renderAlbums();
        $('#total-coins').html(that.coins);
        $('#loading-msg').rainbow(
        { 
            colors: [
            '#FF0000',
            '#f26522',
            '#fff200',
            '#00a651',
            '#28abe2',
            '#2e3192',
            '#6868ff'
            ],
            animate: true,
            animateInterval: 200,
            pad: false,
            pauseLength: 200,
        });
        //
        $.each(this.plugins, function(i,v)
        {
            var plugin = this;
            if (plugin.enabled)
            {
                plugin.loaded = false;
                $.jbLoadJS('plugins/'+plugin.name+'/plugin.js', function()
                {
                    if (that.allPluginsLoaded())
                    {
                        //
                        if (!that.afterInitFired)
                        {
                            var event = new CustomEvent('jbAfterInit', { });
                            document.dispatchEvent(event);
                        }
                        that.afterInitFired = true;
                    }
                    plugin.loaded = true;
                });
            }
        });
        //$('#video-iframe').width($('#video-container').width()).height($('#video-container').height()).css('display', 'block');
    },
    allPluginsLoaded: function()
    {
        $.each(this.plugins, function(i,v)
        {
            if (this.enabled && this.loaded == false)
            {
                return false;
            }
        });
        return true;
    }
}
//
var jb;
$(document).ready(function()
{
    jb = new JukeBox().Init();
    console.log(jb);
});
//---------------------------------------
function jbLoadAsset(assetId, type, href)
{
    if (!document.getElementById(assetId))
    {
        if (type == 'css')
        {
            var head  = document.getElementsByTagName('head')[0];
            var link  = document.createElement('link');
            link.id   = cssId;
            link.rel  = 'stylesheet';
            link.type = 'text/css';
            link.href = href;
            link.media = 'all';
            head.appendChild(link);
        }
        if (type == 'js')
        {
            var js = document.createElement('script')
            js.type = 'text/javascript';
            js.src = href;
        }
    }
}
//
jQuery.jbLoadJS = function (href, callback)
{
    jQuery.ajax(
    {
        url: href,
        dataType: 'script',
        success: callback,
        async: false
    });
}
