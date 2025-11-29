import React, { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/Layout'
import VideoComments from '../../components/VideoComments'
import VideoMaterials from '../../components/VideoMaterials'
import { toEmbed } from '../../utils/helpers'

export default function AlunoSala() {
  const { id } = useParams()
  const { getRoom, getNextVideo } = useData()
  const { currentUser, isVideoWatched, markVideoWatched, getVideoProgress } = useAuth()
  const room = getRoom(id)

  // Initialize with first playlist/video
  const initialSelection = useMemo(() => {
    if (room && room.playlists.length > 0) {
      const firstPlaylist = room.playlists[0]
      return {
        playlistId: firstPlaylist.id,
        videoId: firstPlaylist.videos.length > 0 ? firstPlaylist.videos[0].id : null
      }
    }
    return { playlistId: null, videoId: null }
  }, [room])

  const [selectedPlaylist, setSelectedPlaylist] = useState(initialSelection.playlistId)
  const [selectedVideo, setSelectedVideo] = useState(initialSelection.videoId)
  const [showComments, setShowComments] = useState(false)

  if (!room) {
    return (
      <Layout>
        <div className="card">
          <p>Sala não encontrada.</p>
          <Link to="/aluno" className="btn">Voltar</Link>
        </div>
      </Layout>
    )
  }

  if (!currentUser?.enrolledRooms?.includes(room.id) && !room.enrolledStudents?.includes(currentUser?.id)) {
    return (
      <Layout>
        <div className="card">
          <p>Você não está matriculado nesta sala.</p>
          <Link to="/aluno" className="btn">Voltar</Link>
        </div>
      </Layout>
    )
  }

  const playlist = room.playlists.find(p => p.id === selectedPlaylist)
  const video = playlist?.videos.find(v => v.id === selectedVideo)
  const nextVideo = video ? getNextVideo(room.id, selectedPlaylist, video.id) : null

  // Calculate playlist progress
  function getPlaylistProgress(p) {
    if (!p.videos.length) return 0
    const watched = p.videos.filter(v => isVideoWatched(v.id)).length
    return Math.round((watched / p.videos.length) * 100)
  }

  function handleMarkWatched() {
    if (video) {
      markVideoWatched(video.id, room.id, selectedPlaylist, 100)
    }
  }

  function handleVideoSelect(playlistId, videoId) {
    setSelectedPlaylist(playlistId)
    setSelectedVideo(videoId)
    setShowComments(false)
  }

  function handleNextVideo() {
    if (nextVideo) {
      setSelectedVideo(nextVideo.id)
      setShowComments(false)
    }
  }

  return (
    <Layout>
      <div className="breadcrumb">
        <Link to="/aluno">Início</Link> / <span>{room.name}</span>
      </div>

      <div className="aluno-sala-layout">
        {/* Sidebar with playlists */}
        <div className="aluno-playlists">
          <div className="card">
            <h3>📚 Conteúdo</h3>
            
            {room.playlists.length === 0 ? (
              <p className="muted">Nenhum conteúdo disponível ainda.</p>
            ) : (
              <div className="playlist-list">
                {room.playlists.map(p => {
                  const progress = getPlaylistProgress(p)
                  const isActive = selectedPlaylist === p.id

                  return (
                    <div key={p.id} className="playlist-accordion">
                      <div
                        className={`playlist-header ${isActive ? 'active' : ''}`}
                        onClick={() => setSelectedPlaylist(isActive ? null : p.id)}
                      >
                        <div className="playlist-title">
                          <span className="playlist-icon">{isActive ? '📂' : '📁'}</span>
                          <span>{p.name}</span>
                        </div>
                        <div className="playlist-meta">
                          <span className="progress-mini-badge">{progress}%</span>
                          <span className="video-count">{p.videos.length}</span>
                        </div>
                      </div>

                      {isActive && (
                        <div className="video-list">
                          {p.videos.length === 0 ? (
                            <p className="muted small">Nenhum vídeo nesta playlist</p>
                          ) : (
                            p.videos.map((v, index) => {
                              const watched = isVideoWatched(v.id)
                              const inProgress = getVideoProgress(v.id)
                              const isSelected = selectedVideo === v.id

                              return (
                                <div
                                  key={v.id}
                                  className={`video-list-item ${isSelected ? 'selected' : ''} ${watched ? 'watched' : ''}`}
                                  onClick={() => handleVideoSelect(p.id, v.id)}
                                >
                                  <span className="video-number">{index + 1}</span>
                                  <span className="video-title">{v.title}</span>
                                  <span className="video-status">
                                    {watched ? '✅' : inProgress > 0 ? `${inProgress}%` : '○'}
                                  </span>
                                </div>
                              )
                            })
                          )}
                        </div>
                      )}

                      {/* Playlist progress bar */}
                      <div className="playlist-progress-bar">
                        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Main content - video player */}
        <div className="aluno-video-area">
          {!video ? (
            <div className="card empty-state">
              <h3>Selecione uma aula</h3>
              <p>Escolha uma playlist e depois um vídeo para começar a assistir.</p>
            </div>
          ) : (
            <>
              <div className="card video-player-card">
                <div className="video-player-header">
                  <h2>{video.title}</h2>
                  {isVideoWatched(video.id) && (
                    <span className="watched-badge">✅ Assistido</span>
                  )}
                </div>

                <div className="video-player">
                  <iframe
                    src={toEmbed(video.url)}
                    title={video.title}
                    width="100%"
                    height="450"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                <div className="video-controls">
                  {!isVideoWatched(video.id) && (
                    <button className="btn" onClick={handleMarkWatched}>
                      ✅ Marcar como Assistido
                    </button>
                  )}
                  
                  {nextVideo && (
                    <button className="btn secondary" onClick={handleNextVideo}>
                      Próxima Aula ▶️
                    </button>
                  )}

                  <button 
                    className={`btn secondary ${showComments ? 'active' : ''}`}
                    onClick={() => setShowComments(!showComments)}
                  >
                    💬 Comentários
                  </button>
                </div>

                {video.description && (
                  <div className="video-description">
                    <h4>Descrição</h4>
                    <p>{video.description}</p>
                  </div>
                )}

                {/* Materials */}
                <VideoMaterials 
                  videoId={video.id} 
                  roomId={room.id} 
                  playlistId={selectedPlaylist}
                  canEdit={false}
                />
              </div>

              {/* Comments Section */}
              {showComments && (
                <div className="card">
                  <VideoComments 
                    videoId={video.id} 
                    roomId={room.id} 
                    playlistId={selectedPlaylist}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}
