$(document).ready(function() {

  module("Backbone.Dependents");

  var UserModel = Backbone.Model.extend({
    defaults: {
      'first_name': 'First',
      'last_name': 'Last'
    },
    dependents: {
      'full_name': function() {
        var fname = this.get('first_name'),
            lname = this.get('last_name');
        return fname + ' ' + lname;
      },
      'name_length': function() {
        var name = this.get('full_name') || '';
        return name.length;
      }
    }
  });
  
  test("Dependents: bind and trigger from normal attributes", function() {
    var user, full_name;
    user = new UserModel({
      first_name: 'Hunter',
      last_name: 'Loftis'
    });
    user.bind('change:full_name', function(model, name) {
      full_name = name;  
    }, user);
    full_name = user.get('full_name');
    strictEqual(full_name, 'Hunter Loftis', 'full_name should start as Hunter Loftis.');
    user.set({ first_name: 'Chris' });
    strictEqual(full_name, 'Chris Loftis', 'full_name should update to Chris Loftis when first_name changes.');
    user.set({ last_name: 'Gomez' });
    strictEqual(full_name, 'Chris Gomez', 'full_name should update to Chris Gomez when first_name changes.');
  });

  test("Dependents: bind and trigger from other dependents", function() {
    var user, name_length;
    user = new UserModel({
      first_name: 'Hunter',
      last_name: 'Loftis'
    });
    user.bind('change:name_length', function(model, length) {
      name_length = length;
    }, user);
    name_length = user.get('name_length');
    strictEqual(name_length, 13, 'name_length should start at 13.');
    user.set({ first_name: 'Chris' });
    strictEqual(name_length, 12, 'name_length should update to 12.');
    user.set({ last_name: 'Gomez' });
    strictEqual(name_length, 11, 'name_length should update to 11.');
    
  });

});