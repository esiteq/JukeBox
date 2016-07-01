<?php

/**
 * @author Alex Raven
 * @company ESITEQ
 * @URL http://www.esiteq.com/
 * @copyright 2016
 */

$json = array();

require_once realpath(dirname(__file__)). '/../inc/jukebox.php';

if ($_GET['action'] == 'get-playlist')
{
    $media  = $jukebox->getMedia();
    $json = array_merge($json, $media);
}

if ($_GET['action'] == 'scan-dir')
{
    $json = $_GET;
    $scanned = $jukebox->scanDir($_GET['dir']);
    $json = array('dir'=> $_GET['dir'], 'scanned'=>$scanned);
}

if ($_GET['action'] == 'get-subdirs')
{
    $jukebox->scanMediaSubdirs();
    $json = $jukebox->mediaSubdirs;
}

echo json_encode($json);
?>