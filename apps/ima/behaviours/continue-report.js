const config = require('../../../config');
const NotifyClient = require('notifications-node-client').NotifyClient;
const notifyApiKey = config.govukNotify.notifyApiKey;
const notifyClient = new NotifyClient(notifyApiKey);
const templateId = config.govukNotify.saveAndExitTemplateId;
const tokenGenerator = require('../../../db/save-token');
const utilities = require('../../../lib/utilities');
const DEFAULTS = config.sessionDefaults;

const getMandatorySteps = (mandatorySteps, steps) => {
  const currentStep = mandatorySteps[mandatorySteps.length - 1];
  const nextStep = steps[currentStep].next || steps[currentStep].journeyStart;
  if (nextStep) {
    mandatorySteps.push(nextStep);
    return getMandatorySteps(mandatorySteps, steps);
  }
  return mandatorySteps;
};

module.exports = superclass => class extends superclass {
  getValues(req, res, next) {
    const cepr = req.sessionModel.get('cepr');

    if (!cepr) {
      return res.redirect('/ima/continue-form');
    }

    req.sessionModel.set('redirect-to-summary', true);

    // steps in the session fall out of sync when changed from the current progress report page
    // this reorders them to ensure the user jumps to the last step they filled out
    const sessionSteps = req.sessionModel.get('steps');
    const formSteps = Object.keys(req.form.options.steps);
    const orderedSessionSteps = formSteps.filter(step => sessionSteps.includes(step));
    let lastestStepInJourney = orderedSessionSteps[orderedSessionSteps.length - 1];

    const serviceMandatorySteps = getMandatorySteps([formSteps[0]], req.form.options.steps);

    const indexOfLatestStep = serviceMandatorySteps.indexOf(lastestStepInJourney);
    const mandatoryStepsToLatestStep = serviceMandatorySteps.slice(0, indexOfLatestStep + 1);
    const sessionStepsContainMandatorySteps = mandatoryStepsToLatestStep.every(v => {
      return orderedSessionSteps.includes(v);
    });

    if (!sessionStepsContainMandatorySteps) {
      const missingSteps = mandatoryStepsToLatestStep.filter(v => !sessionSteps.includes(v));
      const firstMissingStep = missingSteps[0];
      const indexOfMissingStep = mandatoryStepsToLatestStep.indexOf(firstMissingStep);
      const correctedSteps = mandatoryStepsToLatestStep.slice(0, indexOfMissingStep + 1);

      req.sessionModel.set('steps', correctedSteps);
      lastestStepInJourney = correctedSteps[correctedSteps.length - 1];
    }

    if (orderedSessionSteps.length < DEFAULTS.steps.length) {
      req.sessionModel.set('steps', DEFAULTS.steps);
      lastestStepInJourney = DEFAULTS.steps[DEFAULTS.steps.length - 1];
    }

    req.sessionModel.set('save-return-next-step', lastestStepInJourney);

    return super.getValues(req, res, next);
  }

  locals(req, res) {
    return Object.assign({}, super.locals(req, res), {
      visitedImagesPage: req.sessionModel.get('steps').includes('/evidence-upload')
    });
  }

  saveValues(req, res, next) {
    super.saveValues(req, res, async err => {
      if (err) {
        next(err);
      }
      req.sessionModel.set('redirect-to-summary', false);
      if (req.body['save-and-exit']) {
        const host = req.get('host');
        const userEmail = req.form.values['user-email'] || req.sessionModel.get('user-email');
        const token = tokenGenerator.save(req, userEmail);
        try {
          await notifyClient.sendEmail(templateId, userEmail, {
            personalisation: utilities.getPersonalisation(host, token)
          });
        } catch (e) {
          return next(e);
        }
        return res.redirect('/ima/save-and-exit');
      }
      return res.redirect(`/ima${req.sessionModel.get('save-return-next-step')}`);
    });
  }
};
