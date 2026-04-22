import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { moduleService } from '../services/moduleService';
import '../styles/structured-materials.css';

const years = [1, 2, 3, 4];

const StructuredStudyMaterialsPage = () => {
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const [expandedYears, setExpandedYears] = useState({});

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const response = await moduleService.getAll({ page: 1 });
        setModules(response.data?.modules || response.data || []);
      } catch (error) {
        toast.error('Failed to load modules');
        console.error('Error loading modules:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  const toggleYear = (year) => {
    setExpandedYears((prev) => ({
      ...prev,
      [year]: !prev[year],
    }));
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p style={{ marginTop: '1rem', color: '#475569' }}>
          Loading structured study materials...
        </p>
      </div>
    );
  }

  return (
    <div className="structured-materials-container">
      <div className="structured-materials-header">
        <h1>Structured Study Materials</h1>
        <p>Browse by year, semester, and module.</p>
      </div>

      <div className="years-grid">
        {years.map((year) => {
          const yearModules = modules.filter((item) => Number(item.year) === year);
          const isExpanded = expandedYears[year];

          return (
            <div key={year} className="year-accordion">
              <button
                className="year-accordion-header"
                onClick={() => toggleYear(year)}
              >
                <div className="year-accordion-title">
                  <span>{year} Year</span>
                  <div className="year-accordion-subtitle">
                    {yearModules.length} modules
                  </div>
                </div>

                {/* 🔽 SMALL MODERN ICON */}
                <span className={`year-accordion-toggle ${isExpanded ? 'open' : ''}`}>
                  ⌄
                </span>
              </button>

              {isExpanded && (
                <div className="year-accordion-content">
                  {yearModules.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-state-icon">📭</div>
                      <h3 className="empty-state-title">No modules</h3>
                      <p className="empty-state-description">
                        No modules configured for this year.
                      </p>
                    </div>
                  ) : (
                    <>
                      {[1, 2].map((semester) => {
                        const semesterModules = yearModules.filter(
                          (item) => Number(item.semester) === semester
                        );

                        return (
                          <div key={`${year}-${semester}`} className="semester-section">
                            <div className="semester-title">
                              Semester {semester} ({semesterModules.length} modules)
                            </div>

                            {semesterModules.length === 0 ? (
                              <div className="empty-message">
                                No modules in this semester.
                              </div>
                            ) : (
                              <div className="modules-list">
                                {semesterModules.map((module) => (
                                  <button
                                    key={module.id}
                                    type="button"
                                    className="module-button"
                                  >
                                    {module.name}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StructuredStudyMaterialsPage;