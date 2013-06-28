var app = app || {};

// Overall view structure
//
// ApplicationView
// |
// + -> NavigationView
// |   |
// |   +-> NewUserForm
// |   |
// |   `-> LoginForm
// |
// `-> MainView
//     |
//     `-> AlertView

// Models
app.User = Backbone.Model.extend({
  url: '/users',

  defaults: {
    email:    null,
    username: null
  }
});

app.Session = Backbone.Model.extend({
  url: '/session'
})

// Views
app.ApplicationView = Backbone.View.extend({
  el: 'body',

  initialize: function() {
    var navigationView = new app.NavigationView({
      el: this.$('#navigation'),
      modalTarget: $(document.body)
    });

    new app.MainView({el: this.$('#main')});

    if (localStorage['userToken']) {
      navigationView.setLoginState();
    }

    this.listenTo(Backbone, 'login', navigationView.setLoginState);
  }

});

app.NavigationView = Backbone.View.extend({
  events: {
    'click #create-user': 'showUserForm',
    'click #log-in': 'showLoginForm'
  },

  showUserForm: function(e) {
    e.preventDefault();
    new app.NewUserForm().show(this.options.modalTarget);
  },

  showLoginForm: function(e) {
    e.preventDefault();
    new app.LoginForm().show(this.options.modalTarget);
  },

  setLoginState: function() {
    $('ul li.public').hide();
    $('ul li.private').show();
  }
});

app.AlertView = Backbone.View.extend({
  template: _.template($('#alert-template').html()),

  render: function() {
    this.$el.html(this.template(this.options));
    return this;
  },

  close: function() {
    this.remove();
  },

  show: function(elem) {
    // TODO: set timeout to automatically dismiss alert
    elem.prepend(this.render().el);
    $('#alert').bind('closed', _.bind(this.close, this));
  }
})

app.MainView = Backbone.View.extend({
  initialize: function() {
    this.listenTo(Backbone, 'alert', this.showAlert);
  },

  showAlert: function(message) {
    var alertView = new app.AlertView({message: message});
    alertView.show(this.$el);
  }
});

app.NewUserForm = Backbone.View.extend({
  template: _.template($('#new-user-form-template').html()),

  events: {
    'submit form': 'create'
  },

  create: function(e) {
    event.preventDefault();

    var user = new app.User();
    var formValues = this.$('form').serializeArray();

    this.listenTo(user, 'error', this.displayErrors);
    this.listenTo(user, 'sync', this.displaySuccess);

    _(formValues).each(function(pair) { user.set(pair.name, pair.value); });

    user.save();
  },

  displayErrors: function(model, xhr) {
    _(xhr.responseJSON.errors).each(function(error) {
      this.$('.errors').append('<li>' + error + '</li>');
    });
  },

  displaySuccess: function(model, resp) {
    $('#new-user-form').modal('hide');
    Backbone.trigger('alert', "Created account for '" + model.get('username') + "'");
  },

  render: function() {
    this.$el.html(this.template());
    return this;
  },

  close: function() {
    this.stopListening();
    this.trigger('close');
    this.remove();
  },

  show: function(elem) {
    elem.append(this.render().el);

    // TODO: Chain these on multiple lines?
    $('#new-user-form').on('hidden', _.bind(this.close, this)).modal();
  }

});

app.LoginForm = Backbone.View.extend({
  template: _.template($('#login-form-template').html()),

  events: {
    'submit form': 'login'
  },

  login: function(event) {
    event.preventDefault();

    var session = new app.Session();
    var formValues = this.$('form').serializeArray();

    this.listenTo(session, 'sync', this.persistLogin);
    this.listenTo(session, 'error', this.displayErrors);

    _(formValues).each(function(pair) { session.set(pair.name, pair.value); });

    session.save();
  },

  persistLogin: function(model, response) {
    localStorage['userToken'] = response.token;
    $('#login-form').modal('hide');

    Backbone.trigger('alert', 'You have successfully logged-in')
    Backbone.trigger('login');
  },

  displayErrors: function(model, xhr) {
    _(xhr.responseJSON.errors).each(function(error) {
      this.$('.errors').append('<li>' + error + '</li>');
    });
  },

  close: function() {
    this.stopListening();
    this.trigger('close');
    this.remove();
  },

  render: function() {
    this.$el.html(this.template());
    return this;
  },

  show: function(elem) {
    elem.append(this.render().el);

    $('#login-form').on('hidden', _.bind(this.close, this)).modal();
  }
});
