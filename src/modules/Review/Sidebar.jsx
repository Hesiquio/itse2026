function Sidebar({ isOpen, setSection, toggleSidebar, darkMode }) {
  return (
    <>
      {/* Fondo oscuro al abrir */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={toggleSidebar}
        ></div>
      )}

      <div
        className={`fixed top-0 left-0 h-full w-64 p-6 z-50 transform
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        transition-transform duration-300
        ${darkMode ? "bg-gray-900 text-white" : "bg-gray-200 text-black"}`}
      >
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold">Menú</h2>
          <button
            onClick={toggleSidebar}
            className="text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Opciones */}
        <ul className="space-y-6 text-lg">
          <li
            className="cursor-pointer hover:text-red-500"
            onClick={() => {
              setSection("inicio");
              toggleSidebar();
            }}
          >
            🏠 Página Principal
          </li>

          <li
            className="cursor-pointer hover:text-red-500"
            onClick={() => {
              setSection("suscripciones");
              toggleSidebar();
            }}
          >
            📺 Suscripciones
          </li>

          <li
            className="cursor-pointer hover:text-red-500"
            onClick={() => {
              setSection("gustados");
              toggleSidebar();
            }}
          >
            ❤️ Videos que te gustaron
          </li>
        </ul>
      </div>
    </>
  );
}

export default Sidebar;