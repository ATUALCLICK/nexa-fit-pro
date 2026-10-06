# Publicação de funis via deploy embutido

O app é estático, sem backend: um funil gerado só existe em produção se estiver dentro do build. Decidimos que **publicar = gravar o `funnel.json` como arquivo do projeto e gerar uma nova versão do app** — o funil entra no deploy, e rollback é restaurar a versão anterior do app.

A alternativa era publicação instantânea via storage remoto (CDN/S3), que adicionaria infraestrutura, CORS, credenciais e um ponto de falha novo já no MVP — injustificável para um operador solo que publica poucos funis por semana. O trade-off aceito: cada funil novo exige um redeploy de minutos. O caminho de migração para storage remoto fica reservado ao F5 (proxy backend), sem mudança no contrato do `funnel.json` nem no loader (`?f=slug`).

## Consequences

- "Publicar" no /admin grava arquivos localmente; ir ao ar é uma ação de versionamento do app, não do gerador.
- Versionamento por funil (`{slug}.v{n}.json`) só chega no F4; antes disso, o histórico de versões do app é o histórico dos funis.
- Qualquer automação futura de publicação precisa respeitar o gate duplo: QA verde + confirmação humana no preview.
