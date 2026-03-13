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
  const [rows, setRows] = useState(() => [
    { id: uid(), materia: 'Matemáticas', nota: 85, creditos: 4 },
    { id: uid(), materia: 'Historia', nota: 78, creditos: 3 },
  ]);
  const [mode, setMode] = useState('ponderado');
  const [target, setTarget] = useState('85');

  const addRow = () => {
    setRows(r => [...r, { id: uid(), materia: '', nota: '', creditos: 1 }]);
  };

  const examples = [
    { materia: 'Matemáticas', nota: 95, creditos: 4 },
    { materia: 'Física', nota: 88, creditos: 4 },
    { materia: 'Química', nota: 76, creditos: 3 },
    { materia: 'Historia', nota: 82, creditos: 2 },
    { materia: 'Inglés', nota: 91, creditos: 2 },
    { materia: 'Programación', nota: 85, creditos: 3 },
    { materia: 'Educación Física', nota: 70, creditos: 1 },
  ];

  const loadExamples = () => {
    setRows(examples.map(e => ({ ...e, id: uid() })));
  };

  const updateRow = (id, key, value) => {
    setRows(r => r.map(row => (row.id === id ? { ...row, [key]: value } : row)));
  };

  const removeRow = id => setRows(r => r.filter(row => row.id !== id));

  const summary = useMemo(() => {
    const clean = rows.map(r => ({
      ...r,
      nota: Number(r.nota) || 0,
      creditos: Number(r.creditos) || 0,
    }));

    const simple = clean.length ? clean.reduce((s, x) => s + x.nota, 0) / clean.length : 0;
    const totalCreds = clean.reduce((s, x) => s + x.creditos, 0);
    const weighted = totalCreds ? clean.reduce((s, x) => s + x.nota * x.creditos, 0) / totalCreds : 0;

    return {
      simple: Number(simple.toFixed(2)),
      weighted: Number(weighted.toFixed(2)),
      totalCreds,
    };
  }, [rows]);

  const result = mode === 'ponderado' ? summary.weighted : summary.simple;

  const requiredToReachTarget = useMemo(() => {
    const t = Number(target) || 0;
    if (!t) return null;
    const clean = rows.map(r => ({ nota: Number(r.nota) || 0, creditos: Number(r.creditos) || 0 }));
    const totalCreds = clean.reduce((s, x) => s + x.creditos, 0);
    if (mode === 'simple') {
      const currentSum = clean.reduce((s, x) => s + x.nota, 0);
      const neededTotal = t * clean.length;
      const diff = Math.max(0, neededTotal - currentSum);
      return Number((diff / clean.length).toFixed(2));
    }
    if (totalCreds === 0) return null;
    const currentWeightedSum = clean.reduce((s, x) => s + x.nota * x.creditos, 0);
    const neededWeightedSum = t * totalCreds;
    const diff = Math.max(0, neededWeightedSum - currentWeightedSum);
    return Number((diff / totalCreds).toFixed(2));
  }, [rows, target, mode]);

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-5xl mx-auto bg-white/30 backdrop-blur-lg border border-white/30 rounded-2xl shadow-md overflow-hidden">
        <header className="flex items-center gap-4 p-6 bg-transparent">
          <div className="text-2xl font-semibold text-slate-800">Calculadora de Promedios</div>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              aria-label="Regresar al menú"
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-sm rounded border border-white/10 text-slate-800"
            >
              ← Regresar
            </button>
            <div className="text-sm text-slate-600">Promedio simple y ponderado por créditos</div>
          </div>
        </header>

        <main className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="mode" checked={mode === 'ponderado'} onChange={() => setMode('ponderado')} />
                <span>Ponderado (por créditos)</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="mode" checked={mode === 'simple'} onChange={() => setMode('simple')} />
                <span>Simple (media aritmética)</span>
              </label>
              <div className="ml-auto flex items-center gap-2">
                <button onClick={addRow} className="px-3 py-1 bg-slate-800 text-white rounded shadow-sm">+ Añadir materia</button>
                <button onClick={loadExamples} className="px-3 py-1 bg-emerald-600 text-white rounded shadow-sm">Cargar 7 ejemplos</button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-fixed bg-white/60 rounded-md">
                <thead className="text-sm text-slate-600">
                  <tr className="border-b">
                    <th className="text-left p-3">Materia</th>
                    <th className="w-28 text-left p-3">Calificación</th>
                    <th className="w-28 text-left p-3">Créditos</th>
                    <th className="w-28 text-left p-3">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(row => (
                    <tr key={row.id} className="align-middle border-b last:border-0">
                      <td className="p-3">
                        <input aria-label="Materia" className="w-full p-2 bg-transparent border-b focus:border-slate-400 outline-none" placeholder="Materia" value={row.materia} onChange={e => updateRow(row.id, 'materia', e.target.value)} />
                      </td>
                      <td className="p-3">
                        <input aria-label="Calificación" type="number" min="0" max="100" className="w-full p-2 bg-transparent border-b focus:border-slate-400 outline-none" placeholder="Calificación" value={row.nota} onChange={e => updateRow(row.id, 'nota', e.target.value)} />
                      </td>
                      <td className="p-3">
                        <input aria-label="Créditos" type="number" min="0" className="w-full p-2 bg-transparent border-b focus:border-slate-400 outline-none" placeholder="Créditos" value={row.creditos} onChange={e => updateRow(row.id, 'creditos', e.target.value)} />
                      </td>
                      <td className="p-3">
                        <button onClick={() => removeRow(row.id)} className="text-sm text-red-600">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-4 bg-white/40 rounded border border-white/20 shadow-sm">
              <div className="text-sm text-slate-600 mb-2">Resultado</div>
              <div className="flex items-center gap-4">
                <div className="text-3xl font-semibold text-slate-800">{result}</div>
                <div className="text-lg text-slate-700">Letra: <span className="font-medium">{toLetter(result)}</span></div>
                <div className="flex-1">
                  <div className="h-3 bg-slate-200 rounded overflow-hidden">
                    <div className="h-full bg-slate-800" style={{ width: `${Math.min(100, Math.max(0, result))}%`, opacity: 0.08 }} />
                  </div>
                </div>
              </div>
              <div className="mt-3 text-sm text-slate-600">Promedio simple: {summary.simple} • Créditos totales: {summary.totalCreds}</div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="p-4 bg-gradient-to-br from-white to-sky-50 rounded border">
              <div className="font-semibold">¿Meta?</div>
              <div className="mt-2 flex gap-2">
                <input type="number" className="flex-1 p-2 border rounded" value={target} onChange={e => setTarget(e.target.value)} />
                <div className="p-2 bg-sky-100 rounded">Necesitas +{requiredToReachTarget ?? '--'}</div>
              </div>
              <div className="mt-3 text-xs text-slate-600">La cifra indica cuánto debería aumentar, en promedio, tu nota (o ponderación) para alcanzar la meta.</div>
            </div>

            <div className="p-4 bg-white rounded border shadow-sm">
              <div className="font-semibold">Detalles educativos</div>
              <ul className="mt-2 text-sm list-disc list-inside text-slate-700 space-y-1">
                <li>Promedio simple: suma de notas dividido entre número de materias.</li>
                <li>Promedio ponderado: cada nota se multiplica por sus créditos.</li>
                <li>Los créditos influyen en la importancia de la materia en tu promedio.</li>
                <li>Consejo: mejorar asignaturas con alto número de créditos sube más el promedio.</li>
              </ul>
            </div>

            <div className="p-4 bg-white rounded border shadow-sm">
              <div className="font-semibold">Ejemplo rápido</div>
              <div className="mt-2 text-sm text-slate-700">
                Si tienes 90 (4 créditos) y 70 (2 créditos), el ponderado es (90*4 + 70*2) / 6 = 83.33.
              </div>
            </div>
          </aside>
        </main>

        <footer className="p-4 text-xs text-slate-500 text-center">Herramienta educativa — usa esto como guía, confirma con tu institución.</footer>
      </div>
    </div>
  );
}
