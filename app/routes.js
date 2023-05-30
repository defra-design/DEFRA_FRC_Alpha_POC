//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()
/*const CommodityVolumeGetController_Router = govukPrototypeKit.requests.setupRouter()
const AnnualIncomeController = govukPrototypeKit.requests.setupRouter()

const ParentCompanyController = govukPrototypeKit.requests.setupRouter()
const ParentCompanyIncomeController = govukPrototypeKit.requests.setupRouter()
const commodityvolumeController = govukPrototypeKit.requests.setupRouter()
const UserjourneyController = govukPrototypeKit.requests.setupRouter()
const applicationcompletionController = govukPrototypeKit.requests.setupRouter()
const AmendedCommodityController = govukPrototypeKit.requests.setupRouter()
const Static_AmendedCommodityController = govukPrototypeKit.requests.setupRouter()
const AppComplete_AmendedCommodityController = govukPrototypeKit.requests.setupRouter()
const ExemptionPeriodController = govukPrototypeKit.requests.setupRouter()
const AmendedExemptionPeriodController = govukPrototypeKit.requests.setupRouter()
const CommodityMethodsController = govukPrototypeKit.requests.setupRouter()*/

router.post('/Login-answer', function (req, res) {
  const accountholder = req.session.data['Accountholder'];

  if (accountholder == "Yes") {
    res.redirect('/signin')
  } else {
    res.redirect('/create-account')
  }
});

/*router.get('/session', function (req, res) {
  res.json(req.session)
});*/

router.post('/save-company', function (req, res) {
  const { company } = req.session.data;
  req.session.data = {
    company
  };

  req.session.save(() => {
    res.redirect('/Dashboard');
  })
});

router.post('/UserServices', function (req, res) {
  const { company } = req.session.data;
  req.session.data = { company };
  req.session.save(() => {
    res.redirect('/UserServices');
  })
})

router.post('/Userjourney', function (req, res) {
  const { Userservice } = req.session.data;
  req.session.data['complete'] = 'No';
  req.session.data['amendcomplete'] = 'No';

  req.session.save(() => {
    if (Userservice == "Exemption") {
      return res.redirect("/AnnunalTurnover")
    }

    res.redirect("/amendCommodities")
  });
});

router.post('/AnnualIncome', function (req, res) {
  const { AnnualIncome } = req.session.data;

  if (AnnualIncome < 500) {
    return res.redirect('/ParentCompany');
  }

  return res.redirect('/PeriodOfExemption');
});

router.post('/ParentCompany', function (req, res) {
  const { ParentCompany } = req.session.data;

  if (ParentCompany === "Yes") {
    return res.redirect('/ParentCompanyDetails')
  }
  res.redirect('/NoService')
});

router.post('/ParentCompanyAnnualIncome', function (req, res) {
  const { ParentCompanyAnnualIncome } = req.session.data;

  if (ParentCompanyAnnualIncome < 100) {
    return res.redirect('/NoService');
  }

  res.redirect('/PeriodOfExemption')
});

router.post('/exemptionperiod', function (req, res) {
  if (req.session.data.ExemptionPeriod) {
    const periods = req.session.data.ExemptionPeriod.split(' ');
    req.session.data['reportingPeriod'] = `${periods[1]} to ${periods[4]}`;
  }

  req.session.save(() => {
    res.redirect("/FRCcommodities");
  });
});

router.get('/CommodityVolumeController', function (req, res) {
  req.session.data['selectedCommodities'] = req.session.data['FRC'].map(commodity => {
    const config = req.session.data['commodities'].find(_config => _config.value === commodity)
    return {
      id: config.value,
      text: config.text,
      value: config.value,
      errorMessage: undefined,
    }
  });

  req.session.save(() => {
    res.redirect('/CommodityVolume');
  });
});


router.post('/commodityvolume', function (req, res) {
  const selectedCommodities = [...req.session.data['selectedCommodities']];
  const error = req.session.data['errors'].commodities

  Object.entries(req.body).forEach(([commodity, value]) => {
    const index = selectedCommodities.findIndex(_config => _config.id === commodity);
    selectedCommodities[index].commodityValue = value
    selectedCommodities[index].errorMessage = value > 999 ? error.invalid : undefined
  });
  req.session.data['selectedCommodities'] = selectedCommodities

  req.session.save(() => {
    if (selectedCommodities.find(commodity => commodity.errorMessage != undefined)) {
      return res.redirect("/CommodityVolume")
    }

    res.redirect("/CommodityDetermination")
  });
});


router.post('/getdata_amended_threshold', function (req, res) {

  const fromYear = req.session.data['threshold-change-year'];
  const fromMonth = req.session.data['threshold-change-month'];
  const fromPeriod = new Date(`${fromYear}-${fromMonth}-${String(new Date().getDate()).padStart(2, '0')}`).toLocaleString('en-us', {
    month: 'short', year: 'numeric'
  });
  const toPeriod = req.session.data['ExemptionPeriod'].split("to")[1];
  const reportingYear = req.session.data['reportingPeriod'].split('to');

  if (reportingYear && reportingYear.map(year => year.trim()).includes(fromYear)) {
    req.session.data['amendcomplete'] = 'Yes';
    req.session.data['thresholdchange_Amend'] = `${fromPeriod} to ${toPeriod}`;
    req.session.data['amendedCommodities'] = req.session.data['amendedCommodity'].map(commodity => {
      const config = req.session.data['commodities'].find(_config => _config.value === commodity)
      return {
        id: config.value,
        text: config.text,
      }
    });
    req.session.data['ammendYearError'] = 'No';

    return req.session.save(() => {
      res.redirect("/amendCommodityMethods");
    });
  }
  
  req.session.data['ammendYearError'] = 'Yes';
  return req.session.save(() => {
    res.redirect("/thresholdchange");
  });
});

router.post('/appcomplete', function (req, res) {

  const today = new Date();
  const yyyy = today.getFullYear();
  let mm = today.getMonth() + 1; // Months start at 0!
  let dd = today.getDate();

  if (dd < 10) dd = '0' + dd;
  if (mm < 10) mm = '0' + mm;

  const currentDate = dd + '/' + mm + '/' + yyyy;
  req.session.data['currentdate'] = currentDate;

  req.session.data['complete'] = 'Yes';
  res.redirect("/applicationcomplete");

});

/*
Static_AmendedCommodityController.post('/getdata_amend', function (req, res) {
  if (req.session.data['static_amend_commodity'] == "Soy") {
    res.redirect("/thresholdchange_soya");
  }
  else {
    res.redirect("/thresholdchange_rubber");
  }

});

AppComplete_AmendedCommodityController.post('/getdata_appcomplete', function (req, res) {
  if (req.session.data['static_amend_commodity'] == "Soy") {
    res.redirect("/application_complete_Soy");
  }
  else {
    res.redirect("/application_complete_rubber");
  }

});*/