* Fetching a collection seems to require sending the content-type header manually (e.g. `articles.fetch({headers:{'Content-Type':'application/json'}})`)
* Developing Backbone.js Applications book
  * Book content is different between HTML version and PDF version (could be that one was not regenerated)
  * Code examples in the 'Internals' section changed between examples
  * Initial view code example is just wrong (use of tagName: 'li' meaningless, needed el: '#todo' instead)
  * Why `var TodoList` and `app.AppView` -- inconsistent code, or is there a reason?
  * Why `app.Todos` in some places, and `window.app.Todos` in others (e.g. binding to events)