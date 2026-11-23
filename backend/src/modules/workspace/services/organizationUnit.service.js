import OrganizationUnit from '../../models/OrganizationUnit.js';

export class OrganizationUnitService {
  async createUnit(input) {
    let computedPath = 'ROOT';

    if (input.parentId) {
      const parent = await OrganizationUnit.findOne({
        _id: input.parentId,
        organizationId: input.organizationId,
        deletedAt: null,
      });

      if (!parent) {
        throw new Error("Unité parente invalide ou introuvable dans cette organisation.");
      }
      computedPath = `${parent.path}/${parent._id}`;
    }

    const unit = await OrganizationUnit.create({
      organizationId: input.organizationId,
      parentId: input.parentId || null,
      name: input.name,
      slug: input.slug,
      type: input.type || 'DEPARTMENT',
      inheritPermissions: input.inheritPermissions ?? true,
      metadata: input.metadata || {},
      path: computedPath,
    });

    if (computedPath === 'ROOT') {
      unit.path = unit._id.toString();
    } else {
      unit.path = `${computedPath}/${unit._id}`;
    }

    await unit.save();
    return unit;
  }

  async getSubTree(unitId) {
    const unit = await OrganizationUnit.findOne({ _id: unitId, deletedAt: null });

    if (!unit) {
      throw new Error("Unité introuvable.");
    }

    return OrganizationUnit.find({
      path: { $regex: `^${unit.path}` },
      deletedAt: null,
    }).sort({ createdAt: 1 });
  }
}