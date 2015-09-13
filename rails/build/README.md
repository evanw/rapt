# Robots Are People Too

RAPT is a complex and challenging HTML5 platformer. The exit to each level is blocked by enemies that roll, jump, fly, and shoot to prevent escape at all costs. Gameplay is exclusively two-player and uses a unique split-screen mechanic. The levels and enemies are designed to promote cooperation between players.

RAPT also comes with a powerful level editor which allows players to create levels of any size. Levels are saved to the player's account on the server, which has a public page listing custom levels. Link to this page for a simple way of sharing levels with friends!

Our server is written in Rails and is currently hosted at [http://raptjs.com/](http://raptjs.com/). The game and editor are written entirely in JavaScript using just the HTML5 canvas API and some jQuery, and contain a little over 20,000 lines of JavaScript.

### Building and Running RAPT

After cloning this repository, run this in the root directory:

    python build.py release

This will combine all separate *.js files into two large files, run them through Google Closure Compiler, and place the result in the `rails` subfolder.  Next, from the `rails` subfolder, run the server:

    bundle install
    rake db:setup
    ruby script/rails server

This will create a server at http://localhost:3000/.

### More Information

This project is actually a port of a [previous iteration](http://raptgame.com/) written in C++ using OpenGL. Because this project was a port, performance has always been an issue for us. We were able to raise our rendering performance to an acceptable level but physics performance is still an issue.

The C++ version relied on a locked physics tick of 100 FPS, which just can't be done yet in modern browsers. We were able to bring this down to 60 FPS without impacting game mechanics, but anything under that caused gameplay issues. As a result RAPT only really runs well in Google Chrome, which has the lowest costs for function calls and object allocations. We tried bringing up performance in Firefox by inlining a lot of our 2D vector operations and unnecessary allocations (automatically via `game/js_inline.py`) but it only gave performance gains of 5-10% in Firefox.

RAPT uses vector graphics exclusively which originally caused performance problems with the split screen camera, since it has to draw the entire screen twice with non-rectangular polygon clipping. This was solved by rendering the level background to two canvas elements and using those to draw the background instead. To avoid creating a humongous canvas, caching is done just around the player in an area twice as big as the screen. The cache is re-centered around the player whenever the screen goes off the cache.

### License

Copyright (C) 2010 Evan Wallace, Justin Ardini, and Kayle Gishen

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.
