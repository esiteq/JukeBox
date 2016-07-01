# JukeBox
JukeBox application written in Javascript, cross platform and responsive.

# Installation
To install and run it, you need PHP and MySQL.
1. Place files to your web server directory.
2. Create a database and import contents of `library.sql`.
2. Update `inc/dbconnect.php` with your MySQL host, username, password and db name.
3. Place your media files to `media` directory (see readme.txt in `media`).
4. Launch `http://your-server-url/library/`. It will scan `media` contents and cache them in database for faster access.
5. Launch `http://your-server-url/` and enjoy JukeBox :-)

# Usage
Select album with `q` and `a` keys, or mouse click. Select song with `p` and `l` or mouse double click. Space adds selected song to playlist. After adding first song, playlist will start automatically. `]` - skip current song and go to next. `+` to add coins.
