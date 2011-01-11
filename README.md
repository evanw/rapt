# Robots Are People Too

RAPT is a complex and challenging HTML5 platformer. The exit to each level is blocked by with enemies that roll, jump, fly, and shoot to prevent escape at all costs. Gameplay uses a unique split-screen mechanic and is exclusively two-player.  It is currently hosted at http://raptjs.heroku.com/.

The game and the editor are written entirely in JavaScript using just the HTML5 canvas API and some jQuery, and the server is written in Rails. Our code base contains a little over 20,000 lines of JavaScript.

### Building and Running RAPT

After cloning this repository, run this in the root directory:

    python build.py release

This will combine all separate *.js files into two large files, run them through Google Closure Compiler, and place the result in the `rails` subfolder.  Next, from the `rails` subfolder, run the server:

    rake db:setup
    rails s

This will create a server at http://localhost:3000/.

### More Information

This project is actually a port of a [previous iteration](http://raptgame.com/) written in C++ using OpenGL. Because this project was a port, performance has always been an issue for us. We were able to raise our rendering performance to an acceptable level but physics performance is still an issue.

The C++ version relied on a locked physics tick of 100 FPS, which just can't be done yet in modern browsers. We were able to bring this down to 60 FPS without impacting game mechanics, but anything under that caused weird gameplay issues. As a result RAPT only really runs well in Google Chrome, which has the lowest costs for function calls and object allocations. We tried bringing up performance in Firefox by inlining a lot of our 2D vector operations and unnecessary allocations (automatically via `game/js_inline.py`) but it only gave performance gains of 5-10% in Firefox.

RAPT uses vector graphics exclusively which originally caused performance problems with the split screen camera, since it has to draw the entire screen twice with non-rectangular polygon clipping. This was solved by rendering the level background to two canvas elements and using those to draw the background instead. To avoid creating a humongous canvas, caching is done just around the player in an area twice as big as the screen. The cache is re-centered around the player whenever the screen goes off the cache.
