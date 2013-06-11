# Client-Side Framework Bootstrap

This is just a simple structure to make it easy to use various client-side frameworks against an [existing API](https://github.com/reagent/js-frameworks).

# Setup

Fork this repository to your own account, and then clone it.  Once you have a local copy, run the local helper script to make sure everything is up-to-date:

    $ ./bin/setup

Once that's complete, you can use the `serve` script to have the local server point to the right root directory.  You can use (or add) a subdirectory under `frameworks` and then provide that value to the script:

    $ ./bin/serve backbone
    Starting server with '/tmp/js-client-apps/frameworks/backbone' as the root path
    >> Thin web server (v1.5.0 codename Knife)
    >> Maximum connections set to 1024
    >> Listening on 0.0.0.0:9292, CTRL+C to stop

