import React, { useState } from 'react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Chip,
  Stack,
  IconButton,
  Divider,
  Collapse,
} from '@mui/material'
import {
  Send,
  Reply,
  CheckCircle,
  Delete,
  QuestionAnswer,
} from '@mui/icons-material'

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
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        <QuestionAnswer sx={{ mr: 1, verticalAlign: 'middle' }} />
        Dúvidas e Comentários ({comments.length})
      </Typography>

      {/* New Comment Form */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder={isProfessor ? "Adicionar comentário..." : "Tem alguma dúvida? Pergunte aqui..."}
              variant="outlined"
              size="small"
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button 
                type="submit" 
                variant="contained" 
                startIcon={<Send />}
                disabled={!newComment.trim()}
              >
                {isProfessor ? 'Comentar' : 'Enviar Dúvida'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Comments List */}
      {topLevelComments.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          Nenhum comentário ainda. Seja o primeiro a perguntar!
        </Typography>
      ) : (
        <Stack spacing={2}>
          {topLevelComments.map(comment => (
            <Card 
              key={comment.id} 
              variant="outlined"
              sx={{ 
                opacity: comment.resolved ? 0.7 : 1,
                borderLeft: comment.resolved ? '3px solid' : 'none',
                borderLeftColor: 'success.main',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Avatar sx={{ bgcolor: comment.userRole === 'professor' ? 'primary.main' : 'secondary.main' }}>
                    {comment.userName?.[0] || '?'}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography fontWeight={600}>{comment.userName}</Typography>
                      <Chip 
                        label={comment.userRole === 'professor' ? 'Professor' : 'Aluno'} 
                        size="small"
                        color={comment.userRole === 'professor' ? 'primary' : 'default'}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(comment.createdAt).toLocaleDateString('pt-BR')}
                      </Typography>
                      {comment.resolved && (
                        <Chip icon={<CheckCircle />} label="Resolvido" size="small" color="success" />
                      )}
                    </Box>
                    
                    <Typography sx={{ mt: 1, mb: 2 }}>{comment.content}</Typography>

                    <Stack direction="row" spacing={1}>
                      <Button 
                        size="small"
                        startIcon={<Reply />}
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      >
                        Responder
                      </Button>
                      {isProfessor && !comment.resolved && (
                        <Button 
                          size="small"
                          color="success"
                          startIcon={<CheckCircle />}
                          onClick={() => markCommentResolved(comment.id)}
                        >
                          Resolver
                        </Button>
                      )}
                      {(isProfessor || comment.userId === currentUser?.id) && (
                        <IconButton 
                          size="small"
                          color="error"
                          onClick={() => {
                            if (confirm('Excluir comentário?')) deleteComment(comment.id)
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>

                    {/* Reply Form */}
                    <Collapse in={replyingTo === comment.id}>
                      <Box component="form" onSubmit={(e) => handleReply(e, comment.id)} sx={{ mt: 2 }}>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          size="small"
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          placeholder="Escreva sua resposta..."
                        />
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Button type="submit" size="small" variant="contained" disabled={!replyText.trim()}>
                            Responder
                          </Button>
                          <Button 
                            size="small" 
                            onClick={() => { setReplyingTo(null); setReplyText('') }}
                          >
                            Cancelar
                          </Button>
                        </Stack>
                      </Box>
                    </Collapse>

                    {/* Replies */}
                    {getReplies(comment.id).length > 0 && (
                      <Box sx={{ mt: 2, pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
                        {getReplies(comment.id).map(reply => (
                          <Box key={reply.id} sx={{ py: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                              <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                                {reply.userName?.[0] || '?'}
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2" fontWeight={600}>{reply.userName}</Typography>
                                  <Chip 
                                    label={reply.userRole === 'professor' ? 'Professor' : 'Aluno'} 
                                    size="small"
                                    sx={{ height: 20, '& .MuiChip-label': { px: 1, fontSize: '0.7rem' } }}
                                  />
                                  <Typography variant="caption" color="text.secondary">
                                    {new Date(reply.createdAt).toLocaleDateString('pt-BR')}
                                  </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ mt: 0.5 }}>{reply.content}</Typography>
                              </Box>
                              {(isProfessor || reply.userId === currentUser?.id) && (
                                <IconButton 
                                  size="small"
                                  color="error"
                                  onClick={() => {
                                    if (confirm('Excluir resposta?')) deleteComment(reply.id)
                                  }}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  )
}
