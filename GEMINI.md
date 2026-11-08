# Regras do Projeto ATMaintenance

## Diretrizes de Segurança e Credenciais

1. **Isolamento de Segredos:**
   - Nunca comitar chaves de API, senhas ou credenciais de serviço.
   - O arquivo `.env` deve permanecer no `.gitignore`.
   - O arquivo `firebase-applet-config.json` e chaves de contas de serviço devem permanecer ignorados no Git.
   - O arquivo `firebase.ts` deve ler configurações exclusivamente via variáveis de ambiente (`process.env.NEXT_PUBLIC_FIREBASE_*`).

2. **Auditoria e Sugestão de Restrições:**
   - Sempre que novas integrações com Firebase, Google Cloud ou serviços terceiros forem criadas ou importadas, validar se as restrições de referenciadores HTTP (`http://localhost:3000/*` e domínio de produção) e restrições de escopo de API foram recomendadas ao usuário ao final da resposta.
