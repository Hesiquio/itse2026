import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { ArrowLeft, Plus, Edit, Trash2, Save, X, AlertCircle, CheckCircle, Mail, Phone, BookOpen, MapPin, Search, Download, Upload } from 'lucide-react';

const fields = [
  { name: 'nombre', label: 'Nombre', type: 'text', required: true },
  { name: 'materia', label: 'Materia', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'telefono', label: 'Teléfono', type: 'tel', required: false, placeholder: '(981) 000-0000' },
  { name: 'Salon', label: 'Salon', type: 'text', required: false },
  { name: 'fotoUrl', label: 'Foto (Google Drive)', type: 'text', required: false, placeholder: 'https://drive.google.com/drive/folders/1AsJdu4POTb4w31zfVpnjf7YJEnLSneKB?usp=sharing' },
];

function DirectorioDeProfesores() {
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfesor, setEditingProfesor] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [selectedProfesor, setSelectedProfesor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

  const moduleName = "Directorio de Profesores";
  const moduleOwner = "DirectorioDeProfesores";

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(null), 3000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const { data, error } = await supabase
        .from('student_modules')
        .select('*')
        .eq('module_owner', moduleOwner)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfesores(data || []);
    } catch (error) {
      console.error('Error fetching data:', error.message);
      setErrorMsg('Error al cargar datos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addData = async (content) => {
    setSaving(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase
        .from('student_modules')
        .insert([{ module_owner: moduleOwner, content }])
        .select();

      if (error) throw error;
      setProfesores([data[0], ...profesores]);
      setSuccessMsg('¡Registro guardado correctamente!');
      resetForm();
    } catch (error) {
      console.error('Error adding data:', error.message);
      setErrorMsg('Error al guardar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const updateData = async (id, content) => {
    setSaving(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase
        .from('student_modules')
        .update({ content })
        .eq('id', id);

      if (error) throw error;
      setProfesores(profesores.map(item => item.id === id ? { ...item, content } : item));
      setSuccessMsg('¡Registro actualizado correctamente!');
      resetForm();
    } catch (error) {
      console.error('Error updating data:', error.message);
      setErrorMsg('Error al actualizar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteData = async (id) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este profesor?')) return;
    setErrorMsg(null);
    try {
      const { error } = await supabase
        .from('student_modules')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setProfesores(profesores.filter(item => item.id !== id));
      setSuccessMsg('Registro eliminado.');
    } catch (error) {
      console.error('Error deleting data:', error.message);
      setErrorMsg('Error al eliminar: ' + error.message);
    }
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setEditingProfesor(null);
    setFormData({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingProfesor) {
      updateData(editingProfesor.id, formData);
    } else {
      addData(formData);
    }
  };

  const handleEdit = (item) => {
    setEditingProfesor(item);
    setFormData(item.content);
    setIsModalOpen(true);
  };

  const handleInputChange = (fieldName, value) => {
    setFormData({ ...formData, [fieldName]: value });
  };

  const isRLSError = errorMsg && (
    errorMsg.includes('row-level') ||
    errorMsg.includes('violates') ||
    errorMsg.includes('42501') ||
    errorMsg.includes('new row') ||
    errorMsg.includes('permission')
  );

  // Convierte URL compartida de Google Drive (archivo individual) a URL de visualización directa
  const getDriveImageUrl = (url) => {
    if (!url) return '';
    
    // Busca ID en formato /file/d/ID/ o /file/d/ID
    const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)(?:\/|$|\?)/);
    if (fileMatch && fileMatch[1]) {
      return `https://drive.google.com/drive/folders/1AsJdu4POTb4w31zfVpnjf7YJEnLSneKB?usp=sharing${fileMatch[1]}`;
    }
    
    // Busca ID en formato /d/ID/ (carpetas o archivos)
    const folderMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)(?:\/|$|\?)/);
    if (folderMatch && folderMatch[1]) {
      return `https://drive.google.com/drive/folders/1AsJdu4POTb4w31zfVpnjf7YJEnLSneKB?usp=sharing${folderMatch[1]}`;
    }
    
    // Si ya está en formato uc?export=view
    if (url.includes('uc?export=view')) return url;
    
    return url;
  };

  // Filtrar profesores por nombre y materia
  const filteredProfesores = profesores.filter((profesor) => {
    const searchLower = searchTerm.toLowerCase();
    const nombre = (profesor.content.nombre || '').toLowerCase();
    const materia = (profesor.content.materia || '').toLowerCase();
    return nombre.includes(searchLower) || materia.includes(searchLower);
  });

  // Exportar profesores a CSV
  const exportToCSV = () => {
    try {
      if (profesores.length === 0) {
        setErrorMsg('No hay profesores para exportar.');
        return;
      }

      const headers = ['Nombre', 'Materia', 'Email', 'Teléfono', 'Salon', 'Foto URL'];
      const rows = profesores.map((profesor) => [
        profesor.content.nombre || '',
        profesor.content.materia || '',
        profesor.content.email || '',
        profesor.content.telefono || '',
        profesor.content.salon || '',
        profesor.content.fotoUrl || '',
      ]);

      let csvContent = '\uFEFF' + headers.join(',') + '\n';
      rows.forEach((row) => {
        csvContent += row.map((cell) => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(',') + '\n';
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'directorio_profesores.csv';
      link.click();

      setSuccessMsg('Directorio exportado correctamente.');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      setErrorMsg('Error al exportar CSV: ' + error.message);
    }
  };

  // Importar profesores desde CSV
  const importFromCSV = async (file) => {
    try {
      if (!file) return;
      setIsImporting(true);
      setErrorMsg(null);

      const text = await file.text();
      const cleanText = text.replace(/^\uFEFF/, '');
      const lines = cleanText.split('\n').filter((line) => line.trim());

      if (lines.length < 2) {
        setErrorMsg('El archivo CSV debe tener al menos un encabezado y una fila de datos.');
        setIsImporting(false);
        return;
      }

      const headerLine = lines[0];
      const headers = headerLine.split(',').map((h) => h.trim().toLowerCase().replace(/["]/g, ''));

      const nombreIndex = headers.findIndex((h) => h === 'nombre');
      const emailIndex = headers.findIndex((h) => h === 'email' || h === 'e-mail');
      const materiaIndex = headers.findIndex((h) => h === 'materia' || h === 'subject');
      const telefonoIndex = headers.findIndex((h) => h === 'teléfono' || h === 'telefono' || h === 'phone');
      const SalonIndex = headers.findIndex((h) => h === 'Salon' || h === 'office');
      const fotoUrlIndex = headers.findIndex((h) => h === 'foto url' || h === 'foto' || h === 'fotourl');

      if (nombreIndex === -1 || emailIndex === -1) {
        setErrorMsg('El CSV debe tener columnas "Nombre" y "Email".');
        setIsImporting(false);
        return;
      }

      const newProfesores = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cells = line.split(',').map((c) => c.trim().replace(/["]/g, ''));
        const nombre = cells[nombreIndex]?.trim() || '';
        const email = cells[emailIndex]?.trim() || '';

        if (!nombre || !email) continue;

        const content = {
          nombre,
          email,
          materia: materiaIndex !== -1 ? cells[materiaIndex]?.trim() || '' : '',
          telefono: telefonoIndex !== -1 ? cells[telefonoIndex]?.trim() || '' : '',
          salon: SalonIndex !== -1 ? cells[SalonIndex]?.trim() || '' : '',
          fotoUrl: fotoUrlIndex !== -1 ? cells[fotoUrlIndex]?.trim() || '' : '',
        };

        newProfesores.push({
          module_owner: moduleOwner,
          content,
        });
      }

      if (newProfesores.length === 0) {
        setErrorMsg('No se encontraron registros válidos en el archivo.');
        setIsImporting(false);
        return;
      }

      const { data, error } = await supabase
        .from('student_modules')
        .insert(newProfesores)
        .select();

      if (error) throw error;

      setProfesores([...data, ...profesores]);
      setSuccessMsg(`✓ ${newProfesores.length} profesor(es) importado(s) correctamente.`);

      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Error importing CSV:', error);
      setErrorMsg('Error al importar CSV: ' + error.message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-gray-800">{moduleName}</h1>
            <button
              onClick={() => { setIsModalOpen(!isModalOpen); setEditingProfesor(null); setErrorMsg(null); }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              {isModalOpen ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              {isModalOpen ? 'Cancelar' : 'Agregar Nuevo'}
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="mb-6 bg-red-50 border border-red-300 text-red-800 rounded-lg px-4 py-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-500" />
              <div className="flex-1">
                <p className="font-semibold">Ocurrió un error</p>
                <p className="text-sm mt-1 font-mono bg-red-100 rounded p-1">{errorMsg}</p>
                {isRLSError && (
                  <div className="mt-3 text-sm bg-yellow-50 border border-yellow-200 rounded p-3 text-yellow-900">
                    <p className="font-semibold mb-1">💡 Solución — Row Level Security (RLS):</p>
                    <p>Ejecuta este SQL en tu panel de Supabase:</p>
                    <pre className="mt-2 bg-gray-800 text-green-300 text-xs rounded p-2 overflow-x-auto">
                      {`ALTER TABLE student_modules DISABLE ROW LEVEL SECURITY;`}
                    </pre>
                  </div>
                )}
              </div>
              <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Success Banner */}
        {successMsg && (
          <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-300 text-green-800 rounded-lg px-4 py-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <p>{successMsg}</p>
          </div>
        )}

        {/* Form Modal */}
        {isModalOpen && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {editingProfesor ? 'Editar' : 'Agregar Nuevo'} Profesor
            </h2>
            <form onSubmit={handleSubmit}>
              {fields.map((field) => (
                <div key={field.name} className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="4"
                      required={field.required}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={field.required}
                    >
                      <option value="">Seleccionar...</option>
                      {field.options?.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type || 'text'}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={field.required}
                    />
                  )}
                </div>
              ))}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg flex items-center transition-colors"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="animate-spin w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="ml-3 text-gray-600">Cargando directorio...</span>
          </div>
        ) : profesores.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-4">No hay profesores registrados aún.</p>
            <button
              onClick={() => { setIsModalOpen(true); setEditingProfesor(null); }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar primer profesor
            </button>
          </div>
        ) : (
          <>
            {/* Search Bar and Export/Import Buttons */}
            <div className="mb-8">
              <div className="flex gap-3 mb-4">
                <button
                  onClick={exportToCSV}
                  disabled={profesores.length === 0}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                  title="Descargar CSV"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar CSV
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                  title="Importar desde CSV"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isImporting ? 'Importando...' : 'Importar CSV'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={(e) => importFromCSV(e.target.files?.[0])}
                  className="hidden"
                />
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o materia..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Limpiar búsqueda"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Photo Gallery Grid */}
            {filteredProfesores.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No se encontraron profesores que coincidan con tu búsqueda.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                  {filteredProfesores.map((profesor) => {
                    const fotoUrl = getDriveImageUrl(profesor.content.fotoUrl);
                    const tieneFoto = fotoUrl && fotoUrl !== '';
                    
                    return (
                  <div key={profesor.id} className="flex flex-col">
                    {/* Foto */}
                    <div
                      onClick={() => tieneFoto && setSelectedProfesor(profesor)}
                      className={`relative overflow-hidden rounded-lg mb-3 ${tieneFoto ? 'cursor-pointer' : 'bg-gray-200'}`}
                      style={{ paddingBottom: '100%' }}
                    >
                      {tieneFoto ? (
                        <img
                          src={fotoUrl}
                          alt={profesor.content.nombre || 'Profesor'}
                          className="absolute inset-0 w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                          <span className="text-3xl text-gray-500 font-bold">
                            {profesor.content.nombre ? profesor.content.nombre.charAt(0).toUpperCase() : '?'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Nombre y Materia */}
                    <h3 className="font-bold text-gray-800 text-sm truncate">
                      {profesor.content.nombre || 'Sin nombre'}
                    </h3>
                    <p className="text-xs text-gray-600 truncate mb-3">
                      {profesor.content.materia || 'Sin materia'}
                    </p>

                    {/* Botones de Acción */}
                    <div className="flex gap-2 justify-center">
                      {profesor.content.email && (
                        <a
                          href={`mailto:${profesor.content.email}`}
                          className="flex items-center justify-center w-8 h-8 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full transition-colors flex-shrink-0"
                          title={profesor.content.email}
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {profesor.content.telefono && (
                        <a
                          href={`tel:${profesor.content.telefono}`}
                          className="flex items-center justify-center w-8 h-8 bg-green-100 hover:bg-green-200 text-green-600 rounded-full transition-colors flex-shrink-0"
                          title={profesor.content.telefono}
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {profesor.content.salon && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            profesor.content.salon
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center w-8 h-8 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-full transition-colors flex-shrink-0"
                          title={profesor.content.salon}
                        >
                          <MapPin className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => handleEdit(profesor)}
                        className="flex items-center justify-center w-8 h-8 bg-yellow-100 hover:bg-yellow-200 text-yellow-600 rounded-full transition-colors flex-shrink-0"
                        title="Editar"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteData(profesor.id)}
                        className="flex items-center justify-center w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-full transition-colors flex-shrink-0"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                    );
                  })}
                </div>

                {/* Reload Button */}
                <div className="text-center">
                  <button
                    onClick={fetchData}
                    className="text-sm text-blue-600 hover:text-blue-700 underline"
                  >
                    ↻ Recargar Directorio
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedProfesor && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedProfesor(null)}
        >
          <button
            onClick={() => setSelectedProfesor(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            title="Cerrar"
          >
            <X className="w-8 h-8" />
          </button>
          
          <div
            className="flex flex-col items-center max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getDriveImageUrl(selectedProfesor.content.fotoUrl)}
              alt={selectedProfesor.content.nombre || 'Profesor'}
              className="max-h-[80vh] w-auto object-contain rounded-lg shadow-2xl mb-4"
            />
            <div className="bg-white rounded-lg p-4 w-full text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                {selectedProfesor.content.nombre || 'Sin nombre'}
              </h2>
              <p className="text-gray-600 mb-4">
                {selectedProfesor.content.materia || 'Sin materia'}
              </p>

              {/* Información detallada en lightbox */}
              <div className="flex flex-col gap-2 text-sm text-gray-700 mb-4">
                {selectedProfesor.content.email && (
                  <p>
                    <span className="font-semibold">Email:</span> {selectedProfesor.content.email}
                  </p>
                )}
                {selectedProfesor.content.telefono && (
                  <p>
                    <span className="font-semibold">Teléfono:</span> {selectedProfesor.content.telefono}
                  </p>
                )}
                {selectedProfesor.content.oficina && (
                  <p>
                    <span className="font-semibold">Oficina:</span> {selectedProfesor.content.oficina}
                  </p>
                )}
              </div>

              {/* Botones en lightbox */}
              <div className="flex gap-2 justify-center">
                {selectedProfesor.content.email && (
                  <a
                    href={`mailto:${selectedProfesor.content.email}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors text-sm"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </a>
                )}
                {selectedProfesor.content.telefono && (
                  <a
                    href={`tel:${selectedProfesor.content.telefono}`}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors text-sm"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Llamar
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DirectorioDeProfesores;
