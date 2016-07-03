/*
Name: Help
Version: 1.0
Author: Alex Raven
URL: http://www.esiteq.com/projects/JukeBox/
*/

console.log('Help plugin loaded');

document.addEventListener('jbAfterPlayPlaylist', function()
{
    $('#help-outer').addClass('hide');
    $('#stats-outer').removeClass('hide');
    //jb_plugins.Help.jbAfterPlayPlaylist();
});
//
//jb_plugins.Help.jbAfterInit = window.jbAfterInit;
document.addEventListener('jbAfterInit', function()
{
    var _help = `
<div id="help-outer">
<table class="title-table" id="help-title">
<tr>
<th class="text-center">Помощь</th>
</tr>
</table>
<div class="text-left">
<div class="row">
<div class="col-sm-12">
<p>Выбирайте альбом и исполнителя в левом списке (кликом или клавишами). При этом откроется список песен в правом списке.
Выбирайте песни и добавляйте их в плейлист (двойной клик или клавиши). Проигрывание начнется автоматически при добавлении
в плейлист хотя бы одной песни.</p>
</div>
</div>
<div class="row">
<div class="col-sm-1 text-right">&laquo;`+jb.album_up+`&raquo;</div>
<div class="col-sm-5">Предыдущий альбом</div>
<div class="col-sm-1 text-right">&laquo;`+jb.album_down+`&raquo;</div>
<div class="col-sm-5">Следующий альбом</div>
</div>
<div class="row">
<div class="col-sm-1 text-right">&laquo;`+jb.song_up+`&raquo;</div>
<div class="col-sm-5">Предыдущая песня</div>
<div class="col-sm-1 text-right">&laquo;`+jb.song_down+`&raquo;</div>
<div class="col-sm-5">Следующая песня</div>                    
</div>
<div class="row">
<div class="col-sm-1 text-right">&laquo;`+jb.song_select+`&raquo;</div>
<div class="col-sm-5">Выбор песни</div>
<div class="col-sm-1 text-right">&laquo;`+jb.coin_insert+`&raquo;</div>
<div class="col-sm-5">Подкинуть монет</div>                    
</div>
<div class="row">
<div class="col-sm-1 text-right">&laquo;`+jb.song_next+`&raquo;</div>
<div class="col-sm-5">Пропустить песню</div>
</div>
</div>
</div>`;

    $('#stats-box').append(_help);
    $('#help-outer').removeClass('hide');
    $('#stats-outer').addClass('hide');
});