# Backbone.ExtendedView
Additional method for backbone view;

- render
- destroy
- bindUIElements
- unbindUIElements
- bindEvents
- unbindEvents
- renderChildView
- serializeData

Data for template you can pass into `data` param.
```javascript
var View = Backbone.ExtendedView.extend({
    data: {}
});

//or

var view = View({
    data: {}
});
```