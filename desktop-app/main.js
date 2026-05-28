const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');
const Store = require('electron-store');

// Configuracao persistente
const store = new Store();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    transparent: false,
    backgroundColor: '#1a0a25',
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  mainWindow.loadFile('index.html');
  
  // DevTools em desenvolvimento
  // mainWindow.webContents.openDevTools();
}

// Notificacao de novo pedido
ipcMain.on('new-order-notification', (event, order) => {
  const notification = new Notification({
    title: 'Novo Pedido!',
    body: `Pedido #${order.order_number} - ${order.customer_name}`,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    silent: false
  });
  notification.show();
});

// Controle da janela
ipcMain.on('minimize-window', () => mainWindow.minimize());
ipcMain.on('maximize-window', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});
ipcMain.on('close-window', () => mainWindow.close());

// Salvar configuracoes
ipcMain.on('save-config', (event, config) => {
  store.set('config', config);
  event.reply('config-saved', true);
});

// Carregar configuracoes
ipcMain.on('load-config', (event) => {
  const config = store.get('config', {
    adminId: '',
    printerName: '',
    autoPrint: true
  });
  event.reply('config-loaded', config);
});

// Listar impressoras
ipcMain.on('get-printers', async (event) => {
  const printers = await mainWindow.webContents.getPrintersAsync();
  event.reply('printers-list', printers);
});

// Imprimir pedido
ipcMain.on('print-order', async (event, { order, printerName }) => {
  try {
    // Gerar HTML do recibo
    const receiptHtml = generateReceiptHtml(order);
    
    // Criar janela oculta para impressao
    const printWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: true
      }
    });
    
    await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(receiptHtml)}`);
    
    printWindow.webContents.print({
      silent: true,
      printBackground: true,
      deviceName: printerName,
      margins: { marginType: 'none' }
    }, (success, errorType) => {
      printWindow.close();
      if (success) {
        event.reply('print-result', { success: true, orderId: order.id });
      } else {
        event.reply('print-result', { success: false, error: errorType });
      }
    });
  } catch (error) {
    event.reply('print-result', { success: false, error: error.message });
  }
});

function generateReceiptHtml(order) {
  const items = order.items || [];
  const itemsHtml = items.map(item => `
    <tr>
      <td style="text-align:left">${item.quantity}x ${item.name}</td>
      <td style="text-align:right">R$ ${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
    ${item.additions?.length ? item.additions.map(add => `
      <tr><td colspan="2" style="font-size:10px;padding-left:10px">+ ${add.name}</td></tr>
    `).join('') : ''}
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @page { size: 80mm auto; margin: 0; }
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          width: 80mm;
          margin: 0;
          padding: 5mm;
        }
        .header { text-align: center; margin-bottom: 10px; }
        .logo { max-width: 60mm; max-height: 20mm; }
        .divider { border-top: 1px dashed #000; margin: 8px 0; }
        .title { font-size: 14px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 2px 0; }
        .total { font-size: 14px; font-weight: bold; }
        .footer { text-align: center; margin-top: 10px; font-size: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        ${order.store_logo ? `<img src="${order.store_logo}" class="logo" />` : ''}
        <div class="title">${order.store_name || 'ACAI DA PRAIA'}</div>
      </div>
      
      <div class="divider"></div>
      
      <div style="text-align:center">
        <strong>PEDIDO #${order.order_number || order.id?.slice(-6)}</strong>
      </div>
      <div>Data: ${new Date(order.created_at).toLocaleString('pt-BR')}</div>
      <div>Cliente: ${order.customer_name || 'N/A'}</div>
      ${order.customer_phone ? `<div>Tel: ${order.customer_phone}</div>` : ''}
      
      <div class="divider"></div>
      
      <table>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      
      <div class="divider"></div>
      
      <table>
        <tr>
          <td>Subtotal:</td>
          <td style="text-align:right">R$ ${(order.subtotal || 0).toFixed(2)}</td>
        </tr>
        ${order.delivery_fee ? `
        <tr>
          <td>Taxa de Entrega:</td>
          <td style="text-align:right">R$ ${order.delivery_fee.toFixed(2)}</td>
        </tr>
        ` : ''}
        ${order.discount ? `
        <tr>
          <td>Desconto:</td>
          <td style="text-align:right">-R$ ${order.discount.toFixed(2)}</td>
        </tr>
        ` : ''}
        <tr class="total">
          <td>TOTAL:</td>
          <td style="text-align:right">R$ ${(order.total || 0).toFixed(2)}</td>
        </tr>
      </table>
      
      <div class="divider"></div>
      
      <div><strong>Pagamento:</strong> ${order.payment_method || 'N/A'}</div>
      <div><strong>Tipo:</strong> ${order.order_type === 'delivery' ? 'ENTREGA' : 'RETIRADA'}</div>
      
      ${order.delivery_address ? `
      <div class="divider"></div>
      <div><strong>Endereco:</strong></div>
      <div>${order.delivery_address}</div>
      ` : ''}
      
      ${order.notes ? `
      <div class="divider"></div>
      <div><strong>Obs:</strong> ${order.notes}</div>
      ` : ''}
      
      <div class="divider"></div>
      
      <div class="footer">
        Obrigado pela preferencia!<br>
        Volte sempre!
      </div>
    </body>
    </html>
  `;
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
