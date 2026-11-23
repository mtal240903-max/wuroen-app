const createCompany = require('./createCompany');
const getCompanyById = require('./getCompanyById');
const addCompanyStaff = require('./addCompanyStaff');
const getCompanies = require('./getCompanies');
const updateCompany = require('./updateCompany');
const removeCompanyStaff = require('./removeCompanyStaff');
const getCompanyAuditLogs = require('./getCompanyAuditLogs');
const getCompanyStaff = require('./getCompanyStaff'); // ➕ Ajouté ici

module.exports = {
  createCompany,
  getCompanyById,
  addCompanyStaff,
  getCompanies,
  updateCompany,
  removeCompanyStaff,
  getCompanyAuditLogs,
  getCompanyStaff // ➕ Ajouté ici
};