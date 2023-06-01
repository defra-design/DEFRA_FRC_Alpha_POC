//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

router.post('/Login-answer', function (req, res) {
  const accountholder = req.session.data['Accountholder'];

  if (accountholder == "Yes") {
    res.redirect('/signin')
  } else {
    res.redirect('/create-account')
  }
});

router.post('/select-company', function (req, res, next) {
  req.session.destroy();
  next()
});

router.post('/save-company', function (req, res) {
  const { company } = req.session.data;
  req.session.data = {
    company
  };

  req.session.save(() => {
    res.redirect('/dashboard');
  })
});

router.post('/user-services', function (req, res, next) {
  const { company } = req.session.data;
  req.session.data = { company };
  req.session.save(next)
})

router.post('/Userjourney', function (req, res) {
  const { Userservice } = req.session.data;
  req.session.data['complete'] = 'No';
  req.session.data['amendcomplete'] = 'No';

  req.session.save(() => {
    if (Userservice == "Exemption") {
      return res.redirect("/annual-turnover")
    }

    res.redirect("/amend-commodities")
  });
});

router.post('/AnnualIncome', function (req, res) {
  const { AnnualIncome } = req.session.data;

  if (AnnualIncome < 500) {
    return res.redirect('/parent-company');
  }

  return res.redirect('/period-of-exemption');
});

router.post('/parent-company', function (req, res) {
  const { ParentCompany } = req.session.data;

  if (ParentCompany === "Yes") {
    return res.redirect('/parent-company-details')
  }
  res.redirect('/no-service')
});

router.post('/ParentCompanyAnnualIncome', function (req, res) {
  const { ParentCompanyAnnualIncome } = req.session.data;

  if (ParentCompanyAnnualIncome < 100) {
    return res.redirect('/no-service');
  }

  res.redirect('/period-of-exemption')
});

router.post('/exemptionperiod', function (req, res) {
  if (req.session.data.ExemptionPeriod) {
    const periods = req.session.data.ExemptionPeriod.split(' ');
    req.session.data['reportingPeriod'] = `${periods[1]} to ${periods[4]}`;
  }

  req.session.save(() => {
    res.redirect("/frc-commodities");
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
    res.redirect('/commodity-volume');
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
      return res.redirect("/commodity-volume")
    }

    res.redirect("/commodity-determination")
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
      res.redirect("/amend-commodity-methods");
    });
  }
  
  req.session.data['ammendYearError'] = 'Yes';
  return req.session.save(() => {
    res.redirect("/amend-threshold");
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
  res.redirect("/application-complete");

});