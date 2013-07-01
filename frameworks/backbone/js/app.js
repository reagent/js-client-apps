var app = app || {};

// Key code lookup for keydown events
app.keyCodes = {};
app.keyCodes.Enter = 13;

// Overall view structure
//
// ApplicationView
// |
// + -> NavigationView
// |   |
// |   +-> NewUserForm
// |   |
// |   +-> LoginForm
// |   |
// |   +-> CurrentAccountView
// |      |
// |      `-> InputView
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
});

app.Account = Backbone.Model.extend({
  url: '/account',

  token: null,

  save: function(attributes, options) {
    options = options || {};
    options.headers = options.headers || {}

    options.headers['X-User-Token'] = this.token;

    return Backbone.Model.prototype.save.apply(this, [attributes, options])
  },

  fetch: function(options) {
    options         = options || {};
    options.headers = options.headers || {}

    options.headers['Content-Type'] = 'application/json';
    options.headers['X-User-Token'] = this.token;

    return Backbone.Model.prototype.fetch.apply(this, [options]);
  }
});

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
    'click #log-in': 'showLoginForm',
    'click #current-account-show': 'showCurrentAccount'
  },

  showUserForm: function(e) {
    e.preventDefault();
    new app.NewUserForm().show(this.options.modalTarget);
  },

  showLoginForm: function(e) {
    e.preventDefault();
    new app.LoginForm().show(this.options.modalTarget);
  },

  showCurrentAccount: function(e) {
    e.preventDefault();
    new app.CurrentAccountView().show(this.options.modalTarget);
  },

  setLoginState: function() {
    $('ul li.public').hide();
    $('ul li.private').show();
  }
});

app.InputField = Backbone.View.extend({
  template: _.template('<input type="text" name="<%= name %>" value="<%= value %>" />'),

  events: {
    'keydown input': 'persistOnComplete'
  },

  initialize: function() {
    this.listenTo(this.model, 'sync', this.close);
  },

  render: function(elem) {
    this.$el.html(this.template(this.options));
    return this;
  },

  persistOnComplete: function(e) {
    if (e.keyCode === app.keyCodes.Enter) {
      this.persist();
    }
  },

  persist: function() {
    var $elem     = this.$('input'),
        attribute = $elem.attr('name'),
        value     = $elem.val();

    var updates = {};
    updates[attribute] = value;

    console.log(updates);

    this.model.save(updates, {patch: true});
  },

  close: function() {
    this.stopListening();
    this.trigger('close', this.$('input').val());
    this.remove();
  }
})

app.CurrentAccountView = Backbone.View.extend({
  template: _.template($('#current-account-show-template').html()),

  events: {
    'dblclick td[data-attribute]': 'makeFieldEditable'
  },

  initialize: function() {
    this.account = new app.Account();
    this.account.token = localStorage['userToken'];
  },

  makeFieldEditable: function(e) {
    var $elem = $(e.currentTarget);

    if ($elem.data('editing') !== '1') {
      $elem.data('editing', '1');

      var attributeName = $elem.data('attribute'),
          value         = $elem.html();

      var input = new app.InputField({
        model: this.account,
        name:  attributeName,
        value: value
      });

      this.listenTo(input, 'close', function(newValue) {
        $elem.html(newValue);
        $elem.data('editing', '0');
      });

      $elem.html(input.render().el);
    }
  },

  close: function() {
    this.stopListening();
    this.remove();
  },

  render: function() {
    this.$el.html(this.template(this.account.toJSON()));
    return this;
  },

  displayDialog: function(elem) {
    elem.prepend(this.render().el);
    $('#current-account-show').on('hidden', _.bind(this.close, this)).modal();
  },

  show: function(elem) {
    this.account.fetch({success: _.bind(this.displayDialog, this, elem)});
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
