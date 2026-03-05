import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { CheckCircle, XCircle, Clock, ChevronDown } from 'lucide-react';

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const timeToMinutes = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

const minutesToHora = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
};

const getAsistenciaColor = (asistencia) => {
  switch (asistencia) {
    case 'Asistió':
      return { bg: '#dbeafe', border: '#60a5fa' };
    case 'Falta':
      return { bg: '#fee2e2', border: '#f87171' };
    case 'Retardo':
      return { bg: '#fef3c7', border: '#fcd34d' };
    default:
      return { bg: '#f3f4f6', border: '#d1d5db' };
  }
};

const getAsistenciaIcon = (asistencia) => {
  switch (asistencia) {
    case 'Asistió':
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'Falta':
      return <XCircle className="w-4 h-4 text-red-600" />;
    case 'Retardo':
      return <Clock className="w-4 h-4 text-yellow-600" />;
    default:
      return null;
  }
};

export default function HorarioVistaSemanal() {
  const [horario, setHorario] = useState([]);
  const [dropdownActivo, setDropdownActivo] = useState(null);

  useEffect(() => {
    async function fetchHorario() {
      const { data, error } = await supabase
        .from('student_modules')
        .select('*')
        .eq('module_owner', 'ControlDeAsistencias_schedule');
      if (!error) setHorario(data || []);
    }
    fetchHorario();
  }, []);

  const actualizarAsistencia = async (id, nuevoEstado) => {
    try {
      const evento = horario.find(e => e.id === id);
      if (evento) {
        const { error } = await supabase
          .from('student_modules')
          .update({ content: { ...evento.content, asistencia: nuevoEstado } })
          .eq('id', id);
        
        if (!error) {
          // Actualizar el estado local
          setHorario(horario.map(e => 
            e.id === id 
              ? { ...e, content: { ...e.content, asistencia: nuevoEstado } }
              : e
          ));
          setDropdownActivo(null);
        }
      }
    } catch (error) {
      console.error('Error al actualizar:', error.message);
    }
  };

  // Generar horas basadas en los eventos existentes
  const generarHorasAdaptadas = () => {
    if (horario.length === 0) {
      // Si no hay eventos, mostrar un rango por defecto
      const horas = [];
      for (let h = 8; h < 20; h += 2) {
        horas.push(`${h}:00`);
      }
      return horas;
    }

    // Encontrar la hora mínima y máxima de todos los eventos
    let minMinutos = Infinity;
    let maxMinutos = -Infinity;

    horario.forEach(evento => {
      const inicio = timeToMinutes(evento.content.hora_inicio);
      const fin = timeToMinutes(evento.content.hora_fin);
      minMinutos = Math.min(minMinutos, inicio);
      maxMinutos = Math.max(maxMinutos, fin);
    });

    // Redondear la hora mínima al múltiplo de 2 horas anterior
    const horaMinRedondeada = Math.floor(minMinutos / 120) * 120;
    // Redondear la hora máxima al múltiplo de 2 horas siguiente (inclusive)
    const horaMaxRedondeada = Math.ceil(maxMinutos / 120) * 120;

    const horas = [];
    for (let m = horaMinRedondeada; m <= horaMaxRedondeada; m += 120) {
      horas.push(minutesToHora(m));
    }

    return horas;
  };

  const horas = generarHorasAdaptadas();

  // Obtener eventos que caen dentro de un bloque de 2 horas
  const getEventosEnBloque = (dia, horaInicio) => {
    const inicioMinutes = timeToMinutes(horaInicio);
    const finBloqueMinutes = inicioMinutes + 120; // 2 horas
    
    return horario.filter(evento => {
      if (evento.content.dia !== dia) return false;
      const eventoInicio = timeToMinutes(evento.content.hora_inicio);
      const eventoFin = timeToMinutes(evento.content.hora_fin);
      
      // Verificar si el evento se superpone con el bloque de 2 horas
      return eventoInicio < finBloqueMinutes && eventoFin > inicioMinutes;
    }).map(evento => {
      const eventoInicio = timeToMinutes(evento.content.hora_inicio);
      const eventoFin = timeToMinutes(evento.content.hora_fin);
      
      // Calcular posición relativa dentro del bloque (en porcentaje)
      const topOffset = Math.max(0, ((eventoInicio - inicioMinutes) / 120) * 100);
      
      // Calcular altura relativa (duración del evento / 2 horas * 100)
      const duracion = Math.min(eventoFin, inicioMinutes + 120) - Math.max(eventoInicio, inicioMinutes);
      const altura = (duracion / 120) * 100;
      
      return {
        ...evento,
        topOffset,
        altura
      };
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 overflow-x-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Horario Semanal</h2>
      <div style={{ display: 'table', width: '100%', borderCollapse: 'collapse' }}>
        <div style={{ display: 'table-header-group' }}>
          <div style={{ display: 'table-row', backgroundColor: '#2563eb' }}>
            <div style={{ 
              display: 'table-cell', 
              padding: '12px 16px', 
              color: 'white', 
              fontWeight: 'bold',
              borderRight: '1px solid #1d4ed8',
              textAlign: 'left'
            }}>
              Hora
            </div>
            {diasSemana.map(dia => (
              <div
                key={dia}
                style={{
                  display: 'table-cell',
                  padding: '12px 16px',
                  color: 'white',
                  fontWeight: 'bold',
                  borderRight: '1px solid #1d4ed8',
                  textAlign: 'center'
                }}
              >
                {dia}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'table-row-group' }}>
          {horas.map((hora, hourIdx) => (
            <div 
              key={hora} 
              style={{ 
                display: 'table-row',
                backgroundColor: hourIdx % 2 === 0 ? '#f9fafb' : 'white'
              }}
            >
              <div style={{
                display: 'table-cell',
                padding: '12px 16px',
                fontWeight: '600',
                color: '#1f2937',
                borderRight: '1px solid #e5e7eb',
                borderBottom: '1px solid #e5e7eb',
                height: '200px',
                textAlign: 'left',
                verticalAlign: 'top'
              }}>
                {hora}
              </div>
              {diasSemana.map(dia => {
                const eventos = getEventosEnBloque(dia, hora);

                return (
                  <div
                    key={dia}
                    style={{
                      display: 'table-cell',
                      padding: '4px',
                      textAlign: 'center',
                      borderRight: '1px solid #e5e7eb',
                      borderBottom: '1px solid #e5e7eb',
                      height: '200px',
                      position: 'relative',
                      verticalAlign: 'top'
                    }}
                  >
                    {eventos.length > 0 ? (
                      <div style={{ position: 'relative', height: '100%' }}>
                        {eventos.map((evento, idx) => {
                          const colores = getAsistenciaColor(evento.content.asistencia);
                          const isDropdownActive = dropdownActivo === evento.id;
                          
                          return (
                            <div
                              key={idx}
                              style={{
                                position: 'absolute',
                                top: `${evento.topOffset}%`,
                                left: '4px',
                                right: '4px',
                                height: `${evento.altura}%`,
                                minHeight: '30px',
                                padding: '8px',
                                borderRadius: '8px',
                                border: `2px solid ${colores.border}`,
                                backgroundColor: colores.bg,
                                transition: 'all 0.2s',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                overflow: 'hidden',
                                position: 'relative'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'}
                              onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                            >
                              <div>
                                <div style={{ 
                                  fontWeight: 'bold', 
                                  fontSize: '11px', 
                                  color: '#1f2937',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: 'flex',
                                  gap: '4px',
                                  alignItems: 'center'
                                }}>
                                  {getAsistenciaIcon(evento.content.asistencia)}
                                  {evento.content.materia}
                                </div>
                                <div style={{ 
                                  fontSize: '10px', 
                                  color: '#4b5563',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {evento.content.hora_inicio} - {evento.content.hora_fin}
                                </div>
                              </div>

                              {/* Dropdown button */}
                              <div style={{ position: 'relative', marginTop: '4px' }}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDropdownActivo(isDropdownActive ? null : evento.id);
                                  }}
                                  style={{
                                    width: '100%',
                                    padding: '4px',
                                    fontSize: '11px',
                                    backgroundColor: 'rgba(255,255,255,0.7)',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '2px'
                                  }}
                                >
                                  Marcar <ChevronDown className="w-3 h-3" />
                                </button>

                                {/* Dropdown menu */}
                                {isDropdownActive && (
                                  <div
                                    style={{
                                      position: 'absolute',
                                      top: '100%',
                                      left: 0,
                                      right: 0,
                                      backgroundColor: 'white',
                                      border: '1px solid #e5e7eb',
                                      borderRadius: '4px',
                                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                      zIndex: 20,
                                      marginTop: '2px'
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {['Asistió', 'Falta', 'Retardo', 'No registrada'].map(estado => (
                                      <button
                                        key={estado}
                                        onClick={() => actualizarAsistencia(evento.id, estado)}
                                        style={{
                                          width: '100%',
                                          padding: '6px 8px',
                                          textAlign: 'left',
                                          fontSize: '11px',
                                          backgroundColor: evento.content.asistencia === estado ? '#f0f9ff' : 'white',
                                          border: 'none',
                                          cursor: 'pointer',
                                          borderBottom: '1px solid #f3f4f6'
                                        }}
                                      >
                                        {estado}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ color: '#d1d5db', fontSize: '14px', paddingTop: '8px' }}>-</div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
