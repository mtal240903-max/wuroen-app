const Membership = require('../../models/workplace/Membership.model');
const Role = require('../../models/workplace/Role.model');
const MemberRoleAssignment = require('../../models/workplace/MemberRoleAssignment.model');
const OrganizationUnit = require('../../models/workplace/OrganizationUnit.model');
const ApplicationAccess = require('../../models/workplace/ApplicationAccess.model');
const PermissionContext = require('../../models/workplace/PermissionContext.model');

class PermissionContextService {
  
  /**
   * Génère ou met à jour le contexte de permissions d'un membre.
   * À appeler lors du login, ou de toute modification de rôle/accès.
   */
  async buildContext(membershipId, organizationId) {
    // 1. Vérifier que le membership est actif
    const membership = await Membership.findOne({ _id: membershipId, organizationId, status: 'ACTIVE' })
      .populate('globalRoles'); // Rôles transverses (s'il y en a directement sur le membre)
    
    if (!membership) throw new Error('Membership inactif ou introuvable.');

    const effectivePermissions = new Set();
    const unitPermissions = new Map();

    // 2. Ajouter les permissions des rôles globaux (héritage direct)
    if (membership.globalRoles) {
      for (const role of membership.globalRoles) {
        role.permissions.forEach(p => effectivePermissions.add(p));
      }
    }

    // 3. Récupérer toutes les affectations de rôles explicites
    const assignments = await MemberRoleAssignment.find({ membershipId, organizationId })
      .populate('roleId');

    // 4. Récupérer toute la hiérarchie des unités de l'organisation pour gérer l'héritage
    const allUnits = await OrganizationUnit.find({ organizationId, status: 'ACTIVE' }).lean();
    
    for (const assignment of assignments) {
      const rolePerms = assignment.roleId.permissions;

      if (assignment.scopeType === 'ORGANIZATION') {
        // Permissions globales (Admin, etc.)
        rolePerms.forEach(p => effectivePermissions.add(p));
      } 
      else if (assignment.scopeType === 'UNIT' && assignment.scopeId) {
        // Appliquer à l'unité cible
        this._addUnitPermissions(unitPermissions, assignment.scopeId.toString(), rolePerms);

        // Gestion de l'héritage descendant (si un manager de département a aussi accès aux équipes)
        if (assignment.inheritPermissions) {
          const childUnits = this._findDescendants(assignment.scopeId, allUnits);
          for (const child of childUnits) {
            this._addUnitPermissions(unitPermissions, child._id.toString(), rolePerms);
          }
        }
      }
    }

    // 5. Résoudre les accès aux applications externes
    const applicationAccess = await this._resolveApplicationAccess(membershipId, organizationId, Array.from(unitPermissions.keys()));

    // 6. Sauvegarder dans le cache MongoDB (Upsert)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Expire dans 24h

    const context = await PermissionContext.findOneAndUpdate(
      { membershipId, organizationId },
      {
        effectivePermissions: Array.from(effectivePermissions),
        unitPermissions: Object.fromEntries(unitPermissions),
        applicationAccess,
        computedAt: new Date(),
        expiresAt,
        $inc: { version: 1 }
      },
      { new: true, upsert: true }
    );

    return context;
  }

  /**
   * Invalide (supprime) le contexte pour forcer un recalcul à la prochaine requête.
   */
  async invalidateContext(membershipId, organizationId) {
    await PermissionContext.deleteOne({ membershipId, organizationId });
  }

  // --- Méthodes privées utilitaires --- //

  _addUnitPermissions(map, unitId, permissions) {
    if (!map.has(unitId)) map.set(unitId, new Set());
    permissions.forEach(p => map.get(unitId).add(p));
  }

  _findDescendants(parentId, allUnits) {
    let descendants = [];
    const children = allUnits.filter(u => u.parentId?.toString() === parentId.toString());
    for (const child of children) {
      descendants.push(child);
      descendants = descendants.concat(this._findDescendants(child._id, allUnits));
    }
    return descendants;
  }

  async _resolveApplicationAccess(membershipId, organizationId, userUnitIds) {
    // Récupère les règles d'accès ciblant l'orga, les unités de l'utilisateur ou l'utilisateur directement
    const accessRules = await ApplicationAccess.find({
      organizationId,
      $or: [
        { targetType: 'MEMBERSHIP', targetId: membershipId },
        { targetType: 'UNIT', targetId: { $in: userUnitIds } },
        { targetType: 'ORGANIZATION', targetId: organizationId }
      ]
    });

    const finalAccess = {};
    const levelHierarchy = { 'NONE': 0, 'READ_ONLY': 1, 'READ_WRITE': 2, 'FULL_ADMIN': 3 };

    // Le niveau le plus élevé l'emporte (ou le plus spécifique selon votre politique, ici le plus élevé par simplicité)
    for (const rule of accessRules) {
      const currentLevel = levelHierarchy[finalAccess[rule.applicationName]] || 0;
      const newLevel = levelHierarchy[rule.accessLevel];
      
      if (newLevel > currentLevel) {
        finalAccess[rule.applicationName] = rule.accessLevel;
      }
    }

    return finalAccess;
  }
}

module.exports = new PermissionContextService();