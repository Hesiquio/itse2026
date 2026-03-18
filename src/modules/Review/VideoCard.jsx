function VideoCard({ video, onLike, darkMode }) {

  const getVideoId = (url) => {
    const match = url.match(/v=([^&]+)/);
    return match ? match[1] : null;
  };

  const videoId = getVideoId(video.url);
  const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div className={`rounded-lg overflow-hidden shadow-lg ${
      darkMode ? "bg-gray-900" : "bg-gray-100"
    }`}>

      <img src={thumbnail} alt="thumbnail" className="w-full" />

      <div className="p-4">
        <h2 className="font-semibold text-lg">{video.titulo}</h2>
        <p className="text-sm opacity-70">{video.descripcion}</p>

        <button
          onClick={onLike}
          className="mt-3 bg-red-600 text-white px-3 py-1 rounded-lg"
        >
          👍 {video.likes}
        </button>
      </div>
    </div>
  );
}

export default VideoCard;