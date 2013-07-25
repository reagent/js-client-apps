var app = app || {};

// Views

app.ApplicationView = Backbone.View.extend({
  el: 'body',

  initialize: function() {
    var navigationView = new app.NavigationView({
      el: this.$('#navigation'),
      modalTarget: $(document.body)
    });

    new app.MainView({el: this.$('#main')});

    if (app.currentUser.isLoggedIn()) {
      navigationView.setLoginState();
    }

    this.listenTo(app.currentUser, 'login', navigationView.setLoginState);
  }

});

app.NavigationView = Backbone.View.extend({
  events: {
    'click #create-user': 'showUserForm',
    'click #log-in': 'showLoginForm',
    'click #current-account-show': 'showCurrentAccount',
    'click #post-article': 'showArticleForm'
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

  showArticleForm: function(e) {
    e.preventDefault();
    new app.ArticleForm().show(this.options.modalTarget);
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

    this.model.save(updates, {attrs: updates});
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

      $elem.html(input.render().el).find('input').focus();
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

  modalSelector: '#current-account-show',

  displayDialog: function(elem) {
    elem.prepend(this.render().el);
    var other = $(this.modalSelector);

    other.on('hidden', _.bind(this.close, this))
    other.modal();
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

app.NewUserForm = app.CreateForm.extend({
  template: _.template($('#new-user-form-template').html()),

  modalSelector: '#new-user-form',

  initializeModel: function() {
    this.model = new app.User();
  },

  handleSuccess: function(model, resp) {
    $('#new-user-form').modal('hide');
    Backbone.trigger('alert', "Created account for '" + model.get('username') + "'");
  },

});

app.LoginForm = app.CreateForm.extend({
  template: _.template($('#login-form-template').html()),

  modalSelector: '#login-form',

  initializeModel: function() {
    this.model = new app.Session();
  },

  handleSuccess: function(model, response) {
    app.currentUser.logInWith(response.token, _.bind(function() {
      $(this.modalSelector).modal('hide');
      Backbone.trigger('alert', 'You have successfully logged-in');
    }, this));
  },

});

app.ArticleForm = app.CreateForm.extend({
  template: _.template($('#article-form-template').html()),

  modalSelector: '#article-form',

  initializeModel: function() {
    this.model = new app.Article();
    this.model.token = localStorage['userToken'];
  },

  handleSuccess: function(model, response) {
    $('#article-form').modal('hide');
    Backbone.trigger('alert', "Created article '" + model.get('title') + "'");
  }

});
