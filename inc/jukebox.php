<?php

/**
 * @author Alex Raven
 * @company ESITEQ
 * @URL http://www.esiteq.com/
 * @copyright 2016
 */

require_once realpath(dirname(__file__)) . '/dbconnect.php';
require_once realpath(dirname(__file__)) . '/../lib/getid3/getid3.php';

class JukeBox
{
    // media library can be spreaded over multiple directories
    var $mediaDir;
    var $media = array();
    var $mediaSubdirs = array();
    var $getID3;
    //
    function isWindows()
    {
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN')
        {
            return true;
        }
        return false;
    }
    //
    function utf($str)
    {
        if (!$this->isWindows()) return $str;
        return iconv('Windows-1251', 'UTF-8', $str);
    }
    //
    function win($str)
    {
        if (!$this->isWindows()) return $str;
        return iconv('UTF-8', 'Windows-1251', $str);
    }
    //
    function scanMediaSubdirs()
    {
        $this->mediaSubdirs[] = array();
        $this->mediaSubdirs = array_filter(glob($this->mediaDir . '/*'), 'is_dir');
        foreach ($this->mediaSubdirs as $key => $value)
        {
            $value = $this->utf($value);
            $this->mediaSubdirs[$key] = str_replace($this->mediaDir . '/', '', $value);
        }
        sort($this->mediaSubdirs);
    }
    //
    function truncateLibrary()
    {
        mysql_query("TRUNCATE TABLE library");
    }
    //
    function scanDir($dir)
    {
        $scanned = 0;
        $dir = $this->win($dir);
        $tmp = glob($this->mediaDir . '/' . $dir . '/*.mp3');
        $songs = array();
        foreach ($tmp as $song)
        {
            $info = $this->getID3->analyze($song);
            $duration = $info['playtime_string'];
            if (!$duration)
            {
                $duration = '0:00';
            }
            $pi = pathinfo($song);
            $type = strtolower($pi['extension']);
            $url = str_replace($this->mediaDir . '/', '', $this->utf($song));
            $songs[] = array(
                'url' => $url,
                'duration' => $duration,
                'type' => $type);
        }
        $dir = $this->utf($dir);
        $album_name = basename($dir);
        $this->media[] = array(
            'dir' => $dir,
            'album_name' => $album_name,
            'songs' => $songs);
        foreach ($songs as $song)
        {
            $url = mysql_real_escape_string($song['url']);
            $duration = mysql_real_escape_string($song['duration']);
            $type = mysql_real_escape_string($song['type']);
            $album = mysql_real_escape_string($album_name);
            $pi = pathinfo($song['url']);
            $title = str_replace('.' . $pi['extension'], '', $pi['basename']);
            $sql = "INSERT INTO library SET `artist`='{$album}', `album`='{$album}', `title`='{$title}', `url`='{$url}', `duration`='{$duration}', `type`='{$type}'";
            mysql_query($sql);
            $scanned++;
        }
        return $scanned;
    }
    //
    function scanMedia()
    {
        $this->scanMediaSubdirs();
        $this->media = array();
        foreach ($this->mediaSubdirs as $dir)
        {
            $this->scanDir($dir);
        }
    }
    //
    function printSubdirs()
    {
        $this->scanMediaSubdirs();
        if (!is_array($this->mediaSubdirs))
        {
            $this->mediaSubdirs = array();
        }
        echo json_encode($this->mediaSubdirs, JSON_PRETTY_PRINT);
    }
    //
    function printAlbums()
    {
        foreach ($this->media as $key => $album)
        {
            $dir = $this->utf(basename($album['dir']));
            echo '<option value="', $key, '">', $dir, '</option>', "\n";
        }
    }
    //
    function getMedia()
    {
        $this->media = array();
        $sql = "SELECT `album`, `duration`, `played`, `last_played`, `type`, `url` FROM library ORDER BY `album` ASC";
        $result = mysql_query($sql);
        $albums = array();
        while ($row = mysql_fetch_assoc($result))
        {
            /*
            $this->media[] = array(
            'dir' => $dir,
            'album_name' => $album_name,
            'songs' => $songs);
            $song = array('url' => $row['url'], );
            $this->media[$row['album']] = $song;
            */
            $albums[$row['album']][] = array('url' => $row['url'], 'duration' => $row['duration'], 'type' => $row['type'], 'played' => $row['played'], 'last_played' => $row['last_played']);
        }
        foreach ($albums as $key => $songs)
        {
            $this->media[] = array('album_name'=>$key, 'songs'=>$songs);
        }
        return $this->media;
    }
    //
    function __construct()
    {
        mysql_connect(DB_HOST, DB_USER, DB_PASS) or die("Can't connect to MySQL");
        mysql_select_db(DB_NAME) or die("Can't select DB");
        mysql_query("SET NAMES utf8");
        $this->getID3 = new getID3;
        $this->mediaDir = '../media';
    }
}

$jukebox = new JukeBox;

?>