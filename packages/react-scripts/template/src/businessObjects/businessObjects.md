# Business objects

Each business objects library should contain a json(or js, exporting an object) config file like this:

```javascript
{
  title: 'LibraryName',
  models: [
    {
      title: 'modelName',
      // Array of models, that also should be configured, to use this model (Mostly, should be dublication of foreign keys configs)
      // Also, this models will be passed into editComponent as restify entities and as entityEditorActions
      dependsOn: ['otherModelName'],
    },
  ],
}
```

`modelName` should correspond to the name of the folder, in library
Each folder should contain an `index.js` file, exporting the following object:
```javascript
{
  model: {}, // Restify model config
  form: {}, // Restify form config, this config will be used as default config, for editing and creating entities of that type
  editComponent: ({
    model: PropTypes.object.isRequired,
    modelErrors: PropTypes.object,
    modelValid: PropTypes.bool,

    modelFormActions: PropTypes.object,
    modelActions: PropTypes.object,
    modelApiActions: PropTypes.object,
  }) => (<div></div>), // React component, that is used for displaying editing form of the entity
  actions: {
    // Optional, a function to map restify model into restify form for editing
    // By default, using restify mapModelToForm action
    mapModelToForm = (model, formActions) => {},
    // Optional, for submitting entity form.
    // Should return a Promise, resolving with object { data: RestifyModel, status: HttpCodeStatus }, when entity is successfully saved
    // By default, using restify form.submit() action
    submitEntityForm = (modelFormName, cancelAction, submitAction) => Promise(),
    // Same purpose, as submitEntityForm, but can be used for diferrintiate creation and editing of entity
    submitCreateEntityForm = (modelFormName) => Promise(),
    submitEditEntityForm = (modelFormName) => Promise(),
  },
}

```

# Predefined business objects
We can use some default Trood services, such as:
1. files
