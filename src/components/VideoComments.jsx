import React, { useState } from 'react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'

export default function VideoComments({ videoId, roomId, playlistId }) {
  const { getVideoComments, addComment, markCommentResolved, deleteComment } = useData()
  const { currentUser, isProfessor } = useAuth()
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')

  const comments = getVideoComments(videoId)
  const topLevelComments = comments.filter(c => !c.parentId)

  function handleSubmit(e) {
    e.preventDefault()
    if (!newComment.trim()) return
    addComment(videoId, roomId, playlistId, newComment.trim())
    setNewComment('')
  }

  function handleReply(e, parentId) {
    e.preventDefault()
    if (!replyText.trim()) return
    addComment(videoId, roomId, playlistId, replyText.trim(), parentId)
    setReplyText('')
    setReplyingTo(null)
  }

  function getReplies(commentId) {
    return comments.filter(c => c.parentId === commentId)
  }

  return (
    <div className="comments-section">
      <h4>💬 Dúvidas e Comentários ({comments.length})</h4>

      {/* New Comment Form */}
      <form onSubmit={handleSubmit} className="comment-form">
        <textarea
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder={isProfessor ? "Adicionar comentário..." : "Tem alguma dúvida? Pergunte aqui..."}
          rows={3}
        />
        <button type="submit" className="btn" disabled={!newComment.trim()}>
          {isProfessor ? 'Comentar' : 'Enviar Dúvida'}
        </button>
      </form>

      {/* Comments List */}
      <div className="comments-list">
        {topLevelComments.length === 0 ? (
          <p className="muted">Nenhum comentário ainda. Seja o primeiro a perguntar!</p>
        ) : (
          topLevelComments.map(comment => (
            <div key={comment.id} className={`comment-item ${comment.resolved ? 'resolved' : ''}`}>
              <div className="comment-header">
                <span className="comment-avatar">{comment.userAvatar || '👤'}</span>
                <div className="comment-meta">
                  <strong>{comment.userName}</strong>
                  <span className="comment-role">{comment.userRole === 'professor' ? 'Professor' : 'Aluno'}</span>
                  <span className="comment-date">
                    {new Date(comment.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                {comment.resolved && <span className="resolved-badge">✅ Resolvido</span>}
              </div>

              <div className="comment-content">
                {comment.content}
              </div>

              <div className="comment-actions">
                <button 
                  className="btn-link"
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                >
                  💬 Responder
                </button>
                {isProfessor && !comment.resolved && (
                  <button 
                    className="btn-link"
                    onClick={() => markCommentResolved(comment.id)}
                  >
                    ✅ Marcar como resolvido
                  </button>
                )}
                {(isProfessor || comment.userId === currentUser?.id) && (
                  <button 
                    className="btn-link danger"
                    onClick={() => {
                      if (confirm('Excluir comentário?')) deleteComment(comment.id)
                    }}
                  >
                    🗑️ Excluir
                  </button>
                )}
              </div>

              {/* Reply Form */}
              {replyingTo === comment.id && (
                <form onSubmit={(e) => handleReply(e, comment.id)} className="reply-form">
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Escreva sua resposta..."
                    rows={2}
                  />
                  <div className="reply-actions">
                    <button type="submit" className="btn btn-sm" disabled={!replyText.trim()}>
                      Responder
                    </button>
                    <button 
                      type="button" 
                      className="btn secondary btn-sm"
                      onClick={() => { setReplyingTo(null); setReplyText('') }}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              {/* Replies */}
              {getReplies(comment.id).length > 0 && (
                <div className="replies-list">
                  {getReplies(comment.id).map(reply => (
                    <div key={reply.id} className="reply-item">
                      <div className="comment-header">
                        <span className="comment-avatar">{reply.userAvatar || '👤'}</span>
                        <div className="comment-meta">
                          <strong>{reply.userName}</strong>
                          <span className="comment-role">{reply.userRole === 'professor' ? 'Professor' : 'Aluno'}</span>
                          <span className="comment-date">
                            {new Date(reply.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      <div className="comment-content">{reply.content}</div>
                      {(isProfessor || reply.userId === currentUser?.id) && (
                        <button 
                          className="btn-link danger"
                          onClick={() => {
                            if (confirm('Excluir resposta?')) deleteComment(reply.id)
                          }}
                        >
                          🗑️ Excluir
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
