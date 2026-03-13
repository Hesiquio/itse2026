import React, { useMemo, useState } from 'react';

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const LETTER_GRADES = [
  { min: 90, letter: 'A' },
  { min: 80, letter: 'B' },
  { min: 70, letter: 'C' },
  { min: 60, letter: 'D' },
  { min: 0, letter: 'F' },
];

function toLetter(score) {
  const g = LETTER_GRADES.find(x => score >= x.min);
  return g ? g.letter : '--';
}

export default function CalculadoraDePromedios() {
  const [students, setStudents] = useState(() => [
    {
      id: uid(),
      name: 'Daniel',
      grades: [
        { materia: 'Matemáticas', nota: 92, creditos: 4 },
        { materia: 'Física', nota: 88, creditos: 3 },
        { materia: 'Inglés', nota: 85, creditos: 2 },
      ],
    },
    {
      id: uid(),
      name: 'Pepe',
      grades: [
        { materia: 'Matemáticas', nota: 75, creditos: 4 },
        { materia: 'Historia', nota: 82, creditos: 3 },
        { materia: 'Programación', nota: 90, creditos: 3 },
      ],
    },
    {
      id: uid(),
      name: 'Camilo',
      grades: [
        { materia: 'Química', nota: 68, creditos: 3 },
        { materia: 'Biología', nota: 73, creditos: 2 },
        { materia: 'Educación Física', nota: 95, creditos: 1 },
      ],
    },
  ]);

  const [mode, setMode] = useState('ponderado');
  const [decimals, setDecimals] = useState(2);
  const [status, setStatus] = useState('');
  const [isDark, setIsDark] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const selectedStudent = students.find(s => s.id === selectedStudentId) || null;
  const [searchName, setSearchName] = useState('');
  const [minAverage, setMinAverage] = useState('');
  const [sortBy, setSortBy] = useState('none');
  const [showSidebar, setShowSidebar] = useState(true);

  function formatNumber(n) {
    if (n == null || Number.isNaN(Number(n))) return '--';
    return Number(n).toFixed(decimals);
  }

  function computeStudentSummary(student) {
    const clean = (student.grades || []).map(g => ({
      nota: Number(g.nota) || 0,
      creditos: Number(g.creditos) || 0,
    }));
    const simple = clean.length ? clean.reduce((s, x) => s + x.nota, 0) / clean.length : 0;
    const totalCreds = clean.reduce((s, x) => s + x.creditos, 0);
    const weighted = totalCreds ? clean.reduce((s, x) => s + x.nota * x.creditos, 0) / totalCreds : simple;
    const result = mode === 'ponderado' ? weighted : simple;
    return { simple: Number(simple.toFixed(2)), weighted: Number(weighted.toFixed(2)), totalCreds, result };
  }

  const studentsWithSummary = useMemo(() => students.map(s => ({ ...s, summary: computeStudentSummary(s) })), [students, mode]);

  const filteredStudents = useMemo(() => {
    const name = String(searchName || '').trim().toLowerCase();
    const minAvg = Number(minAverage);
    return studentsWithSummary.filter(s => {
      if (name && !s.name.toLowerCase().includes(name)) return false;
      if (!Number.isNaN(minAvg) && minAverage !== '' && s.summary.result < minAvg) return false;
      return true;
    });
  }, [studentsWithSummary, searchName, minAverage]);

  const overallSummary = useMemo(() => {
    if (!filteredStudents || filteredStudents.length === 0) return { avg: 0 };
    const total = filteredStudents.reduce((s, st) => s + (st.summary?.result || 0), 0);
    const avg = total / filteredStudents.length;
    return { avg: Number(avg.toFixed(2)) };
  }, [filteredStudents]);

  const sortedFilteredStudents = useMemo(() => {
    const arr = (filteredStudents || []).slice();
    if (sortBy === 'avg_desc') return arr.sort((a, b) => (b.summary.result || 0) - (a.summary.result || 0));
    if (sortBy === 'avg_asc') return arr.sort((a, b) => (a.summary.result || 0) - (b.summary.result || 0));
    return arr;
  }, [filteredStudents, sortBy]);

  const miniDashboard = useMemo(() => {
    const count = (filteredStudents || []).length;
    if (count === 0) return { count: 0, avg: 0, best: null, worst: null };
    const avg = overallSummary.avg;
    const best = filteredStudents.reduce((m, s) => (!m || (s.summary.result || 0) > (m.summary.result || 0)) ? s : m, null);
    const worst = filteredStudents.reduce((m, s) => (!m || (s.summary.result || 0) < (m.summary.result || 0)) ? s : m, null);
    return { count, avg, best, worst };
  }, [filteredStudents, overallSummary]);

  const openStudent = studentId => setSelectedStudentId(studentId);
  const closeStudent = () => setSelectedStudentId(null);

  const addStudent = () => {
    const name = window.prompt('Nombre del alumno:');
    if (!name) return;
    setStudents(s => [...s, { id: uid(), name: name.trim(), grades: [] }]);
  };

  const updateStudentGrade = (studentId, index, key, value) => {
    setStudents(prev => prev.map(st => {
      if (st.id !== studentId) return st;
      const grades = (st.grades || []).map(g => ({ ...g }));
      if (index >= 0 && index < grades.length) {
        grades[index] = { ...grades[index], [key]: value };
      }
      return { ...st, grades };
    }));
  };

  const addGradeToStudent = (studentId) => {
    setStudents(prev => prev.map(st => st.id === studentId ? { ...st, grades: [...(st.grades||[]), { materia: '', nota: '', creditos: 1 }] } : st));
  };

  const removeGradeFromStudent = (studentId, index) => {
    setStudents(prev => prev.map(st => {
      if (st.id !== studentId) return st;
      const grades = (st.grades || []).slice();
      grades.splice(index, 1);
      return { ...st, grades };
    }));
  };

  const removeStudent = (studentId) => {
    if (!studentId) return;
    if (!window.confirm('¿Eliminar este alumno?')) return;
    setStudents(prev => prev.filter(s => s.id !== studentId));
    if (selectedStudentId === studentId) setSelectedStudentId(null);
    setStatus('Alumno eliminado');
    setTimeout(() => setStatus(''), 1500);
  };

  const copyStudentResult = async student => {
    const s = computeStudentSummary(student);
    const text = `${student.name} — Promedio: ${formatNumber(s.result)} (${toLetter(s.result)})`;
    try {
      await navigator.clipboard.writeText(text);
      setStatus('Copiado');
    } catch (e) {
      setStatus('No se pudo copiar');
    }
    setTimeout(() => setStatus(''), 1500);
  };

  const exportStudentCSV = async student => {
    const header = ['Alumno', 'Materia', 'Calificación', 'Créditos'];
    const rowsCsv = (student.grades || []).map(g => [student.name, g.materia || '', g.nota || '', g.creditos || '']
      .map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
    const csv = [header.join(','), ...rowsCsv].join('\n');

    try {
      // Crear blob y forzar descarga
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${student.name.replace(/\s+/g, '_')}_calificaciones.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus('CSV descargado');
    } catch (e) {
      // Fallback: copiar al portapapeles
      try {
        await navigator.clipboard.writeText(csv);
        setStatus('CSV copiado al portapapeles');
      } catch (e2) {
        setStatus('Error al exportar CSV');
      }
    }
    setTimeout(() => setStatus(''), 1500);
  };

  return (
    <div className={`${isDark ? 'min-h-screen p-4 sm:p-6 bg-slate-900 text-slate-200' : 'min-h-screen p-4 sm:p-6 bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 bg-white/30 backdrop-blur-lg border border-white/30 rounded-2xl shadow-md overflow-hidden relative">
        <header className="flex items-center gap-4 p-6 bg-transparent">
          <div className="flex-1">
            <div className="text-2xl font-semibold text-slate-800">Calculadora — Promedio por Alumno</div>
            <div className="text-sm text-slate-600">Haz click en un alumno para ver todas sus calificaciones</div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className={`${isDark ? 'bg-slate-800/60 text-slate-100' : 'bg-white/80 text-slate-800'} p-2 rounded border`}>
              <div className="text-xs text-slate-500">Alumnos</div>
              <div className="font-semibold">{miniDashboard.count}</div>
            </div>
            <div className={`${isDark ? 'bg-slate-800/60 text-slate-100' : 'bg-white/80 text-slate-800'} p-2 rounded border`}>
              <div className="text-xs text-slate-500">Promedio general</div>
              <div className="font-semibold">{formatNumber(miniDashboard.avg)} <span className="text-sm">{toLetter(miniDashboard.avg)}</span></div>
            </div>
            <div className={`${isDark ? 'bg-slate-800/60 text-slate-100' : 'bg-white/80 text-slate-800'} p-2 rounded border hidden sm:block`}>
              <div className="text-xs text-slate-500">Mejor</div>
              <div className="font-semibold">{miniDashboard.best ? miniDashboard.best.name : '--'}</div>
            </div>
            <div className={`${isDark ? 'bg-slate-800/60 text-slate-100' : 'bg-white/80 text-slate-800'} p-2 rounded border hidden sm:block`}>
              <div className="text-xs text-slate-500">Peor</div>
              <div className="font-semibold">{miniDashboard.worst ? miniDashboard.worst.name : '--'}</div>
            </div>
            <div className="text-sm text-slate-600 mr-4">Promedio: <span className="font-semibold">{formatNumber(overallSummary.avg)}</span> — <span className="font-medium">{toLetter(overallSummary.avg)}</span></div>
            <button onClick={() => setShowSidebar(s => !s)} className="px-2 py-1 bg-white/10 border rounded text-sm">{showSidebar ? 'Ocultar panel' : 'Mostrar panel'}</button>
            <button onClick={() => setIsDark(d => !d)} className="px-2 py-1 bg-white/10 border rounded text-sm">{isDark ? 'Modo claro' : 'Modo oscuro'}</button>
            <button
              onClick={() => window.history.back()}
              aria-label="Regresar al menú"
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-sm rounded border border-white/10 text-slate-800"
            >
              ← Regresar
            </button>
            <button onClick={addStudent} className="px-3 py-1 bg-emerald-600 text-white rounded text-sm">+ Agregar alumno</button>
          </div>
        </header>

        <main className="p-4 sm:p-6 grid grid-cols-1 gap-6">
          <section>
            <div className="flex flex-col gap-3 mb-4">
              {/* Chart / mini dashboard area */}
              <div className={`${isDark ? 'bg-slate-800 text-slate-100 border-slate-700' : 'bg-white text-slate-800 border-white/20'} p-4 rounded-lg border mb-4`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm text-slate-500">Promedio general</div>
                    <div className="text-2xl font-semibold">{formatNumber(overallSummary.avg)}</div>
                  </div>
                  <div className="text-sm text-slate-500">Gráfico de promedios</div>
                </div>
                <div className="w-full h-40 sm:h-44 flex items-end gap-4 px-2 overflow-hidden">
                  {(sortedFilteredStudents.length ? sortedFilteredStudents : studentsWithSummary).map((s, i) => {
                    const val = s.summary?.result || 0;
                    const h = Math.max(6, Math.round((val / 100) * 160));
                    const barColor = val >= 90 ? 'bg-emerald-400' : val >= 80 ? 'bg-sky-400' : val >= 70 ? 'bg-amber-400' : 'bg-rose-400';
                    return (
                      <div key={s.id || i} className="flex-1 flex flex-col items-center">
                        <div className="self-stretch flex items-end justify-center">
                          <div className={`rounded-t ${barColor}`} style={{ height: `${h}px`, width: '60%' }} />
                        </div>
                        <div className="text-xs mt-2 text-center truncate w-full">{s.name}</div>
                        <div className="text-xs text-slate-400">{Math.round(val)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" name="mode" checked={mode === 'ponderado'} onChange={() => setMode('ponderado')} />
                  <span>Ponderado (por créditos)</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" name="mode" checked={mode === 'simple'} onChange={() => setMode('simple')} />
                  <span>Simple (media aritmética)</span>
                </label>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <input placeholder="Buscar por nombre" value={searchName} onChange={e => setSearchName(e.target.value)} className="p-2 border rounded flex-1 min-w-0" />
                <input type="number" placeholder="Mín promedio" value={minAverage} onChange={e => setMinAverage(e.target.value)} className="p-2 border rounded w-36 sm:w-40" />
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="p-2 border rounded">
                  <option value="none">Ordenar: ninguno</option>
                  <option value="avg_desc">Promedio ↓</option>
                  <option value="avg_asc">Promedio ↑</option>
                </select>
                <button onClick={() => { setSearchName(''); setMinAverage(''); setSortBy('none'); }} className="px-3 py-1 bg-white border rounded">Limpiar</button>
              </div>

              <div className="space-y-3">
                {sortedFilteredStudents.map(student => {
                  const avg = student.summary.result || 0;
                  const pct = Math.max(0, Math.min(100, Math.round(avg)));
                  const colorClass = avg >= 90 ? 'bg-emerald-500' : avg >= 80 ? 'bg-sky-500' : avg >= 70 ? 'bg-amber-400' : 'bg-rose-500';
                  const cardBg = isDark ? 'bg-slate-800 text-slate-100 border-slate-700' : 'bg-white text-slate-800 border-white/20';
                  return (
                    <div key={student.id} className={`p-4 ${cardBg} rounded border flex flex-col sm:flex-row items-start sm:items-center justify-between transform hover:-translate-y-1 transition-transform duration-200`}>
                      <div className="flex items-center gap-4 w-full">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg flex-shrink-0 ${isDark ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-700'}`}>{student.name.charAt(0)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-lg truncate">{student.name}</div>
                          <div className="text-sm text-slate-500">Promedio: <span className="font-medium">{formatNumber(avg)}</span> — <span className="font-medium">{toLetter(avg)}</span></div>

                          <div className="mt-2 w-full sm:w-56 bg-slate-200/40 rounded overflow-hidden h-3">
                            <div className={`${colorClass} h-full`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 mt-3 sm:mt-0">
                        <button onClick={() => openStudent(student.id)} className="px-3 py-1 bg-sky-600 text-white rounded text-sm">📊 Ver calificaciones</button>
                        <button onClick={() => copyStudentResult(student)} className="px-2 py-1 bg-slate-800 text-white rounded text-sm">📋</button>
                        <button onClick={() => { if (window.confirm(`Eliminar a ${student.name}?`)) removeStudent(student.id); }} className="px-3 py-1 bg-rose-600 text-white rounded text-sm">Eliminar</button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
          </section>

          {showSidebar && (
            <>
              {/* Floating panel for md+ */}
              <div className="hidden md:block">
                <div className="absolute right-6 top-28 w-72 sm:w-80 z-40">
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded border shadow-sm">
                      <div className="font-semibold">Instrucciones</div>
                      <div className="mt-2 text-sm text-slate-700">Lista general de alumnos. Haz click en "Ver calificaciones" para abrir una ventana con todas las materias y notas del alumno seleccionado.</div>
                    </div>

                    <div className="p-4 bg-white rounded border shadow-sm">
                      <div className="font-semibold">Detalles</div>
                      <div className="mt-2 text-sm text-slate-700">Modo ponderado considera créditos. El modo simple hace un promedio aritmético.</div>
                    </div>

                    <div className="p-4 bg-white rounded border shadow-sm text-xs text-slate-500">Ejemplos: Daniel, Pepe, Camilo.</div>
                  </div>
                </div>
              </div>

              {/* Mobile: show panel in flow */}
              <div className="md:hidden">
                <aside className="space-y-4 mt-4">
                  <div className="p-4 bg-white rounded border shadow-sm">
                    <div className="font-semibold">Instrucciones</div>
                    <div className="mt-2 text-sm text-slate-700">Lista general de alumnos. Haz click en "Ver calificaciones" para abrir una ventana con todas las materias y notas del alumno seleccionado.</div>
                  </div>

                  <div className="p-4 bg-white rounded border shadow-sm">
                    <div className="font-semibold">Detalles</div>
                    <div className="mt-2 text-sm text-slate-700">Modo ponderado considera créditos. El modo simple hace un promedio aritmético.</div>
                  </div>

                  <div className="p-4 bg-white rounded border shadow-sm text-xs text-slate-500">Ejemplos: Daniel, Pepe, Camilo.</div>
                </aside>
              </div>
            </>
          )}
        </main>

        <footer className="p-4 text-xs text-slate-500 text-center">Herramienta educativa — usa esto como guía, confirma con tu institución.</footer>
      </div>

      {selectedStudent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" role="dialog" aria-modal="true">
          <div className="w-full max-w-2xl bg-white rounded p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xl font-semibold">{selectedStudent.name} — Calificaciones</div>
                <div className="text-sm text-slate-600">Promedio: {formatNumber(computeStudentSummary(selectedStudent).result)} — Letra: {toLetter(computeStudentSummary(selectedStudent).result)}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => exportStudentCSV(selectedStudent)} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm">Exportar CSV</button>
                <button onClick={closeStudent} className="px-3 py-1 bg-white border rounded text-sm">Cerrar</button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-slate-600">
                  <tr className="border-b">
                    <th className="text-left p-2">Materia</th>
                    <th className="text-left p-2">Calificación</th>
                    <th className="text-left p-2">Créditos</th>
                  </tr>
                </thead>
                <tbody>
                      {(selectedStudent.grades || []).map((g, i) => (
                        <tr key={i} className="border-b">
                          <td className="p-2">
                            <input className="p-1 border rounded w-full" value={g.materia || ''} onChange={e => updateStudentGrade(selectedStudent.id, i, 'materia', e.target.value)} />
                          </td>
                          <td className="p-2">
                            <input type="number" min="0" max="100" className="p-1 border rounded w-full" value={g.nota} onChange={e => updateStudentGrade(selectedStudent.id, i, 'nota', e.target.value)} />
                          </td>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <input type="number" min="0" step="1" className="p-1 border rounded w-20" value={g.creditos} onChange={e => updateStudentGrade(selectedStudent.id, i, 'creditos', e.target.value)} />
                              <button onClick={() => removeGradeFromStudent(selectedStudent.id, i)} className="text-sm text-red-600">Eliminar</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan={3} className="p-2">
                          <button onClick={() => addGradeToStudent(selectedStudent.id)} className="px-3 py-1 bg-slate-800 text-white rounded text-sm">+ Añadir materia</button>
                        </td>
                      </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
