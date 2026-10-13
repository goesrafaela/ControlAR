# ControlAr v9.4 — Gestão Operacional somente Admin

Correção:
- Gestão Operacional não aparece mais na página inicial pública.
- Central/gestão operacional e detalhes dos técnicos são marcados como conteúdo administrativo.
- A aba Gestão Operacional é disponibilizada somente após login do administrador Oscar.
- Cliente e técnicos não recebem essa área.
- Ao sair/trocar perfil, a classe de sessão administrativa é removida.
- Toda a integração de OS, clientes, equipamentos, agenda, alertas e técnicos foi preservada.

Teste:
1. Abra a página inicial sem login: Gestão Operacional não deve aparecer.
2. Entre como Cliente: não deve aparecer.
3. Entre como João, Marcos ou Renato: não deve aparecer.
4. Entre como Oscar/Admin: a aba Gestão Operacional deve estar disponível.
