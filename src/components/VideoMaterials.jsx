import React, { useState, useRef } from 'react'
import { useData } from '../context/DataContext'

export default function VideoMaterials({ videoId, roomId, playlistId, canEdit = false }) {
  const { getVideoMaterials, addMaterial, deleteMaterial } = useData()
  const [showUpload, setShowUpload] = useState(false)
  const [materialName, setMaterialName] = useState('')
  const [materialUrl, setMaterialUrl] = useState('')
  const [materialType, setMaterialType] = useState('pdf')
  const fileInputRef = useRef(null)

  const materials = getVideoMaterials(videoId)

  function handleAddMaterial(e) {
    e.preventDefault()
    if (!materialName.trim() || !materialUrl.trim()) return

    addMaterial(videoId, roomId, playlistId, {
      name: materialName.trim(),
      url: materialUrl.trim(),
      type: materialType
    })

    setMaterialName('')
    setMaterialUrl('')
    setShowUpload(false)
  }

  function handleFileUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    // For demo, we'll create a fake URL. In production, upload to storage
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result
      addMaterial(videoId, roomId, playlistId, {
        name: file.name,
        url: dataUrl,
        type: getFileType(file.name),
        size: file.size
      })
    }
    reader.readAsDataURL(file)
    
    e.target.value = '' // Reset input
  }

  function getFileType(filename) {
    const ext = filename.split('.').pop().toLowerCase()
    if (['pdf'].includes(ext)) return 'pdf'
    if (['ppt', 'pptx'].includes(ext)) return 'slides'
    if (['doc', 'docx', 'txt'].includes(ext)) return 'document'
    if (['xls', 'xlsx'].includes(ext)) return 'spreadsheet'
    if (['zip', 'rar'].includes(ext)) return 'archive'
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'image'
    return 'file'
  }

  function getTypeIcon(type) {
    const icons = {
      pdf: '📄',
      slides: '📊',
      document: '📝',
      spreadsheet: '📈',
      archive: '📦',
      image: '🖼️',
      file: '📁',
      link: '🔗'
    }
    return icons[type] || '📁'
  }

  function formatSize(bytes) {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="materials-section">
      <div className="materials-header">
        <h4>📎 Materiais Complementares ({materials.length})</h4>
        {canEdit && (
          <button className="btn btn-sm" onClick={() => setShowUpload(!showUpload)}>
            + Adicionar
          </button>
        )}
      </div>

      {/* Upload Form */}
      {canEdit && showUpload && (
        <div className="material-upload-form card">
          <h5>Adicionar Material</h5>
          
          {/* File Upload */}
          <div className="form-group">
            <label>Upload de Arquivo</label>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar,.jpg,.jpeg,.png,.gif"
            />
            <small className="muted">PDF, DOC, PPT, XLS, imagens ou arquivos compactados</small>
          </div>

          <div className="divider">ou</div>

          {/* Link Form */}
          <form onSubmit={handleAddMaterial}>
            <div className="form-group">
              <label>Nome do Material</label>
              <input
                type="text"
                value={materialName}
                onChange={e => setMaterialName(e.target.value)}
                placeholder="Ex: Slides da Aula 1"
              />
            </div>

            <div className="form-group">
              <label>URL do Material</label>
              <input
                type="url"
                value={materialUrl}
                onChange={e => setMaterialUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="form-group">
              <label>Tipo</label>
              <select value={materialType} onChange={e => setMaterialType(e.target.value)}>
                <option value="pdf">PDF</option>
                <option value="slides">Slides</option>
                <option value="document">Documento</option>
                <option value="link">Link Externo</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn">Adicionar</button>
              <button type="button" className="btn secondary" onClick={() => setShowUpload(false)}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Materials List */}
      <div className="materials-list">
        {materials.length === 0 ? (
          <p className="muted">Nenhum material anexado a esta aula.</p>
        ) : (
          materials.map(material => (
            <div key={material.id} className="material-item">
              <span className="material-icon">{getTypeIcon(material.type)}</span>
              <div className="material-info">
                <strong>{material.name}</strong>
                {material.size && <span className="material-size">{formatSize(material.size)}</span>}
              </div>
              <div className="material-actions">
                {material.url.startsWith('data:') ? (
                  <a 
                    href={material.url} 
                    download={material.name}
                    className="btn btn-sm secondary"
                  >
                    ⬇️ Baixar
                  </a>
                ) : (
                  <a 
                    href={material.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-sm secondary"
                  >
                    🔗 Abrir
                  </a>
                )}
                {canEdit && (
                  <button 
                    className="btn-icon danger"
                    onClick={() => {
                      if (confirm('Excluir material?')) deleteMaterial(material.id)
                    }}
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
