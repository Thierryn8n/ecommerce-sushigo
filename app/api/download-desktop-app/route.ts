import { NextResponse } from 'next/server'
import JSZip from 'jszip'

// Código fonte do aplicativo desktop
const files = {
  'package.json': `{
  "name": "acai-printer",
  "version": "1.0.0",
  "description": "Aplicativo de impressao automatica de pedidos - Acai da Praia",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "build": "electron-builder --win --x64",
    "build:portable": "electron-builder --win portable"
  },
  "author": "Acai da Praia",
  "license": "MIT",
  "devDependencies": {
    "electron": "^28.0.0",
    "electron-builder": "^24.9.1"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "electron-store": "^8.1.0"
  },
  "build": {
    "appId": "com.acaidapraia.printer",
    "productName": "Acai Printer",
    "directories": {
      "output": "dist"
    },
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64"]
        }
      ],
      "signAndEditExecutable": false,
      "verifyUpdateCodeSignature": false
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    },
    "forceCodeSigning": false
  }
}`,

  'main.js': `const { app, BrowserWindow, ipcMain, Notification } = require('electron')
const path = require('path')
const Store = require('electron-store')

const store = new Store()
let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    icon: path.join(__dirname, 'assets/icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0a0118'
  })

  mainWindow.loadFile('index.html')
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// IPC Handlers
ipcMain.handle('get-store', (event, key) => store.get(key))
ipcMain.handle('set-store', (event, key, value) => store.set(key, value))
ipcMain.handle('get-printers', async () => {
  return await mainWindow.webContents.getPrintersAsync()
})

ipcMain.handle('print-order', async (event, { printerName, content }) => {
  const printWindow = new BrowserWindow({ show: false })
  await printWindow.loadURL(\`data:text/html;charset=utf-8,\${encodeURIComponent(content)}\`)
  
  return new Promise((resolve) => {
    printWindow.webContents.print({
      silent: true,
      printBackground: true,
      deviceName: printerName,
      margins: { marginType: 'none' }
    }, (success, failureReason) => {
      printWindow.close()
      resolve({ success, failureReason })
    })
  })
})

ipcMain.handle('show-notification', (event, { title, body }) => {
  new Notification({ title, body }).show()
})

ipcMain.on('minimize-window', () => mainWindow.minimize())
ipcMain.on('maximize-window', () => {
  if (mainWindow.isMaximized()) mainWindow.unmaximize()
  else mainWindow.maximize()
})
ipcMain.on('close-window', () => mainWindow.close())`,

  'renderer.js': `const { ipcRenderer } = require('electron')
const { createClient } = require('@supabase/supabase-js')

// Configuracao Supabase
const SUPABASE_URL = 'https://vqgryimcbgjcxyguabdj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxZ3J5aW1jYmdqY3h5Z3VhYmRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMzI3NzksImV4cCI6MjA2MjkwODc3OX0.Ij1w0ZBKNyt63tIjLQ9v2l3MpPF_NFSP8bmzykW3Ys0'

let supabase
let storeId = null
let selectedPrinter = null
let autoprint = false
let orders = []
let storeLogo = null

// Inicializacao
document.addEventListener('DOMContentLoaded', async () => {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  
  // Carregar configuracoes salvas
  storeId = await ipcRenderer.invoke('get-store', 'storeId')
  selectedPrinter = await ipcRenderer.invoke('get-store', 'selectedPrinter')
  autoprint = await ipcRenderer.invoke('get-store', 'autoprint') || false
  
  if (storeId) {
    document.getElementById('store-id-input').value = storeId
    await connectToStore()
  }
  
  // Carregar impressoras
  await loadPrinters()
  
  // Configurar autoprint checkbox
  document.getElementById('autoprint-checkbox').checked = autoprint
  
  setupEventListeners()
})

async function loadPrinters() {
  const printers = await ipcRenderer.invoke('get-printers')
  const select = document.getElementById('printer-select')
  select.innerHTML = '<option value="">Selecionar impressora...</option>'
  
  printers.forEach(printer => {
    const option = document.createElement('option')
    option.value = printer.name
    option.textContent = printer.name + (printer.isDefault ? ' (Padrao)' : '')
    if (printer.name === selectedPrinter) option.selected = true
    select.appendChild(option)
  })
}

async function connectToStore() {
  if (!storeId) {
    document.getElementById('connection-status').textContent = 'ID nao informado'
    document.getElementById('connection-status').className = 'status disconnected'
    return
  }
  
  try {
    // Buscar dados da loja
    const { data: store, error } = await supabase
      .from('stores')
      .select('*')
      .eq('id', storeId)
      .single()
    
    if (error) {
      console.error('Erro ao buscar loja:', error)
      document.getElementById('connection-status').textContent = 'Loja nao encontrada'
      document.getElementById('connection-status').className = 'status disconnected'
      alert('Erro: ' + error.message)
      return
    }
    
    if (store) {
      storeLogo = store.logo_url
      document.getElementById('store-name').textContent = store.name || 'Loja Conectada'
      if (storeLogo) {
        document.getElementById('store-logo').src = storeLogo
        document.getElementById('store-logo').style.display = 'block'
      }
      document.getElementById('connection-status').textContent = 'Conectado'
      document.getElementById('connection-status').className = 'status connected'
      
      // Buscar pedidos existentes
      await loadOrders()
      
      // Configurar realtime
      setupRealtime()
    } else {
      document.getElementById('connection-status').textContent = 'Loja nao encontrada'
      document.getElementById('connection-status').className = 'status disconnected'
    }
  } catch (err) {
    console.error('Erro na conexao:', err)
    document.getElementById('connection-status').textContent = 'Erro de conexao'
    document.getElementById('connection-status').className = 'status disconnected'
    alert('Erro ao conectar: ' + err.message)
  }
}

async function loadOrders() {
  const { data } = await supabase
    .from('orders')
    .select('*, profiles(full_name, phone)')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })
    .limit(50)
  
  if (data) {
    orders = data
    renderOrders()
  }
}

function setupRealtime() {
  supabase
    .channel('orders-realtime')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'orders',
      filter: \`store_id=eq.\${storeId}\`
    }, async (payload) => {
      const newOrder = payload.new
      
      // Buscar dados completos do pedido
      const { data } = await supabase
        .from('orders')
        .select('*, profiles(full_name, phone)')
        .eq('id', newOrder.id)
        .single()
      
      if (data) {
        orders.unshift(data)
        renderOrders()
        
        // Notificacao
        ipcRenderer.invoke('show-notification', {
          title: 'Novo Pedido!',
          body: \`Pedido #\${data.id.slice(-6)} - R$ \${data.total?.toFixed(2)}\`
        })
        
        // Auto-impressao
        if (autoprint && selectedPrinter) {
          await printOrder(data)
        }
      }
    })
    .subscribe()
}

function renderOrders() {
  const container = document.getElementById('orders-list')
  container.innerHTML = ''
  
  orders.forEach(order => {
    const card = document.createElement('div')
    card.className = \`order-card \${order.printed ? 'printed' : ''}\`
    card.innerHTML = \`
      <div class="order-header">
        <span class="order-id">#\${order.id.slice(-6)}</span>
        <span class="order-status \${order.status}">\${order.status}</span>
      </div>
      <div class="order-info">
        <p><strong>Cliente:</strong> \${order.profiles?.full_name || order.customer_name || 'N/A'}</p>
        <p><strong>Total:</strong> R$ \${order.total?.toFixed(2)}</p>
        <p><strong>Data:</strong> \${new Date(order.created_at).toLocaleString('pt-BR')}</p>
      </div>
      <div class="order-actions">
        <button class="btn-print" onclick="printOrder(orders.find(o => o.id === '\${order.id}'))">
          Imprimir
        </button>
        <button class="btn-toggle-printed" onclick="togglePrinted('\${order.id}', \${!order.printed})">
          \${order.printed ? 'Desmarcar' : 'Marcar'} Impresso
        </button>
      </div>
    \`
    container.appendChild(card)
  })
}

async function printOrder(order) {
  if (!selectedPrinter) {
    alert('Selecione uma impressora primeiro!')
    return
  }
  
  const printContent = generatePrintContent(order)
  const result = await ipcRenderer.invoke('print-order', {
    printerName: selectedPrinter,
    content: printContent
  })
  
  if (result.success) {
    await togglePrinted(order.id, true)
  } else {
    alert('Erro ao imprimir: ' + result.failureReason)
  }
}

function generatePrintContent(order) {
  const items = order.items || []
  const itemsHtml = items.map(item => \`
    <tr>
      <td>\${item.quantity}x \${item.name}</td>
      <td style="text-align:right">R$ \${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  \`).join('')
  
  return \`
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: monospace; font-size: 12px; width: 80mm; padding: 5mm; }
        .header { text-align: center; margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
        .logo { max-width: 50mm; margin-bottom: 5px; }
        h1 { font-size: 16px; }
        .order-info { margin: 10px 0; }
        .order-info p { margin: 3px 0; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        td { padding: 3px 0; }
        .total { border-top: 1px dashed #000; padding-top: 10px; font-size: 14px; font-weight: bold; }
        .footer { text-align: center; margin-top: 15px; font-size: 10px; border-top: 1px dashed #000; padding-top: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        \${storeLogo ? \`<img src="\${storeLogo}" class="logo" />\` : ''}
        <h1>PEDIDO #\${order.id.slice(-6)}</h1>
      </div>
      <div class="order-info">
        <p><strong>Cliente:</strong> \${order.profiles?.full_name || order.customer_name || 'N/A'}</p>
        <p><strong>Tel:</strong> \${order.profiles?.phone || order.customer_phone || 'N/A'}</p>
        <p><strong>Data:</strong> \${new Date(order.created_at).toLocaleString('pt-BR')}</p>
        \${order.delivery_address ? \`<p><strong>Endereco:</strong> \${order.delivery_address}</p>\` : ''}
      </div>
      <table>
        <tbody>
          \${itemsHtml}
        </tbody>
      </table>
      <div class="total">
        <p>TOTAL: R$ \${order.total?.toFixed(2)}</p>
      </div>
      \${order.notes ? \`<p style="margin-top:10px"><strong>Obs:</strong> \${order.notes}</p>\` : ''}
      <div class="footer">
        <p>Obrigado pela preferencia!</p>
      </div>
    </body>
    </html>
  \`
}

async function togglePrinted(orderId, printed) {
  await supabase
    .from('orders')
    .update({ printed })
    .eq('id', orderId)
  
  const order = orders.find(o => o.id === orderId)
  if (order) order.printed = printed
  renderOrders()
}

function setupEventListeners() {
  // Salvar ID da loja
  document.getElementById('save-store-id').addEventListener('click', async () => {
    const input = document.getElementById('store-id-input')
    storeId = input.value.trim()
    
    if (!storeId) {
      alert('Por favor, insira o ID da loja!')
      return
    }
    
    document.getElementById('connection-status').textContent = 'Conectando...'
    document.getElementById('connection-status').className = 'status connecting'
    
    try {
      await ipcRenderer.invoke('set-store', 'storeId', storeId)
      await connectToStore()
    } catch (error) {
      alert('Erro ao conectar: ' + error.message)
      document.getElementById('connection-status').textContent = 'Erro'
      document.getElementById('connection-status').className = 'status disconnected'
    }
  })
  
  // Selecionar impressora
  document.getElementById('printer-select').addEventListener('change', async (e) => {
    selectedPrinter = e.target.value
    await ipcRenderer.invoke('set-store', 'selectedPrinter', selectedPrinter)
  })
  
  // Autoprint
  document.getElementById('autoprint-checkbox').addEventListener('change', async (e) => {
    autoprint = e.target.checked
    await ipcRenderer.invoke('set-store', 'autoprint', autoprint)
  })
  
  // Controles da janela
  document.getElementById('btn-minimize').addEventListener('click', () => ipcRenderer.send('minimize-window'))
  document.getElementById('btn-maximize').addEventListener('click', () => ipcRenderer.send('maximize-window'))
  document.getElementById('btn-close').addEventListener('click', () => ipcRenderer.send('close-window'))
}

// Expor funcoes globalmente
window.printOrder = printOrder
window.togglePrinted = togglePrinted`,

  'index.html': `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Acai Printer - Sistema de Impressao</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    :root {
      --bg-primary: #0a0118;
      --bg-secondary: #1a0a25;
      --bg-card: #2a1a35;
      --text-primary: #ffffff;
      --text-secondary: #a0a0a0;
      --accent: #8b5cf6;
      --accent-hover: #7c3aed;
      --success: #22c55e;
      --warning: #f59e0b;
      --danger: #ef4444;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      min-height: 100vh;
    }
    
    /* Titlebar */
    .titlebar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 40px;
      background: var(--bg-secondary);
      padding: 0 15px;
      -webkit-app-region: drag;
    }
    
    .titlebar-title {
      font-size: 14px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .titlebar-controls {
      display: flex;
      gap: 5px;
      -webkit-app-region: no-drag;
    }
    
    .titlebar-btn {
      width: 30px;
      height: 30px;
      border: none;
      background: transparent;
      color: var(--text-secondary);
      cursor: pointer;
      border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }
    
    .titlebar-btn:hover { background: var(--bg-card); color: var(--text-primary); }
    .titlebar-btn.close:hover { background: var(--danger); }
    
    /* Layout */
    .container {
      display: grid;
      grid-template-columns: 300px 1fr;
      height: calc(100vh - 40px);
    }
    
    /* Sidebar */
    .sidebar {
      background: var(--bg-secondary);
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      overflow-y: auto;
    }
    
    .logo-section {
      text-align: center;
      padding: 20px 0;
      border-bottom: 1px solid var(--bg-card);
    }
    
    .logo-section img {
      max-width: 120px;
      border-radius: 10px;
      display: none;
    }
    
    .store-name {
      font-size: 18px;
      font-weight: bold;
      margin-top: 10px;
    }
    
    .status {
      font-size: 12px;
      padding: 4px 12px;
      border-radius: 20px;
      display: inline-block;
      margin-top: 10px;
    }
    
    .status.connected { background: var(--success); color: white; }
    .status.disconnected { background: var(--danger); color: white; }
    .status.connecting { background: var(--warning); color: white; animation: pulse 1s infinite; }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    /* Form */
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .form-group label {
      font-size: 12px;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .form-group input,
    .form-group select {
      padding: 12px;
      border: 1px solid var(--bg-card);
      border-radius: 8px;
      background: var(--bg-primary);
      color: var(--text-primary);
      font-size: 14px;
    }
    
    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: var(--accent);
    }
    
    .btn {
      padding: 12px 20px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .btn-primary {
      background: var(--accent);
      color: white;
    }
    
    .btn-primary:hover { background: var(--accent-hover); }
    
    .checkbox-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .checkbox-group input[type="checkbox"] {
      width: 20px;
      height: 20px;
      accent-color: var(--accent);
    }
    
    /* Main Content */
    .main {
      padding: 20px;
      overflow-y: auto;
    }
    
    .main-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    
    .main-header h2 {
      font-size: 24px;
    }
    
    /* Orders List */
    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    .order-card {
      background: var(--bg-card);
      border-radius: 12px;
      padding: 20px;
      border: 1px solid transparent;
      transition: all 0.2s;
    }
    
    .order-card:hover { border-color: var(--accent); }
    .order-card.printed { opacity: 0.6; }
    
    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }
    
    .order-id {
      font-size: 18px;
      font-weight: bold;
      color: var(--accent);
    }
    
    .order-status {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      text-transform: uppercase;
    }
    
    .order-status.pending { background: var(--warning); color: black; }
    .order-status.confirmed { background: var(--accent); color: white; }
    .order-status.preparing { background: #3b82f6; color: white; }
    .order-status.ready { background: var(--success); color: white; }
    .order-status.delivered { background: #6b7280; color: white; }
    
    .order-info {
      margin-bottom: 15px;
    }
    
    .order-info p {
      margin: 5px 0;
      color: var(--text-secondary);
    }
    
    .order-actions {
      display: flex;
      gap: 10px;
    }
    
    .btn-print {
      padding: 8px 16px;
      background: var(--accent);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }
    
    .btn-print:hover { background: var(--accent-hover); }
    
    .btn-toggle-printed {
      padding: 8px 16px;
      background: var(--bg-secondary);
      color: var(--text-secondary);
      border: 1px solid var(--bg-card);
      border-radius: 6px;
      cursor: pointer;
    }
    
    .btn-toggle-printed:hover { background: var(--bg-card); color: var(--text-primary); }
    
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--text-secondary);
    }
    
    .empty-state svg {
      width: 80px;
      height: 80px;
      margin-bottom: 20px;
      opacity: 0.5;
    }
  </style>
</head>
<body>
  <div class="titlebar">
    <div class="titlebar-title">
      <span>Acai Printer</span>
    </div>
    <div class="titlebar-controls">
      <button class="titlebar-btn" id="btn-minimize">-</button>
      <button class="titlebar-btn" id="btn-maximize">[]</button>
      <button class="titlebar-btn close" id="btn-close">X</button>
    </div>
  </div>
  
  <div class="container">
    <aside class="sidebar">
      <div class="logo-section">
        <img id="store-logo" src="" alt="Logo" />
        <p id="store-name" class="store-name">Nao Conectado</p>
        <span id="connection-status" class="status disconnected">Desconectado</span>
      </div>
      
      <div class="form-group">
        <label>ID da Loja</label>
        <input type="text" id="store-id-input" placeholder="Cole o ID da loja aqui..." />
        <button class="btn btn-primary" id="save-store-id">Conectar</button>
      </div>
      
      <div class="form-group">
        <label>Impressora</label>
        <select id="printer-select">
          <option value="">Selecionar impressora...</option>
        </select>
      </div>
      
      <div class="form-group">
        <label>Opcoes</label>
        <div class="checkbox-group">
          <input type="checkbox" id="autoprint-checkbox" />
          <span>Impressao automatica</span>
        </div>
      </div>
    </aside>
    
    <main class="main">
      <div class="main-header">
        <h2>Pedidos</h2>
      </div>
      
      <div id="orders-list" class="orders-list">
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>Conecte-se a uma loja para ver os pedidos</p>
        </div>
      </div>
    </main>
  </div>
  
  <script src="renderer.js"></script>
</body>
</html>`,

  'README.md': `# Acai Printer - Aplicativo de Impressao

## Instalacao

1. Certifique-se de ter o Node.js instalado (versao 18+)
2. Abra o terminal na pasta do projeto
3. Execute: \`npm install\`
4. Para rodar em desenvolvimento: \`npm start\`
5. Para gerar o instalador .exe: \`npm run build\`

## Uso

1. Abra o aplicativo
2. Cole o ID da sua loja (disponivel no painel admin)
3. Selecione a impressora termica (Epson 80mm)
4. Ative "Impressao automatica" se desejar
5. Os pedidos aparecerao em tempo real!

## Requisitos

- Windows 10 ou superior
- Impressora termica 80mm (Epson ou compativel)
- Conexao com internet
`
}

export async function GET() {
  try {
    const zip = new JSZip()
    const folder = zip.folder('acai-printer')
    
    // Adicionar todos os arquivos ao ZIP
    for (const [filename, content] of Object.entries(files)) {
      folder?.file(filename, content)
    }
    
    // Criar pasta assets
    folder?.folder('assets')
    
    // Gerar o ZIP
    const zipContent = await zip.generateAsync({ type: 'nodebuffer' })
    
    return new NextResponse(zipContent, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="acai-printer-source.zip"'
      }
    })
  } catch (error) {
    console.error('Erro ao gerar ZIP:', error)
    return NextResponse.json({ error: 'Erro ao gerar arquivo' }, { status: 500 })
  }
}
