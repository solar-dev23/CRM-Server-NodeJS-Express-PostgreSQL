const core = require('../core');
const controllerUtils = core.controllerUtils;
const db = require('../database');

module.exports = {
	async calculate(req, res) {
		let date_from = controllerUtils.formatDate(req.body.object.date_from);
    let date_to = controllerUtils.formatDate(req.body.object.date_to);
    let currency = req.body.object.currency;
    let show_by = req.body.object.showBy;
    let value = req.body.object.value;
    console.log(req.body.object);
    if (show_by == 'Currency') this.filterEUR = this.filterUSD = true;

    let query = `SELECT * FROM opportunities where `;
    // add date filter
    query += `created_at >= '${date_from}' and created_at<='${date_to}' `;
    // currency filter
    if (currency == 'ALL') {} else if (show_by != 'Currency') {
        if (currency == 'USD') query += `and currency like 'USD'`;
        if (currency == 'EUR') query += `and currency like 'EUR'`;
    }
    // order
    query += ` order by created_at`;

    let opportunities = await db.sequelize.query(query, {
        type: db.sequelize.QueryTypes.SELECT
    })

    let users = await getUsers();
    let companies = await getCompanies();
    let statuses = await getStatus();

    let result = calculate(opportunities, show_by, users, companies, statuses);
    return controllerUtils.responseHandler(res, true, "Get Opportunities Successfully ", result);
	},
	async calculateV2(req, res) {
		let date_from = controllerUtils.formatDate(req.body.object.date_from);
    let date_to = controllerUtils.formatDate(req.body.object.date_to);
    let currency = req.body.object.currency;
    let show_by = req.body.object.showBy;
    let by = req.body.object.by;
    let value = req.body.object.value;

    if (show_by == 'Currency' || by == 'Currency') this.filterEUR = this.filterUSD = true;

    let query = `SELECT * FROM opportunities where `;
    // add date filter
    query += `created_at >= '${date_from}' and created_at<='${date_to}' `;
    // currency filter
    if (currency == 'ALL') {} else if (show_by != 'Currency') {
        if (currency == 'USD') query += `and currency like 'USD'`;
        if (currency == 'EUR') query += `and currency like 'EUR'`;
    }
    // order
    query += ` order by created_at`;

    let opportunities = await db.sequelize.query(query, {
        type: db.sequelize.QueryTypes.SELECT
    })

    let users = await getUsers();
    let companies = await getCompanies();
    let statuses = await getStatus();

    // 
    if(show_by == by) {
        let data = calculate(opportunities, show_by, users, companies, statuses);
        let result = [{
            name: by,
            data: data
        }];
        return controllerUtils.responseHandler(res, true, "Get Calculation Successfully ", result);
        return;
    }

    let users_store = users.slice();
    let companies_store = companies.slice();
    let statuses_store = statuses.slice();

    let currencies = [];
    currencies.push({
        name: 'USD',
        opportunities: []
    });
    currencies.push({
        name: 'EUR',
        opportunities: []
    });

    for (let i = 0; i < users.length; i++) {
        let name = users[i];
        users[i] = {};
        users[i].name = name;
        users[i].opportunities = [];
    }
    for (let i = 0; i < companies.length; i++) {
        let name = companies[i];
        companies[i] = {};
        companies[i].name = name;
        companies[i].opportunities = [];
    }
    for (let i = 0; i < statuses.length; i++) {
        statuses[i].opportunities = [];
    }

    months = [];
    years = []
    monthTemp = new Date(2000, 0, 1);
    yearTemp = new Date(2000, 0, 1);
    monthDataTemp = {
        name: "2000-1",
        opportunities: []
    }
    yearDataTemp = {
        name: "2000",
        opportunities: []
    }

    opportunities.forEach(function (opportunity) {
        // Currency
        if (opportunity.currency == 'USD') currencies[0].opportunities.push(opportunity);
        if (opportunity.currency == 'EUR') currencies[1].opportunities.push(opportunity);
        // User, Company, Statuses
        if (show_by == 'User') {
            for (var j = 0; j < users.length; j++) {
                if (opportunity.contact == users[j].name) {
                    users[j].opportunities.push(opportunity)
                }
            }
        }
        if (show_by == 'Company') {
            for (var j = 0; j < companies.length; j++) {
                if (opportunity.company == companies[j].name) {
                    companies[j].opportunities.push(opportunity)
                }
            }
        }
        if (show_by == 'Status') {
            for (var j = 0; j < statuses.length; j++) {
                if (opportunity.status_id == statuses[j].id) {
                    statuses[j].opportunities.push(opportunity)
                }
            }
        }

        //Data filter by month        
        var dateCreated = new Date(opportunity.created_at);
        if (show_by == 'Month') {
            if ((dateCreated.getFullYear() == monthTemp.getFullYear()) && (dateCreated.getMonth() == monthTemp.getMonth())) {
                monthDataTemp.opportunities.push(opportunity)
            } else {
                monthDataTemp = Object.assign({
                    name: dateCreated.getFullYear() + "-" + (dateCreated.getMonth() + 1),
                    opportunities: [opportunity]
                });
                months.push(monthDataTemp);
                monthTemp = dateCreated;
            }
        }
        //Data filter by year
        if (show_by == 'Year') {
            if ((dateCreated.getFullYear() == yearTemp.getFullYear())) {
                yearDataTemp.opportunities.push(opportunity);
            } else {
                yearDataTemp = Object.assign({
                    name: dateCreated.getFullYear(),
                    opportunities: [opportunity]
                });
                years.push(yearDataTemp);
                yearTemp = dateCreated;
            }
        }
    }, this);

    let result_v1;
    switch (show_by) {
        case 'User':
            result_v1 = users;
            break;
        case 'Company':
            result_v1 = companies;
            break;
        case 'Year':
            result_v1 = years;
            break;
        case 'Month':
            result_v1 = months;
            break;
        case 'Currency':
            result_v1 = currencies;
            break;
        case 'Status':
            result_v1 = statuses;
            break;
    }

    for(let i = 0 ; i < result_v1.length; i ++ ) {
        let result_v2 = calculate(result_v1[i].opportunities, by, users_store.slice(), companies_store.slice(), statuses_store.slice());
        delete result_v1[i].opportunities;
        result_v1[i].data = result_v2.map(e => Object.assign({}, e));
    }
    return controllerUtils.responseHandler(res, true, "Get Opportunities Successfully ", result_v1);
	}
};

const getUsers = async() => {
  let opportunities = await db.sequelize.query(`SELECT contact FROM opportunities`, {
      type: db.sequelize.QueryTypes.SELECT
  })
  let result = [];
  opportunities.forEach(function (opportunity) {
      let contact = opportunity.contact;
      if (result.indexOf(contact) == -1) result.push(contact);
  }, this);
  return result;
}

const getStatus = async() => {
  return await db.sequelize.query(`SELECT * FROM statuses`, {
      type: db.sequelize.QueryTypes.SELECT
  });
}

const getCompanies = async() => {
  let opportunities = await db.sequelize.query(`SELECT company FROM opportunities`, {
      type: db.sequelize.QueryTypes.SELECT
  });
  let result = [];
  opportunities.forEach(function (opportunity) {
      let company = opportunity.company;
      if (result.indexOf(company) == -1) result.push(company);
  }, this);
  return result;
}

const calculate = (opportunities, show_by, users, companies, statuses) => {
  // console.log(opportunities, 'opportunities');
  let currencies = [];
  currencies.push({
      name: 'USD',
      count: 0
  });
  currencies.push({
      name: 'EUR',
      count: 0
  });

  for (let i = 0; i < users.length; i++) {
      let name = users[i];
      users[i] = {};
      users[i].name = name;
      users[i].count = 0;
      users[i].sum = 0;
  }
  for (let i = 0; i < companies.length; i++) {
      let name = companies[i];
      companies[i] = {};
      companies[i].name = name;
      companies[i].count = 0;
      companies[i].sum = 0;
  }
  for (let i = 0; i < statuses.length; i++) {
      let name = statuses[i];
      statuses[i].count = 0;
      statuses[i].sum = 0;
  }

  months = [];
  years = []
  monthTemp = new Date(2000, 0, 1);
  yearTemp = new Date(2000, 0, 1);
  monthDataTemp = {
      name: "2000-1",
      sum: 0,
      count: 0
  }
  yearDataTemp = {
      name: "2000",
      sum: 0,
      count: 0
  }
  console.log(opportunities.length, 'opportunity length');

  opportunities.forEach(function (opportunity) {
      // Currency
      if (opportunity.currency == 'USD') currencies[0].count++;
      if (opportunity.currency == 'EUR') currencies[1].count++;
      // User, Company, Statuses
      if (show_by == 'User') {
          for (var j = 0; j < users.length; j++) {
              if (opportunity.contact == users[j].name) {
                  users[j].sum += opportunity.value;
                  users[j].count++;
              }
          }
      }
      if (show_by == 'Company') {
          for (var j = 0; j < companies.length; j++) {
              if (opportunity.company == companies[j].name) {
                  companies[j].sum += opportunity.value;
                  companies[j].count++;
              }
          }
      }
      if (show_by == 'Status') {
          for (var j = 0; j < statuses.length; j++) {
              if (opportunity.status_id == statuses[j].id) {
                  statuses[j].sum += opportunity.value;
                  statuses[j].count++;
              }
          }
      }

      //Data filter by month        
      var dateCreated = new Date(opportunity.created_at);
      if (show_by == 'Month') {
          if ((dateCreated.getFullYear() == monthTemp.getFullYear()) && (dateCreated.getMonth() == monthTemp.getMonth())) {
              monthDataTemp.sum += opportunity.value;
              monthDataTemp.count++;
          } else {
              monthDataTemp = Object.assign({
                  name: dateCreated.getFullYear() + "-" + (dateCreated.getMonth() + 1),
                  sum: opportunity.value,
                  count: 1
              });
              months.push(monthDataTemp);
              monthTemp = dateCreated;
          }
      }
      //Data filter by year
      if (show_by == 'Year') {
          if ((dateCreated.getFullYear() == yearTemp.getFullYear())) {
              yearDataTemp.sum += opportunity.value;
              yearDataTemp.count++;
          } else {
              yearDataTemp = Object.assign({
                  name: dateCreated.getFullYear(),
                  sum: opportunity.value,
                  count: 1
              });
              years.push(yearDataTemp);
              yearTemp = dateCreated;
          }
      }
  }, this);
  let result;
  switch (show_by) {
      case 'User':
          result = users;
          break;
      case 'Company':
          result = companies;
          break;
      case 'Year':
          result = years;
          break;
      case 'Month':
          result = months;
          break;
      case 'Currency':
          result = currencies;
          break;
      case 'Status':
          result = statuses;
          break;
  }

  return result;
}
