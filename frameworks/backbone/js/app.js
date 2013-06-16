var app = app || {};

app.User = Backbone.Model.extend({
  url: '/users',

  defaults: {
    email:    null,
    username: null
  }
});

app.AppView = Backbone.View.extend({
  el: '#app',

  events: {
    'click #create-user': 'showNewUserForm'
  },

  initialize: function() {
    this.$formDisplay = $('#form-display');
  },

  showNewUserForm: function(event) {
    event.preventDefault();

    var newUserForm = new app.newUserForm();
    this.listenTo(newUserForm, 'close', this.closeNewUserForm);

    this.$formDisplay.html(newUserForm.render().el);
  },

  closeNewUserForm: function() {
    this.$formDisplay.html('');
  }

});

app.newUserForm = Backbone.View.extend({
  template: _.template($('#new-user').html()),

  events: {
    'submit form': 'createUser',
    'click button[type=reset]': 'closeForm'
  },

  createUser: function(event) {
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
    alert("Created account for '" + model.get('username') + "'")
    this.closeForm();
  },

  closeForm: function() {
    this.stopListening();
    this.trigger('close');
  },

  render: function() {
    this.$el.html(this.template());
    return this;
  }

});
