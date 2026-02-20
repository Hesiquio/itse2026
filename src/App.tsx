import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GestorDeTareas from './modules/GestorDeTareas/GestorDeTareas';
import CalculadoraDePromedios from './modules/CalculadoraDePromedios/CalculadoraDePromedios';
import BitacoraDeTutorias from './modules/BitacoraDeTutorias/BitacoraDeTutorias';
import ControlDePrestamos from './modules/ControlDePrestamos/ControlDePrestamos';
import DirectorioDeProfesores from './modules/DirectorioDeProfesores/DirectorioDeProfesores';
import RepositorioDeEnlaces from './modules/RepositorioDeEnlaces/RepositorioDeEnlaces';
import PlanificadorDeExamenes from './modules/PlanificadorDeExamenes/PlanificadorDeExamenes';
import RegistroDeGastos from './modules/RegistroDeGastos/RegistroDeGastos';
import ControlDeAsistencias from './modules/ControlDeAsistencias/ControlDeAsistencias';
import IdeasParaProyectos from './modules/IdeasParaProyectos/IdeasParaProyectos';
import GestorDeContrasenasSimulado from './modules/GestorDeContrasenasSimulado/GestorDeContrasenasSimulado';
import HorarioDeLaboratorio from './modules/HorarioDeLaboratorio/HorarioDeLaboratorio';
import ListaDeLecturas from './modules/ListaDeLecturas/ListaDeLecturas';
import DiarioDeErrores from './modules/DiarioDeErrores/DiarioDeErrores';
import MetasDelSemestre from './modules/MetasDelSemestre/MetasDelSemestre';
import InventarioDeComponentes from './modules/InventarioDeComponentes/InventarioDeComponentes';
import ContactosDeEquipos from './modules/ContactosDeEquipos/ContactosDeEquipos';
import CitasDeReferenciasAPA from './modules/CitasDeReferenciasAPA/CitasDeReferenciasAPA';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/gestor-de-tareas" element={<GestorDeTareas />} />
        <Route path="/calculadora-de-promedios" element={<CalculadoraDePromedios />} />
        <Route path="/bitacora-de-tutorias" element={<BitacoraDeTutorias />} />
        <Route path="/control-de-prestamos" element={<ControlDePrestamos />} />
        <Route path="/directorio-de-profesores" element={<DirectorioDeProfesores />} />
        <Route path="/repositorio-de-enlaces" element={<RepositorioDeEnlaces />} />
        <Route path="/planificador-de-examenes" element={<PlanificadorDeExamenes />} />
        <Route path="/registro-de-gastos" element={<RegistroDeGastos />} />
        <Route path="/control-de-asistencias" element={<ControlDeAsistencias />} />
        <Route path="/ideas-para-proyectos" element={<IdeasParaProyectos />} />
        <Route path="/gestor-de-contrasenas-simulado" element={<GestorDeContrasenasSimulado />} />
        <Route path="/horario-de-laboratorio" element={<HorarioDeLaboratorio />} />
        <Route path="/lista-de-lecturas" element={<ListaDeLecturas />} />
        <Route path="/diario-de-errores" element={<DiarioDeErrores />} />
        <Route path="/metas-del-semestre" element={<MetasDelSemestre />} />
        <Route path="/inventario-de-componentes" element={<InventarioDeComponentes />} />
        <Route path="/contactos-de-equipos" element={<ContactosDeEquipos />} />
        <Route path="/citas-de-referencias-apa" element={<CitasDeReferenciasAPA />} />
      </Routes>
    </Router>
  );
}

export default App;
