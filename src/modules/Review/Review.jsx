import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import ReviewForm from "./ReviewForm";
import VideoCard from "./VideoCard";

function Review() {
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [section, setSection] = useState("inicio");
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    setFilteredVideos(videos);
  }, [videos]);

  const addVideo = (video) => {
    setVideos([...videos, { ...video, likes: 0 }]);
  };

  const likeVideo = (index) => {
    const updated = [...videos];
    updated[index].likes += 1;
    setVideos(updated);
  };

  const handleSearch = (query) => {
    const filtered = videos.filter((video) =>
      video.titulo.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredVideos(filtered);
  };

  return (
    <div className={darkMode ? "bg-black text-white min-h-screen" : "bg-white text-black min-h-screen"}>
      
      <Navbar
        onSearch={handleSearch}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          setSection={setSection}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          darkMode={darkMode}
        />

        <div
          className={`flex-1 p-6 transition-all duration-300 ${
            sidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          {section === "inicio" && (
            <>
              <ReviewForm onAdd={addVideo} darkMode={darkMode} />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                {filteredVideos.map((video, index) => (
                  <VideoCard
                    key={index}
                    video={video}
                    onLike={() => likeVideo(index)}
                    darkMode={darkMode}
                  />
                ))}
              </div>
            </>
          )}

          {section === "suscripciones" && (
            <h2 className="text-2xl font-bold">📺 Suscripciones</h2>
          )}

          {section === "gustados" && (
            <>
              <h2 className="text-2xl font-bold mb-4">
                ❤️ Videos que te gustaron
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {videos
                  .filter((video) => video.likes > 0)
                  .map((video, index) => (
                    <VideoCard
                      key={index}
                      video={video}
                      onLike={() => likeVideo(index)}
                      darkMode={darkMode}
                    />
                  ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Review;