import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { moduleService } from '../services/moduleService';
import { studyMaterialService } from '../services/studyMaterialService';
import { formatDate, formatFileSize } from '../utils/formatters';
import '../styles/structured-materials.css';

const years = [1, 2, 3, 4];

const StructuredStudyMaterialsPage = () => {
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const [materialsByModule, setMaterialsByModule] = useState({});
  const [expandedYears, setExpandedYears] = useState({});
  const [activeModuleBySemester, setActiveModuleBySemester] = useState({});

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

  const getModuleKey = (module) => `${module.year}-${module.semester}-${module.id}`;
  const getSemesterKey = (year, semester) => `${year}-${semester}`;

  const handleModuleOpen = async (module) => {
    const moduleKey = getModuleKey(module);
    const semesterKey = getSemesterKey(module.year, module.semester);

    setActiveModuleBySemester((prev) => ({
      ...prev,
      [semesterKey]: moduleKey,
    }));

    if (materialsByModule[moduleKey]) return;

    try {
      const response = await studyMaterialService.getByModule(module.name, {
        year: module.year,
        semester: module.semester,
      });

      setMaterialsByModule((prev) => ({
        ...prev,
        [moduleKey]: response.data?.materials || response.data || [],
      }));
    } catch (error) {
      toast.error('Failed to load module materials');
      console.error('Error loading materials:', error);
    }
  };

  const toggleYear = (year) => {
    setExpandedYears((prev) => ({
      ...prev,
      [year]: !prev[year],
    }));
  };

  const getFileBadgeClass = (type) => {
    if (!type) return 'file-badge file';

    const typeUpper = type.toUpperCase();
    if (typeUpper.includes('PDF')) return 'file-badge pdf';
    if (typeUpper.includes('DOC')) return 'file-badge docx';
    if (typeUpper.includes('XLS')) return 'file-badge xlsx';
    if (typeUpper.includes('PPT')) return 'file-badge pptx';
    if (typeUpper.includes('VIDEO')) return 'file-badge video';
    if (typeUpper.includes('AUDIO')) return 'file-badge audio';

    return 'file-badge file';
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
                <span className={`year-accordion-toggle ${isExpanded ? 'open' : ''}`}>
                  ▼
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

                        const semesterKey = getSemesterKey(year, semester);
                        const activeModuleKey = activeModuleBySemester[semesterKey];
                        const activeModule = semesterModules.find(
                          (module) => getModuleKey(module) === activeModuleKey
                        );
                        const activeMaterials = activeModuleKey
                          ? materialsByModule[activeModuleKey] || []
                          : [];

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
                              <>
                                <div className="modules-list">
                                  {semesterModules.map((module) => {
                                    const moduleKey = getModuleKey(module);
                                    const isActive = activeModuleKey === moduleKey;

                                    return (
                                      <button
                                        key={module.id}
                                        className={`module-button ${isActive ? 'active' : ''}`}
                                        onClick={() => handleModuleOpen(module)}
                                      >
                                        {module.name}
                                      </button>
                                    );
                                  })}
                                </div>

                                {activeModule && (
                                  <div className="materials-list">
                                    <div className="module-materials-section">
                                      <div className="module-materials-title">
                                        📚 {activeModule.name}
                                      </div>

                                      {activeMaterials.length === 0 ? (
                                        <div className="empty-message">
                                          No materials for this module.
                                        </div>
                                      ) : (
                                        activeMaterials.map((item) => (
                                          <div key={item.id} className="material-item">
                                            <div className="material-info">
                                              <p className="material-title">
                                                <span
                                                  className={getFileBadgeClass(
                                                    item.file?.typeLabel
                                                  )}
                                                >
                                                  {item.file?.typeLabel || 'FILE'}
                                                </span>
                                                {item.title}
                                              </p>
                                              <p className="material-meta">
                                                {item.file?.size
                                                  ? formatFileSize(item.file.size)
                                                  : 'N/A'}{' '}
                                                • {formatDate(item.createdAt)}
                                              </p>
                                            </div>

                                            <a
                                              className="material-download-btn"
                                              href={`${
                                                import.meta.env.VITE_API_URL ||
                                                import.meta.env.REACT_APP_API_URL ||
                                                'http://localhost:5000'
                                              }/api/materials/${item.id}/download`}
                                              download
                                            >
                                              Download
                                            </a>
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  </div>
                                )}
                              </>
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