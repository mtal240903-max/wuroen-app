import React, { useEffect, useState } from 'react';
import { organizationUnitService } from '../../services/organizationUnitService';

export const OrganizationTree = ({ rootUnitId }) => {
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTree = async () => {
      try {
        setLoading(true);
        const result = await organizationUnitService.getSubTree(rootUnitId);
        if (result.success) {
          setTreeData(result.data);
        }
      } catch (err) {
        setError("Erreur lors du chargement de la structure.");
      } finally {
        setLoading(false);
      }
    };

    if (rootUnitId) fetchTree();
  }, [rootUnitId]);

  if (loading) return <div className="p-4 text-gray-500">Chargement de la structure...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Structure Organisationnelle</h3>
      <ul className="space-y-2 border-l-2 border-indigo-100 pl-4">
        {treeData.map((unit) => (
          <li key={unit._id} className="py-2">
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md hover:bg-gray-100 transition">
              <div>
                <span className="font-medium text-gray-900">{unit.name}</span>
                <span className="ml-2 text-xs uppercase px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
                  {unit.type}
                </span>
              </div>
              {unit.description && (
                <span className="text-sm text-gray-500 truncate max-w-xs">{unit.description}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};