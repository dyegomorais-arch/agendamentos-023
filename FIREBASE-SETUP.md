# Sillion Agenda + Firebase

1. Crie o projeto no console.firebase.google.com
2. Authentication > Método de login > E-mail/senha (ativar)
3. Authentication > Usuários > Adicionar usuário (crie o login dos agendadores)
4. Authentication > Configurações > Ações do usuário > DESMARQUE "Ativar criação (cadastro)"
5. Firestore Database > Criar banco (modo produção, região southamerica-east1)
6. Firestore > Regras > cole o conteúdo de firestore.rules > Publicar
7. Configurações do projeto > Seus apps > </> Web > registre o app e copie o firebaseConfig para js/firebase-config.js
8. Authentication > Configurações > Domínios autorizados: adicione o domínio onde o site ficará
9. Teste localmente com um servidor (ex.: `npx serve .`), pois ES modules não funcionam abrindo o arquivo direto (file://)
10. Publicar: `npm i -g firebase-tools && firebase login && firebase init hosting && firebase deploy`
