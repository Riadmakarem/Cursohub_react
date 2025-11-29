import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import Layout from '../../components/Layout'
import VideoComments from '../../components/VideoComments'
import VideoMaterials from '../../components/VideoMaterials'
import { toEmbed } from '../../utils/helpers'

export default function SalaDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getRoom, createPlaylist, deletePlaylist, addVideo, deleteVideo, deleteRoom, getVideoComments, getRoomStats } = useData()
  const room = getRoom(id)

  const [playlistName, setPlaylistName] = useState('')
  const [selectedPlaylist, setSelectedPlaylist] = useState(null)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [videoTitle, setVideoTitle] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [videoDescription, setVideoDescription] = useState('')
  const [activeTab, setActiveTab] = useState('videos')
  const [searchTerm, setSearchTerm] = useState('')

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

  const stats = getRoomStats(room.id)
  const playlist = room.playlists.find(p => p.id === selectedPlaylist)
  const video = selectedVideo ? playlist?.videos.find(v => v.id === selectedVideo) : null
  
  // Filter videos by search term
  const filteredVideos = playlist?.videos.filter(v => 
    v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

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

  function getVideoQuestionCount(videoId) {
    const comments = getVideoComments(videoId)
    return comments.filter(c => c.type === 'question' && !c.resolved).length
  }

  return (
    <Layout>
      <div className="breadcrumb">
        <Link to="/professor/salas">Salas</Link> / <span>{room.name}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h1>{room.name}</h1>
          <p style={{ color: '#666' }}>{room.description || 'Sem descrição'}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to={`/professor/salas/${room.id}/alunos`} className="btn secondary">👥 Gerenciar Alunos</Link>
          <button className="btn danger" onClick={handleDeleteRoom}>Excluir Sala</button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-number">{room.playlists.length}</div>
          <div className="stat-label">Playlists</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats?.totalVideos || 0}</div>
          <div className="stat-label">Vídeos</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{room.enrolledStudents?.length || 0}</div>
          <div className="stat-label">Alunos</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats?.unresolvedQuestions || 0}</div>
          <div className="stat-label">Dúvidas Pendentes</div>
        </div>
      </div>

      <div className="sala-layout">
        {/* Playlists Column */}
        <div className="playlists-column">
          <div className="card">
            <h3>📁 Playlists</h3>

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
                {room.playlists.map(p => {
                  const pendingQuestions = p.videos.reduce((acc, v) => acc + getVideoQuestionCount(v.id), 0)
                  return (
                    <div
                      key={p.id}
                      className={`playlist-item ${selectedPlaylist === p.id ? 'active' : ''}`}
                      onClick={() => { setSelectedPlaylist(p.id); setSelectedVideo(null); setSearchTerm('') }}
                    >
                      <span>📁 {p.name}</span>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span className="badge">{p.videos.length}</span>
                        {pendingQuestions > 0 && (
                          <span className="questions-badge">❓ {pendingQuestions}</span>
                        )}
                        <button
                          className="btn-icon danger"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm('Excluir playlist?')) deletePlaylist(room.id, p.id)
                          }}
                        >🗑️</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Videos Column */}
        <div className="videos-column">
          {!playlist ? (
            <div className="card empty-state">
              <p>👈 Selecione uma playlist para ver e adicionar vídeos</p>
            </div>
          ) : (
            <>
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3>📁 {playlist.name}</h3>
                  <div className="tabs" style={{ margin: 0 }}>
                    <button 
                      className={`tab ${activeTab === 'videos' ? 'active' : ''}`}
                      onClick={() => setActiveTab('videos')}
                    >Vídeos</button>
                    <button 
                      className={`tab ${activeTab === 'add' ? 'active' : ''}`}
                      onClick={() => setActiveTab('add')}
                    >+ Adicionar</button>
                  </div>
                </div>

                {activeTab === 'add' && (
                  <form onSubmit={handleAddVideo} className="video-form">
                    <div className="form-group">
                      <label>Título do vídeo</label>
                      <input
                        type="text"
                        value={videoTitle}
                        onChange={e => setVideoTitle(e.target.value)}
                        placeholder="Ex: Aula 01 - Introdução"
                      />
                    </div>
                    <div className="form-group">
                      <label>Link do YouTube *</label>
                      <input
                        type="url"
                        value={videoUrl}
                        onChange={e => setVideoUrl(e.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Descrição (opcional)</label>
                      <textarea
                        value={videoDescription}
                        onChange={e => setVideoDescription(e.target.value)}
                        placeholder="Descrição ou observações sobre o vídeo"
                        rows={2}
                      />
                    </div>
                    <button type="submit" className="btn">+ Adicionar Vídeo</button>
                  </form>
                )}

                {activeTab === 'videos' && (
                  <>
                    {playlist.videos.length > 3 && (
                      <div className="form-group" style={{ marginBottom: 16 }}>
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                          placeholder="🔍 Buscar vídeos..."
                        />
                      </div>
                    )}

                    <div className="videos-list">
                      {filteredVideos.length === 0 ? (
                        <p className="muted">{searchTerm ? 'Nenhum vídeo encontrado' : 'Nenhum vídeo nesta playlist'}</p>
                      ) : (
                        filteredVideos.map(v => {
                          const questionCount = getVideoQuestionCount(v.id)
                          return (
                            <div 
                              key={v.id} 
                              className={`video-card ${selectedVideo === v.id ? 'active' : ''}`}
                              onClick={() => setSelectedVideo(v.id)}
                              style={{ cursor: 'pointer' }}
                            >
                              <div className="video-header">
                                <strong>🎬 {v.title}</strong>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                  {questionCount > 0 && (
                                    <span className="questions-badge">❓ {questionCount}</span>
                                  )}
                                  <button
                                    className="btn-icon danger"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      if (confirm('Excluir vídeo?')) deleteVideo(room.id, playlist.id, v.id)
                                    }}
                                  >🗑️</button>
                                </div>
                              </div>
                              {v.description && <p className="video-desc">{v.description}</p>}
                            </div>
                          )
                        })
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Video Detail Panel */}
              {video && (
                <div className="card" style={{ marginTop: 16 }}>
                  <h3>🎬 {video.title}</h3>
                  {video.description && <p style={{ color: '#666', marginBottom: 16 }}>{video.description}</p>}
                  
                  <div className="video-embed">
                    <iframe
                      src={toEmbed(video.url)}
                      title={video.title}
                      width="100%"
                      height="400"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>

                  {/* Materials Section */}
                  <VideoMaterials videoId={video.id} roomId={room.id} isProfessor={true} />

                  {/* Comments Section */}
                  <VideoComments videoId={video.id} roomId={room.id} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}
