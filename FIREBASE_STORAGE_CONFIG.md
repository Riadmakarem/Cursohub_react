# Configuração do Firebase Storage

## Problema CORS

O erro de CORS que você está enfrentando ocorre porque o Firebase Storage precisa ser configurado corretamente.

## Passos para corrigir:

### 1. Configure as regras de segurança do Firebase Storage

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto: **cursohub-fd8e2**
3. No menu lateral, vá em **Storage**
4. Clique na aba **Rules** (Regras)
5. Substitua as regras existentes pelo conteúdo do arquivo `storage.rules` na raiz do projeto
6. Clique em **Publish** (Publicar)

Alternativamente, você pode usar o Firebase CLI para fazer o deploy das regras:

```bash
firebase deploy --only storage:rules
```

### 2. Verifique se o Storage está habilitado

1. No Firebase Console, vá em **Storage**
2. Se não estiver habilitado, clique em **Get Started**
3. Escolha o modo de teste (pode configurar segurança depois)
4. Selecione a localização: **southamerica-east1** (São Paulo) ou outra de sua preferência

### 3. Configuração CORS (Se necessário)

Se o problema persistir, você pode precisar configurar CORS manualmente usando gsutil:

1. Instale o [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)

2. Crie um arquivo `cors.json` com o seguinte conteúdo (já criado na raiz do projeto):

```json
[
  {
    "origin": ["*"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "maxAgeSeconds": 3600
  }
]
```

3. Execute o comando:

```bash
gsutil cors set cors.json gs://cursohub-fd8e2.firebasestorage.app
```

## Solução Temporária

Se você quiser testar sem configurar o Firebase Storage agora, pode usar URLs de teste ou localStorage para armazenar os materiais localmente. Mas para produção, é necessário configurar o Firebase Storage corretamente.

## Verificação

Após configurar, teste fazendo upload de um arquivo. O erro CORS deve desaparecer e o upload deve funcionar normalmente.
