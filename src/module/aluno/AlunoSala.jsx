import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import Layout from '../../components/Layout'
import { toEmbed } from '../../utils/helpers'

export default function AlunoSala() {
  const { id } = useParams()
  const { getRoom, currentUser } = useData()
  const room = getRoom(id)

  const [selectedPlaylist, setSelectedPlaylist] = useState(null)
  const [selectedVideo, setSelectedVideo] = useState(null)

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

  if (!currentUser.enrolledRooms.includes(room.id)) {
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

  return (
    <Layout>
      <div className="breadcrumb">
        <Link to="/aluno">Início</Link> / <span>{room.name}</span>
      </div>

      <h1>{room.name}</h1>
      <p className="muted">{room.description}</p>

      <div className="aluno-sala-layout">
        {/* Sidebar with playlists */}
        <div className="aluno-playlists">
          <div className="card">
            <h3>Playlists</h3>
            {room.playlists.length === 0 ? (
              <p className="muted">Nenhum conteúdo disponível ainda.</p>
            ) : (
              <div className="playlist-list">
                {room.playlists.map(p => (
                  <div key={p.id}>
                    <div
                      className={`playlist-item ${selectedPlaylist === p.id ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedPlaylist(p.id)
                        setSelectedVideo(null)
                      }}
                    >
                      <span>📁 {p.name}</span>
                      <span className="badge">{p.videos.length}</span>
                    </div>

                    {selectedPlaylist === p.id && (
                      <div className="video-list-nested">
                        {p.videos.map(v => (
                          <div
                            key={v.id}
                            className={`video-item-small ${selectedVideo === v.id ? 'active' : ''}`}
                            onClick={() => setSelectedVideo(v.id)}
                          >
                            🎬 {v.title}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
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
            <div className="card">
              <h2>{video.title}</h2>
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
              {video.description && (
                <div className="video-description">
                  <h4>Materiais Complementares</h4>
                  <p>{video.description}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
