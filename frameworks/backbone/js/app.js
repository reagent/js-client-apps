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

// Shared view elements
app.ModalView = Backbone.View.extend({
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
    $(this.modalSelector).on('hidden', _.bind(this.close, this)).modal();
  }
});

app.CreateForm = app.ModalView.extend({
  events: {
    'submit form': 'create'
  },

  initialize: function() {
    this.initializeModel();

    this.listenTo(this.model, 'sync', this.handleSuccess);
    this.listenTo(this.model, 'error', this.displayErrors);
  },

  create: function(event) {
    this.clearErrors();
    event.preventDefault();

    _(this.$('form').serializeArray()).each(function(pair) {
      this.model.set(pair.name, pair.value);
    }, this);

    this.model.save();
  },

  clearErrors: function() {
    this.$('#errors-general').hide();
    this.$('.control-group').removeClass('error');
    this.$('.control-group .controls .help-inline').remove();
  },

  displayErrors: function(model, xhr) {
    model.errors = xhr.responseJSON.errors.keyed;

    _(model.errors).each(function(messages, key) {
      this.showError(key, _(messages).join(', '));
    }, this);
  },

  showError: function(attribute, message) {
    if (attribute === 'general') {
      this.$('#errors-general').html(message).show();
    } else {
      var $field = this.$('#' + attribute + '-field');

      $field.addClass('error');
      $field.find('.controls').append('<span class="help-inline">' + message + '</span>');
    }
  }
});