<!DOCTYPE HTML>
<html>
<head>
    <meta charset="UTF-8" />
	<meta http-equiv="content-type" content="text/html" />
	<meta name="author" content="Alex Raven" />
    <link rel="stylesheet" href="../css/bootstrap.min.css" />
	<title>JukeBox - Media Library</title>
    <script src="../js/jquery-3.0.0.min.js"></script>
</head>

<body>
<?php
require_once realpath(dirname(__file__)). '/../inc/jukebox.php';
$jukebox->truncateLibrary();
?>
<script>
var subdirs = <?php $jukebox->printSubdirs(); ?>;
var finished = false;
var total = 0;
var total_files = 0;
var scanned = 0;

function scanSubdir()
{
    if (subdirs.length == 0)
    {
        finished = true;
        $('#processing-name').html('<span style="color:green">Все папки были просканированы</span>');
    }
    else
    {
        $('#processing-left').html(subdirs.length);
        var dir = subdirs.shift();
        $('#processing-name').html('Обработка: '+dir);
        $.get('../ajax/?action=scan-dir', {dir: dir}, function(data)
        {
            total_files += data.scanned;
            scanned++;
            var percent = Math.round((scanned / total) * 100);
            $('#scan-progress').css('width', percent+'%');
            $('#total-scanned').html(total_files);
            scanSubdir();
        }, 'json');
    }
}

$(document).ready(function($)
{
    total = subdirs.length;
    scanSubdir();
});
</script>
<div class="container">
    <div class="row">
        <div class="col-md-12">
            <h1>Создание медиа библиотеки</h1>
        </div>
    </div>
    <div class="row">
        <div class="col-md-8">
            <p><span id="processing-name">&nbsp;</span></p>
        </div>
        <div class="col-md-4">
            <p class="text-right">Осталось: <span class="processing-left">0</span></p>
        </div>
    </div>
    <div class="row">
        <div class="col-md-12">
            <div class="progress">
                <div class="progress-bar" id="scan-progress" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width:0%">
                    <span class="sr-only">&nbsp;</span>
                </div>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-md-12">
            <p>Просканировано файлов: <span id="total-scanned">0</span></p>
        </div>
    </div>
</div>
</body>
</html>