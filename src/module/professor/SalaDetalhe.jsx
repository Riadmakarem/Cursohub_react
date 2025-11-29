import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import Layout from '../../components/Layout'
import { toEmbed } from '../../utils/helpers'

export default function SalaDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getRoom, createPlaylist, deletePlaylist, addVideo, deleteVideo, deleteRoom } = useData()
  const room = getRoom(id)

  const [playlistName, setPlaylistName] = useState('')
  const [selectedPlaylist, setSelectedPlaylist] = useState(null)
  const [videoTitle, setVideoTitle] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [videoDescription, setVideoDescription] = useState('')

  if (!room) {
    return (
      <Layout>
        <div className="card">
          <p>Sala não encontrada.</p>
          <Link to="/professor/salas" className="btn">Voltar</Link>
        </div>
      </Layout>
    )
  }

  const playlist = room.playlists.find(p => p.id === selectedPlaylist)

  function handleCreatePlaylist(e) {
    e.preventDefault()
    if (!playlistName.trim()) return
    createPlaylist(room.id, playlistName.trim())
    setPlaylistName('')
  }

  function handleAddVideo(e) {
    e.preventDefault()
    if (!videoUrl.trim() || !selectedPlaylist) return
    addVideo(room.id, selectedPlaylist, {
      title: videoTitle.trim() || 'Videoaula',
      url: videoUrl.trim(),
      description: videoDescription.trim()
    })
    setVideoTitle('')
    setVideoUrl('')
    setVideoDescription('')
  }

  function handleDeleteRoom() {
    if (confirm('Tem certeza que deseja excluir esta sala?')) {
      deleteRoom(room.id)
      navigate('/professor/salas')
    }
  }

  return (
    <Layout>
      <div className="breadcrumb">
        <Link to="/professor/salas">Salas</Link> / <span>{room.name}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1>{room.name}</h1>
          <p style={{ color: '#666' }}>{room.description || 'Sem descrição'}</p>
        </div>
        <button className="btn danger" onClick={handleDeleteRoom}>Excluir Sala</button>
      </div>

      <div className="sala-layout">
        {/* Playlists Column */}
        <div className="playlists-column">
          <div className="card">
            <h3>Playlists</h3>

            <form onSubmit={handleCreatePlaylist} style={{ marginBottom: 16 }}>
              <div className="form-row">
                <input
                  type="text"
                  value={playlistName}
                  onChange={e => setPlaylistName(e.target.value)}
                  placeholder="Nome da playlist"
                />
                <button type="submit" className="btn">+ Criar</button>
              </div>
            </form>

            {room.playlists.length === 0 ? (
              <p className="muted">Nenhuma playlist criada</p>
            ) : (
              <div className="playlist-list">
                {room.playlists.map(p => (
                  <div
                    key={p.id}
                    className={`playlist-item ${selectedPlaylist === p.id ? 'active' : ''}`}
                    onClick={() => setSelectedPlaylist(p.id)}
                  >
                    <span>📁 {p.name}</span>
                    <span className="badge">{p.videos.length} vídeos</span>
                    <button
                      className="btn-icon danger"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm('Excluir playlist?')) deletePlaylist(room.id, p.id)
                      }}
                    >🗑️</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Videos Column */}
        <div className="videos-column">
          {!playlist ? (
            <div className="card empty-state">
              <p>Selecione uma playlist para ver e adicionar vídeos</p>
            </div>
          ) : (
            <div className="card">
              <h3>📁 {playlist.name}</h3>

              <form onSubmit={handleAddVideo} className="video-form">
                <div className="form-group">
                  <input
                    type="text"
                    value={videoTitle}
                    onChange={e => setVideoTitle(e.target.value)}
                    placeholder="Título do vídeo"
                  />
                </div>
                <div className="form-group">
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={e => setVideoUrl(e.target.value)}
                    placeholder="Link do YouTube (ex: https://youtube.com/watch?v=...)"
                    required
                  />
                </div>
                <div className="form-group">
                  <textarea
                    value={videoDescription}
                    onChange={e => setVideoDescription(e.target.value)}
                    placeholder="Descrição ou materiais complementares (opcional)"
                    rows={2}
                  />
                </div>
                <button type="submit" className="btn">+ Adicionar Vídeo</button>
              </form>

              <div className="videos-list">
                {playlist.videos.length === 0 ? (
                  <p className="muted">Nenhum vídeo nesta playlist</p>
                ) : (
                  playlist.videos.map(video => (
                    <div key={video.id} className="video-card">
                      <div className="video-header">
                        <strong>{video.title}</strong>
                        <button
                          className="btn-icon danger"
                          onClick={() => {
                            if (confirm('Excluir vídeo?')) deleteVideo(room.id, playlist.id, video.id)
                          }}
                        >🗑️</button>
                      </div>
                      {video.description && <p className="video-desc">{video.description}</p>}
                      <div className="video-embed">
                        <iframe
                          src={toEmbed(video.url)}
                          title={video.title}
                          width="100%"
                          height="315"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
