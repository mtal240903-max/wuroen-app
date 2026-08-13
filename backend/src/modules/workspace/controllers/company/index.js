const createCompany = require('./createCompany');
const getCompanyById = require('./getCompanyById');
const addCompanyStaff = require('./addCompanyStaff');
const getCompanies = require('./getCompanies');
const updateCompany = require('./updateCompany');         // Ajouté
const removeCompanyStaff = require('./removeCompanyStaff'); // Ajouté
const getCompanyAuditLogs = require('./getCompanyAuditLogs'); // Ajouté

module.exports = {
  createCompany,
  getCompanyById,
  addCompanyStaff,
  getCompanies,
  updateCompany,
  removeCompanyStaff,
  getCompanyAuditLogs
};