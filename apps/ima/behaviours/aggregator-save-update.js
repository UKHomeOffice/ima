module.exports = superclass => class extends superclass {
  constructor(options) {
    if (!options.aggregateTo) {
      throw new Error('options.aggregateTo is required for loops');
    }
    if (!options.aggregateFrom) {
      throw new Error('options.aggregateField is required for loops');
    }
    super(options);
  }

  deleteItem(req, res) {
    const id = req.params.id;

    let items = '';

    if (id) {
      items = this.getAggregateArray(req).filter((element, index) => index !== parseInt(id, 10));
      this.setAggregateArray(req, items);
    }

    if(items.length === 0 && `${req.form.options.route}` === '/human-rights-family-summary') {
      res.redirect(`${req.baseUrl}/human-rights-claim`);
    }

    res.redirect(`${req.baseUrl}${req.form.options.route}`);
  }

  updateItem(req, res) {
    const id = req.params.id;

    const items = this.getAggregateArray(req);

    if (items[id]) {
      items[id].fields.forEach(obj => {
        req.sessionModel.set(obj.field, obj.value);
      });

      items.splice(id, 1);
      this.setAggregateArray(req, items);
    }

    return this.redirectToAddStep(req, res);
  }

  addItem(req, res) {
    const items = this.getAggregateArray(req);
    const fields = [];

    let itemTitle = '';

    let undefinedValueExists = false;

    req.form.options.aggregateFrom.forEach(aggregateFromElement => {
      const aggregateFromField = aggregateFromElement.field || aggregateFromElement;
      const isTitleField = req.form.options.titleField === aggregateFromField;
      const value = req.sessionModel.get(aggregateFromField);

      // Check for an undefined title caused by pressing the browser back button after a deletion
      if (isTitleField && value === undefined) {
        undefinedValueExists = true;
      }

      let isRefNumber = false;

      if (isTitleField) {
        itemTitle = value;
      }

      if(aggregateFromElement === 'uan-detail') {
        isRefNumber = true;
      } else {
        isRefNumber = false;
      }

      fields.push({
        field: aggregateFromField,
        parsed: this.parseField(aggregateFromField, value, req),
        value,
        isRefNumber,
        showInSummary: !isTitleField,
        changeField: aggregateFromElement.changeField
      });

      this.setAggregateArray(req, items);
      req.sessionModel.unset(aggregateFromField);
    });

    const secondLastStep = req.sessionModel.get('steps')[req.sessionModel.get('steps').length - 1];

    // Bypass the adding of the SIH country if the name is undefined
    if (undefinedValueExists && (secondLastStep.includes('/harm-claim-details') ||
    secondLastStep.includes('/risk-of-harm') || secondLastStep === '/harm-claim-countries') &&
    req.sessionModel.get('sih-countries')) {
      res.redirect(`${req.baseUrl}/harm-claim-summary`);
    }

    // Bypass the adding of the SIH country if number of countries is 5 to overcome browser back button issue
    if ((secondLastStep.includes('/harm-claim-details') || secondLastStep.includes('/risk-of-harm') ||
    secondLastStep === '/harm-claim-countries') && req.sessionModel.get('sih-countries') &&
    req.sessionModel.get('sih-countries').aggregatedValues.length >= 5) {
      res.redirect(`${req.baseUrl}/harm-claim-summary`);
    }

    const newItem = { itemTitle, fields };

    items.push(newItem);

    this.setAggregateArray(req, items);
    res.redirect(`${req.baseUrl}${req.form.options.route}`);
  }

  getAggregateArray(req) {
    const aggregateToField = req.sessionModel.get(req.form.options.aggregateTo) || { aggregatedValues: [] };
    return aggregateToField.aggregatedValues;
  }

  setAggregateArray(req, value) {
    req.sessionModel.set(req.form.options.aggregateTo, { aggregatedValues: value });
  }

  newFieldsProvided(req) {
    let fieldsProvided = false;

    req.form.options.aggregateFrom.forEach(aggregateFromField => {
      if (req.sessionModel.get(aggregateFromField)) {
        fieldsProvided = true;
      }
    });

    return fieldsProvided;
  }

  redirectToAddStep(req, res) {
    return res.redirect(`${req.baseUrl}/${req.form.options.addStep}`);
  }

  getAction(req) {
    const noItemsPresent = this.getAggregateArray(req).length === 0;

    let action;

    if (this.newFieldsProvided(req)) {
      action = 'addItem';
    } else if (noItemsPresent) {
      action = 'redirectToAddStep';
    }

    return action || 'showItems';
  }

  getValues(req, res, next) {
    const action = req.params.action || this.getAction(req, res, next);
    this.handleAction(req, res, next, action);
  }

  handleAction(req, res, next, action) {
    switch (action) {
      case 'delete':
        this.deleteItem(req, res);
        break;
      case 'edit':
        this.updateItem(req, res);
        break;
      case 'addItem':
        this.addItem(req, res);
        break;
      case 'redirectToAddStep':
        this.redirectToAddStep(req, res);
        break;
      case 'showItems':
      default:
        return Object.assign({}, super.getValues(req, res, next), { redirected: false });
    }
    return { redirected: true };
  }

  parseField(field, value, req) {
    const fieldName = field.field || field;
    const parser = req.form.options.fieldsConfig[fieldName].parse;
    return parser ? parser(value) : value;
  }

  locals(req, res) {
    const items = this.getAggregateArray(req);

    items.forEach((element, index) => {
      element.index = index;
    });

    return Object.assign({}, super.locals(req, res), {
      items,
      hasItems: items.length > 0,
      addStep: req.form.options.addStep,
      field: req.form.options.aggregateTo,
      addAnotherLinkText: req.form.options.addAnotherLinkText
    });
  }
};
