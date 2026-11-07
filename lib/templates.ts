export interface MaintenanceTemplate {
  id: string;
  name: string;
  icon: string;
  badge: string;
  description: string;
  defaultSiteName: string;
  htmlContent: string;
}

export const MAINTENANCE_TEMPLATES: MaintenanceTemplate[] = [
  {
    id: 'wordpress',
    name: 'WordPress / WooCommerce',
    icon: '🌐',
    badge: 'WP / E-com',
    description: 'Rotina de atualização de plugins, temas, banco MySQL e validação de checkout.',
    defaultSiteName: 'WordPress - Loja Online',
    htmlContent: `<h2>🔐 Dados de Acesso & Hospedagem</h2>
<table>
  <thead>
    <tr>
      <th>Serviço</th>
      <th>URL / Host</th>
      <th>Usuário / Identificação</th>
      <th>Observações</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Painel WP Admin</td>
      <td>https://exemplo.com/wp-admin</td>
      <td>admin@exemplo.com</td>
      <td>2FA Ativado via app</td>
    </tr>
    <tr>
      <td>Hospedagem / cPanel</td>
      <td>https://cpanel.exemplo.com:2083</td>
      <td>cpanel_user</td>
      <td>Acesso via IP liberado</td>
    </tr>
    <tr>
      <td>FTP / SSH / CDN</td>
      <td>ssh.exemplo.com:22</td>
      <td>ssh_user</td>
      <td>Cloudflare Proxy Ativo</td>
    </tr>
  </tbody>
</table>

<h2>🛡️ 1. Procedimento Pré-Manutenção</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Gerar backup completo da base de dados MySQL (via UpdraftPlus ou WP-CLI / mysqldump).</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Criar snapshot ou cópia compactada da pasta <code>/wp-content/</code>.</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Ativar página de modo de manutenção amigável para visitantes.</p></div></li>
</ul>

<h2>⚙️ 2. Rotina de Atualizações</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Atualizar extensões críticas de pagamento e segurança (ex: Mercado Pago, Stripe, Wordfence).</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Atualizar WooCommerce e executar a rotina de atualização de tabelas do banco se solicitado.</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Atualizar plugins complementares e temas instalados.</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Atualizar versão principal do WordPress Core se compatível com o tema ativo.</p></div></li>
</ul>

<h2>🚀 3. Validação e Testes Pós-Deploy</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Testar carregamento da Home, catálogo de produtos e cálculo de frete no carrinho.</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Realizar teste de checkout simulando pedido com PIX / Cartão em modo sandbox.</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Limpar caches de objeto (Redis/Memcached), LiteSpeed / WP Rocket e purgar Cloudflare.</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Desativar modo de manutenção e validar uptime no monitor externo.</p></div></li>
</ul>`,
  },
  {
    id: 'vps',
    name: 'Servidor VPS / Linux',
    icon: '🖥️',
    badge: 'Linux / DevOps',
    description: 'Manutenção de pacotes OS, serviços Nginx/Apache, Docker e integridade de disco.',
    defaultSiteName: 'VPS - Servidor Produção',
    htmlContent: `<h2>🖥️ Credenciais do Servidor</h2>
<table>
  <thead>
    <tr>
      <th>Serviço</th>
      <th>Host / IP</th>
      <th>Porta</th>
      <th>Usuário</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>SSH Direto</td>
      <td>192.168.1.100</td>
      <td>2222</td>
      <td>deploy / root</td>
    </tr>
    <tr>
      <td>Banco de Dados</td>
      <td>localhost</td>
      <td>3306 / 5432</td>
      <td>app_user</td>
    </tr>
    <tr>
      <td>Monitoramento</td>
      <td>https://status.exemplo.com</td>
      <td>443</td>
      <td>admin</td>
    </tr>
  </tbody>
</table>

<h2>📦 1. Diagnóstico e Atualização de Pacotes</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Verificar espaço livre em disco com <code>df -h</code> e consumo de RAM com <code>free -m</code>.</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Atualizar índices de repositórios: <code>sudo apt update</code>.</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Aplicar patches e atualizações de segurança: <code>sudo apt upgrade -y</code>.</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Remover dependências antigas órfãs: <code>sudo apt autoremove --purge</code>.</p></div></li>
</ul>

<h2>💾 2. Banco de Dados e Serviços</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Executar dump de segurança de todos os bancos com <code>mysqldump --all-databases > backup.sql</code>.</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Checar status dos contêineres e imagens Docker: <code>docker ps -a</code>.</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Rotacionar ou limpar logs volumosos em <code>/var/log/nginx/</code> e <code>/var/log/journal/</code>.</p></div></li>
</ul>

<h2>🛡️ 3. Verificação de Portas e Firewall</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Testar configuração do servidor web: <code>sudo nginx -t && sudo systemctl reload nginx</code>.</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Checar status das regras do firewall com <code>sudo ufw status verbose</code>.</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Validar renovação automática do certificado SSL Certbot: <code>sudo certbot renew --dry-run</code>.</p></div></li>
</ul>`,
  },
  {
    id: 'ecommerce',
    name: 'E-commerce & SaaS',
    icon: '🛒',
    badge: 'E-commerce',
    description: 'Rotina periódica de estabilidade para lojas virtuais e plataformas de vendas.',
    defaultSiteName: 'E-commerce - Manutenção Mensal',
    htmlContent: `<h2>💳 Gateways e Integrações Críticas</h2>
<table>
  <thead>
    <tr>
      <th>Integração</th>
      <th>Ambiente</th>
      <th>Status do Webhook</th>
      <th>Última Verificação</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Gateway de Pagamento</td>
      <td>Produção</td>
      <td>Ativo / 200 OK</td>
      <td>Hoje</td>
    </tr>
    <tr>
      <td>Cálculo de Frete / Logística</td>
      <td>Produção</td>
      <td>API Conectada</td>
      <td>Hoje</td>
    </tr>
    <tr>
      <td>Emissão de Nota Fiscal (ERP)</td>
      <td>Produção</td>
      <td>Fila sincronizada</td>
      <td>Hoje</td>
    </tr>
  </tbody>
</table>

<h2>🧹 1. Integridade e Limpeza</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Verificar se há transações presas com status "Processando" sem webhook de retorno.</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Limpar carrinhos abandonados antigos e logs de auditoria temporários da loja.</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Verificar expiração do Certificado SSL e status do domínio no registrador.</p></div></li>
</ul>

<h2>🛒 2. Testes de Compra</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Adicionar item ao carrinho, aplicar cupom de teste e conferir descontos.</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Gerar pedido de teste via PIX (validar QR Code e chave copia-e-cola).</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Confirmar se os e-mails transacionais (pedido confirmado, fatura) são entregues na caixa de entrada.</p></div></li>
</ul>

<h2>📢 3. Fechamento e Comunicação</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Registrar relatório sucinto das rotinas executadas para envio ao cliente/gestor.</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Notificar equipe sobre o término da janela de manutenção.</p></div></li>
</ul>`,
  },
  {
    id: 'padrao',
    name: 'Checklist Rápido Padrão',
    icon: '⚡',
    badge: 'Geral',
    description: 'Checklist enxuto de 6 passos para manutenções rotineiras e ágeis.',
    defaultSiteName: 'Site - Manutenção Preventiva',
    htmlContent: `<h2>📋 Checklist de Manutenção Preventiva</h2>
<blockquote>Realize cada etapa marcando a caixa de seleção para manter o histórico auditável do procedimento.</blockquote>

<ul data-type="taskList">
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p><b>1. Backup de Segurança:</b> Gerar snapshot ou cópia de segurança antes de qualquer modificação.</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p><b>2. Aplicação de Atualizações:</b> Atualizar componentes, plugins, pacotes e extensões pendentes.</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p><b>3. Otimização de Performance:</b> Purgar caches do servidor, CDN e banco de dados.</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p><b>4. Testes Funcionais:</b> Navegar pelas principais páginas, formulários de contato e checkout.</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p><b>5. Checagem de Segurança:</b> Verificar logs de erros recentes e status do certificado SSL.</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p><b>6. Validação Final:</b> Conferir se o site responde com status HTTP 200 e monitoramento verde.</p></div></li>
</ul>`,
  },
];
