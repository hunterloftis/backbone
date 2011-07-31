$(document).ready(function() {

  module("Backbone.Dependent");

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
  
  test("can bind and trigger from normal attributes", function() {
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
    user.set({ first_name: 'Amy' });
    strictEqual(full_name, 'Amy Loftis', 'full_name should update to Amy Loftis when first_name changes.');
    user.set({ last_name: 'Lynn' });
    strictEqual(full_name, 'Amy Lynn', 'full_name should update to Amy Lynn when last_name changes.');
  });

  test("can bind and trigger from other dependents", function() {
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
    user.set({ first_name: 'Amy' });
    strictEqual(name_length, 10, 'name_length should update to 10.');
    user.set({ last_name: 'Lynn' });
    strictEqual(name_length, 8, 'name_length should update to 8.');
  });
  
  test("dynamically tracks dependencies", function() {
    var counter = 0;
    var TestModel = Backbone.Model.extend({
      defaults: {
        a: 1,
        b: 2,
        c: 3,
        active: 0
      },
      dependents: {
        dynamic: function() {
          counter++;
          var active = this.get('active');
          var map = ['a', 'b', 'c'];
          var depends_on = this.get(map[active]);
          return depends_on;
        }
      }
    });
    strictEqual(counter, 0, 'counter should start at 0.');
    var test = new TestModel();
    strictEqual(counter, 1, 'counter should be 1 after model instance is created.')
    strictEqual(test.get('dynamic'), 1, 'first dependency should be a');
    strictEqual(counter, 1, 'counter should still be 1 after get() since result is the same.');  // It should cache the last computed result in _currentResult
    test.set({ b: 10, c: 10 });
    strictEqual(counter, 1, 'counter should still be 1 after unrelated attributes are set.');
    test.set({ b: 2, c: 3 });
    test.set({ active: 1 });
    strictEqual(counter, 2, 'counter should be 2 after "active" is updated.');
    test.set({ active: 1 });
    strictEqual(counter, 2, 'counter should still be 2 after duplicate set() to "active."');
    strictEqual(test.get('dynamic'), 2, 'second dependency should b b');
    test.set({ active: 2 });
    strictEqual(counter, 3, 'counter should be 3 after third update.');
    test.set({ a: 10, b: 10 });
    test.set({ a: 20, b: 20 });
    strictEqual(counter, 3, 'counter should still be 3 after updating expired dependencies.');
    strictEqual(test.get('dynamic'), 3, 'third dependency should be c');
  });
  
  test("dependents work across different Models and model instances", function() {
    var base = new Backbone.Model({
      val: 1
    });
    var PlusModel = Backbone.Model.extend({
      defaults: {
        delta: 1
      },
      dependents: {
        val: function() {
          var ref = this.get('reference'),
              delta = this.get('delta');
          if (typeof(ref) === 'undefined') return -1;
          return ref.get('val') + delta;
        }
      }
    });
    var a = new PlusModel({ reference: base });
    var b = new PlusModel({ reference: a, delta: 10 });
    strictEqual(base.get('val'), 1, 'base value should be 1.');
    strictEqual(a.get('val'), 2, 'value of "a" should be 2.');
    strictEqual(b.get('val'), 12, 'value of "b" should be 12.');
  });

});