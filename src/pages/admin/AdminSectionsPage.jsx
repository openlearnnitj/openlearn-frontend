import React, { useState, useEffect, useCallback } from 'react';
import SectionManagement from '../../components/admin/SectionManagement';
import AdminService from '../../utils/adminService';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = `${BASE_URL}/api`;

const AdminSectionsPage = () => {
  const [sections, setSections] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [sectionsData, weeksData, leaguesData] = await Promise.all([
        AdminService.getAllSectionsComplete(),
        AdminService.getAllWeeks(),
        AdminService.getAllLeagues()
      ]);
      
      setSections(sectionsData.sections || []);
      setWeeks(weeksData.weeks || []);
      setLeagues(leaguesData.leagues || []);
    } catch (err) {
      console.error('Error fetching sections data:', err);
      setError(`Failed to load sections: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateSection = async (section) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`${API_BASE_URL}/sections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(section)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSections([...sections, result.data]);
      } else {
        throw new Error(result.error || 'Failed to create section');
      }
    } catch (err) {
      console.error('Error creating section:', err);
      setError(`Failed to create section: ${err.message}`);
    }
  };

  const handleUpdateSection = async (sectionId, updatedSection) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`${API_BASE_URL}/sections/${sectionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedSection)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSections(sections.map(section => 
          section.id === sectionId ? result.data : section
        ));
      } else {
        throw new Error(result.error || 'Failed to update section');
      }
    } catch (err) {
      console.error('Error updating section:', err);
      setError(`Failed to update section: ${err.message}`);
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm('Are you sure you want to delete this section? This action cannot be undone.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`${API_BASE_URL}/sections/${sectionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSections(sections.filter(section => section.id !== sectionId));
      } else {
        throw new Error(result.error || 'Failed to delete section');
      }
    } catch (err) {
      console.error('Error deleting section:', err);
      setError(`Failed to delete section: ${err.message}`);
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <SectionManagement
      sections={sections}
      weeks={weeks}
      leagues={leagues}
      onCreateSection={handleCreateSection}
      onUpdateSection={handleUpdateSection}
      onDeleteSection={handleDeleteSection}
      loading={loading}
    />
  );
};

export default AdminSectionsPage;
