import { useState } from "react";

function ReviewForm({ onAdd, darkMode }) {

  const [titulo, setTitulo] = useState("");
  const [url, setUrl] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    onAdd({ titulo, url, descripcion });

    setTitulo("");
    setUrl("");
    setDescripcion("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`p-4 rounded-xl shadow-md ${
        darkMode ? "bg-gray-900" : "bg-gray-100"
      }`}
    >

      <input
        type="text"
        placeholder="Título del video"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        className={`w-full p-2 mb-3 rounded ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
        }`}
        required
      />

      <input
        type="url"
        placeholder="Link de YouTube"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className={`w-full p-2 mb-3 rounded ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
        }`}
        required
      />

      <textarea
        placeholder="Descripción"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        className={`w-full p-2 mb-3 rounded ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
        }`}
      />

      <button
        type="submit"
        className="bg-red-500 text-white px-4 py-2 rounded-lg"
      >
        Subir Video
      </button>

    </form>
  );
}

export default ReviewForm;