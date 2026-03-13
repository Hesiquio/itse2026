function Navbar({ onSearch, toggleSidebar, darkMode, setDarkMode }) {
  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.search.value;
    onSearch(query);
  };

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-red-600 text-white">
      <button onClick={toggleSidebar} className="text-2xl">
        ☰
      </button>

      <h1
        className="text-xl font-bold cursor-pointer"
        onClick={() => onSearch("")}
      >
        DevTube Academy
      </h1>

      <form onSubmit={handleSearch} className="flex w-1/3">
        <input
          name="search"
          type="text"
          placeholder="Buscar..."
          className="w-full p-2 text-black rounded-l-lg"
        />
        <button type="submit" className="bg-black px-4 rounded-r-lg">
          🔍
        </button>
      </form>

      <button
        onClick={() => setDarkMode(!darkMode)}
        className="ml-4 bg-black px-3 py-1 rounded-lg"
      >
        {darkMode ? "☀️" : "🌙"}
      </button>
    </div>
  );
}

export default Navbar;